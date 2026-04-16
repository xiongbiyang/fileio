import { prefetchIceServers } from '~/composables/useWebRTC'
import {
  cleanupStaleOpfsFiles,
  createFileReceiver,
  isOpfsAvailable,
  type FileReceiver,
} from '~/composables/useFileReceiver'
import { writeToClipboard } from '~/utils/clipboard'
import { renderQrCodeToCanvas } from '~/utils/qrcode'
import { generateRoomId } from '~/utils/roomId'
import { formatSize, formatSpeed, formatTime } from '~/utils/transferFormat'
import { buildRoomJoinUrl } from '~/utils/shareLink'
import {
  textTransferKeyFingerprint,
  textTransferSecurityLogs,
} from '~/constants/toolPageData'
import type { DeviceHistoryItem, RecentTransferItem, TransferHistoryItem, TransferState } from '~/types/toolPages'

interface StoredTransferRecord {
  id: string
  name: string
  sizeBytes: number
  direction: 'sent' | 'received'
  status: 'pending' | 'completed' | 'failed'
  timestamp: number
  deviceName: string
  deviceIcon: string
}

interface StoredDeviceRecord {
  id: string
  name: string
  icon: string
  lastSeen: number
  online: boolean
}

const TRANSFER_HISTORY_KEY = 'tp_text_transfer_history'
const DEVICE_HISTORY_KEY = 'tp_text_transfer_devices'
const REMOTE_DEVICE_ID = 'remote-peer'

