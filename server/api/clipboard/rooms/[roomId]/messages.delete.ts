import { getD1Binding } from '~/server/utils/d1'
import { requireAuthSessionUser } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const db = getD1Binding(event)
  if (!db) {
    return { ok: false, reason: 'D1_NOT_CONFIGURED' }
  }

  const { uid: userId } = await requireAuthSessionUser(event)
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
