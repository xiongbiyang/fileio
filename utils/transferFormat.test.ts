import { describe, expect, it } from 'vitest'

import { formatSize, formatSpeed, formatTime } from './transferFormat'

describe('transferFormat', () => {
  it('formats file sizes with expected units', () => {
    expect(formatSize(512)).toBe('512 B')
    expect(formatSize(1536)).toBe('1.5 KB')
    expect(formatSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('formats transfer speeds with expected units', () => {
    expect(formatSpeed(999)).toBe('999 B/s')
    expect(formatSpeed(2048)).toBe('2.0 KB/s')
    expect(formatSpeed(3 * 1024 * 1024)).toBe('3.0 MB/s')
  })

  it('formats remaining time in compact labels', () => {
    expect(formatTime(0.4)).toBe('< 1s')
    expect(formatTime(10.2)).toBe('~11s')
    expect(formatTime(119)).toBe('~2m')
  })
})

