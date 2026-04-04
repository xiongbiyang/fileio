import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'

const SESSION_COOKIE = 'tp_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
const SESSION_VERSION = 1

interface SessionPayload {
  v: number
  uid: string
  email: string
  exp: number
}

function toBase64Url(input: Uint8Array) {
  let binary = ''
  for (const value of input) {
    binary += String.fromCharCode(value)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (normalized.length % 4)) % 4
  const padded = normalized + '='.repeat(padLength)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function utf8Encode(value: string) {
  return new TextEncoder().encode(value)
}

function utf8Decode(value: Uint8Array) {
  return new TextDecoder().decode(value)
}

function getSessionSecret(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)
  const secret = String(runtimeConfig.authSessionSecret || '').trim()
  if (!secret) {
    throw createError({ statusCode: 503, statusMessage: 'Auth session secret is not configured' })
  }
  return secret
}

async function signPayload(secret: string, payloadEncoded: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    utf8Encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, utf8Encode(payloadEncoded))
  return toBase64Url(new Uint8Array(signature))
}

async function encodeSessionToken(event: H3Event, payload: SessionPayload) {
  const encoded = toBase64Url(utf8Encode(JSON.stringify(payload)))
  const signature = await signPayload(getSessionSecret(event), encoded)
  return `${encoded}.${signature}`
}

async function decodeSessionToken(event: H3Event, token: string) {
  const [payloadEncoded, signature] = token.split('.')
  if (!payloadEncoded || !signature) return null

  const expected = await signPayload(getSessionSecret(event), payloadEncoded)
  if (expected !== signature) return null

  try {
    const parsed = JSON.parse(utf8Decode(fromBase64Url(payloadEncoded))) as Partial<SessionPayload>
    if (parsed.v !== SESSION_VERSION) return null
    const uid = String(parsed.uid || '').trim()
    const email = String(parsed.email || '').trim().toLowerCase()
    const exp = Number(parsed.exp || 0)
    if (!uid || !email || !Number.isFinite(exp) || exp <= Date.now()) return null
    return { uid, email }
  }
  catch {
    return null
  }
}

export async function setAuthSession(event: H3Event, user: { id: string, email: string }) {
  const payload: SessionPayload = {
    v: SESSION_VERSION,
    uid: user.id,
    email: user.email.trim().toLowerCase(),
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  }
  const token = await encodeSessionToken(event, payload)
  setCookie(event, SESSION_COOKIE, token, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export async function getAuthSessionUser(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  return decodeSessionToken(event, token)
}

export async function requireAuthSessionUser(event: H3Event) {
  const user = await getAuthSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return user
}
