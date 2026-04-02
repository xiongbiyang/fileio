export async function writeToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}
