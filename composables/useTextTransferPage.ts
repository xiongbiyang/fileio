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
  const qrExpired = ref(false)
  const roomId = ref('')
  const verificationDigits = ref(['8', '4', '9', '2'])
  const reconnectAttempt = ref(3)
  const receivedMessages = ref<Array<{ id: string, content: string, isSelf: boolean }>>([])
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
  let incomingFileChunks: ArrayBuffer[] = []
  let incomingReceivedBytes = 0
  let disconnectTimer: ReturnType<typeof setTimeout> | null = null
  let receiveTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  const RECEIVE_TIMEOUT_MS = 30_000
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
            incomingFileMeta = { name: msg.name as string, size: msg.size as number, mimeType: msg.mimeType as string }
            incomingFileChunks = []
            incomingReceivedBytes = 0
            currentFile.value = { name: msg.name as string, size: formatSize(msg.size as number) }
            transferProgress.value = 0
            state.value = 'transferring'
            resetReceiveTimeout()
          }
          else if (msg.type === 'file-end' && incomingFileMeta) {
            clearReceiveTimeout()
            pushTransferRecord({
              name: incomingFileMeta.name,
              sizeBytes: incomingFileMeta.size,
              direction: 'received',
              status: 'completed',
              ...getCurrentRemoteDeviceInfo(),
            })
            const blob = new Blob(incomingFileChunks, { type: incomingFileMeta.mimeType || 'application/octet-stream' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = incomingFileMeta.name
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            // Show file in message list so both sides can see transfer history
            receivedMessages.value.push({
              id: crypto.randomUUID(),
              content: `📎 ${incomingFileMeta.name} (${formatSize(incomingFileMeta.size)})`,
              isSelf: false,
            })
            incomingFileMeta = null
            incomingFileChunks = []
            incomingReceivedBytes = 0
            transferProgress.value = 0
            currentFile.value = { name: '', size: '' }
            // Return to transfer UI instead of success screen
            state.value = 'waiting'
          }
          else if (msg.type === 'file-cancel') {
            clearReceiveTimeout()
            incomingFileMeta = null
            incomingFileChunks = []
            incomingReceivedBytes = 0
            transferProgress.value = 0
            currentFile.value = { name: '', size: '' }
            state.value = 'transferring'
          }
        }
        catch {
          // Ignore malformed messages from remote peers.
        }
      }
      else if (data instanceof ArrayBuffer && incomingFileMeta) {
        incomingFileChunks.push(data)
        incomingReceivedBytes += data.byteLength
        transferProgress.value = Math.round((incomingReceivedBytes / incomingFileMeta.size) * 100)
        transferredSize.value = formatSize(incomingReceivedBytes)
        resetReceiveTimeout()
      }
    },
    onError: () => {
      if (state.value === 'transferring') {
        clearDisconnectTimer()
        attemptReconnect()
      }
    },
    onStateChange: (connectionState) => {
      if (connectionState === 'connected') {
        clearDisconnectTimer()
        markRemoteDeviceOnline(true)
        sendLocalPeerMeta()
        if (state.value === 'pairing' || state.value === 'waiting' || state.value === 'reconnecting') {
          // Keep interactive controls available after handshake.
          // Actual transfer state is entered only when sending/receiving payload.
          state.value = 'waiting'
        }
        signaling.disconnect()
      }
      else if (connectionState === 'disconnected' && state.value === 'transferring') {
        markRemoteDeviceOnline(false)
        disconnectTimer = setTimeout(() => {
          if (webrtc.connectionState.value !== 'connected') attemptReconnect()
        }, 8000)
      }
      else if (connectionState === 'failed' && state.value === 'transferring') {
        clearDisconnectTimer()
        markRemoteDeviceOnline(false)
        attemptReconnect()
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
    if (isConnected.value || state.value === 'transferring') {
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
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Read room ID from multiple sources to survive redirects / hydration issues
    const queryRoom = route.query.r as string | undefined
    const urlParams = new URLSearchParams(window.location.search)
    const searchRoom = urlParams.get('r') || undefined
    const hashRoom = window.location.hash.match(/r=([^&]+)/)?.[1]
    const joinRoom = (queryRoom || searchRoom || hashRoom || '').trim().toLowerCase()


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
    markRemoteDeviceOnline(false)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
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
        incomingFileMeta = null
        incomingFileChunks = []
        incomingReceivedBytes = 0
        transferProgress.value = 0
        currentFile.value = { name: '', size: '' }
        attemptReconnect()
      }
    }, RECEIVE_TIMEOUT_MS)
  }
  function clearReceiveTimeout() {
    if (receiveTimeoutTimer) {
      clearTimeout(receiveTimeoutTimer)
      receiveTimeoutTimer = null
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
  function sendLocalPeerMeta() {
    const meta = inferLocalDeviceInfo()
    webrtc.sendControl('peer-meta', {
      name: meta.name,
      icon: meta.icon,
    })
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
    if (isConnected.value || state.value === 'transferring') {
      event.preventDefault()
      event.returnValue = ''
    }
  }
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && state.value === 'transferring' && webrtc.connectionState.value !== 'connected') {
      clearDisconnectTimer()
      attemptReconnect()
    }
  }
  async function attemptReconnect() {
    if (reconnectAttempt.value <= 0) {
      state.value = 'reconnecting'
      return
    }
    reconnectAttempt.value--
    state.value = 'reconnecting'
    try {
      if (!isReceiver.value) {
        signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
          await webrtc.setRemoteDescription(answer)
          signaling.disconnect()
        }
        signaling.connect()
        const restartOffer = await webrtc.restartIce()
        await signaling.sendSignal('offer', restartOffer)
      }
      else {
        signaling.onOffer.value = async (offer: RTCSessionDescriptionInit) => {
          const answer = await webrtc.receiveRestartOffer(offer)
          await signaling.sendSignal('answer', answer)
          signaling.disconnect()
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
      const url = buildRoomJoinUrl(window.location.origin, localePath('/tools/text-transfer'), roomId.value)
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
    signaling.onOffer.value = async (offer: RTCSessionDescriptionInit) => {
      signaling.onOffer.value = null
      const answer = await webrtc.connect(offer)
      signaling.sendSignal('answer', answer)
    }
    signaling.connect()
  }
  async function initReceiverMode() {
    isReceiver.value = true
    try {
      signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
        await webrtc.setRemoteDescription(answer)
      }
      setupTrickleIce()
      signaling.connect()
      const offer = await webrtc.connect()
      signaling.sendSignal('offer', offer)
    }
    catch {
      notify(t('common.roomConnectFailed'), 'error')
    }
  }
  async function copyLink() {
    try {
      const url = buildRoomJoinUrl(window.location.origin, localePath('/tools/text-transfer'), roomId.value)
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
    qrExpired.value = false
    reconnectAttempt.value = 3
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
  function confirmPairing() {
    if (webrtc.connectionState.value !== 'connected') return
    state.value = 'waiting'
  }
  function denyPairing() {
    state.value = 'waiting'
  }
  function startNewTransfer() {
    state.value = 'waiting'
    refreshQr()
  }
  function goToWaitingState() {
    state.value = 'waiting'
  }
  function addFilesToQueue(files: File[]) {
    fileQueue.value.push(...files)
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
    incomingFileMeta = null
    incomingFileChunks = []
    incomingReceivedBytes = 0
    transferProgress.value = 0
    transferredSize.value = '0 B'
    currentFile.value = { name: '', size: '' }
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
    fileQueue.value = files
    startTransfer()
  }
  async function handleMobileFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files?.[0] || !isConnected.value) return
    const file = input.files[0]
    input.value = ''
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
    addFilesToQueue, attachQrCanvas, cancelTransfer, clearFileQueue, confirmPairing, copyLink,
    connectedDeviceName, currentFile, desktopSend, desktopTextInput, devices, denyPairing, disconnectAndRefresh, docCards, goToWaitingState, handleDesktopFileSelect, handleMobileFileSelect,
    historyFilter, historyStats, isConnected, isReceiver, keyFingerprint, mobileRecentTransfers,
    mobileSend, mobileTextInput, qrExpired, queuedFiles, receivedMessages, reconnectAttempt,
    refreshQr, removeQueuedFile, roomId, securityLogs, startNewTransfer, startTransfer, state,
    timeRemaining, transferHistoryItems, transferProgress, transferSpeed, transferredSize, verificationDigits,
  }
}

function _generateVerificationCode(): string[] {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10).toString())
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