export function useTextTransferPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()
  const { notify } = useNotifier()
  const state = ref<TransferState>('waiting')
  const roomId = ref('')
  // 4-digit Short Authentication String derived from both peers' DTLS
  // fingerprints. Populated once the DataChannel opens. If a MITM swaps the
  // SDP on the signaling path they'd have to use their own cert → different
  // fingerprints → different digits on each side. Left as '----' until we
  // actually have both fingerprints so the UI never falsely reassures the user.
  const verificationDigits = ref(['-', '-', '-', '-'])
  const reconnectAttempt = ref(3)
  // Quick Share hint banner. We nudge users toward Tool B (R2-backed, resumable
  // download links) when the P2P path is a poor fit for the file they're about
  // to send. Three triggers:
  //   - big-file: queued a file > 500 MB (OPFS tab handles it but relay TURN
  //     or flaky mobile network makes P2P painful at that size)
  //   - relay:    the negotiated ICE candidate pair is `relay`, meaning all
  //     bytes go through Cloudflare TURN. Burns our quota + typically slower.
  //   - retry:    the connection has failed and re-established ≥2 times in
  //     this session. Signal of an unstable network — Quick Share sidesteps it.
  // Dismissal is remembered for the session so the banner doesn't nag.
  const quickShareHint = ref<'big-file' | 'relay' | 'retry' | null>(null)
  let quickShareHintDismissed = false
  let transferFailureCount = 0
  // Suggest Quick Share once queued file crosses 100 MB. Files 100-300 MB are
  // the "reasonable over WebRTC but better over a download link" band —
  // still transferable, but Quick Share's resumable URL wins if either peer
  // has a flaky network.
  const QUICK_SHARE_BIG_FILE_THRESHOLD = 100 * 1024 * 1024
  const QUICK_SHARE_FAILURE_THRESHOLD = 2
  const receivedMessages = ref<Array<{ id: string, content: string, isSelf: boolean, downloadUrl?: string, downloadName?: string }>>([])
  const mobileTextInput = ref('')
  const desktopTextInput = ref('')
  const isReceiver = ref(false)
  const qrCanvasElements = ref<(HTMLCanvasElement | null)[]>([])
  const transferProgress = ref(0)
  const transferredSize = ref('0 B')
  const transferSpeed = ref('--')
  const timeRemaining = ref('--')
  const currentFile = ref({ name: '', size: '' })
  const fileQueue = ref<File[]>([])
  const historyFilter = ref('All')
  let incomingFileMeta: { name: string, size: number, mimeType: string } | null = null
  let incomingReceiver: FileReceiver | null = null
  // Receiver creation is async (OPFS file handle + writer). Chunks that arrive
  // between file-meta and receiver readiness must await this promise so they
  // hit write() in the correct order.
  let incomingReceiverReady: Promise<FileReceiver> | null = null
  let incomingReceivedBytes = 0
  let incomingLastBytes = 0
  let incomingLastTime = 0
  let disconnectTimer: ReturnType<typeof setTimeout> | null = null
  let receiveTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  let iceWatchdogTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectBackoffTimer: ReturnType<typeof setTimeout> | null = null
  // Current exponential-backoff delay. Doubles each failed attempt, reset on
  // successful 'connected'. Protects against burning the retry quota on a
  // network that's still mid-recovery.
  const RECONNECT_BACKOFF_START_MS = 1_000
  const RECONNECT_BACKOFF_MAX_MS = 10_000
  let reconnectBackoffMs = RECONNECT_BACKOFF_START_MS
  let relayFallbackUsed = false
  const RECEIVE_TIMEOUT_MS = 30_000
  // Hard ceiling on initial ICE. If we're not 'connected' by this time, the
  // peers likely can't find a working candidate pair (symmetric NAT, strict
  // firewall). Fall back to a relay-only retry which forces TURN.
  const ICE_WATCHDOG_MS = 12_000
  // Hard cap on accepted file size. Backend-aware:
  //  - OPFS (Chromium / Safari 15.2+ / Firefox 111+): streams to disk — 300 MB.
  //    Usage data shows ≥95% of real transfers fit; larger files are better
  //    served by Quick Share's R2 + resumable download link.
  //  - Blob fallback (rare): in-memory, keep the stricter 100 MB ceiling to
  //    protect mobile Safari 15.0/15.1 tabs from OOM.
  const MAX_FILE_BYTES_OPFS = 300 * 1024 * 1024
  const MAX_FILE_BYTES_BLOB = 100 * 1024 * 1024
  const MAX_FILE_BYTES = isOpfsAvailable() ? MAX_FILE_BYTES_OPFS : MAX_FILE_BYTES_BLOB
  const transferRecords = ref<StoredTransferRecord[]>([])
  const deviceRecords = ref<StoredDeviceRecord[]>([])
  const remoteDeviceName = ref('')
  const remoteDeviceIcon = ref('devices')

  const webrtc = useWebRTC({
    onMessage: (data) => {
      if (typeof data === 'string') {
        try {
          const msg = JSON.parse(data)
          if (msg.type === 'text') {
            receivedMessages.value.push({ id: crypto.randomUUID(), content: msg.data as string, isSelf: false })
          }
          else if (msg.type === 'peer-meta') {
            applyRemotePeerMeta(msg.data)
          }
          else if (msg.type === 'file-meta') {
            const declaredSize = Number(msg.size)
            const rawName = typeof msg.name === 'string' ? msg.name : ''
            // Defend against malicious / buggy sender: bad size, path traversal
            // in filename, or oversized payload.
            if (
              !rawName
              || !Number.isFinite(declaredSize)
              || declaredSize < 0
              || declaredSize > MAX_FILE_BYTES
            ) {
              notify(t('common.transferFailed'), 'error')
              return
            }
            incomingFileMeta = {
              name: rawName.replace(/[/\\]/g, '_').slice(0, 255),
              size: declaredSize,
              mimeType: typeof msg.mimeType === 'string' ? msg.mimeType : '',
            }
            incomingReceivedBytes = 0
            incomingLastBytes = 0
            incomingLastTime = Date.now()
            // Start OPFS handle acquisition eagerly. Subsequent chunk handlers
            // await this promise so they write in arrival order even if
            // createWritable() is still in flight when the first chunk lands.
            incomingReceiverReady = createFileReceiver(incomingFileMeta)
              .then((r) => { incomingReceiver = r; return r })
              .catch(() => {
                notify(t('common.transferFailed'), 'error')
                resetIncomingFileState()
                state.value = 'waiting'
                throw new Error('receiver-init-failed')
              })
            currentFile.value = { name: incomingFileMeta.name, size: formatSize(declaredSize) }
            transferProgress.value = 0
            transferredSize.value = '0 B'
            transferSpeed.value = '--'
            timeRemaining.value = '--'
            state.value = 'transferring'
            resetReceiveTimeout()
          }
          else if (msg.type === 'file-end' && incomingFileMeta) {
            clearReceiveTimeout()
            const meta = incomingFileMeta
            void finalizeIncomingFile(meta)
          }
          else if (msg.type === 'file-cancel') {
            clearReceiveTimeout()
            void abortIncomingReceiver()
            resetIncomingFileState()
            state.value = 'waiting'
          }
        }
        catch {
          // Ignore malformed messages from remote peers.
        }
      }
      else if (data instanceof ArrayBuffer && incomingFileMeta) {
        void ingestChunk(data)
      }
    },
    onError: () => {
      if (state.value === 'transferring') {
        clearDisconnectTimer()
        attemptReconnect()
      }
    },
    onDataChannelOpen: () => {
      // `connectionState === 'connected'` fires before the DataChannel is guaranteed
      // 'open' (especially on the answerer side, which receives the channel via
      // ondatachannel). Sending peer-meta here ensures sendControl's readyState
      // check doesn't silently drop the message.
      sendLocalPeerMeta()
      void computeVerificationDigits()
      void checkRelayCandidateForHint()
    },
    onStateChange: (connectionState) => {
      if (connectionState === 'connected') {
        clearDisconnectTimer()
        clearIceWatchdog()
        clearReconnectBackoff()
        markRemoteDeviceOnline(true)
        // Refill the retry budget. Without this, 3 brief network blips over
        // an hour exhaust the counter and the 4th disconnect wedges the UI
        // in 'reconnecting' forever with no recovery path.
        reconnectAttempt.value = 3
        // Only reset the failure-retry hint counter on *clean* connections.
        // A user that keeps getting reconnected after visible failures
        // doesn't benefit from us hiding the Quick Share nudge.
        transferFailureCount = 0
        if (state.value === 'waiting' || state.value === 'reconnecting') {
          // Keep interactive controls available after handshake.
          // Actual transfer state is entered only when sending/receiving payload.
          state.value = 'waiting'
        }
        signaling.disconnect()
      }
      else if (connectionState === 'disconnected' && state.value === 'transferring') {
        markRemoteDeviceOnline(false)
        disconnectTimer = setTimeout(() => {
          if (webrtc.connectionState.value !== 'connected') scheduleReconnect()
        }, 8000)
      }
      else if (connectionState === 'failed') {
        clearDisconnectTimer()
        clearIceWatchdog()
        markRemoteDeviceOnline(false)
        transferFailureCount++
        if (transferFailureCount >= QUICK_SHARE_FAILURE_THRESHOLD) {
          raiseQuickShareHint('retry')
        }
        // Mid-transfer failure → reconnect on existing path.
        // Initial handshake failure → one-shot relay retry (forces TURN).
        if (state.value === 'transferring') {
          // Any in-flight receive can't be resumed across ICE restart — the
          // sender doesn't auto-retry the same file. Drop the partial OPFS
          // file rather than leaving orphaned bytes on disk, and tell the
          // user so they know to resend rather than wait.
          if (incomingFileMeta) {
            void abortIncomingReceiver()
            resetIncomingFileState()
            notify(t('common.transferFailed'), 'error')
          }
          scheduleReconnect()
        }
        else {
          void tryRelayFallback()
        }
      }
    },
  })
  const signaling = useSignaling(roomId)

  const queuedFiles = computed(() => fileQueue.value.map(file => ({ name: file.name, size: formatSize(file.size) })))
  const mobileRecentTransfers = computed<RecentTransferItem[]>(() =>
    transferRecords.value
      .filter(item => item.status === 'completed')
      .slice(0, 5)
      .map(item => ({
        icon: inferFileIcon(item.name),
        name: item.name,
        desc: `${formatSize(item.sizeBytes)} - ${item.direction === 'sent' ? t('toolA.recentDirectionSent') : t('toolA.recentDirectionReceived')}`,
        time: formatCompactElapsed(item.timestamp, t),
      })),
  )
  const devices = computed<DeviceHistoryItem[]>(() =>
    deviceRecords.value.map(item => ({
      icon: item.icon,
      name: item.name,
      time: formatElapsed(item.lastSeen, t),
      online: item.online,
    })),
  )
  const historyStats = computed(() => {
    const sentBytes = transferRecords.value
      .filter(item => item.direction === 'sent' && item.status === 'completed')
      .reduce((sum, item) => sum + item.sizeBytes, 0)
    const activeNodes = deviceRecords.value.filter(item => item.online).length
    return [
      { icon: 'upload', value: formatSize(sentBytes), label: t('toolA.totalSent') },
      { icon: 'hub', value: String(activeNodes).padStart(2, '0'), label: t('toolA.activeNodesLabel') },
      { icon: 'lock', value: 'AES-256', label: t('toolA.securityLevelLabel') },
    ]
  })
  const transferHistoryItems = computed<TransferHistoryItem[]>(() =>
    transferRecords.value
      .filter((item) => {
        if (historyFilter.value === 'Failed') return item.status === 'failed'
        if (historyFilter.value === 'Pending') return item.status === 'pending'
        return true
      })
      .map(item => ({
        name: item.name,
        size: formatSize(item.sizeBytes),
        icon: inferFileIcon(item.name),
        iconBg: item.status === 'completed' ? 'bg-primary-fixed/30' : item.status === 'failed' ? 'bg-error/10' : 'bg-secondary-container',
        iconColor: item.status === 'completed' ? 'text-primary' : item.status === 'failed' ? 'text-error' : 'text-on-secondary-container',
        device: item.deviceName,
        deviceIcon: item.deviceIcon,
        time: formatHistoryTimestamp(item.timestamp),
        status: item.status === 'completed'
          ? t('toolA.historyStatusCompleted')
          : item.status === 'failed'
              ? t('toolA.historyStatusFailed')
              : t('toolA.historyStatusPending'),
        statusClass: item.status === 'completed'
          ? 'bg-primary-fixed text-on-primary-fixed-variant'
          : item.status === 'failed'
              ? 'bg-error-container text-on-error-container'
              : 'bg-secondary-container text-on-secondary-container',
        dotClass: item.status === 'completed' ? 'bg-primary' : item.status === 'failed' ? 'bg-error' : 'bg-on-secondary-container',
      })),
  )
  const keyFingerprint = textTransferKeyFingerprint
  const securityLogs = textTransferSecurityLogs
  const docCards = computed(() => [
    { icon: 'security', title: t('toolA.docPrivateTitle'), desc: t('toolA.docPrivateDesc') },
    { icon: 'bolt', title: t('toolA.docFrictionTitle'), desc: t('toolA.docFrictionDesc') },
    { icon: 'history', title: t('toolA.docExpiringTitle'), desc: t('toolA.docExpiringDesc') },
  ])
  const isConnected = computed(() => webrtc.connectionState.value === 'connected')
  const connectedDeviceName = computed(() => remoteDeviceName.value || t('toolA.unknownDevice'))

  const { confirm: showConfirm } = useConfirmDialog()
  onBeforeRouteLeave(async () => {
    if (isConnected.value || state.value === 'transferring' || state.value === 'reconnecting') {
      const leave = await showConfirm({
        title: t('toolA.leaveTitle'),
        message: t('toolA.leaveWarning'),
        confirmText: t('toolA.leaveConfirm'),
        cancelText: t('toolA.leaveCancel'),
      })
      return leave
    }
  })

  onMounted(async () => {
    loadPersistedState()
    // Warm the STUN/TURN credential cache before either peer needs it.
    // Sender hits this path waiting for a scan; receiver hits it while the QR
    // scanner is still handing off to the browser — by the time either calls
    // webrtc.connect(), fetchIceServers() is either cached or well in flight.
    prefetchIceServers()
    // Reap orphaned OPFS files from a prior tab crash (tab closed mid-transfer
    // before cleanup ran). Non-blocking; we don't await.
    void cleanupStaleOpfsFiles()
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    // Network Information API — not in Safari but widely supported on
    // Android/Chrome where WiFi↔4G transitions are common.
    const conn = (navigator as unknown as { connection?: EventTarget }).connection
    conn?.addEventListener?.('change', handleNetworkChange)

    // Read room ID from multiple sources. The canonical entry point is
    // /j/[id] (path segment survives any redirect); this fallback chain
    // still handles ?r= / #r= links pasted manually or emitted by older
    // clients.
    const pickFirst = (v: unknown): string => {
      if (Array.isArray(v)) return String(v[0] ?? '')
      return typeof v === 'string' ? v : ''
    }
    const queryRoom = pickFirst(route.query.r)
    const urlParams = new URLSearchParams(window.location.search)
    const searchRoom = urlParams.get('r') || ''
    const hashRoom = window.location.hash.match(/r=([^&]+)/)?.[1] || ''
    const joinRoom = (queryRoom || searchRoom || hashRoom).trim().toLowerCase()


    if (joinRoom) {
      roomId.value = joinRoom
      await initReceiverMode()
    }
    else {
      roomId.value = generateRoomId('abcdefghjkmnpqrstuvwxyz23456789')
      await generateRoomQr()
      startSenderSignaling()
    }
  })

  onUnmounted(() => {
    clearDisconnectTimer()
    clearReceiveTimeout()
    clearIceWatchdog()
    clearReconnectBackoff()
    // If a transfer is in flight when user navigates away, abort the receiver
    // so the OPFS file is removed — otherwise it sits there until the 30min
    // stale-cleanup sweep on next mount.
    void abortIncomingReceiver()
    markRemoteDeviceOnline(false)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    const conn = (navigator as unknown as { connection?: EventTarget }).connection
    conn?.removeEventListener?.('change', handleNetworkChange)
  })

  function attachQrCanvas(elements: (HTMLCanvasElement | null)[]) {
    qrCanvasElements.value = elements
    // Canvas might arrive after generateRoomQr() was called — re-render
    if (elements.some(Boolean) && roomId.value && !isReceiver.value) {
      generateRoomQr()
    }
  }
  function clearDisconnectTimer() {
    if (disconnectTimer) {
      clearTimeout(disconnectTimer)
      disconnectTimer = null
    }
  }
  function resetReceiveTimeout() {
    if (receiveTimeoutTimer) clearTimeout(receiveTimeoutTimer)
    receiveTimeoutTimer = setTimeout(() => {
      if (incomingFileMeta) {
        void abortIncomingReceiver()
        resetIncomingFileState()
        attemptReconnect()
      }
    }, RECEIVE_TIMEOUT_MS)
  }

  function resetIncomingFileState() {
    incomingFileMeta = null
    incomingReceiver = null
    incomingReceiverReady = null
    incomingReceivedBytes = 0
    transferProgress.value = 0
    currentFile.value = { name: '', size: '' }
  }

  async function abortIncomingReceiver() {
    const r = incomingReceiver
    incomingReceiver = null
    incomingReceiverReady = null
    if (r) {
      try { await r.abort() }
      catch { /* best-effort */ }
    }
  }

  async function ingestChunk(data: ArrayBuffer) {
    if (!incomingFileMeta) return
    const next = incomingReceivedBytes + data.byteLength
    // Guard against a sender that under-declared size or ignores the cap.
    // Allow 64 KB overshoot for the final-chunk rounding edge case.
    if (next > MAX_FILE_BYTES || next > incomingFileMeta.size + 64 * 1024) {
      clearReceiveTimeout()
      await abortIncomingReceiver()
      resetIncomingFileState()
      state.value = 'waiting'
      notify(t('common.transferFailed'), 'error')
      return
    }
    try {
      // `incomingReceiverReady` resolves to the same FileReceiver as
      // `incomingReceiver` — await it so chunks arriving before createWritable()
      // finishes are still written in order.
      const r = incomingReceiver ?? (incomingReceiverReady ? await incomingReceiverReady : null)
      if (!r) return
      await r.write(data)
    }
    catch {
      // Disk full / writer aborted / quota exceeded — drop the transfer cleanly.
      clearReceiveTimeout()
      await abortIncomingReceiver()
      resetIncomingFileState()
      state.value = 'waiting'
      notify(t('common.transferFailed'), 'error')
      return
    }
    incomingReceivedBytes = next
    transferProgress.value = Math.round((incomingReceivedBytes / incomingFileMeta.size) * 100)
    transferredSize.value = formatSize(incomingReceivedBytes)
    const now = Date.now()
    const dt = (now - incomingLastTime) / 1000
    if (dt >= 0.5) {
      const speed = (incomingReceivedBytes - incomingLastBytes) / dt
      transferSpeed.value = formatSpeed(speed)
      timeRemaining.value = speed > 0 ? formatTime((incomingFileMeta.size - incomingReceivedBytes) / speed) : '--'
      incomingLastBytes = incomingReceivedBytes
      incomingLastTime = now
    }
    resetReceiveTimeout()
  }

  async function finalizeIncomingFile(meta: { name: string; size: number; mimeType: string }) {
    const receiver = incomingReceiver ?? (incomingReceiverReady ? await incomingReceiverReady.catch(() => null) : null)
    if (!receiver) {
      resetIncomingFileState()
      state.value = 'waiting'
      return
    }
    try {
      const { url, cleanup } = await receiver.finalize()
      pushTransferRecord({
        name: meta.name,
        sizeBytes: meta.size,
        direction: 'received',
        status: 'completed',
        ...getCurrentRemoteDeviceInfo(),
      })
      // Transition to 'waiting' before adding the message so that any
      // state-dependent guards (visibility change, disconnected) already see
      // the idle state by the time the message appears in the UI.
      incomingReceiver = null
      incomingReceiverReady = null
      resetIncomingFileState()
      state.value = 'waiting'
      // Render the file as a tappable download link in the message bubble.
      // Auto-clicking a.click() on mobile navigates the page to the blob URL
      // (iOS Safari ignores `download` attribute for blobs) — pressing Back
      // after that tears down the Vue component and closes the WebRTC connection.
      // A user-initiated tap on <a download> is handled correctly on all platforms.
      receivedMessages.value.push({
        id: crypto.randomUUID(),
        content: `📎 ${meta.name} (${formatSize(meta.size)})`,
        isSelf: false,
        downloadUrl: url,
        downloadName: meta.name,
      })
      // Keep the blob URL alive for 5 minutes so the user has time to tap it.
      // The OPFS stale-file reaper (cleanupStaleOpfsFiles on next mount) will
      // handle anything the 5-min timer misses.
      setTimeout(() => { void cleanup() }, 5 * 60 * 1000)
    }
    catch {
      notify(t('common.transferFailed'), 'error')
      try { await receiver.abort() }
      catch { /* best-effort */ }
      incomingReceiver = null
      incomingReceiverReady = null
      resetIncomingFileState()
      state.value = 'waiting'
    }
  }
  function clearReceiveTimeout() {
    if (receiveTimeoutTimer) {
      clearTimeout(receiveTimeoutTimer)
      receiveTimeoutTimer = null
    }
  }
  function startIceWatchdog() {
    clearIceWatchdog()
    iceWatchdogTimer = setTimeout(() => {
      if (webrtc.connectionState.value !== 'connected') {
        // No handshake after N seconds — treat as ICE dead-end and trigger relay retry.
        void tryRelayFallback()
      }
    }, ICE_WATCHDOG_MS)
  }
  function clearIceWatchdog() {
    if (iceWatchdogTimer) {
      clearTimeout(iceWatchdogTimer)
      iceWatchdogTimer = null
    }
  }
  async function tryRelayFallback() {
    // If we've already tried relay and it still failed, surface that to the
    // user — they'll keep staring at a spinner otherwise. This is almost
    // always a TURN deployment issue (credentials missing or rejected).
    if (relayFallbackUsed || webrtc.getIceTransportPolicy() === 'relay') {
      state.value = 'reconnecting'
      notify(t('common.roomConnectFailed'), 'error')
      return
    }
    // Only the offerer (receiver of the QR, i.e. the scanning device) drives
    // the retry. The sender stays as answerer but must re-arm its onOffer
    // handler: startSenderSignaling() nulled it after the first offer, so the
    // receiver's relay-retry offer would otherwise be silently dropped.
    if (!isReceiver.value) {
      state.value = 'reconnecting'
      signaling.onOffer.value = async (offer: RTCSessionDescriptionInit) => {
        try {
          setupTrickleIce()
          const answer = await webrtc.connect(offer)
          signaling.sendSignal('answer', answer)
        }
        catch {
          notify(t('common.roomConnectFailed'), 'error')
        }
      }
      return
    }
    relayFallbackUsed = true
    state.value = 'reconnecting'
    try {
      webrtc.disconnect()
      signaling.disconnect()
      pendingOffer = null
      peerPresent = false
      signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
        try {
          await webrtc.setRemoteDescription(answer)
        }
        catch {
          /* ICE watchdog will catch the timeout */
        }
      }
      signaling.onPeerCount.value = (count: number) => {
        peerPresent = count >= 2
        if (peerPresent && pendingOffer) signaling.sendSignal('offer', pendingOffer)
      }
      signaling.onPeerJoined.value = () => {
        peerPresent = true
        if (pendingOffer) signaling.sendSignal('offer', pendingOffer)
      }
      signaling.onRoomFull.value = handleRoomFull
      setupTrickleIce()
      signaling.connect()
      const offer = await webrtc.connect(undefined, { iceTransportPolicy: 'relay' })
      pendingOffer = offer
      if (peerPresent) signaling.sendSignal('offer', offer)
      startIceWatchdog()
    }
    catch {
      notify(t('common.roomConnectFailed'), 'error')
    }
  }
  function loadPersistedState() {
    transferRecords.value = safeParseStorage<StoredTransferRecord[]>(TRANSFER_HISTORY_KEY, [])
    deviceRecords.value = safeParseStorage<StoredDeviceRecord[]>(DEVICE_HISTORY_KEY, [])
  }
  function saveTransferRecords() {
    if (!import.meta.client) return
    localStorage.setItem(TRANSFER_HISTORY_KEY, JSON.stringify(transferRecords.value.slice(0, 100)))
  }
  function saveDeviceRecords() {
    if (!import.meta.client) return
    localStorage.setItem(DEVICE_HISTORY_KEY, JSON.stringify(deviceRecords.value.slice(0, 50)))
  }
  function upsertRemoteDevice(online: boolean) {
    const info = getCurrentRemoteDeviceInfo()
    const now = Date.now()
    const idx = deviceRecords.value.findIndex(item => item.id === REMOTE_DEVICE_ID)
    if (idx >= 0) {
      deviceRecords.value[idx] = {
        ...deviceRecords.value[idx],
        name: info.deviceName,
        icon: info.deviceIcon,
        online,
        lastSeen: now,
      }
    }
    else {
      deviceRecords.value.unshift({
        id: REMOTE_DEVICE_ID,
        name: info.deviceName,
        icon: info.deviceIcon,
        online,
        lastSeen: now,
      })
    }
    saveDeviceRecords()
  }
  function markRemoteDeviceOnline(online: boolean) {
    upsertRemoteDevice(online)
  }
  const localDeviceInfo = inferLocalDeviceInfo()
  function sendLocalPeerMeta() {
    webrtc.sendControl('peer-meta', {
      name: localDeviceInfo.name,
      icon: localDeviceInfo.icon,
    })
  }
  function raiseQuickShareHint(reason: 'big-file' | 'relay' | 'retry') {
    if (quickShareHintDismissed) return
    // Priority: retry > relay > big-file. Don't overwrite a higher-signal
    // hint with a lower one (big-file while user is failing to connect is
    // less actionable than "connection keeps failing").
    const rank = (r: typeof reason | null) => r === 'retry' ? 3 : r === 'relay' ? 2 : r === 'big-file' ? 1 : 0
    if (rank(reason) <= rank(quickShareHint.value)) return
    quickShareHint.value = reason
  }
  function dismissQuickShareHint() {
    quickShareHintDismissed = true
    quickShareHint.value = null
  }
  function switchToQuickShare() {
    quickShareHintDismissed = true
    quickShareHint.value = null
    void navigateTo(localePath('/share'))
  }
  async function checkRelayCandidateForHint() {
    // Give ICE a moment to actually select the nominated pair before asking —
    // getStats() may not have the transport report populated right at DC open.
    await new Promise(r => setTimeout(r, 300))
    const type = await webrtc.getSelectedCandidatePairType()
    if (type === 'relay') raiseQuickShareHint('relay')
  }
  async function computeVerificationDigits() {
    // Hash both fingerprints in a deterministic order so both peers arrive
    // at the same 4 digits. If a MITM swapped the SDP on the signaling wire
    // they'd need their own DTLS cert → the two sides would show different
    // digits, letting the user abort.
    const fp = webrtc.getDtlsFingerprints()
    if (!fp) return
    const canonical = [fp.local, fp.remote].sort().join('|')
    try {
      const bytes = new TextEncoder().encode(canonical)
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      const view = new DataView(digest)
      // Take first 4 bytes as a uint32 → 4 decimal digits (0000–9999).
      const num = view.getUint32(0) % 10000
      verificationDigits.value = num.toString().padStart(4, '0').split('')
    }
    catch {
      // crypto.subtle not available (very old / insecure context) — leave dashes
      // rather than silently fabricate a plausible-looking code.
    }
  }
  function applyRemotePeerMeta(raw: unknown) {
    if (!raw || typeof raw !== 'object') return
    const payload = raw as Record<string, unknown>
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const icon = typeof payload.icon === 'string' ? payload.icon.trim() : ''
    if (!name && !icon) return
    remoteDeviceName.value = name || remoteDeviceName.value
    remoteDeviceIcon.value = icon || remoteDeviceIcon.value
    upsertRemoteDevice(isConnected.value)
  }
  function getCurrentRemoteDeviceInfo() {
    return {
      deviceName: remoteDeviceName.value || t('toolA.unknownDevice'),
      deviceIcon: remoteDeviceIcon.value,
    }
  }
  function pushTransferRecord(record: Omit<StoredTransferRecord, 'id' | 'timestamp'>) {
    const inserted = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...record,
    }
    transferRecords.value.unshift(inserted)
    transferRecords.value = transferRecords.value.slice(0, 100)
    saveTransferRecords()
    return inserted.id
  }
  function updateTransferRecord(id: string, patch: Partial<StoredTransferRecord>) {
    const idx = transferRecords.value.findIndex(item => item.id === id)
    if (idx < 0) return
    transferRecords.value[idx] = {
      ...transferRecords.value[idx],
      ...patch,
      timestamp: patch.timestamp ?? Date.now(),
    }
    saveTransferRecords()
  }
  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (isConnected.value || state.value === 'transferring' || state.value === 'reconnecting') {
      event.preventDefault()
      event.returnValue = ''
    }
  }
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && state.value === 'transferring' && webrtc.connectionState.value !== 'connected') {
      clearDisconnectTimer()
      scheduleReconnect()
    }
  }
  function handleOffline() {
    // OS-level offline — stop waiting for WebRTC's 30s consent-freshness
    // timeout and reflect the state immediately in the UI.
    if (state.value === 'transferring' || isConnected.value) {
      clearDisconnectTimer()
      state.value = 'reconnecting'
    }
  }
  function handleOnline() {
    // System came back online. Only retry if we are already in the reconnect
    // loop — 'waiting' (no peer yet) and other idle states have nothing to
    // restart, and the old `connectionState !== 'connected'` guard mistakenly
    // fired when pc was still null ('new'/'closed'), wasting a retry budget
    // and flipping state to 'reconnecting' while the user was just showing QR.
    if (state.value === 'reconnecting') {
      clearDisconnectTimer()
      scheduleReconnect()
    }
  }
  function handleNetworkChange() {
    // navigator.connection fires when the effective network type changes
    // (WiFi → cellular, new SSID, etc.). The old ICE candidate pair is
    // instantly stale — trigger a restart instead of waiting for it to fail.
    if (webrtc.connectionState.value === 'connected') {
      // Active session on a new network — force restart.
      void attemptReconnect()
    }
    else if (state.value === 'reconnecting') {
      // Already in the reconnect loop — kick it sooner than the backoff.
      clearReconnectBackoff()
      scheduleReconnect()
    }
  }
  function scheduleReconnect() {
    if (reconnectBackoffTimer) return
    const delay = reconnectBackoffMs
    reconnectBackoffMs = Math.min(reconnectBackoffMs * 2, RECONNECT_BACKOFF_MAX_MS)
    reconnectBackoffTimer = setTimeout(() => {
      reconnectBackoffTimer = null
      void attemptReconnect()
    }, delay)
  }
  function clearReconnectBackoff() {
    if (reconnectBackoffTimer) {
      clearTimeout(reconnectBackoffTimer)
      reconnectBackoffTimer = null
    }
    reconnectBackoffMs = RECONNECT_BACKOFF_START_MS
  }
  async function attemptReconnect() {
    if (reconnectAttempt.value <= 0) {
      // All ICE-restart attempts exhausted — the remote peer has most likely
      // left permanently. Mint a fresh room so the sender can display a new
      // QR and accept a new connection without requiring a manual page reload.
      notify(t('common.transferFailed'), 'error')
      if (!isReceiver.value) {
        isReceiver.value = false
        refreshQr()
      }
      else {
        // Receiver can't generate a new QR — tell them to ask the sender.
        state.value = 'reconnecting'
      }
      return
    }
    // If we're offline at the OS level, don't burn an attempt — wait for the
    // 'online' handler to resume us once the network actually comes back.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      state.value = 'reconnecting'
      return
    }
    reconnectAttempt.value--
    state.value = 'reconnecting'
    try {
      signaling.onRoomFull.value = handleRoomFull
      if (!isReceiver.value) {
        // Sender becomes the ICE-restart offerer. Use the same pending-offer
        // pattern as initReceiverMode() so the restart offer is (re)sent once
        // the receiver's signaling socket lands in the room — both peers
        // reconnect independently and either may arrive first.
        let pendingRestartOffer: RTCSessionDescriptionInit | null = null
        signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
          try {
            await webrtc.setRemoteDescription(answer)
          }
          catch {
            /* retry loop in onStateChange will trip eventually */
          }
        }
        signaling.onPeerCount.value = (count: number) => {
          if (count >= 2 && pendingRestartOffer) signaling.sendSignal('offer', pendingRestartOffer)
        }
        signaling.onPeerJoined.value = () => {
          if (pendingRestartOffer) signaling.sendSignal('offer', pendingRestartOffer)
        }
        signaling.connect()
        const restartOffer = await webrtc.restartIce()
        pendingRestartOffer = restartOffer
        // Also try sending immediately — receiver may already be in the room.
        signaling.sendSignal('offer', restartOffer)
      }
      else {
        signaling.onOffer.value = async (offer: RTCSessionDescriptionInit) => {
          try {
            const answer = await webrtc.receiveRestartOffer(offer)
            signaling.sendSignal('answer', answer)
          }
          catch {
            /* ditto */
          }
        }
        signaling.connect()
      }
    }
    catch {
      notify(t('common.roomConnectFailed'), 'error')
      state.value = 'reconnecting'
    }
  }
  async function generateRoomQr() {
    await nextTick()
    const canvases = qrCanvasElements.value.filter((c): c is HTMLCanvasElement => c !== null)
    if (!canvases.length || !roomId.value) return
    try {
      const url = buildRoomJoinUrl(window.location.origin, localePath(`/j/${roomId.value}`))
      if (!url) return
      for (const canvas of canvases) {
        await renderQrCodeToCanvas(canvas, url, { width: 220, margin: 2 })
      }
    }
    catch {
      notify(t('common.qrFailed'), 'error')
    }
  }
  function setupTrickleIce() {
    // Send local ICE candidates to remote peer via signaling
    // Must be called BEFORE webrtc.connect() to avoid losing early candidates
    webrtc.onIceCandidateEmit((candidate) => {
      signaling.sendSignal('candidate', candidate)
    })
    // Receive remote ICE candidates from signaling
    signaling.onCandidate.value = async (candidate: RTCIceCandidateInit) => {
      await webrtc.addIceCandidate(candidate)
    }
  }
  function startSenderSignaling() {
    setupTrickleIce()
    // Named so we can re-arm after a bad offer without self-referential tricks.
    const handleIncomingOffer = async (offer: RTCSessionDescriptionInit) => {
      signaling.onOffer.value = null
      try {
        const answer = await webrtc.connect(offer)
        signaling.sendSignal('answer', answer)
        // Start watchdog so relay fallback fires if ICE gets stuck in
        // 'checking' on the sender side (some mobile browsers never fire
        // 'failed' themselves; the receiver drives relay but only if the
        // sender also times out and re-arms its offer handler via tryRelayFallback).
        startIceWatchdog()
      }
      catch {
        // Malformed / hostile SDP — surface the error and re-arm for a
        // legitimate retry instead of wedging silently.
        notify(t('common.roomConnectFailed'), 'error')
        signaling.onOffer.value = handleIncomingOffer
      }
    }
    signaling.onOffer.value = handleIncomingOffer
    signaling.onRoomFull.value = handleRoomFull
    signaling.connect()
  }

  function handleRoomFull() {
    // Server told us this room already has 2 peers. Don't retry — surface
    // a dedicated message and move to reconnecting (user will typically
    // refresh the QR to mint a new room id).
    clearIceWatchdog()
    state.value = 'reconnecting'
    notify(t('common.roomFull'), 'error')
  }
  // Stash the current offer so we can (re)send it whenever the sender is
  // confirmed present. Avoids two races:
  //  1. Receiver joins an empty room (sender not connected yet) → the first
  //     offer is broadcast to zero peers and is lost forever.
  //  2. Sender briefly loses its WS and re-joins → it missed the earlier offer.
  let pendingOffer: RTCSessionDescriptionInit | null = null
  let peerPresent = false

  async function initReceiverMode() {
    isReceiver.value = true
    relayFallbackUsed = false
    pendingOffer = null
    peerPresent = false
    try {
      signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
        try {
          await webrtc.setRemoteDescription(answer)
        }
        catch {
          // Malformed answer — let the ICE watchdog handle the timeout path.
        }
      }
      // peer-count arrives immediately on signaling connect. If sender is
      // already in the room (the common case) we flush the offer right away;
      // otherwise we wait for peer-joined.
      signaling.onPeerCount.value = (count: number) => {
        peerPresent = count >= 2
        if (peerPresent && pendingOffer) signaling.sendSignal('offer', pendingOffer)
      }
      signaling.onPeerJoined.value = () => {
        peerPresent = true
        if (pendingOffer) signaling.sendSignal('offer', pendingOffer)
      }
      signaling.onPeerLeft.value = () => {
        // Sender vanished mid-handshake. Next peer-joined will trigger a
        // resend of the current offer — stay idempotent.
        peerPresent = false
      }
      signaling.onRoomFull.value = handleRoomFull
      setupTrickleIce()
      signaling.connect()
      const offer = await webrtc.connect()
      pendingOffer = offer
      if (peerPresent) signaling.sendSignal('offer', offer)
      startIceWatchdog()
    }
    catch {
      notify(t('common.roomConnectFailed'), 'error')
    }
  }
  async function copyLink() {
    try {
      const url = buildRoomJoinUrl(window.location.origin, localePath(`/j/${roomId.value}`))
      if (!url) return
      await writeToClipboard(url)
      notify(t('common.copied'))
    }
    catch {
      notify(t('common.copyFailed'), 'error')
    }
  }
  function refreshQr() {
    state.value = 'waiting'
    roomId.value = generateRoomId('abcdefghjkmnpqrstuvwxyz23456789')
    reconnectAttempt.value = 3
    relayFallbackUsed = false
    verificationDigits.value = ['-', '-', '-', '-']
    clearIceWatchdog()
    clearReconnectBackoff()
    markRemoteDeviceOnline(false)
    webrtc.disconnect()
    signaling.disconnect()
    generateRoomQr().then(() => startSenderSignaling())
  }
  async function disconnectAndRefresh() {
    const leave = await showConfirm({
      title: t('toolA.disconnectTitle'),
      message: t('toolA.disconnectMessage'),
      confirmText: t('toolA.disconnectConfirm'),
      cancelText: t('toolA.leaveCancel'),
    })
    if (leave) {
      receivedMessages.value = []
      isReceiver.value = false
      refreshQr()
    }
  }
  function goToWaitingState() {
    state.value = 'waiting'
  }
  // Receiver-side caps are enforced again on arrival — this is a UX-level
  // pre-check so oversize files are rejected before the sender spends time
  // reading chunks off disk and the receiver has to abort mid-stream.
  // Use the most permissive cap (OPFS path) on the sender: the receiver will
  // apply its own stricter Blob cap if needed and reject on file-meta.
  function filterAcceptableFiles(files: File[]): File[] {
    const ok: File[] = []
    let hasBigFile = false
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES_OPFS) {
        notify(t('common.fileTooLarge', { name: file.name }), 'error')
        continue
      }
      if (file.size > QUICK_SHARE_BIG_FILE_THRESHOLD) hasBigFile = true
      ok.push(file)
    }
    if (hasBigFile) raiseQuickShareHint('big-file')
    return ok
  }

  function addFilesToQueue(files: File[]) {
    fileQueue.value.push(...filterAcceptableFiles(files))
  }
  function clearFileQueue() {
    fileQueue.value = []
  }
  function removeQueuedFile(index: number) {
    fileQueue.value.splice(index, 1)
  }
  async function startTransfer() {
    if (!fileQueue.value.length || !isConnected.value) return
    state.value = 'transferring'
    let lastBytes = 0
    let lastTime = Date.now()
    for (const file of fileQueue.value) {
      currentFile.value = { name: file.name, size: formatSize(file.size) }
      transferProgress.value = 0
      transferredSize.value = '0 B'
      transferSpeed.value = '--'
      timeRemaining.value = '--'
      lastBytes = 0
      lastTime = Date.now()
      const pendingRecordId = pushTransferRecord({
        name: file.name,
        sizeBytes: file.size,
        direction: 'sent',
        status: 'pending',
        ...getCurrentRemoteDeviceInfo(),
      })
      try {
        await webrtc.sendFile(file, (progress) => {
          transferProgress.value = progress
          const bytesDone = Math.round(file.size * progress / 100)
          transferredSize.value = formatSize(bytesDone)
          const now = Date.now()
          const dt = (now - lastTime) / 1000
          if (dt >= 0.5) {
            const speed = (bytesDone - lastBytes) / dt
            transferSpeed.value = formatSpeed(speed)
            timeRemaining.value = speed > 0 ? formatTime((file.size - bytesDone) / speed) : '--'
            lastBytes = bytesDone
            lastTime = now
          }
        })
        updateTransferRecord(pendingRecordId, { status: 'completed' })
        // Show sent file in message list
        receivedMessages.value.push({
          id: crypto.randomUUID(),
          content: `📎 ${file.name} (${formatSize(file.size)})`,
          isSelf: true,
        })
      }
      catch {
        updateTransferRecord(pendingRecordId, { status: 'failed' })
        notify(t('common.transferFailed'), 'error')
      }
    }
    fileQueue.value = []
    transferProgress.value = 0
    currentFile.value = { name: '', size: '' }
    // Return to transfer UI — stay connected for more transfers
    state.value = 'waiting'
  }
  function cancelTransfer() {
    webrtc.cancelSend()
    clearReceiveTimeout()
    void abortIncomingReceiver()
    resetIncomingFileState()
    transferredSize.value = '0 B'
    fileQueue.value = []
    state.value = 'waiting'
  }
  function mobileSend() {
    const text = mobileTextInput.value.trim()
    if (!text || !isConnected.value) return
    webrtc.sendText(text)
    receivedMessages.value.push({ id: crypto.randomUUID(), content: text, isSelf: true })
    mobileTextInput.value = ''
  }
  function desktopSend() {
    const text = desktopTextInput.value.trim()
    if (!text || !isConnected.value) return
    webrtc.sendText(text)
    receivedMessages.value.push({ id: crypto.randomUUID(), content: text, isSelf: true })
    desktopTextInput.value = ''
  }
  function handleDesktopFileSelect(files: File[]) {
    if (!files.length || !isConnected.value) return
    const acceptable = filterAcceptableFiles(files)
    if (!acceptable.length) return
    fileQueue.value = acceptable
    startTransfer()
  }
  async function handleMobileFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files?.[0] || !isConnected.value) return
    const file = input.files[0]
    input.value = ''
    if (file.size > MAX_FILE_BYTES_OPFS) {
      notify(t('common.fileTooLarge', { name: file.name }), 'error')
      return
    }
    currentFile.value = { name: file.name, size: formatSize(file.size) }
    transferProgress.value = 0
    transferredSize.value = '0 B'
    transferSpeed.value = '--'
    timeRemaining.value = '--'
    state.value = 'transferring'
    let lastBytes = 0
    let lastTime = Date.now()
    const pendingRecordId = pushTransferRecord({
      name: file.name,
      sizeBytes: file.size,
      direction: 'sent',
      status: 'pending',
      ...getCurrentRemoteDeviceInfo(),
    })
    try {
      await webrtc.sendFile(file, (progress) => {
        transferProgress.value = progress
        const bytesDone = Math.round(file.size * progress / 100)
        transferredSize.value = formatSize(bytesDone)
        const now = Date.now()
        const dt = (now - lastTime) / 1000
        if (dt >= 0.5) {
          const speed = (bytesDone - lastBytes) / dt
          transferSpeed.value = formatSpeed(speed)
          timeRemaining.value = speed > 0 ? formatTime((file.size - bytesDone) / speed) : '--'
          lastBytes = bytesDone
          lastTime = now
        }
      })
      updateTransferRecord(pendingRecordId, { status: 'completed' })
      receivedMessages.value.push({
        id: crypto.randomUUID(),
        content: `📎 ${file.name} (${formatSize(file.size)})`,
        isSelf: true,
      })
      transferProgress.value = 0
      currentFile.value = { name: '', size: '' }
      state.value = 'waiting'
    }
    catch {
      updateTransferRecord(pendingRecordId, { status: 'failed' })
      notify(t('common.transferFailed'), 'error')
      state.value = 'waiting'
    }
  }

  return {
    addFilesToQueue, attachQrCanvas, cancelTransfer, clearFileQueue, copyLink,
    connectedDeviceName, currentFile, desktopSend, desktopTextInput, devices, disconnectAndRefresh, docCards, goToWaitingState, handleDesktopFileSelect, handleMobileFileSelect,
    historyFilter, historyStats, isConnected, isReceiver, keyFingerprint, localDeviceInfo, mobileRecentTransfers,
    mobileSend, mobileTextInput, queuedFiles, receivedMessages, reconnectAttempt,
    refreshQr, remoteDeviceIcon, removeQueuedFile, roomId, securityLogs, startTransfer, state,
    timeRemaining, transferHistoryItems, transferProgress, transferSpeed, transferredSize, verificationDigits,
    quickShareHint, dismissQuickShareHint, switchToQuickShare,
  }
}

