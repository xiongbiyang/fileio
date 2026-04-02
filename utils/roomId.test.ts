import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateRoomId } from './roomId'

describe('generateRoomId', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses default length of 6 characters', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const id = generateRoomId('ABC')

    expect(id).toHaveLength(6)
    expect(id).toBe('AAAAAA')
  })

  it('respects custom length and alphabet selection', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.34)
      .mockReturnValueOnce(0.67)
      .mockReturnValueOnce(0.99)

    const id = generateRoomId('ABCD', 4)
    expect(id).toBe('ABCD')
  })
})

