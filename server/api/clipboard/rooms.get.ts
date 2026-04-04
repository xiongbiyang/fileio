import { getD1Binding } from '~/server/utils/d1'
import { requireAuthSessionUser } from '~/server/utils/session'

interface DbRoomRow {
  id: string
  name: string
  description: string
  is_e2ee: number
  created_at: number
  updated_at: number
}

export default defineEventHandler(async (event) => {
  const db = getD1Binding(event)
  if (!db) {
    return { ok: false, reason: 'D1_NOT_CONFIGURED', rooms: [] }
  }

  const { uid: userId } = await requireAuthSessionUser(event)
  const result = await db
    .prepare(`
      SELECT id, name, description, is_e2ee, created_at, updated_at
      FROM clipboard_rooms
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 200
    `)
    .bind(userId)
    .all()

  const rooms = ((result.results || []) as DbRoomRow[]).map(row => ({
    id: row.id,
    name: row.name,
    desc: row.description,
    e2ee: !!row.is_e2ee,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return { ok: true, rooms }
})
