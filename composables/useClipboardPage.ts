import { writeToClipboard } from '~/utils/clipboard'
import { renderQrCodeToCanvas } from '~/utils/qrcode'
import { generateRoomId } from '~/utils/roomId'
import { buildRoomJoinUrl } from '~/utils/shareLink'
import {
  clipboardVoteFeatures,
} from '~/constants/toolPageData'
import type {
  ClipboardMessage,
  ClipboardPastRoom,
  ClipboardViewState,
} from '~/types/toolPages'

export function useClipboardPage() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()
  const { notify } = useNotifier()
  const auth = useAuthState()
  const runtimeConfig = useRuntimeConfig()

  const view = ref<ClipboardViewState>('entry')
  const currentRoom = ref('')
  const joinRoomId = ref('')
  const enableE2ee = ref(false)
  const isE2ee = ref(false)
  const newMessage = ref('')
  const messages = ref<ClipboardMessage[]>([])
  const messagesContainer = ref<HTMLElement>()
  const isTyping = ref(false)
  const qrCanvas = ref<HTMLCanvasElement>()
  const qrCanvasModal = ref<HTMLCanvasElement>()
  const showQrModal = ref(false)
  const expiryTimer = ref('24:00:00')
  const expiryProgress = ref(100)
  const searchQuery = ref('')
  const activeSearchFilter = ref('all')
  const activeSort = ref<'newest' | 'oldest' | 'type'>('newest')

  let expiryInterval: ReturnType<typeof setInterval> | null = null
  let typingHideTimer: ReturnType<typeof setTimeout> | null = null
  let cloudMessageSyncTimer: ReturnType<typeof setTimeout> | null = null

  const cloudPersistenceEnabled = computed(() => {
    return Boolean(runtimeConfig.public.enableClipboardCloudPersistence) && auth.isLoggedIn.value
  })

  const room = useClipboardRoom({
    onMessage: (msg) => {
      messages.value.push({
        id: msg.id,
        content: msg.content,
        type: msg.type,
        isSelf: false,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
      persistRoomMessages()
      scrollToBottom()
    },
    onClear: () => {
      messages.value = []
      if (cloudPersistenceEnabled.value && auth.userId.value && currentRoom.value) {
        clearRoomMessages(auth.userId.value, currentRoom.value)
        void clearRoomMessagesInCloud(currentRoom.value)
      }
    },
    onDeviceCountChange: (_count) => {
      // deviceCount is already reactive via room.deviceCount
    },
    onParticipantsChange: (_participants) => {
      // connectedDevices is derived from room.participants
    },
    onTyping: () => {
      isTyping.value = true
      if (typingHideTimer) clearTimeout(typingHideTimer)
      typingHideTimer = setTimeout(() => {
        isTyping.value = false
      }, 2000)
    },
    onError: () => {
      notify(t('common.roomConnectFailed'), 'error')
    },
  })

  const historyStats = [
    { icon: 'bolt', value: '04', label: 'Active Rooms' },
    { icon: 'sync', value: '128', label: 'Total Transfers' },
    { icon: 'verified_user', value: 'AES-256', label: 'Security Level' },
  ]

  const pastRooms = ref<ClipboardPastRoom[]>(loadPastRooms(auth.userId.value))

  const searchFilters = computed(() => [
    { key: 'all', label: t('toolC.filterAll') },
    { key: 'texts', label: t('toolC.filterTexts') },
    { key: 'links', label: t('toolC.filterLinks') },
    { key: 'images', label: t('toolC.filterImages') },
  ])

  const filteredMessages = computed(() => {
    let results = messages.value.map((msg, index) => ({
      id: msg.id,
      sender: msg.isSelf ? 'You' : 'Remote',
      type: msg.type === 'image' ? 'Image' : (isHttpUrl(msg.content) ? 'Link' : 'Text'),
      time: msg.time,
      avatarClass: msg.isSelf ? 'bg-primary' : 'bg-secondary-container',
      avatarIcon: msg.isSelf ? 'person' : 'laptop_mac',
      imageSrc: msg.type === 'image' ? msg.content : '',
      textContent: msg.type === 'image' ? '' : msg.content,
      searchText: msg.type === 'image' ? '' : msg.content,
      orderIndex: index,
    }))

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      results = results.filter(result => result.searchText.toLowerCase().includes(q))
    }

    if (activeSearchFilter.value !== 'all') {
      const typeMap: Record<string, string> = { texts: 'Text', links: 'Link', images: 'Image' }
      const filterType = typeMap[activeSearchFilter.value]
      if (filterType) results = results.filter(result => result.type === filterType)
    }

    if (activeSort.value === 'newest') {
      results = [...results].sort((a, b) => b.orderIndex - a.orderIndex)
    }
    else if (activeSort.value === 'oldest') {
      results = [...results].sort((a, b) => a.orderIndex - b.orderIndex)
    }
    else if (activeSort.value === 'type') {
      const weight: Record<string, number> = { Text: 1, Link: 2, Image: 3 }
      results = [...results].sort((a, b) => (weight[a.type] || 99) - (weight[b.type] || 99))
    }

    return results
  })

  const roomContentBytes = computed(() => {
    return messages.value.reduce((acc, msg) => {
      if (msg.type === 'image') {
        return acc + Math.floor((msg.content.length * 3) / 4)
      }
      return acc + msg.content.length * 2
    }, 0)
  })

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const storageUsagePercent = computed(() => {
    // Visual estimate for current room payload, capped at 10MB.
    const maxBytes = 10 * 1024 * 1024
    return Math.min(100, Math.round((roomContentBytes.value / maxBytes) * 100))
  })

  const storageUsageLabel = computed(() => {
    return `${storageUsagePercent.value}% · ${formatBytes(roomContentBytes.value)}`
  })

  const voteFeatures = clipboardVoteFeatures
  const sortOptions = computed(() => [
    { key: 'newest', label: t('toolC.sortNewest') },
    { key: 'oldest', label: t('toolC.sortOldest') },
    { key: 'type', label: t('toolC.sortByType') },
  ])

  const howItWorks = computed(() => [
    { num: '01', title: t('toolC.step1Title'), desc: t('toolC.step1Desc') },
    { num: '02', title: t('toolC.step2Title'), desc: t('toolC.step2Desc') },
    { num: '03', title: t('toolC.step3Title'), desc: t('toolC.step3Desc') },
  ])

  const deviceCount = computed(() => room.deviceCount.value)
  const isConnected = computed(() => room.isConnected.value)

  const localDeviceId = computed(() => {
    if (!import.meta.client) return ''
    return sessionStorage.getItem('tp_device_id') || ''
  })

  function getDeviceIconByType(type: string) {
    if (type === 'iphone' || type === 'android') return 'smartphone'
    if (type === 'ipad') return 'tablet_mac'
    if (type === 'windows' || type === 'linux' || type === 'macos') return 'laptop'
    return 'devices'
  }

  const connectedDevices = computed(() => {
    const list = room.participants.value
    if (!list.length || !isConnected.value) return []
    const candidateLocalId = localDeviceId.value
    const resolvedLocalId = (candidateLocalId && list.some(p => p.id === candidateLocalId)) ? candidateLocalId : list[0]?.id
    const localParticipant = list.find(p => p.id === resolvedLocalId)
    const remoteParticipants = list.filter(p => p.id !== resolvedLocalId)
    const local = {
      id: resolvedLocalId || 'local',
      icon: getDeviceIconByType(localParticipant?.deviceType || 'other'),
      name: localParticipant?.deviceName || t('toolC.thisDeviceName'),
      tag: t('toolC.localDeviceTag'),
    }
    const remotes = remoteParticipants.map((participant, index) => ({
      id: participant.id,
      icon: getDeviceIconByType(participant.deviceType),
      name: participant.deviceName || t('toolC.remoteDeviceName', { n: index + 1 }),
      tag: t('toolC.remoteDeviceTag'),
    }))
    return [local, ...remotes]
  })

  const roomMembers = computed(() => {
    return connectedDevices.value.map((device, index) => {
      const isAdmin = index === 0
      const initials = device.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(token => token[0]?.toUpperCase() || '')
        .join('') || 'DV'
      return {
        name: device.name,
        initials,
        role: isAdmin ? t('toolC.memberRoleAdmin') : t('toolC.memberRoleActiveNow'),
        isAdmin,
        avatarClass: isAdmin
          ? 'bg-primary text-on-primary'
          : 'bg-secondary-container text-on-secondary-container',
      }
    })
  })

  watch(showQrModal, (isOpen) => {
    if (isOpen) generateQrCode()
  })

  watch(() => auth.userId.value, (nextUserId) => {
    pastRooms.value = loadPastRooms(nextUserId)
    if (cloudPersistenceEnabled.value && nextUserId && currentRoom.value) {
      messages.value = loadRoomMessages(nextUserId, currentRoom.value)
    }
    if (cloudPersistenceEnabled.value && nextUserId) {
      void hydrateRoomsFromCloud(nextUserId)
      if (currentRoom.value) {
        void restoreRoomMessages()
      }
    }
  })

  onMounted(() => {
    if (cloudPersistenceEnabled.value && auth.userId.value) {
      void hydrateRoomsFromCloud(auth.userId.value)
    }
    const roomId = route.query.r
    if (roomId) {
      joinRoomId.value = (roomId as string).toUpperCase()
      joinRoom()
    }
  })

  onUnmounted(() => {
    if (expiryInterval) clearInterval(expiryInterval)
    if (typingHideTimer) clearTimeout(typingHideTimer)
    if (cloudMessageSyncTimer) clearTimeout(cloudMessageSyncTimer)
  })

  function attachRoomRefs(refs: {
    messagesContainer: HTMLElement | null
    qrCanvas: HTMLCanvasElement | null
    qrCanvasModal: HTMLCanvasElement | null
  }) {
    messagesContainer.value = refs.messagesContainer ?? undefined
    qrCanvas.value = refs.qrCanvas ?? undefined
    qrCanvasModal.value = refs.qrCanvasModal ?? undefined
  }

  function openHistory() {
    view.value = 'history'
  }

  function goToEntry() {
    view.value = 'entry'
  }

  function goToRoom() {
    view.value = 'room'
  }

  function openSearch() {
    view.value = 'search'
  }

  function openSettings() {
    view.value = 'settings'
  }

  async function getRoomsFromCloud() {
    try {
      const res = await $fetch<{ ok: boolean, rooms?: Array<{
        id: string
        name: string
        desc: string
        e2ee: boolean
        createdAt: number
        updatedAt: number
      }> }>('/api/clipboard/rooms')
      if (!res.ok || !Array.isArray(res.rooms)) return []
      return res.rooms
    }
    catch {
      return []
    }
  }

  function toPastRoom(room: {
    id: string
    name: string
    desc: string
    e2ee: boolean
    createdAt: number
    updatedAt: number
  }): ClipboardPastRoom {
    const updatedAt = room.updatedAt || room.createdAt || Date.now()
    return {
      id: room.id,
      name: room.name,
      desc: room.desc,
      active: true,
      time: formatRelativeTime(updatedAt),
      createdAt: room.createdAt || Date.now(),
      e2ee: !!room.e2ee,
    }
  }

  function formatRelativeTime(timestamp: number) {
    const diffMs = Date.now() - timestamp
    if (diffMs < 60_000) return 'Just now'
    if (diffMs < 3_600_000) return `${Math.max(1, Math.floor(diffMs / 60_000))}m ago`
    if (diffMs < 86_400_000) return `${Math.max(1, Math.floor(diffMs / 3_600_000))}h ago`
    return `${Math.max(1, Math.floor(diffMs / 86_400_000))}d ago`
  }

  async function saveRoomToCloud(room: ClipboardPastRoom) {
    try {
      await $fetch('/api/clipboard/rooms', {
        method: 'POST',
        body: {
          room: {
            id: room.id,
            name: room.name,
            desc: room.desc,
            e2ee: room.e2ee,
            createdAt: room.createdAt,
          },
        },
      })
    }
    catch {
      // noop: local storage fallback already exists
    }
  }

  async function getRoomMessagesFromCloud(roomId: string) {
    try {
      const res = await $fetch<{ ok: boolean, messages?: ClipboardMessage[] }>(`/api/clipboard/rooms/${roomId}/messages`)
      if (!res.ok || !Array.isArray(res.messages)) return []
      return res.messages
    }
    catch {
      return []
    }
  }

  async function saveRoomMessagesToCloud(roomId: string, nextMessages: ClipboardMessage[]) {
    try {
      await $fetch(`/api/clipboard/rooms/${roomId}/messages`, {
        method: 'PUT',
        body: {
          messages: nextMessages,
        },
      })
    }
    catch {
      // noop: local storage fallback already exists
    }
  }

  async function clearRoomMessagesInCloud(roomId: string) {
    try {
      await $fetch(`/api/clipboard/rooms/${roomId}/messages`, {
        method: 'DELETE',
      })
    }
    catch {
      // noop: local storage fallback already exists
    }
  }

  async function deleteRoomInCloud(roomId: string) {
    try {
      await $fetch(`/api/clipboard/rooms/${roomId}`, {
        method: 'DELETE',
      })
    }
    catch {
      // noop: local storage fallback already exists
    }
  }

  async function hydrateRoomsFromCloud(userId: string) {
    const cloudRooms = await getRoomsFromCloud()
    if (!cloudRooms.length) return
    const mapped = cloudRooms.map(toPastRoom)
    pastRooms.value = mapped
    savePastRooms(mapped, userId)
  }

  async function restoreRoomMessages() {
    if (!cloudPersistenceEnabled.value || !auth.userId.value || !currentRoom.value) return
    const local = loadRoomMessages(auth.userId.value, currentRoom.value)
    if (local.length) {
      messages.value = local
    }
    const cloudMessages = await getRoomMessagesFromCloud(currentRoom.value)
    if (cloudMessages.length) {
      messages.value = cloudMessages
      saveRoomMessages(auth.userId.value, currentRoom.value, cloudMessages)
    }
  }

  function persistRoomMessages() {
    if (!cloudPersistenceEnabled.value || !auth.userId.value || !currentRoom.value) return
    saveRoomMessages(auth.userId.value, currentRoom.value, messages.value)
    if (cloudMessageSyncTimer) clearTimeout(cloudMessageSyncTimer)
    cloudMessageSyncTimer = setTimeout(() => {
      if (!auth.userId.value || !currentRoom.value) return
      void saveRoomMessagesToCloud(currentRoom.value, messages.value)
    }, 450)
  }

  function createRoom() {
    currentRoom.value = generateRoomId('ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
    isE2ee.value = enableE2ee.value
    messages.value = []
    persistRoomMessages()
    view.value = 'room'
    room.connect(currentRoom.value)
    startExpiryTimer()
    generateQrCode()
    pastRooms.value.unshift({
      id: currentRoom.value,
      name: `#ROOM-${currentRoom.value}`,
      desc: isE2ee.value ? 'E2EE Encrypted Room' : 'Standard Room',
      active: true,
      time: 'Just now',
      createdAt: Date.now(),
      e2ee: isE2ee.value,
    })
    savePastRooms(pastRooms.value, auth.userId.value)
    if (cloudPersistenceEnabled.value && auth.userId.value) {
      void saveRoomToCloud(pastRooms.value[0])
    }
  }

  function joinRoom() {
    if (joinRoomId.value.length < 6) return
    currentRoom.value = joinRoomId.value.toUpperCase()
    const existing = pastRooms.value.find(roomItem => roomItem.id === currentRoom.value)
    isE2ee.value = existing?.e2ee ?? false
    messages.value = []
    isTyping.value = false
    void restoreRoomMessages()
    view.value = 'room'
    room.connect(currentRoom.value)
    startExpiryTimer()
    generateQrCode()

    if (!existing) {
      pastRooms.value.unshift({
        id: currentRoom.value,
        name: `#ROOM-${currentRoom.value}`,
        desc: 'Joined Room',
        active: true,
        time: 'Just now',
        createdAt: Date.now(),
        e2ee: false,
      })
      savePastRooms(pastRooms.value, auth.userId.value)
      if (cloudPersistenceEnabled.value && auth.userId.value) {
        void saveRoomToCloud(pastRooms.value[0])
      }
    }
  }

  function joinExistingRoom(id: string) {
    currentRoom.value = id
    const existing = pastRooms.value.find(roomItem => roomItem.id === id)
    isE2ee.value = existing?.e2ee ?? false
    messages.value = []
    void restoreRoomMessages()
    view.value = 'room'
    room.connect(id)
    startExpiryTimer()
    generateQrCode()
  }

  function sendMessage() {
    if (!newMessage.value.trim()) return
    const content = newMessage.value
    messages.value.push({
      id: Date.now().toString(),
      content,
      type: 'text',
      isSelf: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    persistRoomMessages()
    newMessage.value = ''
    scrollToBottom()
    room.sendMessage(content)
  }

  function startExpiryTimer() {
    if (expiryInterval) clearInterval(expiryInterval)
    const createdAt = Date.now()
    const total = 24 * 60 * 60 * 1000

    function update() {
      const remaining = Math.max(0, total - (Date.now() - createdAt))
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      expiryTimer.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      expiryProgress.value = Math.round((remaining / total) * 100)
    }

    update()
    expiryInterval = setInterval(update, 1000)
  }

  async function generateQrCode() {
    await nextTick()
    if (!currentRoom.value) return

    try {
      const url = buildRoomJoinUrl(window.location.origin, localePath('/tools/clipboard'), currentRoom.value)
      if (!url) return
      if (qrCanvas.value) await renderQrCodeToCanvas(qrCanvas.value, url, { width: 96, margin: 1 })
      if (qrCanvasModal.value) await renderQrCodeToCanvas(qrCanvasModal.value, url, { width: 128, margin: 1 })
    }
    catch {
      notify(t('common.qrFailed'), 'error')
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await writeToClipboard(text)
      notify(t('common.copied'))
    }
    catch {
      notify(t('common.copyFailed'), 'error')
    }
  }

  function copyRoomLink() {
    const url = buildRoomJoinUrl(window.location.origin, localePath('/tools/clipboard'), currentRoom.value)
    if (!url) return
    copyToClipboard(url)
  }

  function sendImageDataUrl(dataUrl: string) {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 800
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      messages.value.push({
        id: Date.now().toString(),
        content: compressed,
        type: 'image',
        isSelf: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
      persistRoomMessages()
      scrollToBottom()
      room.sendMessage(compressed, 'image')
    }
    img.src = dataUrl
  }

  function handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        const reader = new FileReader()
        reader.onload = loadEvent => sendImageDataUrl(loadEvent.target?.result as string)
        reader.readAsDataURL(file)
        break
      }
    }
  }

  function handleFileAttach(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    input.value = ''
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = loadEvent => sendImageDataUrl(loadEvent.target?.result as string)
    reader.readAsDataURL(file)
  }

  function onInput() {
    room.sendTyping()
  }

  function clearRoom() {
    messages.value = []
    if (cloudPersistenceEnabled.value && auth.userId.value && currentRoom.value) {
      clearRoomMessages(auth.userId.value, currentRoom.value)
      void clearRoomMessagesInCloud(currentRoom.value)
    }
    room.clearRoom()
  }

  function leaveRoom() {
    if (expiryInterval) {
      clearInterval(expiryInterval)
      expiryInterval = null
    }
    if (typingHideTimer) {
      clearTimeout(typingHideTimer)
      typingHideTimer = null
    }
    room.disconnect()
    currentRoom.value = ''
    messages.value = []
    view.value = 'entry'
  }

  function deleteRoom(index: number) {
    const room = pastRooms.value[index]
    if (room && cloudPersistenceEnabled.value && auth.userId.value) {
      clearRoomMessages(auth.userId.value, room.id)
      void deleteRoomInCloud(room.id)
    }
    pastRooms.value.splice(index, 1)
    savePastRooms(pastRooms.value, auth.userId.value)
  }

  function scrollToBottom() {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }

  return {
    activeSearchFilter,
    activeSort,
    attachRoomRefs,
    clearRoom,
    copyRoomLink,
    copyToClipboard,
    createRoom,
    currentRoom,
    connectedDevices,
    deleteRoom,
    deviceCount,
    enableE2ee,
    expiryProgress,
    expiryTimer,
    filteredMessages,
    goToEntry,
    goToRoom,
    handleFileAttach,
    handlePaste,
    historyStats,
    howItWorks,
    isConnected,
    isE2ee,
    isTyping,
    joinExistingRoom,
    joinRoom,
    joinRoomId,
    leaveRoom,
    messages,
    newMessage,
    onInput,
    openHistory,
    openSearch,
    openSettings,
    pastRooms,
    roomMembers,
    searchFilters,
    searchQuery,
    sortOptions,
    storageUsageLabel,
    storageUsagePercent,
    sendMessage,
    showQrModal,
    view,
    voteFeatures,
  }
}

function getPastRoomsStorageKey(userId?: string) {
  return userId ? `tp_clipboard_rooms_u_${userId}` : 'tp_clipboard_rooms'
}

function loadPastRooms(userId?: string): ClipboardPastRoom[] {
  if (!import.meta.client) return []
  try {
    return JSON.parse(localStorage.getItem(getPastRoomsStorageKey(userId)) || '[]')
  }
  catch {
    return []
  }
}

function savePastRooms(rooms: ClipboardPastRoom[], userId?: string) {
  if (!import.meta.client) return
  localStorage.setItem(getPastRoomsStorageKey(userId), JSON.stringify(rooms))
}

function getRoomMessagesStorageKey(userId: string, roomId: string) {
  return `tp_clipboard_msgs_u_${userId}_${roomId}`
}

function loadRoomMessages(userId: string, roomId: string): ClipboardMessage[] {
  if (!import.meta.client) return []
  try {
    return JSON.parse(localStorage.getItem(getRoomMessagesStorageKey(userId, roomId)) || '[]')
  }
  catch {
    return []
  }
}

function saveRoomMessages(userId: string, roomId: string, messages: ClipboardMessage[]) {
  if (!import.meta.client) return
  localStorage.setItem(getRoomMessagesStorageKey(userId, roomId), JSON.stringify(messages))
}

function clearRoomMessages(userId: string, roomId: string) {
  if (!import.meta.client) return
  localStorage.removeItem(getRoomMessagesStorageKey(userId, roomId))
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim())
}
