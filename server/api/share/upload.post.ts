import { createError, defineEventHandler, getRequestHeader, readMultipartFormData } from 'h3'
import { generateShareId } from '~/utils/shareId'
import { getShareBucket } from '~/server/utils/r2'
import { assertRateLimit } from '~/server/utils/rateLimit'
import { assertTurnstile } from '~/server/utils/turnstile'

const MAX_FILE_BYTES = 100 * 1024 * 1024 // 100 MB
const ALLOWED_EXPIRES_SEC = new Set([3600, 86400, 259200]) // 1h, 24h, 3d
const ALLOWED_MAX_DOWNLOADS = new Set([0, 1]) // 0 = unlimited, 1 = single-use

// Rate limit: 10 uploads and 500 MB per IP per hour (world).
// Turnstile is unreliable in mainland China (challenges.cloudflare.com is
// throttled by GFW), so CN visitors skip the widget and rely on a tighter
// rate limit instead — see the CF-IPCountry branch below.
const RL_WINDOW_SEC = 3600
const RL_MAX_UPLOADS = 10
const RL_MAX_BYTES = 500 * 1024 * 1024
const RL_MAX_UPLOADS_CN = 5
const RL_MAX_BYTES_CN = 300 * 1024 * 1024

function bytesToHex(buf: ArrayBuffer): string {
  const view = new Uint8Array(buf)
  let out = ''
  for (let i = 0; i < view.length; i++) {
    out += view[i].toString(16).padStart(2, '0')
  }
  return out
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Empty upload' })
  }

  let filePart: typeof parts[number] | null = null
  let turnstileToken = ''
  let expiresInSec = 86400
  let maxDownloads = 1

  for (const part of parts) {
    if (part.name === 'file') filePart = part
    else if (part.name === 'turnstileToken') turnstileToken = String(part.data ?? '')
    else if (part.name === 'expires_in') {
      expiresInSec = Number.parseInt(String(part.data ?? ''), 10)
    }
    else if (part.name === 'max_downloads') {
      maxDownloads = Number.parseInt(String(part.data ?? ''), 10)
    }
  }

  if (!filePart || !filePart.data || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file' })
  }
  if (filePart.data.byteLength === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Empty file' })
  }
  if (filePart.data.byteLength > MAX_FILE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'File too large (max 100 MB)' })
  }
  if (!ALLOWED_EXPIRES_SEC.has(expiresInSec)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid expires_in' })
  }
  if (!ALLOWED_MAX_DOWNLOADS.has(maxDownloads)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid max_downloads' })
  }

  const isCN = getRequestHeader(event, 'cf-ipcountry') === 'CN'
  if (!isCN) {
    await assertTurnstile(event, turnstileToken)
  }
  await assertRateLimit(
    event,
    isCN ? 'share-upload-cn' : 'share-upload',
    RL_WINDOW_SEC,
    isCN ? RL_MAX_UPLOADS_CN : RL_MAX_UPLOADS,
    filePart.data.byteLength,
    isCN ? RL_MAX_BYTES_CN : RL_MAX_BYTES,
  )

  const bucket = getShareBucket(event)
  const id = generateShareId()
  const now = Date.now()
  const expiresAt = now + expiresInSec * 1000

  // Hash content for potential abuse-blocklist lookups later
  const bodyBuf = new Uint8Array(filePart.data).buffer as ArrayBuffer
  const hashBuf = await crypto.subtle.digest('SHA-256', bodyBuf)

  const safeName = filePart.filename.slice(0, 255)
  const contentType = filePart.type || 'application/octet-stream'

  await bucket.put(id, bodyBuf, {
    httpMetadata: { contentType },
    customMetadata: {
      filename: safeName,
      mime: contentType,
      size: String(filePart.data.byteLength),
      expiresAt: String(expiresAt),
      maxDownloads: String(maxDownloads),
      downloadsRemaining: maxDownloads === 0 ? '0' : String(maxDownloads),
      uploadedAt: String(now),
      sha256: bytesToHex(hashBuf),
    },
  })

  return {
    id,
    expiresAt,
    maxDownloads,
    size: filePart.data.byteLength,
  }
})
