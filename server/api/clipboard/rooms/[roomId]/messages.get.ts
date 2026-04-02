import { getD1Binding, requireUserId } from '~/server/utils/d1'

interface MessageRow {
  payload_json: string
  updated_at: number
}

export default defineEventHandler(async (event) => {
  const db = getD1Binding(event)
  if (!db) {
    return { ok: false, reason: 'D1_NOT_CONFIGURED', messages: [] }
  }

  const userId = requireUserId(getQuery(event).userId)
  const roomId = String(getRouterParam(event, 'roomId') || '').trim().toUpperCase()
  if (!roomId) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID required' })
  }

  const row = await db
    .prepare(`
      SELECT payload_json, updated_at
      FROM clipboard_room_messages
      WHERE room_id = ? AND user_id = ?
    `)
    .bind(roomId, userId)
    .first<MessageRow>()

  if (!row) {
    return { ok: true, updatedAt: 0, messages: [] }
  }

  try {
    const messages = JSON.parse(row.payload_json)
    return { ok: true, updatedAt: row.updated_at, messages: Array.isArray(messages) ? messages : [] }
  }
  catch {
    return { ok: true, updatedAt: row.updated_at, messages: [] }
  }
})
