import PartySocket from 'partysocket'

interface ClipboardMessage {
  id: string
  content: string
  type: 'text' | 'image'
  sender: string
  timestamp: number
}

interface ClipboardRoomOptions {
  onMessage?: (message: ClipboardMessage) => void
  onDeviceCountChange?: (count: number) => void
  onClear?: () => void
  onTyping?: () => void
  onError?: (error: Error) => void
}

export function useClipboardRoom(options: ClipboardRoomOptions = {}) {
  const isConnected = ref(false)
  const deviceCount = ref(0)
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

  function getHost(): string {
    if (!import.meta.client) return 'localhost:1999'
    // Injected via runtimeConfig: NUXT_PUBLIC_PARTYKIT_HOST
    const config = useRuntimeConfig()
    return (config.public as Record<string, string>).partykitHost || 'localhost:1999'
  }

  function connect(id: string) {
    disconnect()
    roomId.value = id

    socket = new PartySocket({
      host: getHost(),
      room: id,
      party: 'clipboard',
      id: getDeviceId(),
    })

    socket.addEventListener('open', () => {
      isConnected.value = true
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
    roomId.value = ''
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    deviceCount,
    roomId,
    connect,
    sendMessage,
    sendTyping,
    clearRoom,
    disconnect,
  }
}
