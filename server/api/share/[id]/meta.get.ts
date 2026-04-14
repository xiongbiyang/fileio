import { createError, defineEventHandler, getRouterParam } from 'h3'
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

  const bucket = getShareBucket(event)
  const info = await bucket.head(id)
  if (!info) {
    throw createError({ statusCode: 404, statusMessage: 'Share not found' })
  }

  const meta = info.customMetadata ?? {}
  const expiresAt = Number.parseInt(meta.expiresAt ?? '0', 10)
  if (!expiresAt || Date.now() > expiresAt) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share expired' })
  }

  const maxDownloads = Number.parseInt(meta.maxDownloads ?? '0', 10)
  const downloadsRemaining = maxDownloads === 0
    ? -1 // unlimited sentinel
    : Number.parseInt(meta.downloadsRemaining ?? '0', 10)

  if (maxDownloads > 0 && downloadsRemaining <= 0) {
    await bucket.delete(id).catch(() => {})
    throw createError({ statusCode: 410, statusMessage: 'Share already consumed' })
  }

  return {
    id,
    filename: meta.filename ?? 'file',
    mime: meta.mime ?? 'application/octet-stream',
    size: Number.parseInt(meta.size ?? String(info.size), 10),
    expiresAt,
    maxDownloads,
    downloadsRemaining,
  }
})
