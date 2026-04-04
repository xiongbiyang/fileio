import PartySocket from 'partysocket'

interface ClipboardMessage {
  id: string
  content: string
  type: 'text' | 'image'
  sender: string
  timestamp: number
}

type DeviceType = 'iphone' | 'android' | 'ipad' | 'windows' | 'macos' | 'linux' | 'other'

interface ClipboardParticipant {
  id: string
  deviceType: DeviceType
  deviceName: string
}

interface ClipboardRoomOptions {
  onMessage?: (message: ClipboardMessage) => void
  onDeviceCountChange?: (count: number) => void
  onParticipantsChange?: (participants: ClipboardParticipant[]) => void
  onClear?: () => void
  onTyping?: () => void
  onError?: (error: Error) => void
}

export function useClipboardRoom(options: ClipboardRoomOptions = {}) {
  const isConnected = ref(false)
  const deviceCount = ref(0)
  const participants = ref<ClipboardParticipant[]>([])
  const roomId = ref('')
  let socket: PartySocket | null = null

  function getDeviceId(): string {
    if (!import.meta.client) return ''
    const stored = sessionStorage.getItem('tp_device_id')
    if (stored) return stored
    const id = crypto.randomUUID()
    sessionStorage.setItem('tp_device_id', id)
    return id
  }

  function getHost(): string | null {
    if (!import.meta.client) return 'localhost:1999'
    // Injected via runtimeConfig: NUXT_PUBLIC_PARTYKIT_HOST
    const config = useRuntimeConfig()
    const configuredHost = String((config.public as Record<string, string>).partykitHost || '').trim()
    if (configuredHost) return configuredHost
    if (import.meta.dev) return 'localhost:1999'
    return null
  }

  function detectDeviceType(): DeviceType {
    if (!import.meta.client) return 'other'
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone/.test(ua)) return 'iphone'
    if (/ipad/.test(ua)) return 'ipad'
    if (/android/.test(ua)) return 'android'
    if (/windows/.test(ua)) return 'windows'
    if (/macintosh|mac os x/.test(ua)) return 'macos'
    if (/linux/.test(ua)) return 'linux'
    return 'other'
  }

  function detectDeviceName(type: DeviceType): string {
    if (!import.meta.client) return 'Unknown Device'
    const ua = navigator.userAgent
    const map: Record<DeviceType, string> = {
      iphone: 'iPhone',
      ipad: 'iPad',
      android: 'Android',
      windows: 'Windows',
      macos: 'Mac',
      linux: 'Linux',
      other: 'Unknown Device',
    }
    let baseName = map[type]
    if (type === 'windows' && /edg/i.test(ua)) baseName = 'Windows (Edge)'
    if (type === 'macos' && /safari/i.test(ua) && !/chrome|chromium|edg/i.test(ua)) baseName = 'Mac (Safari)'
    return baseName
  }

  function connect(id: string) {
    disconnect()
    roomId.value = id
    const host = getHost()
    if (!host) {
      options.onError?.(new Error('PartyKit host is not configured'))
      return
    }

    socket = new PartySocket({
      host,
      room: id,
      party: 'clipboard',
      id: getDeviceId(),
    })

    socket.addEventListener('open', () => {
      isConnected.value = true
      const deviceType = detectDeviceType()
      socket?.send(JSON.stringify({
        type: 'presence',
        deviceType,
        deviceName: detectDeviceName(deviceType),
      }))
    })

    socket.addEventListener('message', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string)

        if (data.type === 'message') {
          const msg: ClipboardMessage = data.data
          // Only surface messages from other devices
          if (msg.sender !== getDeviceId()) {
            options.onMessage?.(msg)
          }
        }
        else if (data.type === 'device-count') {
          deviceCount.value = data.count
          options.onDeviceCountChange?.(data.count)
        }
        else if (data.type === 'participants' && Array.isArray(data.participants)) {
          const list = (data.participants as unknown[])
            .map((item: unknown) => {
              if (!item || typeof item !== 'object') return null
              const obj = item as Record<string, unknown>
              const id = String(obj.id || '').trim()
              if (!id) return null
              const deviceType = String(obj.deviceType || 'other') as DeviceType
              const deviceName = String(obj.deviceName || '').trim() || 'Unknown Device'
              return { id, deviceType, deviceName }
            })
            .filter((v: ClipboardParticipant | null): v is ClipboardParticipant => !!v)
          participants.value = list
          options.onParticipantsChange?.(list)
        }
        else if (data.type === 'clear') {
          options.onClear?.()
        }
        else if (data.type === 'typing') {
          options.onTyping?.()
        }
      }
      catch {
        // Ignore malformed messages
      }
    })

    socket.addEventListener('close', () => {
      isConnected.value = false
    })

    socket.addEventListener('error', () => {
      options.onError?.(new Error('WebSocket connection failed'))
      isConnected.value = false
    })
  }

  let lastTypingSent = 0
  function sendTyping() {
    if (!socket) return
    const now = Date.now()
    if (now - lastTypingSent < 1500) return
    lastTypingSent = now
    socket.send(JSON.stringify({ type: 'typing', sender: getDeviceId() }))
  }

  function sendMessage(content: string, type: 'text' | 'image' = 'text') {
    if (!socket) return
    socket.send(JSON.stringify({
      type: 'message',
      content,
      messageType: type,
      sender: getDeviceId(),
    }))
  }

  function clearRoom() {
    if (!socket) return
    socket.send(JSON.stringify({ type: 'clear' }))
  }

  function disconnect() {
    socket?.close()
    socket = null
    isConnected.value = false
    deviceCount.value = 0
    participants.value = []
    roomId.value = ''
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    deviceCount,
    participants,
    roomId,
    connect,
    sendMessage,
    sendTyping,
    clearRoom,
    disconnect,
  }
}
