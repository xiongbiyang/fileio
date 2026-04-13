import { getD1Binding } from '~/server/utils/d1'
import { assertRateLimit } from '~/server/utils/rateLimit'

interface ToolVoteBody {
  votes: string[]
  toolName?: string
  detail?: string
  email?: string
  locale?: string
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'tool-votes', 5, 60_000)
  const body = await readBody<ToolVoteBody>(event)

  const votes = Array.isArray(body?.votes) ? body.votes.map(v => String(v).slice(0, 60)).slice(0, 30) : []
  if (votes.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one vote is required' })
  }

  const toolName = String(body?.toolName || '').trim().slice(0, 200)
  const detail = String(body?.detail || '').trim().slice(0, 1000)
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 254)
  const locale = String(body?.locale || 'en').slice(0, 20)

  // Hash IP for dedup without storing raw IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const ipBytes = new TextEncoder().encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', ipBytes)
  const ipHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)

  const db = getD1Binding(event)
  if (!db) {
    return { ok: true as const, reason: 'STORAGE_NOT_CONFIGURED' as const }
  }

  const id = `tv_${ipHash}_${Date.now()}`
  await db
    .prepare(`
      INSERT INTO tool_votes (id, ip_hash, votes, tool_name, detail, email, locale, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(id, ipHash, JSON.stringify(votes), toolName, detail, email, locale, Date.now())
    .run()

  return { ok: true as const }
})
