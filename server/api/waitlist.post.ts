import { getD1Binding } from '~/server/utils/d1'
import { assertRateLimit } from '~/server/utils/rateLimit'

interface WaitlistBody {
  email: string
  plan: 'monthly' | 'yearly' | 'lifetime'
  locale?: string
  source?: string
}

function normalizePlan(raw: unknown): 'monthly' | 'yearly' | 'lifetime' {
  const value = String(raw || '').trim().toLowerCase()
  if (value === 'monthly' || value === 'yearly' || value === 'lifetime') return value
  throw createError({ statusCode: 400, statusMessage: 'Invalid plan' })
}

function normalizeEmail(raw: unknown) {
  const email = String(raw || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address' })
  }
  return email
}

function createLeadId(email: string, plan: string) {
  const safeEmail = email.replace(/[^a-z0-9]/g, '_')
  return `wl_${safeEmail}_${plan}`
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'waitlist', 5, 60_000) // 5 submissions per minute
  const body = await readBody<WaitlistBody>(event)
  const email = normalizeEmail(body?.email)
  const plan = normalizePlan(body?.plan)
  const locale = String(body?.locale || 'en').slice(0, 20)
  const source = String(body?.source || 'pro-waitlist').slice(0, 40)
  const now = Date.now()

  const db = getD1Binding(event)
  if (!db) {
    return { ok: true as const, reason: 'WAITLIST_STORAGE_NOT_CONFIGURED' as const }
  }

  const id = createLeadId(email, plan)
  await db
    .prepare(`
      INSERT INTO pro_waitlist_leads (id, email, plan, locale, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email, plan) DO UPDATE SET
        locale = excluded.locale,
        source = excluded.source,
        updated_at = excluded.updated_at
    `)
    .bind(id, email, plan, locale, source, now, now)
    .run()

  return { ok: true as const }
})
