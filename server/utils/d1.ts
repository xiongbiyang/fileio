import type { H3Event } from 'h3'

interface D1Binding {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: () => Promise<{ results?: unknown[] }>
      first: <T = unknown>() => Promise<T | null>
      run: () => Promise<unknown>
    }
  }
}

export function getD1Binding(event: H3Event, key = 'DB'): D1Binding | null {
  const env = (event.context as { cloudflare?: { env?: Record<string, unknown> } }).cloudflare?.env
  if (!env) return null
  const binding = env[key] as D1Binding | undefined
  return binding || null
}

export function requireUserId(value: unknown) {
  const userId = String(value || '').trim()
  if (!/^[a-z0-9_]{3,120}$/i.test(userId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid userId' })
  }
  return userId
}
