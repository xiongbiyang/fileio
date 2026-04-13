import { getD1Binding } from '~/server/utils/d1'
import { hashPassword, normalizeUserId, validateCredentials } from '~/server/utils/auth'
import { setAuthSession } from '~/server/utils/session'
import { assertRateLimit } from '~/server/utils/rateLimit'

interface SignupBody {
  email: string
  password: string
}

interface ExistingUser {
  id: string
}

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'signup', 5, 60_000) // 5 signups per minute
  const body = await readBody<SignupBody>(event)
  const { email, password } = validateCredentials(body || {})
  const userId = normalizeUserId(email)
  const db = getD1Binding(event)

  if (!db) {
    return { ok: false as const, reason: 'AUTH_STORAGE_NOT_CONFIGURED' as const }
  }

  const existing = await db
    .prepare('SELECT id FROM auth_users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<ExistingUser>()

  if (existing?.id) {
    throw createError({ statusCode: 409, statusMessage: 'Account already exists' })
  }

  const now = Date.now()
  const passwordHash = await hashPassword(password)
  await db
    .prepare(`
      INSERT INTO auth_users (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(userId, email, passwordHash, now, now)
    .run()

  await setAuthSession(event, {
    id: userId,
    email,
  })

  return {
    ok: true as const,
    user: {
      id: userId,
      email,
    },
  }
})
