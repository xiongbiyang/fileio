export function buildRoomJoinUrl(origin: string, localizedPath: string, roomId: string) {
  const safeOrigin = String(origin || '').trim()
  const safePath = String(localizedPath || '').trim()
  const safeRoomId = String(roomId || '').trim()
  if (!safeOrigin || !safePath || !safeRoomId) return ''
  const separator = safePath.includes('?') ? '&' : '?'
  return `${safeOrigin}${safePath}${separator}r=${encodeURIComponent(safeRoomId)}`
}
