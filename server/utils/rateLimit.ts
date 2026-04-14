import type { H3Event } from 'h3'
import { createError, getRequestIP } from 'h3'

/**
 * Cloudflare Workers KV binding surface we use.
 */
export interface KVNamespace {
  get: (key: string, type?: 'text' | 'json') => Promise<string | null | Record<string, unknown>>
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>
}

function getKV(event: H3Event): KVNamespace | null {
  const env = (event.context.cloudflare?.env ?? {}) as { RATE_LIMIT_KV?: KVNamespace }
  return env.RATE_LIMIT_KV ?? null
}

function clientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

interface BucketState {
  count: number
  bytes: number
  resetAt: number // epoch ms
}

/**
 * Check-and-consume a rate-limit bucket for the caller's IP.
 *
 * @param event       H3 event
 * @param scope       namespace prefix (e.g. `upload`, `download`)
 * @param windowSec   bucket window in seconds (e.g. 3600)
 * @param maxCount    maximum requests allowed in the window (`0` = unlimited)
 * @param addBytes    amount of bytes this request consumes (`0` when counting requests only)
 * @param maxBytes    maximum bytes allowed in the window (`0` = unlimited)
 *
 * Throws H3 error 429 when the limit is exceeded. Silently no-ops when
 * RATE_LIMIT_KV is not configured (local dev) — production must ensure the
 * binding is bound in wrangler.toml.
 */
export async function assertRateLimit(
  event: H3Event,
  scope: string,
  windowSec: number,
  maxCount: number,
  addBytes = 0,
  maxBytes = 0,
): Promise<void> {
  const kv = getKV(event)
  if (!kv) return // graceful no-op when unbound

  const ip = clientIp(event)
  const key = `rl:${scope}:${ip}`
  const now = Date.now()
  const windowMs = windowSec * 1000

  const raw = await kv.get(key, 'json') as BucketState | null
  const state: BucketState = raw && raw.resetAt > now
    ? raw
    : { count: 0, bytes: 0, resetAt: now + windowMs }

  const nextCount = state.count + 1
  const nextBytes = state.bytes + addBytes

  if (maxCount > 0 && nextCount > maxCount) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: { retryAfterSec: Math.max(1, Math.ceil((state.resetAt - now) / 1000)) },
    })
  }
  if (maxBytes > 0 && nextBytes > maxBytes) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Request quota exceeded',
      data: { retryAfterSec: Math.max(1, Math.ceil((state.resetAt - now) / 1000)) },
    })
  }

  state.count = nextCount
  state.bytes = nextBytes
  const ttl = Math.max(60, Math.ceil((state.resetAt - now) / 1000))
  await kv.put(key, JSON.stringify(state), { expirationTtl: ttl })
}
