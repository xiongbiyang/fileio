import { getD1Binding, requireUserId } from '~/server/utils/d1'

export default defineEventHandler(async (event) => {
  const db = getD1Binding(event)
  if (!db) {
    return { ok: false, reason: 'D1_NOT_CONFIGURED' }
  }

  const userId = requireUserId(getQuery(event).userId)
  const roomId = String(getRouterParam(event, 'roomId') || '').trim().toUpperCase()
  if (!roomId) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID required' })
  }

  await db
    .prepare(`
      DELETE FROM clipboard_room_messages
      WHERE room_id = ? AND user_id = ?
    `)
    .bind(roomId, userId)
    .run()

  return { ok: true }
})
