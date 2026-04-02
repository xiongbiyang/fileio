import { getD1Binding, requireUserId } from '~/server/utils/d1'

interface MessagesBody {
  userId: string
  messages: unknown[]
}

export default defineEventHandler(async (event) => {
  const db = getD1Binding(event)
  if (!db) {
    return { ok: false, reason: 'D1_NOT_CONFIGURED' }
  }

  const roomId = String(getRouterParam(event, 'roomId') || '').trim().toUpperCase()
  if (!roomId) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID required' })
  }

  const body = await readBody<MessagesBody>(event)
  const userId = requireUserId(body?.userId)
  const messages = Array.isArray(body?.messages) ? body.messages : []
  const payload = JSON.stringify(messages.slice(-300))
  const now = Date.now()

  await db
    .prepare(`
      INSERT INTO clipboard_room_messages (room_id, user_id, payload_json, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(room_id, user_id) DO UPDATE SET
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `)
    .bind(roomId, userId, payload, now)
    .run()

  await db
    .prepare(`
      UPDATE clipboard_rooms
      SET updated_at = ?
      WHERE id = ? AND user_id = ?
    `)
    .bind(now, roomId, userId)
    .run()

  return { ok: true, updatedAt: now }
})
