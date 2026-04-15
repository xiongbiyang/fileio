interface WebRTCOptions {
  onMessage?: (data: string | ArrayBuffer) => void
  onStateChange?: (state: RTCPeerConnectionState) => void
  onDataChannelOpen?: () => void
  onError?: (error: Error) => void
}

interface WebRTCReturn {
  connectionState: Ref<RTCPeerConnectionState>
  connect: (
    offer?: RTCSessionDescriptionInit,
    opts?: { iceTransportPolicy?: RTCIceTransportPolicy },
  ) => Promise<RTCSessionDescriptionInit>
  setRemoteDescription: (desc: RTCSessionDescriptionInit) => Promise<void>
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>
  onIceCandidateEmit: (cb: (candidate: RTCIceCandidateInit) => void) => void
  restartIce: () => Promise<RTCSessionDescriptionInit>
  receiveRestartOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
  getIceTransportPolicy: () => RTCIceTransportPolicy
  getDtlsFingerprints: () => { local: string; remote: string } | null
  getSelectedCandidatePairType: () => Promise<RTCIceCandidateType | null>
  sendControl: (type: string, data?: unknown) => void
  sendText: (text: string) => void
  sendFile: (file: File, onProgress?: (progress: number) => void) => Promise<void>
  cancelSend: () => void
  disconnect: () => void
}

// Used only when /api/turn-credentials is unreachable.
// Google STUN is blocked in CN but WebRTC skips unresponsive servers gracefully.
// CN users on the normal path receive a CN-specific list from the API (no Google).
const FALLBACK_STUN: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.miwifi.com:3478' },       // Xiaomi — accessible in mainland China
  { urls: 'stun:stun.stunprotocol.org:3478' },  // Neutral fallback
]

// Module-level cache: pairing is 2 peers loading the same page in parallel.
// Without this, each peer blocks their first handshake on an /api/turn-credentials
// round trip (~100–400ms on CN, worse on cold Workers). TURN credentials live 5 min,
// so refresh just before that.
const ICE_CACHE_TTL_MS = 4 * 60 * 1000
let iceCachedAt = 0
let iceInFlight: Promise<RTCIceServer[]> | null = null

// Cap how long we'll wait for the TURN credential API before starting WebRTC
// with fallback STUN. A cold Worker + slow CN link can exceed a few seconds;
// beyond that the user is better served by an attempt-with-STUN than a spinner.
const ICE_FETCH_TIMEOUT_MS = 4_000

async function fetchIceServers(): Promise<RTCIceServer[]> {
  if (!import.meta.client) return FALLBACK_STUN
  const now = Date.now()
  if (iceInFlight && now - iceCachedAt < ICE_CACHE_TTL_MS) return iceInFlight
  iceCachedAt = now
  iceInFlight = (async () => {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), ICE_FETCH_TIMEOUT_MS)
      try {
        const data = await $fetch<{ iceServers: RTCIceServer[] }>(
          '/api/turn-credentials',
          { signal: controller.signal },
        )
        return data.iceServers?.length ? data.iceServers : FALLBACK_STUN
      }
      finally {
        clearTimeout(timer)
      }
    }
    catch {
      return FALLBACK_STUN
    }
  })()
  return iceInFlight
}

/**
 * Start fetching STUN/TURN servers before either peer is ready to handshake.
 * Call on page mount so by the time `connect()` runs, the result is already cached.
 */
export function prefetchIceServers(): void {
  void fetchIceServers()
}

