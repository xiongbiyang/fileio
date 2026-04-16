import { createError, defineEventHandler, getRouterParam, setHeader, setResponseStatus } from 'h3'
import { getShareBucket } from '~/server/utils/r2'
import { assertRateLimit } from '~/server/utils/rateLimit'
import { isShareIdShape } from '~/utils/shareId'

/**
 * Encode a filename for Content-Disposition per RFC 5987 so non-ASCII
 * names like Chinese characters survive the round trip.
 */
function encodeContentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '\\"')
  const encoded = encodeURIComponent(filename)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!isShareIdShape(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share id' })
  }

  await assertRateLimit(event, 'share-download', 3600, 100)

  const bucket = getShareBucket(event)
  const obj = await bucket.get(id)
  if (!obj) {
    throw createError({ statusCode: 404, statusMessage: 'Share not found' })
  }

  const meta = obj.customMetadata ?? {}
  // New uploads go through the S3 API (presigned PUT), which normalizes
  // x-amz-meta-* header names to lowercase. Old uploads went through the
  // R2 binding with camelCase keys. Read both, preferring the new shape.
  const metaNum = (lower: string, camel: string): number =>
    Number.parseInt(meta[lower] ?? meta[camel] ?? '0', 10)

  const expiresAt = metaNum('expiresat', 'expiresAt')
  if (!expiresAt || Date.now() > expiresAt) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share expired' })
  }

  const maxDownloads = metaNum('maxdownloads', 'maxDownloads')
  const downloadsRemaining = maxDownloads === 0
    ? -1
    : metaNum('downloadsremaining', 'downloadsRemaining')
  if (maxDownloads > 0 && downloadsRemaining <= 0) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share already consumed' })
  }

  // New uploads (presigned R2 PUT) percent-encode Unicode filenames because
  // the S3 API only carries ASCII in x-amz-meta-*. Try to decode; fall back
  // to the raw string for legacy objects from the old Worker-mediated path.
  const rawFilename = meta.filename ?? 'download.bin'
  let filename: string
  try {
    filename = decodeURIComponent(rawFilename)
  }
  catch {
    filename = rawFilename
  }
  const mime = meta.mime ?? obj.httpMetadata?.contentType ?? 'application/octet-stream'
  // obj.size is R2's own count of the body bytes — authoritative. The
  // declared x-amz-meta-size is sender-supplied and used only as a fall-
  // back for legacy objects where R2 didn't surface a size (it always
  // does now, but defense in depth). Using obj.size as primary prevents
  // a sender that lied about size from truncating the download response.
  const size = obj.size || metaNum('size', 'size')

  setHeader(event, 'Content-Type', mime)
  setHeader(event, 'Content-Length', size)
  setHeader(event, 'Content-Disposition', encodeContentDisposition(filename))
  setHeader(event, 'Cache-Control', 'no-store')
  // Prevent browsers from MIME-sniffing the body. Without this, a user who
  // somehow bypasses the attachment disposition (e.g. opens the download URL
  // directly in a new tab) could have HTML/JS uploaded by a malicious sender
  // executed in our origin. Stored-XSS belt-and-suspenders.
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseStatus(event, 200)

  const body = obj.body

  // Single-use share semantics (max_downloads === 1):
  //
  // Delete the R2 object BEFORE streaming the body to the client.
  // The previous approach deleted after successful delivery, which left a
  // race window equal to the entire download duration: two concurrent
  // requests both called bucket.get() before any delete fired, both saw
  // downloadsRemaining > 0, and both received the full file.
  //
  // Deleting before streaming shrinks the race window to R2's internal
  // write-propagation latency (~ms). A second concurrent request that
  // already called bucket.get() may still succeed (unavoidable without
  // Durable Objects), but any request that arrives after the delete sees
  // 404 immediately.
  //
  // Trade-off: a mid-stream failure is not retryable. For single-use
  // semantics that is the correct behaviour — "one download" means one
  // attempt. The 3-day expiry lifecycle rule sweeps any orphaned objects.
  //
  // For max_downloads === 0 (unlimited) the object stays until lifecycle
  // rules sweep it (or expiry check on any subsequent GET).
  if (maxDownloads === 1) {
    await bucket.delete(id).catch(() => {})
  }

  return body
})
