import type { H3Event } from 'h3'
import { createError, getRequestIP } from 'h3'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Throws 403 when the token is missing, malformed, or rejected upstream.
 * Silently no-ops when `NUXT_TURNSTILE_SECRET_KEY` is not configured — this
 * keeps local dev usable without a Cloudflare account. Production MUST set
 * the secret.
 */
export async function assertTurnstile(event: H3Event, token: string | undefined): Promise<void> {
  const secret = useRuntimeConfig(event).turnstileSecretKey
  if (!secret) return // unconfigured — skip (dev only)

  if (!token || typeof token !== 'string' || token.length < 10) {
    throw createError({ statusCode: 403, statusMessage: 'Missing captcha token' })
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: getRequestIP(event, { xForwardedFor: true }) || '',
  })

  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Captcha verifier unreachable' })
  }
  const data = await res.json() as TurnstileResponse
  if (!data.success) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Captcha failed',
      data: { codes: data['error-codes'] ?? [] },
    })
  }
}