export function useWebRTC(options: WebRTCOptions = {}): WebRTCReturn {
  const connectionState = ref<RTCPeerConnectionState>('new')
  let pc: RTCPeerConnection | null = null
  let dataChannel: RTCDataChannel | null = null
  let sendCancelFlag = false

  let onIceCandidate: ((candidate: RTCIceCandidateInit) => void) | null = null
  // Candidates that arrive before setRemoteDescription are buffered here.
  // Cap the buffer so a peer that never delivers an SDP (malicious / stuck)
  // can't grow this list unbounded.
  const MAX_PENDING_CANDIDATES = 64
  const pendingRemoteCandidates: RTCIceCandidateInit[] = []

  function initPeerConnection(iceServers: RTCIceServer[], iceTransportPolicy: RTCIceTransportPolicy = 'all') {
    pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy,
      // Pre-gather a small pool of candidates during `new RTCPeerConnection`,
      // so trickle ICE starts emitting candidates the moment `setLocalDescription`
      // resolves instead of waiting for UDP probes to each STUN server.
      iceCandidatePoolSize: 4,
      // Single transport for all streams — fewer candidates to gather, fewer
      // checks to run. Tool A only uses one DataChannel, so max-bundle is free.
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    })

    pc.onconnectionstatechange = () => {
      if (pc) {
        connectionState.value = pc.connectionState
        options.onStateChange?.(pc.connectionState)
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate?.(event.candidate.toJSON())
      }
    }

    pc.ondatachannel = (event) => {
      dataChannel = event.channel
      setupDataChannel()
    }
  }

  function setupDataChannel() {
    if (!dataChannel) return

    dataChannel.onopen = () => {
      options.onDataChannelOpen?.()
    }

    dataChannel.onmessage = (event) => {
      options.onMessage?.(event.data)
    }

    dataChannel.onerror = (event) => {
      options.onError?.(new Error(`DataChannel error: ${event}`))
    }
  }

  // Track the transport policy used so a caller can opt into a relay-only retry
  // when the initial 'all' attempt fails (typical on symmetric NAT / CGNAT).
  let currentTransportPolicy: RTCIceTransportPolicy = 'all'

  async function connect(
    offer?: RTCSessionDescriptionInit,
    opts: { iceTransportPolicy?: RTCIceTransportPolicy } = {},
  ): Promise<RTCSessionDescriptionInit> {
    // Soft tear-down: close any prior PC/DataChannel but PRESERVE
    // `pendingRemoteCandidates`. In trickle ICE the offerer emits candidates
    // before (or in parallel with) its offer, so the answerer often receives
    // candidates over signaling before the offer itself — they're buffered
    // here while pc is null. A hard reset would throw those away and make
    // the answerer wait for the next round of candidates, which measurably
    // slows or occasionally deadlocks pairing. A full reset is only wanted
    // in explicit disconnect().
    dataChannel?.close()
    pc?.close()
    dataChannel = null
    pc = null
    const iceServers = await fetchIceServers()
    currentTransportPolicy = opts.iceTransportPolicy ?? 'all'
    initPeerConnection(iceServers, currentTransportPolicy)
    const active = pc as RTCPeerConnection | null
    if (!active) throw new Error('Failed to create peer connection')

    if (offer) {
      // Answerer path — Trickle ICE: send answer immediately, candidates follow
      await active.setRemoteDescription(offer)
      await flushPendingCandidates()
      const answer = await active.createAnswer()
      await active.setLocalDescription(answer)
      return active.localDescription as RTCSessionDescriptionInit
    }

    // Offerer path — Trickle ICE: send offer immediately, candidates follow
    dataChannel = active.createDataChannel('fileio-transfer', { ordered: true })
    setupDataChannel()
    const createdOffer = await active.createOffer()
    await active.setLocalDescription(createdOffer)
    return active.localDescription as RTCSessionDescriptionInit
  }

  async function flushPendingCandidates() {
    if (!pc || !pc.remoteDescription || !pendingRemoteCandidates.length) return
    const queued = pendingRemoteCandidates.splice(0)
    for (const c of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c))
      }
      catch {
        // Stale candidate (e.g. pre-restart ufrag/pwd) — silently drop.
        // The active ICE gen will gather fresh ones via trickle.
      }
    }
  }

  async function setRemoteDescription(desc: RTCSessionDescriptionInit) {
    if (!pc) return
    await pc.setRemoteDescription(desc)
    await flushPendingCandidates()
  }

  async function addIceCandidate(candidate: RTCIceCandidateInit) {
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
      catch {
        // Stale/invalid candidate — ignore rather than crash.
      }
    }
    else {
      // Buffer until PeerConnection + remoteDescription are ready.
      // Drop oldest when full — late candidates are typically relay/reflexive
      // and more valuable than the initial host ones we'd already have tried.
      if (pendingRemoteCandidates.length >= MAX_PENDING_CANDIDATES) {
        pendingRemoteCandidates.shift()
      }
      pendingRemoteCandidates.push(candidate)
    }
  }

  /**
   * ICE restart — offerer side only. Trickle ICE: returns the offer as soon as
   * `setLocalDescription` resolves; candidates stream out via `onicecandidate`.
   */
  async function restartIce(): Promise<RTCSessionDescriptionInit> {
    if (!pc) throw new Error('No active peer connection')
    const offer = await pc.createOffer({ iceRestart: true })
    await pc.setLocalDescription(offer)
    return pc.localDescription as RTCSessionDescriptionInit
  }

  /**
   * ICE restart — answerer side only. Trickle ICE (see `restartIce` above).
   */
  async function receiveRestartOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!pc) throw new Error('No active peer connection')
    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    return pc.localDescription as RTCSessionDescriptionInit
  }

  function getIceTransportPolicy(): RTCIceTransportPolicy {
    return currentTransportPolicy
  }

  /**
   * Inspect the ICE stats to find which candidate pair WebRTC actually chose.
   * Used by the UI to decide whether to suggest Quick Share (relay paths are
   * markedly slower and count against our Cloudflare TURN quota, so large
   * files over relay are the worst P2P case and a strong Quick Share cue).
   * Returns null when no pair is selected yet.
   */
  async function getSelectedCandidatePairType(): Promise<RTCIceCandidateType | null> {
    if (!pc) return null
    try {
      const stats = await pc.getStats()
      let pairId: string | null = null
      // Preferred: transport.selectedCandidatePairId (modern Chromium/Safari).
      stats.forEach((report) => {
        if (report.type === 'transport' && (report as { selectedCandidatePairId?: string }).selectedCandidatePairId) {
          pairId = (report as { selectedCandidatePairId?: string }).selectedCandidatePairId ?? null
        }
      })
      // Fallback: nominated + succeeded candidate-pair (Firefox path).
      if (!pairId) {
        stats.forEach((report) => {
          const r = report as { type: string; nominated?: boolean; state?: string; id: string }
          if (r.type === 'candidate-pair' && r.nominated && r.state === 'succeeded') {
            pairId = r.id
          }
        })
      }
      if (!pairId) return null
      const pair = stats.get(pairId) as { localCandidateId?: string } | undefined
      if (!pair?.localCandidateId) return null
      const local = stats.get(pair.localCandidateId) as { candidateType?: RTCIceCandidateType } | undefined
      return local?.candidateType ?? null
    }
    catch {
      return null
    }
  }

  /**
   * Extract both peers' DTLS fingerprints from the negotiated SDP.
   * Returns null until both local and remote descriptions are set.
   * Used to derive an SAS (Short Authentication String) so two paired users
   * can visually confirm no MITM is swapping certs on the signaling path.
   */
  function getDtlsFingerprints(): { local: string; remote: string } | null {
    if (!pc?.currentLocalDescription?.sdp || !pc.currentRemoteDescription?.sdp) return null
    const extract = (sdp: string): string => {
      const line = sdp.split(/\r?\n/).find(l => l.startsWith('a=fingerprint:'))
      if (!line) return ''
      // Format: "a=fingerprint:sha-256 AA:BB:..." — keep algorithm + hex.
      return line.slice('a=fingerprint:'.length).trim().toLowerCase()
    }
    const local = extract(pc.currentLocalDescription.sdp)
    const remote = extract(pc.currentRemoteDescription.sdp)
    if (!local || !remote) return null
    return { local, remote }
  }

  function sendControl(type: string, data?: unknown) {
    if (dataChannel?.readyState === 'open') {
      dataChannel.send(JSON.stringify({ type, data }))
    }
  }

  function sendText(text: string) {
    sendControl('text', text)
  }

  async function sendFile(file: File, onProgress?: (progress: number) => void) {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      throw new Error('Data channel not open')
    }

    sendCancelFlag = false

    const CHUNK_SIZE = 16384 // 16 KB
    const BUFFER_THRESHOLD = CHUNK_SIZE * 8
    dataChannel.bufferedAmountLowThreshold = CHUNK_SIZE * 2

    dataChannel.send(JSON.stringify({
      type: 'file-meta',
      name: file.name,
      size: file.size,
      mimeType: file.type,
    }))

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let offset = 0

    for (let i = 0; i < totalChunks; i++) {
      if (sendCancelFlag) {
        dataChannel.send(JSON.stringify({ type: 'file-cancel' }))
        throw new Error('cancelled')
      }

      // Backpressure: wait for buffer to drain using bufferedamountlow event
      while (dataChannel.bufferedAmount > BUFFER_THRESHOLD) {
        if (sendCancelFlag) {
          dataChannel.send(JSON.stringify({ type: 'file-cancel' }))
          throw new Error('cancelled')
        }
        await new Promise<void>((resolve) => {
          if (dataChannel!.bufferedAmount <= BUFFER_THRESHOLD) { resolve(); return }
          const handler = () => {
            dataChannel!.removeEventListener('bufferedamountlow', handler)
            resolve()
          }
          dataChannel!.addEventListener('bufferedamountlow', handler)
          // Safety fallback in case event misfires
          setTimeout(() => {
            dataChannel!.removeEventListener('bufferedamountlow', handler)
            resolve()
          }, 200)
        })
      }

      if (dataChannel.readyState !== 'open') throw new Error('Data channel closed')
      const chunk = file.slice(offset, offset + CHUNK_SIZE)
      const buffer = await chunk.arrayBuffer()
      dataChannel.send(buffer)
      offset += CHUNK_SIZE
      onProgress?.(Math.min(100, Math.round(((i + 1) / totalChunks) * 100)))
    }

    dataChannel.send(JSON.stringify({ type: 'file-end' }))
  }

  function cancelSend() {
    sendCancelFlag = true
  }

  function disconnect() {
    dataChannel?.close()
    pc?.close()
    pc = null
    dataChannel = null
    pendingRemoteCandidates.length = 0
    connectionState.value = 'closed'
  }

  onUnmounted(() => {
    disconnect()
  })

    return {
      connectionState,
      connect,
      setRemoteDescription,
      addIceCandidate,
      onIceCandidateEmit: (cb: (candidate: RTCIceCandidateInit) => void) => { onIceCandidate = cb },
      restartIce,
      receiveRestartOffer,
      getIceTransportPolicy,
      getDtlsFingerprints,
      getSelectedCandidatePairType,
      sendControl,
      sendText,
      sendFile,
      cancelSend,
      disconnect,
    }
}
