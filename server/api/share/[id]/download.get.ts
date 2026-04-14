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
  const encoded = encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, '%2A')
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
  const expiresAt = Number.parseInt(meta.expiresAt ?? '0', 10)
  if (!expiresAt || Date.now() > expiresAt) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share expired' })
  }

  const maxDownloads = Number.parseInt(meta.maxDownloads ?? '0', 10)
  const downloadsRemaining = maxDownloads === 0
    ? -1
    : Number.parseInt(meta.downloadsRemaining ?? '0', 10)
  if (maxDownloads > 0 && downloadsRemaining <= 0) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share already consumed' })
  }

  const filename = meta.filename ?? 'download.bin'
  const mime = meta.mime ?? obj.httpMetadata?.contentType ?? 'application/octet-stream'
  const size = Number.parseInt(meta.size ?? String(obj.size), 10)

  setHeader(event, 'Content-Type', mime)
  setHeader(event, 'Content-Length', String(size))
  setHeader(event, 'Content-Disposition', encodeContentDisposition(filename))
  setHeader(event, 'Cache-Control', 'no-store')
  setResponseStatus(event, 200)

  // Single-use share: schedule delete after the response is handed off.
  // Cloudflare Workers' waitUntil keeps the promise alive past the Worker
  // response boundary. For max_downloads === 0 (unlimited), the object is
  // left in place until the 3-day lifecycle rule sweeps it.
  if (maxDownloads === 1) {
    const cf = event.context.cloudflare as { context?: { waitUntil?: (p: Promise<unknown>) => void } } | undefined
    const waitUntil = cf?.context?.waitUntil
    const deletePromise = bucket.delete(id).catch(() => {})
    if (waitUntil) waitUntil(deletePromise)
    // else: in local dev without cloudflare context, just fire-and-forget
  }

  return obj.body
})
