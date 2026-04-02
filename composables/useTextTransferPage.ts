import { writeToClipboard } from '~/utils/clipboard'
import { renderQrCodeToCanvas } from '~/utils/qrcode'
import { generateRoomId } from '~/utils/roomId'
import { formatSize, formatSpeed, formatTime } from '~/utils/transferFormat'
import {
  sharedDeviceHistoryItems,
  textTransferHistoryItems,
  textTransferKeyFingerprint,
  textTransferRecentTransfers,
  textTransferSecurityLogs,
} from '~/constants/toolPageData'
import type { TransferState } from '~/types/toolPages'

export function useTextTransferPage() {
  const { t } = useI18n()
  const route = useRoute()
  const { notify } = useNotifier()
  const state = ref<TransferState>('waiting')
  const qrExpired = ref(false)
  const roomId = ref('')
  const verificationDigits = ref(['8', '4', '9', '2'])
  const reconnectAttempt = ref(3)
  const receivedMessages = ref<Array<{ id: string, content: string, isSelf: boolean }>>([])
  const mobileTextInput = ref('')
  const isReceiver = ref(false)
  const qrCanvasTransfer = ref<HTMLCanvasElement>()
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

  const webrtc = useWebRTC({
    onMessage: (data) => {
      if (typeof data === 'string') {
        try {
          const msg = JSON.parse(data)
          if (msg.type === 'text') {
            receivedMessages.value.push({ id: crypto.randomUUID(), content: msg.data as string, isSelf: false })
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
            const blob = new Blob(incomingFileChunks, { type: incomingFileMeta.mimeType || 'application/octet-stream' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = incomingFileMeta.name
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            incomingFileMeta = null
            incomingFileChunks = []
            incomingReceivedBytes = 0
            transferProgress.value = 100
            state.value = 'success'
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
        if (state.value === 'pairing' || state.value === 'waiting' || state.value === 'reconnecting') {
          state.value = 'transferring'
        }
        signaling.disconnect()
      }
      else if (connectionState === 'disconnected' && state.value === 'transferring') {
        disconnectTimer = setTimeout(() => {
          if (webrtc.connectionState.value !== 'connected') attemptReconnect()
        }, 8000)
      }
      else if (connectionState === 'failed' && state.value === 'transferring') {
        clearDisconnectTimer()
        attemptReconnect()
      }
    },
  })
  const signaling = useSignaling(roomId)

  const queuedFiles = computed(() => fileQueue.value.map(file => ({ name: file.name, size: formatSize(file.size) })))
  const mobileRecentTransfers = textTransferRecentTransfers
  const devices = sharedDeviceHistoryItems
  const historyStats = [
    { icon: 'upload', value: '1.2 GB', label: t('toolA.totalSent') },
    { icon: 'hub', value: '04', label: t('toolA.activeNodesLabel') },
    { icon: 'lock', value: 'AES-256', label: t('toolA.securityLevelLabel') },
  ]
  const transferHistoryItems = textTransferHistoryItems
  const keyFingerprint = textTransferKeyFingerprint
  const securityLogs = textTransferSecurityLogs
  const docCards = computed(() => [
    { icon: 'security', title: t('toolA.docPrivateTitle'), desc: t('toolA.docPrivateDesc') },
    { icon: 'bolt', title: t('toolA.docFrictionTitle'), desc: t('toolA.docFrictionDesc') },
    { icon: 'history', title: t('toolA.docExpiringTitle'), desc: t('toolA.docExpiringDesc') },
  ])
  const isConnected = computed(() => webrtc.connectionState.value === 'connected')

  onBeforeRouteLeave(() => {
    if (state.value === 'transferring' || state.value === 'pairing') return window.confirm(t('toolA.leaveWarning'))
  })

  onMounted(async () => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    if (route.query.r) {
      roomId.value = (route.query.r as string).toLowerCase()
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
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  function attachQrCanvas(element: HTMLCanvasElement | null) {
    qrCanvasTransfer.value = element ?? undefined
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
  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (state.value === 'transferring' || state.value === 'pairing') {
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
    if (!qrCanvasTransfer.value || !roomId.value) return
    try {
      const url = `${window.location.origin}/tools/text-transfer?r=${roomId.value}`
      await renderQrCodeToCanvas(qrCanvasTransfer.value, url, { width: 220, margin: 2 })
    }
    catch {
      notify(t('common.qrFailed'), 'error')
    }
  }
  function startSenderSignaling() {
    signaling.onOffer.value = async (offer: RTCSessionDescriptionInit) => {
      signaling.onOffer.value = null
      const answer = await webrtc.connect(offer)
      await signaling.sendSignal('answer', answer)
      verificationDigits.value = generateVerificationCode()
      state.value = 'pairing'
    }
    signaling.connect()
  }
  async function initReceiverMode() {
    isReceiver.value = true
    try {
      signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
        await webrtc.setRemoteDescription(answer)
        signaling.disconnect()
      }
      signaling.connect()
      const offer = await webrtc.connect()
      await signaling.sendSignal('offer', offer)
    }
    catch {
      notify(t('common.roomConnectFailed'), 'error')
    }
  }
  async function copyLink() {
    try {
      await writeToClipboard(`${window.location.origin}/tools/text-transfer?r=${roomId.value}`)
      notify(t('common.copied'))
    }
    catch {
      notify(t('common.copyFailed'), 'error')
    }
  }
  function refreshQr() {
    roomId.value = generateRoomId('abcdefghjkmnpqrstuvwxyz23456789')
    qrExpired.value = false
    reconnectAttempt.value = 3
    webrtc.disconnect()
    signaling.disconnect()
    generateRoomQr().then(() => startSenderSignaling())
  }
  function confirmPairing() {
    if (webrtc.connectionState.value !== 'connected') return
    state.value = 'transferring'
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
      }
      catch {
        notify(t('common.transferFailed'), 'error')
      }
    }
    fileQueue.value = []
    state.value = 'success'
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
      state.value = 'success'
    }
    catch {
      notify(t('common.transferFailed'), 'error')
      state.value = 'waiting'
    }
  }

  return {
    addFilesToQueue, attachQrCanvas, cancelTransfer, clearFileQueue, confirmPairing, copyLink,
    currentFile, devices, denyPairing, docCards, goToWaitingState, handleMobileFileSelect,
    historyFilter, historyStats, isConnected, isReceiver, keyFingerprint, mobileRecentTransfers,
    mobileSend, mobileTextInput, qrExpired, queuedFiles, receivedMessages, reconnectAttempt,
    refreshQr, removeQueuedFile, roomId, securityLogs, startNewTransfer, startTransfer, state,
    timeRemaining, transferHistoryItems, transferProgress, transferSpeed, transferredSize, verificationDigits,
  }
}

function generateVerificationCode(): string[] {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10).toString())
}
