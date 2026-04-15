/**
 * Incoming-file sink abstraction.
 *
 * Two backends:
 *  - OPFS (default where supported): streams chunks to a private origin file
 *    so we never build a multi-GB Blob in RAM. Works in Chromium, Safari 15.2+,
 *    Firefox 111+. Quota is disk-derived, not memory-derived.
 *  - Blob (fallback for iOS 15.0/15.1 and other rare cases): accumulates
 *    ArrayBuffers in memory. Callers MUST enforce the stricter Blob-mode cap
 *    upstream since this path can OOM on large files.
 *
 * Caller contract (see useTextTransferPage):
 *   1. `createFileReceiver(meta)` on file-meta arrival.
 *   2. `await receiver.write(chunk)` for each ArrayBuffer. Natural backpressure.
 *   3. On file-end → `const { url, cleanup } = await receiver.finalize()`,
 *      trigger download with `url`, then `await cleanup()` after a short delay.
 *   4. On cancel / error / unmount → `await receiver.abort()` to drop the
 *      OPFS file (or clear the in-memory buffer).
 */

export interface ReceiverMeta {
  name: string
  size: number
  mimeType?: string
}

export interface FileReceiver {
  backend: 'opfs' | 'blob'
  write: (chunk: ArrayBuffer) => Promise<void>
  finalize: () => Promise<{ url: string; cleanup: () => Promise<void> }>
  abort: () => Promise<void>
}

const OPFS_ENTRY_PREFIX = 'tp-rx-'

export function isOpfsAvailable(): boolean {
  if (typeof navigator === 'undefined') return false
  if (!('storage' in navigator) || !('getDirectory' in navigator.storage)) return false
  if (typeof FileSystemFileHandle === 'undefined') return false
  // iOS 15.0 / 15.1 expose FileSystemFileHandle without createWritable.
  return typeof (FileSystemFileHandle.prototype as unknown as { createWritable?: unknown })
    .createWritable === 'function'
}

function createBlobReceiver(meta: ReceiverMeta): FileReceiver {
  const chunks: ArrayBuffer[] = []
  let aborted = false
  return {
    backend: 'blob',
    async write(chunk) {
      if (aborted) return
      chunks.push(chunk)
    },
    async finalize() {
      if (aborted) throw new Error('aborted')
      const blob = new Blob(chunks, { type: meta.mimeType || 'application/octet-stream' })
      chunks.length = 0
      const url = URL.createObjectURL(blob)
      return {
        url,
        cleanup: async () => {
          URL.revokeObjectURL(url)
        },
      }
    },
    async abort() {
      aborted = true
      chunks.length = 0
    },
  }
}

async function createOpfsReceiver(meta: ReceiverMeta): Promise<FileReceiver> {
  const root = await navigator.storage.getDirectory()
  // Timestamp prefix lets cleanupStaleOpfsFiles() reap orphans from a prior
  // crash without needing per-file metadata.
  const opfsName = `${OPFS_ENTRY_PREFIX}${Date.now()}-${crypto.randomUUID()}`
  const handle = await root.getFileHandle(opfsName, { create: true })
  const writer = await handle.createWritable()
  let aborted = false

  const removeEntry = async () => {
    try { await root.removeEntry(opfsName) }
    catch { /* best-effort */ }
  }

  return {
    backend: 'opfs',
    async write(chunk) {
      if (aborted) return
      // Awaiting propagates backpressure: if the disk is slower than the
      // DataChannel, this Promise defers resolution and the caller's
      // per-chunk await naturally slows chunk processing. No in-memory queue.
      await writer.write(chunk)
    },
    async finalize() {
      if (aborted) throw new Error('aborted')
      await writer.close()
      const file = await handle.getFile()
      // file.slice() preserves the File's underlying storage reference — the
      // Blob URL streams directly from OPFS, no copy into RAM.
      const blob = file.slice(0, file.size, meta.mimeType || 'application/octet-stream')
      const url = URL.createObjectURL(blob)
      return {
        url,
        cleanup: async () => {
          URL.revokeObjectURL(url)
          await removeEntry()
        },
      }
    },
    async abort() {
      if (aborted) return
      aborted = true
      try { await writer.abort() }
      catch { /* stream may already be closed */ }
      await removeEntry()
    },
  }
}

export async function createFileReceiver(meta: ReceiverMeta): Promise<FileReceiver> {
  if (isOpfsAvailable()) {
    try {
      return await createOpfsReceiver(meta)
    }
    catch {
      // OPFS init failed (permission, zero quota, iOS quirk) — degrade cleanly.
    }
  }
  return createBlobReceiver(meta)
}

/**
 * Best-effort reaper for OPFS files left behind when a prior tab crashed
 * mid-transfer. Called on page mount. Safe to call without awaiting.
 */
export async function cleanupStaleOpfsFiles(olderThanMs = 30 * 60 * 1000): Promise<void> {
  if (!isOpfsAvailable()) return
  try {
    const root = await navigator.storage.getDirectory()
    const cutoff = Date.now() - olderThanMs
    // The async iterator is standard but its types lag in some TS lib builds.
    const dir = root as unknown as AsyncIterable<FileSystemHandle>
    for await (const entry of dir) {
      if (entry.kind !== 'file') continue
      if (!entry.name.startsWith(OPFS_ENTRY_PREFIX)) continue
      const match = entry.name.match(/^tp-rx-(\d+)-/)
      const ts = match ? Number(match[1]) : NaN
      if (Number.isFinite(ts) && ts < cutoff) {
        try { await root.removeEntry(entry.name) }
        catch { /* best-effort */ }
      }
    }
  }
  catch {
    // Best-effort — silently skip.
  }
}
