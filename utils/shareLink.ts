export function buildRoomJoinUrl(origin: string, localizedJoinPath: string): string {
  const safeOrigin = String(origin || '').trim()
  const safePath = String(localizedJoinPath || '').trim()
  if (!safeOrigin || !safePath) return ''
  return `${safeOrigin}${safePath}`
}
