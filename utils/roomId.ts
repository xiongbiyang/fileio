export function generateRoomId(alphabet: string, length = 6): string {
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}
