/**
 * Clipboard room — GET to poll for new messages.
 * Returns messages since the last poll.
 */
interface RoomData {
  messages: Array<{ id: string; content: string; type: string; sender: string; timestamp: number }>
  devices: Set<string>
  createdAt: number
  lastPoll: Map<string, number>
}

const rooms = new Map<string, RoomData>()

function cleanupRooms() {
  const now = Date.now()
  for (const [id, room] of rooms) {
    if (now - room.createdAt > 24 * 60 * 60 * 1000) {
      rooms.delete(id)
    }
  }
}

export default defineEventHandler((event) => {
  const roomId = getRouterParam(event, 'roomId')
  const deviceId = getQuery(event).deviceId as string || 'unknown'

  if (!roomId) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID required' })
  }

  cleanupRooms()

  const room = rooms.get(roomId)
  if (!room) {
    return { exists: false, messages: [], deviceCount: 0 }
  }

  // Track device
  room.devices.add(deviceId)

  // Get messages since last poll
  const lastPoll = room.lastPoll.get(deviceId) || 0
  const newMessages = room.messages.filter(m => m.timestamp > lastPoll)
  room.lastPoll.set(deviceId, Date.now())

  return {
    exists: true,
    messages: newMessages,
    deviceCount: room.devices.size,
    expiresAt: room.createdAt + 24 * 60 * 60 * 1000,
  }
})
