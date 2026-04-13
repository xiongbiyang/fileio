export function buildRoomJoinUrl(origin: string, localizedPath: string, roomId: string) {
  const safeOrigin = String(origin || '').trim()
  const safePath = String(localizedPath || '').trim()
  const safeRoomId = String(roomId || '').trim()
  if (!safeOrigin || !safePath || !safeRoomId) return ''
  const separator = safePath.includes('?') ? '&' : '?'
  // Include room ID in both query param AND hash for redundancy
  // Some redirects/scanners strip query params but preserve hash
  return `${safeOrigin}${safePath}${separator}r=${encodeURIComponent(safeRoomId)}#r=${encodeURIComponent(safeRoomId)}`
}
