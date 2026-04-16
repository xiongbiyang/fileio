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
  const size = metaNum('size', 'size') || obj.size

  setHeader(event, 'Content-Type', mime)
  setHeader(event, 'Content-Length', size)
  setHeader(event, 'Content-Disposition', encodeContentDisposition(filename))
  setHeader(event, 'Cache-Control', 'no-store')
  setResponseStatus(event, 200)

  const body = obj.body

  // Single-use share: schedule delete after the response is handed off.
  // Cloudflare Workers' waitUntil keeps the promise alive past the Worker
  // response boundary. For max_downloads === 0 (unlimited), the object is
  // left in place until the 3-day lifecycle rule sweeps it.
  //
  // IMPORTANT: do NOT destructure waitUntil — it is a bound method on the
  // execution context. Calling a bare reference triggers "Illegal invocation"
  // in workerd. Always invoke it via the owning object.
  if (maxDownloads === 1) {
    const cf = event.context.cloudflare as
      | { context?: { waitUntil?: (p: Promise<unknown>) => void } }
      | undefined
    if (cf?.context?.waitUntil) {
      cf.context.waitUntil(bucket.delete(id).catch(() => {}))
    }
    else {
      // Fallback for local dev without a cloudflare execution context —
      // fire-and-forget. The delete may or may not complete before the
      // process hands control back, which is acceptable for dev.
      void bucket.delete(id).catch(() => {})
    }
  }

  return body
})
