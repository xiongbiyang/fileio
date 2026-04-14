const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const DEFAULT_LENGTH = 10

/**
 * Generate a URL-safe random share ID using the Web Crypto API.
 * 10 base62 characters ≈ 59 bits of entropy (~5.8e17 combinations),
 * more than enough to prevent brute-force enumeration of temporary shares.
 */
export function generateShareId(length: number = DEFAULT_LENGTH): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let id = ''
  for (let i = 0; i < length; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return id
}

/**
 * Structural sanity check: returns true if the string looks like a share ID
 * (correct length, characters from ALPHABET). Does NOT confirm the share
 * actually exists in R2.
 */
export function isShareIdShape(value: unknown, length: number = DEFAULT_LENGTH): value is string {
  if (typeof value !== 'string' || value.length !== length) return false
  for (let i = 0; i < value.length; i++) {
    if (!ALPHABET.includes(value[i])) return false
  }
  return true
}
