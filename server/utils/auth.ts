import { createError } from 'h3'

const PBKDF2_ITERATIONS = 120000
const PBKDF2_KEY_LENGTH = 32

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface AuthCredentials {
  email: string
  password: string
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeUserId(email: string) {
  return normalizeEmail(email).replace(/[^a-z0-9]/g, '_')
}

export function validateCredentials(input: Partial<AuthCredentials>) {
  const email = normalizeEmail(String(input.email || ''))
  const password = String(input.password || '')
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }
  if (password.trim().length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }
  return { email, password }
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid auth hash format' })
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    const part = hex.slice(i * 2, i * 2 + 2)
    bytes[i] = Number.parseInt(part, 16)
  }
  return bytes
}

function randomSaltHex() {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return bytesToHex(salt)
}

async function deriveHex(password: string, saltHex: string, iterations: number) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: hexToBytes(saltHex),
      iterations,
    },
    key,
    PBKDF2_KEY_LENGTH * 8,
  )
  return bytesToHex(new Uint8Array(bits))
}

export async function hashPassword(password: string) {
  const saltHex = randomSaltHex()
  const derivedHex = await deriveHex(password, saltHex, PBKDF2_ITERATIONS)
  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${saltHex}$${derivedHex}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const parts = String(storedHash || '').split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') return false
  const iterations = Number.parseInt(parts[1], 10)
  const saltHex = parts[2]
  const expectedHex = parts[3]
  if (!Number.isFinite(iterations) || iterations <= 0 || !saltHex || !expectedHex) return false
  const actualHex = await deriveHex(password, saltHex, iterations)
  return actualHex === expectedHex
}
