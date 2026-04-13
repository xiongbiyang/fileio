import { createError, getRequestIP } from 'h3'
import type { H3Event } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries periodically (every 60s)
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

/**
 * Simple in-memory rate limiter for Cloudflare Workers.
 * Uses IP + route key. Resets per window.
 *
 * @param event - H3 event
 * @param key - A unique key for the endpoint (e.g. 'signin', 'contact')
 * @param maxRequests - Max requests per window
 * @param windowMs - Window duration in milliseconds
 */
export function assertRateLimit(
  event: H3Event,
  key: string,
  maxRequests: number,
  windowMs: number,
) {
  cleanup()

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const bucketKey = `${key}:${ip}`
  const now = Date.now()

  const entry = store.get(bucketKey)
  if (!entry || now > entry.resetAt) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return
  }

  entry.count++
  if (entry.count > maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    })
  }
}
