import { describe, expect, it } from 'vitest'
import { buildRoomJoinUrl } from './shareLink'

describe('buildRoomJoinUrl', () => {
  it('builds url with query parameter for clean path', () => {
    const result = buildRoomJoinUrl('https://toolport.dev', '/zh-CN/tools/clipboard', 'ABCD12')
    expect(result).toBe('https://toolport.dev/zh-CN/tools/clipboard?r=ABCD12')
  })

  it('appends parameter to path with existing query', () => {
    const result = buildRoomJoinUrl('https://toolport.dev', '/tools/text-transfer?src=qr', 'ROOM-01')
    expect(result).toBe('https://toolport.dev/tools/text-transfer?src=qr&r=ROOM-01')
  })

  it('encodes room id safely', () => {
    const result = buildRoomJoinUrl('https://toolport.dev', '/tools/clipboard', 'A B+C')
    expect(result).toBe('https://toolport.dev/tools/clipboard?r=A%20B%2BC')
  })
})
