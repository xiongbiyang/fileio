import type { H3Event } from 'h3'
import { createError } from 'h3'

/**
 * Cloudflare R2 bucket binding type — minimal surface we use.
 * Runtime is provided by Cloudflare Pages / Wrangler when `[[r2_buckets]]`
 * is configured in `wrangler.toml`.
 */
export interface R2Bucket {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | string | Blob,
    options?: {
      httpMetadata?: { contentType?: string; contentDisposition?: string }
      customMetadata?: Record<string, string>
    },
  ) => Promise<unknown>
  get: (key: string) => Promise<R2Object | null>
  head: (key: string) => Promise<R2ObjectInfo | null>
  delete: (key: string) => Promise<void>
}

export interface R2ObjectInfo {
  key: string
  size: number
  httpMetadata?: { contentType?: string; contentDisposition?: string }
  customMetadata?: Record<string, string>
}

export interface R2Object extends R2ObjectInfo {
  body: ReadableStream
  arrayBuffer: () => Promise<ArrayBuffer>
}

/**
 * Resolve the SHARE_BUCKET binding from the Cloudflare environment.
 * Throws 503 when the bucket is not configured (e.g. local dev without wrangler).
 */
export function getShareBucket(event: H3Event): R2Bucket {
  const env = (event.context.cloudflare?.env ?? {}) as { SHARE_BUCKET?: R2Bucket }
  if (!env.SHARE_BUCKET) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Share storage is not configured. SHARE_BUCKET binding missing.',
    })
  }
  return env.SHARE_BUCKET
}
