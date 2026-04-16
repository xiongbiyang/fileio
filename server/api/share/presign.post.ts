import { AwsClient } from 'aws4fetch'
import { createError, defineEventHandler, getRequestHeader, readBody } from 'h3'
import { assertRateLimit } from '~/server/utils/rateLimit'
import { assertTurnstile } from '~/server/utils/turnstile'
import { generateShareId } from '~/utils/shareId'

/**
 * Mint a Cloudflare R2 presigned PUT URL so the browser can stream the file
 * directly to R2 without passing through the Worker (whose request body is
 * hard-capped at 100 MB by the Cloudflare Workers runtime).
 *
 * Flow:
 *   1. Client POSTs { filename, size, contentType, expiresInSec, maxDownloads,
 *      turnstileToken } here.
 *   2. We verify Turnstile + rate limit, then generate a shareId and a PUT
 *      URL that is valid for 10 minutes and will write the object with
 *      x-amz-meta-* metadata matching what download.get.ts later reads.
 *   3. Client PUTs the file to uploadUrl with the returned headers.
 *   4. R2 validates the signature, enforces Content-Length, and writes the
 *      object. No Worker invocation happens for the byte transfer.
 *
 * Security:
 *   - Content-Length is signed, so client cannot upload a larger file than
 *     declared (R2 rejects on mismatch).
 *   - URL expires in 10 minutes — stale URLs can't be shared or replayed.
 *   - Custom metadata is signed; client cannot tamper with expires/maxDownloads.
 */

const MAX_FILE_BYTES = 1 * 1024 * 1024 * 1024 // 1 GB — presign hard cap
const BIG_FILE_THRESHOLD = 300 * 1024 * 1024 // 300 MB — expiry tier boundary
const ALLOWED_EXPIRES_SEC = new Set([1800, 3600, 86400, 259200]) // 30m, 1h, 24h, 3d
const BIG_FILE_EXPIRY_SEC = new Set([1800]) // >300 MB must use 30 min
const ALLOWED_MAX_DOWNLOADS = new Set([0, 1]) // 0 = unlimited, 1 = single-use

// Rate limit per IP per hour. Byte quota raised with the 1 GB cap so that
// a single upload cannot exhaust the whole window on its own.
const RL_WINDOW_SEC = 3600
const RL_MAX_UPLOADS = 10
const RL_MAX_BYTES = 3 * 1024 * 1024 * 1024
const RL_MAX_UPLOADS_CN = 5
const RL_MAX_BYTES_CN = Math.floor(1.5 * 1024 * 1024 * 1024)

const PRESIGN_TTL_SEC = 600 // 10 min — enough to start, short enough to prevent reuse

// Browser Origins allowed to hit the presign endpoint. CN visitors bypass
// Turnstile, so without this check a third-party site could CSRF a CN user
// into burning their rate-limit quota. Non-browser clients can forge Origin,
// but Turnstile catches them on the non-CN path; on the CN path, rate-limit
// by IP is still the backstop.
const ALLOWED_ORIGINS = new Set<string>([
  'https://fileio.top',
  'https://www.fileio.top',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
])

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin)) return true
  // Cloudflare Pages preview deployments: <hash>.transfer.pages.dev
  try {
    const u = new URL(origin)
    if (u.protocol === 'https:' && u.hostname.endsWith('.pages.dev')) return true
  }
  catch {
    return false
  }
  return false
}

