import { describe, expect, it } from 'vitest'
import { buildRoomJoinUrl } from './shareLink'

describe('buildRoomJoinUrl', () => {
  it('concatenates origin and the localized join path', () => {
    const result = buildRoomJoinUrl('https://fileio.top', '/zh-CN/j/abcd12')
    expect(result).toBe('https://fileio.top/zh-CN/j/abcd12')
  })

  it('works for the default locale (no prefix)', () => {
    const result = buildRoomJoinUrl('https://fileio.top', '/j/room01')
    expect(result).toBe('https://fileio.top/j/room01')
  })

  it('returns empty string when either piece is missing', () => {
    expect(buildRoomJoinUrl('', '/j/x')).toBe('')
    expect(buildRoomJoinUrl('https://fileio.top', '')).toBe('')
  })
})
