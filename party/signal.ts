import type * as Party from 'partykit/server'

/**
 * WebRTC signaling relay for FileIO File & Text Transfer (Tool A).
 * Each room holds exactly two peers. Messages are forwarded to all
 * other connections in the room — no server-side state needed.
 *
 * Supported message types (client → server → peer):
 *   { type: 'offer',     data: RTCSessionDescriptionInit }
 *   { type: 'answer',    data: RTCSessionDescriptionInit }
 *   { type: 'candidate', data: RTCIceCandidateInit }
 *
 * Server → client notifications:
 *   { type: 'peer-joined' }              — sent when the second peer connects
 *   { type: 'peer-left'  }               — sent when the other peer disconnects
 *   { type: 'peer-count', count: number }
 *   { type: 'room-full'  }               — sent to a 3rd+ peer right before close
 */
const MAX_MESSAGE_SIZE = 64_000 // 64 KB max for signaling messages
const MAX_PEERS_PER_ROOM = 2
// Custom close code: 4000-4999 range is app-reserved per RFC 6455.
const CLOSE_CODE_ROOM_FULL = 4000

// Mirrors the client-side alphabet in utils/roomId.ts (length 4–20).
// Rejecting ill-formed names at the edge stops a malicious client from
// using PartyKit as a free fan-out service for arbitrary channel names.
const ROOM_ID_RE = /^[a-z0-9]{4,20}$/

// Browser origins allowed to open signaling sockets. This is a belt-and-
// suspenders defense on top of the shared-secret room id: a malicious page
// at attacker.com can't trick a visitor's browser into joining a victim's
// pairing room without also matching Origin, because browsers enforce
// Origin truthfully (it's not script-settable). Non-browser clients can
// forge Origin — we accept that trade-off.
const ALLOWED_ORIGINS = new Set<string>([
  'https://fileio.top',
  'https://www.fileio.top',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
])

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin)) return true
  // Cloudflare Pages preview deployments: <hash>.transfer.pages.dev
  try {
    const url = new URL(origin)
    if (url.hostname.endsWith('.pages.dev') && url.protocol === 'https:') return true
  }
  catch {
    return false
  }
  return false
}

export default class SignalParty implements Party.Server {
  constructor(readonly room: Party.Room) {}

  static onBeforeConnect(req: Party.Request, lobby: Party.Lobby) {
    // Reject upstream of room state so a flood of garbage room names doesn't
    // even spin up a Party actor.
    if (!ROOM_ID_RE.test(lobby.id)) {
      return new Response('invalid room id', { status: 400 })
    }
    if (!isAllowedOrigin(req.headers.get('Origin'))) {
      return new Response('forbidden origin', { status: 403 })
    }
    return req
  }

  onConnect(connection: Party.Connection) {
    // `getConnections()` at this point includes the just-connected peer.
    const count = [...this.room.getConnections()].length

    // Room is already full (existing 2 peers) — this is a 3rd tab, stray scan,
    // or stale reconnect. Send a typed notice then close with a dedicated code
    // so the client can show a specific error instead of silently retrying.
    if (count > MAX_PEERS_PER_ROOM) {
      connection.send(JSON.stringify({ type: 'room-full' }))
      connection.close(CLOSE_CODE_ROOM_FULL, 'room-full')
      return
    }

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
    if (raw.length > MAX_MESSAGE_SIZE) return

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

  onClose(_connection: Party.Connection) {
    const count = [...this.room.getConnections()].length
    // Notify remaining peers
    this.room.broadcast(JSON.stringify({ type: 'peer-left' }))
    this.room.broadcast(JSON.stringify({ type: 'peer-count', count }))
  }
}