interface PresignRequestBody {
  filename?: string
  size?: number
  contentType?: string
  expiresInSec?: number
  maxDownloads?: number
  turnstileToken?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const r2AccountId = String(config.r2AccountId || '')
  const r2AccessKeyId = String(config.r2AccessKeyId || '')
  const r2SecretAccessKey = String(config.r2SecretAccessKey || '')
  const r2BucketName = String(config.r2BucketName || 'fileio-share')
  if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) {
    throw createError({ statusCode: 503, statusMessage: 'Upload service not configured' })
  }

  // Origin gate: block third-party sites from initiating uploads on the
  // visitor's behalf (relevant especially on the CN path where Turnstile
  // is skipped). Browsers send Origin truthfully on POST requests.
  const origin = getRequestHeader(event, 'origin') ?? null
  if (!isAllowedOrigin(origin)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden origin' })
  }

  const body = await readBody<PresignRequestBody>(event)
  const filename = String(body?.filename ?? '').trim().slice(0, 255)
  const size = Number(body?.size)
  const rawContentType = String(body?.contentType ?? '').slice(0, 255)
  // Accept only RFC-6838-ish `type/subtype(;params)` shape so a malicious
  // client can't stash arbitrary strings (or header-injection attempts)
  // in x-amz-meta-mime. Anything weird falls back to octet-stream.
  const MIME_RE = /^[a-zA-Z][a-zA-Z0-9.+-]*\/[a-zA-Z0-9.+_-]+(;\s*[a-zA-Z0-9-]+=[^\s;]+)*$/
  const contentType = MIME_RE.test(rawContentType) ? rawContentType : 'application/octet-stream'
  const expiresInSec = Number(body?.expiresInSec)
  const maxDownloads = Number(body?.maxDownloads)
  const turnstileToken = String(body?.turnstileToken ?? '')

  if (!filename) {
    throw createError({ statusCode: 400, statusMessage: 'Missing filename' })
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid size' })
  }
  if (size > MAX_FILE_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'File too large (max 1 GB)' })
  }
  if (!ALLOWED_EXPIRES_SEC.has(expiresInSec)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid expires_in' })
  }
  if (size > BIG_FILE_THRESHOLD && !BIG_FILE_EXPIRY_SEC.has(expiresInSec)) {
    throw createError({ statusCode: 400, statusMessage: 'Files over 300 MB must use 30-minute expiry' })
  }
  if (!ALLOWED_MAX_DOWNLOADS.has(maxDownloads)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid max_downloads' })
  }

  const isCN = getRequestHeader(event, 'cf-ipcountry') === 'CN'
  if (!isCN) await assertTurnstile(event, turnstileToken)
  await assertRateLimit(
    event,
    isCN ? 'share-upload-cn' : 'share-upload',
    RL_WINDOW_SEC,
    isCN ? RL_MAX_UPLOADS_CN : RL_MAX_UPLOADS,
    size,
    isCN ? RL_MAX_BYTES_CN : RL_MAX_BYTES,
  )

  const id = generateShareId()
  const now = Date.now()
  const expiresAt = now + expiresInSec * 1000

  // R2's S3 API carries custom metadata as HTTP headers which are strict
  // ASCII. Unicode filenames (e.g. Chinese) must be percent-encoded here and
  // the download handler decodes them on read.
  const encodedFilename = encodeURIComponent(filename)

  const client = new AwsClient({
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
    region: 'auto',
    service: 's3',
  })

  // Pre-set X-Amz-Expires on the URL. aws4fetch only fills in a 24 h default
  // when the param is absent, so setting it here makes sure our 10 min TTL
  // is what R2 enforces.
  const endpointUrl = new URL(`https://${r2AccountId}.r2.cloudflarestorage.com/${r2BucketName}/${id}`)
  endpointUrl.searchParams.set('X-Amz-Expires', String(PRESIGN_TTL_SEC))

  // The exact header set the client must send. Values are baked into the
  // signature — the client cannot alter them without invalidating the URL.
  //
  // Content-Length here is the *critical* field. aws4fetch's `allHeaders:
  // true` forces it into the signature; the browser auto-populates it from
  // the actual body size when the XHR PUT runs. If the two disagree, R2
  // rejects the request with 403 SignatureDoesNotMatch — so the client
  // physically cannot upload a larger body than the presigned size.
  // Without this, the rate-limit byte quota is trivially bypassed.
  const uploadHeaders: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Length': String(size),
    'x-amz-meta-filename': encodedFilename,
    'x-amz-meta-mime': contentType,
    'x-amz-meta-size': String(size),
    'x-amz-meta-expiresat': String(expiresAt),
    'x-amz-meta-maxdownloads': String(maxDownloads),
    'x-amz-meta-downloadsremaining': maxDownloads === 0 ? '0' : String(maxDownloads),
    'x-amz-meta-uploadedat': String(now),
  }

  const signed = await client.sign(endpointUrl.toString(), {
    method: 'PUT',
    headers: uploadHeaders,
    aws: {
      signQuery: true,
      allHeaders: true, // include x-amz-meta-* AND content-length in signature
    },
  })

  return {
    id,
    uploadUrl: signed.url,
    uploadHeaders,
    expiresAt,
    maxDownloads,
  }
})
