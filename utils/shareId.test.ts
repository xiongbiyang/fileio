import { describe, expect, it } from 'vitest'
import { generateShareId, isShareIdShape } from './shareId'

describe('generateShareId', () => {
  it('generates a 10-char base62 id by default', () => {
    const id = generateShareId()
    expect(id).toMatch(/^[a-zA-Z0-9]{10}$/)
  })

  it('honors custom length', () => {
    const id = generateShareId(16)
    expect(id).toHaveLength(16)
    expect(id).toMatch(/^[a-zA-Z0-9]{16}$/)
  })

  it('produces unique ids across many calls', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 1000; i++) ids.add(generateShareId())
    expect(ids.size).toBe(1000)
  })
})

describe('isShareIdShape', () => {
  it('accepts a valid 10-char id', () => {
    expect(isShareIdShape('abc123XYZ0')).toBe(true)
  })

  it('rejects wrong length', () => {
    expect(isShareIdShape('short')).toBe(false)
    expect(isShareIdShape('way-too-long-id-here')).toBe(false)
  })

  it('rejects non-string values', () => {
    expect(isShareIdShape(123)).toBe(false)
    expect(isShareIdShape(null)).toBe(false)
    expect(isShareIdShape(undefined)).toBe(false)
  })

  it('rejects invalid characters', () => {
    expect(isShareIdShape('abc-12345X')).toBe(false)
    expect(isShareIdShape('abc 12345X')).toBe(false)
  })
})
