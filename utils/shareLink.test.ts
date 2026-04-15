import { describe, expect, it } from 'vitest'
import { buildRoomJoinUrl } from './shareLink'

describe('buildRoomJoinUrl', () => {
  it('builds url with query parameter for clean path', () => {
    const result = buildRoomJoinUrl('https://fileio.top', '/zh-CN/transfer', 'ABCD12')
    expect(result).toBe('https://fileio.top/zh-CN/transfer?r=ABCD12#r=ABCD12')
  })

  it('appends parameter to path with existing query', () => {
    const result = buildRoomJoinUrl('https://fileio.top', '/transfer?src=qr', 'ROOM-01')
    expect(result).toBe('https://fileio.top/transfer?src=qr&r=ROOM-01#r=ROOM-01')
  })

  it('encodes room id safely', () => {
    const result = buildRoomJoinUrl('https://fileio.top', '/transfer', 'A B+C')
    expect(result).toBe('https://fileio.top/transfer?r=A%20B%2BC#r=A%20B%2BC')
  })
})
