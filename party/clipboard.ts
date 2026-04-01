import type * as Party from 'partykit/server'

interface ClipboardMessage {
  id: string
  content: string
  type: 'text' | 'image'
  sender: string
  timestamp: number
}

type IncomingMessage =
  | { type: 'message'; content: string; messageType: 'text' | 'image'; sender: string }
  | { type: 'clear' }
  | { type: 'typing'; sender: string }

export default class ClipboardParty implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(connection: Party.Connection) {
    // Broadcast updated device count to all (including new connection)
    const count = [...this.room.getConnections()].length
    this.room.broadcast(JSON.stringify({ type: 'device-count', count }))
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
  }
}
