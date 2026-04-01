/**
 * Contact form submission endpoint.
 * Stores feedback in Cloudflare D1 (or logs for MVP).
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and message are required',
    })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
    })
  }

  // Rate limiting check (simple in-memory for MVP)
  // In production, use Cloudflare KV or D1

  // For MVP: log the feedback
  console.log('[Contact]', {
    email: body.email,
    message: body.message.substring(0, 500),
    timestamp: new Date().toISOString(),
  })

  // In production: store in D1
  // const db = event.context.cloudflare?.env?.DB
  // await db.prepare('INSERT INTO feedback (email, message, created_at) VALUES (?, ?, ?)')
  //   .bind(body.email, body.message, Date.now())
  //   .run()

  return { success: true }
})
