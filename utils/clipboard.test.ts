import { afterEach, describe, expect, it, vi } from 'vitest'

import { writeToClipboard } from './clipboard'

describe('writeToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('writes text using navigator.clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { clipboard: { writeText } },
    })

    await writeToClipboard('hello world')
    expect(writeText).toHaveBeenCalledWith('hello world')
  })
})

