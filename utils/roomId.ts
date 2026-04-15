/**
 * Generate a pairing room id using a CSPRNG.
 *
 * Room ids act as the shared bearer secret during pairing — anyone who can
 * guess or observe one can join the signaling room and race the real receiver.
 * `Math.random()` is not cryptographically secure (and has been trivially
 * reversible in some V8 builds), so pull entropy from `crypto.getRandomValues`.
 *
 * To avoid modulo bias across a 32-char alphabet, reject bytes that fall
 * outside the largest multiple of `alphabet.length` below 256 and resample.
 */
export function generateRoomId(alphabet: string, length = 6): string {
  const crypto = globalThis.crypto
  if (!crypto?.getRandomValues) {
    throw new Error('crypto.getRandomValues is required')
  }
  const alphabetLen = alphabet.length
  const threshold = 256 - (256 % alphabetLen)
  const out: string[] = []
  const buf = new Uint8Array(length * 2)
  while (out.length < length) {
    crypto.getRandomValues(buf)
    for (let i = 0; i < buf.length && out.length < length; i++) {
      const byte = buf[i]
      if (byte < threshold) out.push(alphabet[byte % alphabetLen])
    }
  }
  return out.join('')
}
