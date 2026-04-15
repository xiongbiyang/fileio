import { describe, expect, it } from 'vitest'

import { generateRoomId } from './roomId'

describe('generateRoomId', () => {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'

  it('uses default length of 6 characters', () => {
    const id = generateRoomId(alphabet)
    expect(id).toHaveLength(6)
  })

  it('respects custom length', () => {
    expect(generateRoomId(alphabet, 4)).toHaveLength(4)
    expect(generateRoomId(alphabet, 10)).toHaveLength(10)
  })

  it('returns only characters from the supplied alphabet', () => {
    const id = generateRoomId(alphabet, 64)
    for (const ch of id) expect(alphabet).toContain(ch)
  })

  it('produces different ids across calls (no obvious degeneracy)', () => {
    const ids = new Set(Array.from({ length: 32 }, () => generateRoomId(alphabet, 8)))
    // 32^8 keyspace → collisions within 32 draws would be astronomical
    expect(ids.size).toBe(32)
  })
})
