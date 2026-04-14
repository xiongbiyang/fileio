interface WebRTCOptions {
  onMessage?: (data: string | ArrayBuffer) => void
  onStateChange?: (state: RTCPeerConnectionState) => void
  onDataChannelOpen?: () => void
  onError?: (error: Error) => void
}

interface WebRTCReturn {
  connectionState: Ref<RTCPeerConnectionState>
  connect: (offer?: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
  setRemoteDescription: (desc: RTCSessionDescriptionInit) => Promise<void>
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>
  onIceCandidateEmit: (cb: (candidate: RTCIceCandidateInit) => void) => void
  restartIce: () => Promise<RTCSessionDescriptionInit>
  receiveRestartOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
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

async function fetchIceServers(): Promise<RTCIceServer[]> {
  if (!import.meta.client) return FALLBACK_STUN
  try {
    const data = await $fetch<{ iceServers: RTCIceServer[] }>('/api/turn-credentials')
    return data.iceServers?.length ? data.iceServers : FALLBACK_STUN
  }
  catch {
    return FALLBACK_STUN
  }
}

export function useWebRTC(options: WebRTCOptions = {}): WebRTCReturn {
  const connectionState = ref<RTCPeerConnectionState>('new')
  let pc: RTCPeerConnection | null = null
  let dataChannel: RTCDataChannel | null = null
  let sendCancelFlag = false

  let onIceCandidate: ((candidate: RTCIceCandidateInit) => void) | null = null
  const pendingRemoteCandidates: RTCIceCandidateInit[] = []

  function initPeerConnection(iceServers: RTCIceServer[]) {
    pc = new RTCPeerConnection({ iceServers })

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

  function waitForIceGathering(peerConnection: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
      if (peerConnection.iceGatheringState === 'complete') {
        resolve()
        return
      }
      const handler = () => {
        if (peerConnection.iceGatheringState === 'complete') {
          peerConnection.removeEventListener('icegatheringstatechange', handler)
          resolve()
        }
      }
      peerConnection.addEventListener('icegatheringstatechange', handler)
      // Safety timeout: proceed even if ICE gathering stalls
      setTimeout(() => {
        peerConnection.removeEventListener('icegatheringstatechange', handler)
        resolve()
      }, 2000)
    })
  }

  async function connect(offer?: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    disconnect()
    const iceServers = await fetchIceServers()
    initPeerConnection(iceServers)
    if (!pc) throw new Error('Failed to create peer connection')

    if (offer) {
      // Answerer path — Trickle ICE: send answer immediately, candidates follow
      await pc.setRemoteDescription(offer)
      // Flush any candidates that arrived before PeerConnection was ready
      for (const c of pendingRemoteCandidates) {
        await pc.addIceCandidate(new RTCIceCandidate(c))
      }
      pendingRemoteCandidates.length = 0
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      return pc.localDescription as RTCSessionDescriptionInit
    }

    // Offerer path — Trickle ICE: send offer immediately, candidates follow
    dataChannel = pc.createDataChannel('fileio-transfer', { ordered: true })
    setupDataChannel()
    const createdOffer = await pc.createOffer()
    await pc.setLocalDescription(createdOffer)
    return pc.localDescription as RTCSessionDescriptionInit
  }

  async function setRemoteDescription(desc: RTCSessionDescriptionInit) {
    if (!pc) return
    await pc.setRemoteDescription(desc)
    // Flush buffered candidates now that remote description is set
    for (const c of pendingRemoteCandidates) {
      await pc.addIceCandidate(new RTCIceCandidate(c))
    }
    pendingRemoteCandidates.length = 0
  }

  async function addIceCandidate(candidate: RTCIceCandidateInit) {
    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    } else {
      // Buffer until PeerConnection + remoteDescription are ready
      pendingRemoteCandidates.push(candidate)
    }
  }

  /**
   * ICE restart — offerer side only.
   * Reuses the existing RTCPeerConnection and DataChannel; only ICE is restarted.
   * Returns the new offer to be sent to the answerer via signaling.
   */
  async function restartIce(): Promise<RTCSessionDescriptionInit> {
    if (!pc) throw new Error('No active peer connection')
    const offer = await pc.createOffer({ iceRestart: true })
    await pc.setLocalDescription(offer)
    await waitForIceGathering(pc)
    return pc.localDescription as RTCSessionDescriptionInit
  }

  /**
   * ICE restart — answerer side only.
   * Receives a restart offer from the offerer, produces a new answer.
   */
  async function receiveRestartOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!pc) throw new Error('No active peer connection')
    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await waitForIceGathering(pc)
    return pc.localDescription as RTCSessionDescriptionInit
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
      sendControl,
      sendText,
      sendFile,
      cancelSend,
      disconnect,
    }
}
