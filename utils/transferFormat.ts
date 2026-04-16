export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
}

export function formatTime(seconds: number): string {
  if (seconds < 1) return '< 1s'
  if (seconds < 60) return `~${Math.ceil(seconds)}s`
  if (seconds < 3600) return `~${Math.ceil(seconds / 60)}m`
  // Hours + remainder minutes so a slow 1 GB upload doesn't just read "~120m"
  const h = Math.floor(seconds / 3600)
  const m = Math.ceil((seconds - h * 3600) / 60)
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`
}
