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

  // Single-use share semantics (max_downloads === 1):
  //
  // We delete the R2 object AFTER the client finishes consuming the stream,
  // not at request start. The previous behavior (schedule delete immediately
  // via waitUntil) broke slow-network recipients: large files (300 MB+) on
  // weak links often got interrupted mid-download, and the retry saw 404
  // because the delete had already fired.
  //
  // New behavior: pipe the R2 body through a pass-through TransformStream
  // and observe `pipeTo`'s completion. On success — the client received the
  // full body — delete the object. On failure (client disconnect, network
  // error) — leave the object so the recipient can retry within the expiry
  // window. Once expiresAt passes, the next request's expiry check will
  // clean it up anyway, so the worst abuse window is one expiry period.
  //
  // For max_downloads === 0 (unlimited) the object stays until lifecycle
  // rules sweep it (or expiry check on any subsequent GET).
  //
  // IMPORTANT: do NOT destructure waitUntil — it is a bound method on the
  // execution context. Calling a bare reference triggers "Illegal invocation"
  // in workerd. Always invoke it via the owning object.
  if (maxDownloads !== 1) {
    return body
  }

  const { readable, writable } = new TransformStream()
  const deleteAfterDelivery = body.pipeTo(writable).then(
    () => bucket.delete(id).catch(() => {}),
    () => { /* stream aborted — preserve for retry; expiry will GC */ },
  )

  const cf = event.context.cloudflare as
    | { context?: { waitUntil?: (p: Promise<unknown>) => void } }
    | undefined
  if (cf?.context?.waitUntil) {
    cf.context.waitUntil(deleteAfterDelivery)
  }
  else {
    // Local dev without a cloudflare execution context — attach the promise
    // to something so it's not dropped by the event loop early.
    void deleteAfterDelivery
  }

  return readable
})
