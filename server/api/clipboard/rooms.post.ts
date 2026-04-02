import { getD1Binding, requireUserId } from '~/server/utils/d1'

interface RoomBody {
  userId: string
  room: {
    id: string
    name: string
    desc?: string
    e2ee?: boolean
    createdAt?: number
  }
}

export default defineEventHandler(async (event) => {
  const db = getD1Binding(event)
  if (!db) {
    return { ok: false, reason: 'D1_NOT_CONFIGURED' }
  }

  const body = await readBody<RoomBody>(event)
  const userId = requireUserId(body?.userId)
  const roomId = String(body?.room?.id || '').trim().toUpperCase()
  if (!/^[A-Z0-9_-]{4,64}$/.test(roomId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid room id' })
  }

  const now = Date.now()
  const createdAt = Number(body?.room?.createdAt) || now
  const name = String(body?.room?.name || `#ROOM-${roomId}`).slice(0, 120)
  const description = String(body?.room?.desc || '').slice(0, 300)
  const isE2ee = body?.room?.e2ee ? 1 : 0

  await db
    .prepare(`
      INSERT INTO clipboard_rooms (id, user_id, name, description, is_e2ee, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        name = excluded.name,
        description = excluded.description,
        is_e2ee = excluded.is_e2ee,
        updated_at = excluded.updated_at
    `)
    .bind(roomId, userId, name, description, isE2ee, createdAt, now)
    .run()

  return { ok: true }
})
