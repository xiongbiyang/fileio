import PartySocket from 'partysocket'

/**
 * WebSocket-based signaling for WebRTC via PartyKit.
 * Replaces the previous HTTP-polling implementation.
 */
export function useSignaling(roomId: Ref<string>) {
  let socket: PartySocket | null = null

  const onOffer = ref<((offer: RTCSessionDescriptionInit) => void) | null>(null)
  const onAnswer = ref<((answer: RTCSessionDescriptionInit) => void) | null>(null)
  const onCandidate = ref<((candidate: RTCIceCandidateInit) => void) | null>(null)
  const onPeerJoined = ref<(() => void) | null>(null)
  const onPeerLeft = ref<(() => void) | null>(null)
  const onPeerCount = ref<((count: number) => void) | null>(null)
  const onRoomFull = ref<(() => void) | null>(null)

  function getHost(): string {
    if (!import.meta.client) return 'localhost:1999'
    const config = useRuntimeConfig()
    return (config.public as Record<string, string>).partykitHost || 'localhost:1999'
  }

  function connect() {
    disconnect()
    if (!roomId.value) return

    socket = new PartySocket({
      host: getHost(),
      room: roomId.value,
      party: 'signal',
    })

    socket.addEventListener('message', (event: MessageEvent) => {
      let msg: { type: string; data?: unknown; count?: number }
      try {
        msg = JSON.parse(event.data as string)
      }
      catch {
        return
      }

      switch (msg.type) {
        case 'offer':
          onOffer.value?.(msg.data as RTCSessionDescriptionInit)
          break
        case 'answer':
          onAnswer.value?.(msg.data as RTCSessionDescriptionInit)
          break
        case 'candidate':
          onCandidate.value?.(msg.data as RTCIceCandidateInit)
          break
        case 'peer-joined':
          onPeerJoined.value?.()
          break
        case 'peer-left':
          onPeerLeft.value?.()
          break
        case 'peer-count':
          if (typeof msg.count === 'number') onPeerCount.value?.(msg.count)
          break
        case 'room-full':
          // Tear down locally so PartySocket's auto-reconnect doesn't loop
          // back into a room it just got rejected from. Calling close()
          // flips `_shouldReconnect` off.
          onRoomFull.value?.()
          socket?.close()
          socket = null
          break
      }
    })
  }

  function sendSignal(type: 'offer' | 'answer' | 'candidate', data: unknown) {
    socket?.send(JSON.stringify({ type, data }))
  }

  function disconnect() {
    socket?.close()
    socket = null
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    sendSignal,
    onOffer,
    onAnswer,
    onCandidate,
    onPeerJoined,
    onPeerLeft,
    onPeerCount,
    onRoomFull,
  }
}
