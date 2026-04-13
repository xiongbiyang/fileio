import { assertRateLimit } from '~/server/utils/rateLimit'
import { getD1Binding } from '~/server/utils/d1'

/**
 * Contact form submission endpoint.
 * Stores feedback in Cloudflare D1 with graceful fallback.
 */
export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'contact', 3, 60_000) // 3 submissions per minute
  const body = await readBody(event)

  const email = String(body.email || '').trim().slice(0, 254)
  const name = String(body.name || '').trim().slice(0, 100)
  const message = String(body.message || '').trim().slice(0, 2000)

  if (!email || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and message are required',
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
    })
  }

  const db = getD1Binding(event)
  if (!db) {
    return { success: true, reason: 'STORAGE_NOT_CONFIGURED' }
  }

  const id = `ct_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
  await db
    .prepare('INSERT INTO contact_submissions (id, email, name, message, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, email, name, message, Date.now())
    .run()

  return { success: true }
})
