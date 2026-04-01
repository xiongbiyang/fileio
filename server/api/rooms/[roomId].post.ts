/**
 * Clipboard room — POST to create room or send message.
 */
interface RoomData {
  messages: Array<{ id: string; content: string; type: string; sender: string; timestamp: number }>
  devices: Set<string>
  createdAt: number
  lastPoll: Map<string, number>
}

const rooms = new Map<string, RoomData>()

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'roomId')
  if (!roomId) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID required' })
  }

  const body = await readBody(event)

  if (body.action === 'create') {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        messages: [],
        devices: new Set(),
        createdAt: Date.now(),
        lastPoll: new Map(),
      })
    }
    return { ok: true, roomId }
  }

  if (body.action === 'message') {
    const room = rooms.get(roomId)
    if (!room) {
      throw createError({ statusCode: 404, statusMessage: 'Room not found' })
    }

    if (room.messages.length >= 100) {
      room.messages.shift()
    }

    const msg = {
      id: crypto.randomUUID(),
      content: body.content,
      type: body.type || 'text',
      sender: body.sender || 'unknown',
      timestamp: Date.now(),
    }
    room.messages.push(msg)

    return { ok: true, message: msg }
  }

  if (body.action === 'clear') {
    rooms.delete(roomId)
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
