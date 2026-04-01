import type * as Party from 'partykit/server'

/**
 * WebRTC signaling relay for ToolPort File & Text Transfer (Tool A).
 * Each room holds exactly two peers. Messages are forwarded to all
 * other connections in the room — no server-side state needed.
 *
 * Supported message types (client → server → peer):
 *   { type: 'offer',     data: RTCSessionDescriptionInit }
 *   { type: 'answer',    data: RTCSessionDescriptionInit }
 *   { type: 'candidate', data: RTCIceCandidateInit }
 *
 * Server → client notifications:
 *   { type: 'peer-joined' }   — sent when the second peer connects
 *   { type: 'peer-left'  }   — sent when the other peer disconnects
 *   { type: 'peer-count', count: number }
 */
export default class SignalParty implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(connection: Party.Connection) {
    const count = [...this.room.getConnections()].length

    // Tell the new arrival how many peers are already here
    connection.send(JSON.stringify({ type: 'peer-count', count }))

    // Notify existing peer(s) that someone joined
    if (count > 1) {
      this.room.broadcast(
        JSON.stringify({ type: 'peer-joined' }),
        [connection.id],
      )
    }
  }

  onMessage(raw: string, sender: Party.Connection) {
    let msg: { type: string; data?: unknown }
    try {
      msg = JSON.parse(raw)
    }
    catch {
      return
    }

    // Forward offer / answer / candidate to all other peers
    if (msg.type === 'offer' || msg.type === 'answer' || msg.type === 'candidate') {
      this.room.broadcast(JSON.stringify(msg), [sender.id])
    }
  }

  onClose(connection: Party.Connection) {
    const count = [...this.room.getConnections()].length
    // Notify remaining peers
    this.room.broadcast(JSON.stringify({ type: 'peer-left' }))
    this.room.broadcast(JSON.stringify({ type: 'peer-count', count }))
  }
}
