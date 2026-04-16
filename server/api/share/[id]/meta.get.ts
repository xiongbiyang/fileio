import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { getShareBucket } from '~/server/utils/r2'
import { assertRateLimit } from '~/server/utils/rateLimit'
import { isShareIdShape } from '~/utils/shareId'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!isShareIdShape(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid share id' })
  }

  // Light rate limit (100 / hour / IP) — prevents mass enumeration
  await assertRateLimit(event, 'share-meta', 3600, 100)

  // Never cache meta responses. A single-use share's state changes the
  // moment a download begins — a stale 200 cached at the edge would lead
  // the recipient to click Download and hit 410 unexpectedly.
  setHeader(event, 'Cache-Control', 'no-store')

  const bucket = getShareBucket(event)
  const info = await bucket.head(id)
  if (!info) {
    throw createError({ statusCode: 404, statusMessage: 'Share not found' })
  }

  const meta = info.customMetadata ?? {}
  // New uploads go through the S3 API (presigned PUT), which lowercases all
  // x-amz-meta-* header names. Legacy uploads (via the R2 binding) used
  // camelCase. Read lowercase first, then fall back.
  const metaNum = (lower: string, camel: string): number =>
    Number.parseInt(meta[lower] ?? meta[camel] ?? '0', 10)

  const expiresAt = metaNum('expiresat', 'expiresAt')
  if (!expiresAt || Date.now() > expiresAt) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share expired' })
  }

  const maxDownloads = metaNum('maxdownloads', 'maxDownloads')
  const downloadsRemaining = maxDownloads === 0
    ? -1 // unlimited sentinel
    : metaNum('downloadsremaining', 'downloadsRemaining')

  if (maxDownloads > 0 && downloadsRemaining <= 0) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share already consumed' })
  }

  const rawFilename = meta.filename ?? 'file'
  let filename: string
  try {
    filename = decodeURIComponent(rawFilename)
  }
  catch {
    filename = rawFilename
  }

  return {
    id,
    filename,
    mime: meta.mime ?? 'application/octet-stream',
    size: metaNum('size', 'size') || info.size,
    expiresAt,
    maxDownloads,
    downloadsRemaining,
  }
})