function safeParseStorage<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  }
  catch {
    return fallback
  }
}

function inferFileIcon(fileName: string) {
  const lower = fileName.toLowerCase()
  if (/\.(png|jpg|jpeg|webp|gif|svg)$/.test(lower)) return 'image'
  if (/\.(mp4|mov|avi|mkv|webm)$/.test(lower)) return 'movie'
  if (/\.(mp3|wav|aac|ogg|flac)$/.test(lower)) return 'music_note'
  return 'description'
}

function formatCompactElapsed(timestamp: number, t: (key: string, params?: Record<string, unknown>) => string) {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return t('toolA.timeNowShort')
  if (diff < 3_600_000) return t('toolA.timeMinuteShort', { n: Math.floor(diff / 60_000) })
  if (diff < 86_400_000) return t('toolA.timeHourShort', { n: Math.floor(diff / 3_600_000) })
  return t('toolA.timeDayShort', { n: Math.floor(diff / 86_400_000) })
}

function formatElapsed(timestamp: number, t: (key: string, params?: Record<string, unknown>) => string) {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return t('toolA.timeJustNow')
  if (diff < 3_600_000) return t('toolA.timeMinutesAgo', { n: Math.floor(diff / 60_000) })
  if (diff < 86_400_000) return t('toolA.timeHoursAgo', { n: Math.floor(diff / 3_600_000) })
  return t('toolA.timeDaysAgo', { n: Math.floor(diff / 86_400_000) })
}

function formatHistoryTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function inferLocalDeviceInfo() {
  if (!import.meta.client) {
    return { name: 'Web Device', icon: 'devices' }
  }
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('iphone')) return { name: 'iPhone', icon: 'smartphone' }
  if (ua.includes('ipad')) return { name: 'iPad', icon: 'tablet_mac' }
  if (ua.includes('android')) return { name: 'Android', icon: 'smartphone' }
  if (ua.includes('windows')) return { name: 'Windows', icon: 'laptop_windows' }
  if (ua.includes('mac os')) return { name: 'Mac', icon: 'laptop_mac' }
  if (ua.includes('linux')) return { name: 'Linux', icon: 'computer' }
  return { name: 'Web Device', icon: 'devices' }
}
