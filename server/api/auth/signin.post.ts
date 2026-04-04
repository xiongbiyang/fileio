import { getD1Binding } from '~/server/utils/d1'
import { normalizeEmail, verifyPassword, validateCredentials } from '~/server/utils/auth'
import { setAuthSession } from '~/server/utils/session'

interface SigninBody {
  email: string
  password: string
}

interface DbUser {
  id: string
  email: string
  password_hash: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SigninBody>(event)
  const { email, password } = validateCredentials(body || {})
  const db = getD1Binding(event)

  if (!db) {
    return { ok: false as const, reason: 'AUTH_STORAGE_NOT_CONFIGURED' as const }
  }

  const user = await db
    .prepare('SELECT id, email, password_hash FROM auth_users WHERE email = ? LIMIT 1')
    .bind(normalizeEmail(email))
    .first<DbUser>()

  if (!user?.id || !user.password_hash) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const passwordMatched = await verifyPassword(password, user.password_hash)
  if (!passwordMatched) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  await setAuthSession(event, {
    id: user.id,
    email: normalizeEmail(user.email),
  })

  return {
    ok: true as const,
    user: {
      id: user.id,
      email: normalizeEmail(user.email),
    },
  }
})
