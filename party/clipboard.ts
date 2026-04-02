import type * as Party from 'partykit/server'

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

type IncomingMessage =
  | { type: 'message'; content: string; messageType: 'text' | 'image'; sender: string }
  | { type: 'presence'; deviceType: DeviceType; deviceName: string }
  | { type: 'clear' }
  | { type: 'typing'; sender: string }

export default class ClipboardParty implements Party.Server {
  constructor(readonly room: Party.Room) {}
  private participantsById = new Map<string, ClipboardParticipant>()

  private normalizeParticipant(id: string, deviceType?: DeviceType, deviceName?: string): ClipboardParticipant {
    const type: DeviceType = deviceType || 'other'
    const fallbackName =
      type === 'iphone' ? 'iPhone'
        : type === 'ipad' ? 'iPad'
          : type === 'android' ? 'Android'
            : type === 'windows' ? 'Windows'
              : type === 'macos' ? 'Mac'
                : type === 'linux' ? 'Linux'
                  : 'Unknown Device'
    return {
      id,
      deviceType: type,
      deviceName: (deviceName || '').trim().slice(0, 60) || fallbackName,
    }
  }

  private getLiveParticipants(): ClipboardParticipant[] {
    const liveIds = new Set([...this.room.getConnections()].map(conn => conn.id))
    for (const id of [...this.participantsById.keys()]) {
      if (!liveIds.has(id)) this.participantsById.delete(id)
    }
    return [...liveIds].map((id) => {
      const existing = this.participantsById.get(id)
      return existing || this.normalizeParticipant(id)
    })
  }

  private broadcastParticipants() {
    const participants = this.getLiveParticipants()
    this.room.broadcast(JSON.stringify({ type: 'participants', participants }))
  }

  onConnect(connection: Party.Connection) {
    this.participantsById.set(connection.id, this.normalizeParticipant(connection.id))
    // Broadcast updated device count to all (including new connection)
    const count = [...this.room.getConnections()].length
    this.room.broadcast(JSON.stringify({ type: 'device-count', count }))
    this.broadcastParticipants()
  }

  onMessage(raw: string, sender: Party.Connection) {
    let msg: IncomingMessage
    try {
      msg = JSON.parse(raw)
    }
    catch {
      return
    }

    if (msg.type === 'typing') {
      this.room.broadcast(JSON.stringify({ type: 'typing' }), [sender.id])
      return
    }

    if (msg.type === 'presence') {
      this.participantsById.set(sender.id, this.normalizeParticipant(sender.id, msg.deviceType, msg.deviceName))
      this.broadcastParticipants()
      return
    }

    if (msg.type === 'clear') {
      // Broadcast clear to everyone except sender
      this.room.broadcast(JSON.stringify({ type: 'clear' }), [sender.id])
      return
    }

    if (msg.type === 'message') {
      const outgoing: ClipboardMessage = {
        id: crypto.randomUUID(),
        content: msg.content,
        type: msg.messageType,
        sender: msg.sender,
        timestamp: Date.now(),
      }
      // Broadcast to everyone (including sender so they get the server-assigned id)
      this.room.broadcast(JSON.stringify({ type: 'message', data: outgoing }))
    }
  }

  onClose() {
    // Broadcast updated device count after someone leaves
    const count = [...this.room.getConnections()].length
    this.room.broadcast(JSON.stringify({ type: 'device-count', count }))
    this.broadcastParticipants()
  }
}
