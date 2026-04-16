<template>
  <AdRailWrapper page-key="share-upload">
    <!-- Header -->
    <header class="mb-8 md:mb-12">
      <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary-container text-xs font-bold uppercase tracking-wider">
        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">cloud_upload</span>
        {{ $t('nav.share') }}
      </span>
      <h1 class="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface mt-4">
        {{ $t('share.title') }}
      </h1>
      <p class="text-on-surface-variant text-sm md:text-base leading-relaxed mt-3 max-w-2xl">
        {{ $t('share.subtitle') }}
      </p>
    </header>

    <!-- Upload view -->
    <section class="space-y-6">
      <!-- Dropzone -->
      <div
        class="relative rounded-2xl border-2 border-dashed transition-colors p-8 md:p-12 text-center cursor-pointer"
        :class="isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-outline/30 bg-surface-container-low dark:bg-surface-container hover:border-primary/50'"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <input ref="fileInput" type="file" hidden @change="handleFileChange" >
        <template v-if="!selectedFile">
          <span class="material-symbols-outlined text-5xl md:text-6xl text-on-surface-variant mb-3">upload_file</span>
          <p class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('share.dropzoneTitle') }}</p>
          <p class="text-sm text-on-surface-variant mt-1">{{ $t('share.dropzoneOr') }}</p>
          <p class="text-xs text-on-surface-variant mt-3">{{ $t('share.dropzoneLimit') }}</p>
        </template>
        <template v-else>
          <div class="flex items-center gap-4 text-left max-w-md mx-auto">
            <span class="material-symbols-outlined text-3xl text-primary flex-shrink-0">description</span>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-on-surface dark:text-surface truncate">{{ selectedFile.name }}</p>
              <p class="text-xs text-on-surface-variant">{{ formatBytes(selectedFile.size) }}</p>
            </div>
            <button class="p-2 rounded-lg hover:bg-surface-container transition-colors" @click.stop="clearSelectedFile">
              <span class="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
          <p class="text-xs text-on-surface-variant mt-4">{{ $t('share.dropzoneReplace') }}</p>
        </template>
      </div>

      <!-- Options -->
      <div class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-6 space-y-5">
        <h2 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('share.optionsTitle') }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">{{ $t('share.labelExpiresIn') }}</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="opt in expiryOptions"
                :key="opt.value"
                type="button"
                :disabled="opt.disabled"
                class="px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors"
                :class="[
                  expiresIn === opt.value && !opt.disabled
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest dark:bg-surface-container-high text-on-surface-variant hover:text-on-surface',
                  opt.disabled ? 'opacity-40 cursor-not-allowed hover:text-on-surface-variant' : '',
                ]"
                @click="!opt.disabled && (expiresIn = opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
            <p
              v-if="isBigFile"
              class="text-xs text-on-surface-variant mt-2"
            >
              {{ $t('share.bigFileExpiryHint') }}
            </p>
          </div>

          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">{{ $t('share.labelMaxDownloads') }}</label>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="opt in downloadOptions"
                :key="opt.value"
                type="button"
                class="px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left"
                :class="maxDownloads === opt.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest dark:bg-surface-container-high text-on-surface-variant hover:text-on-surface'"
                @click="maxDownloads = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Turnstile widget (hidden entirely for CN visitors — widget host is GFW-throttled) -->
      <div v-if="!isCN" class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-6">
        <p class="text-xs text-on-surface-variant mb-3">
          {{ turnstileSiteKey ? $t('share.captchaHint') : $t('share.captchaDisabled') }}
        </p>
        <div v-if="turnstileSiteKey" ref="turnstileContainer" class="min-h-[65px]" />
      </div>

      <!-- Submit -->
      <button
        class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        :disabled="!canSubmit || isUploading"
        @click="handleUpload"
      >
        <span class="material-symbols-outlined">cloud_upload</span>
        {{ isUploading ? $t('share.uploading', { percent: uploadProgress }) : $t('share.uploadBtn') }}
      </button>

      <!-- ToS notice -->
      <p class="text-xs text-on-surface-variant text-center leading-relaxed">
        <i18n-t keypath="share.tosNotice" tag="span">
          <template #termsLink>
            <NuxtLink :to="localePath('/terms')" class="text-primary font-medium hover:underline">
              {{ $t('share.tosLink') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </p>
    </section>

    <AdSlot slot-key="share-upload-bottom" container-class="mt-10" :min-height="120" />
  </AdRailWrapper>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

const turnstileLang = computed(() => {
  const l = locale.value.toLowerCase()
  if (l === 'zh-cn') return 'zh-cn'
  if (l === 'zh-tw') return 'zh-tw'
  return 'en'
})
const runtimeConfig = useRuntimeConfig()
const { notify } = useNotifier()

const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://fileio.top')
const rawTurnstileSiteKey = computed(() => String(runtimeConfig.public.turnstileSiteKey || ''))

// CN visitors can't reliably reach challenges.cloudflare.com — read the
// edge's CF-IPCountry during SSR and skip Turnstile for them. The server
// enforces the same bypass + tighter rate limit in upload.post.ts.
const isCN = useState('isCN', () => {
  if (import.meta.server) {
    const headers = useRequestHeaders(['cf-ipcountry'])
    return headers['cf-ipcountry'] === 'CN'
  }
  return false
})
const turnstileSiteKey = computed(() => (isCN.value ? '' : rawTurnstileSiteKey.value))

const canonicalUrl = computed(() =>
  new URL(localePath('/share'), siteBaseUrl.value).toString(),
)

useHead(() => ({
  title: t('seo.share.title'),
  meta: [
    { name: 'description', content: t('seo.share.desc') },
    { name: 'keywords', content: t('seo.share.keywords') },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  script: turnstileSiteKey.value
    ? [{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true }]
    : [],
}))
useSeoMeta({
  ogTitle: () => t('seo.share.ogTitle'),
  ogDescription: () => t('seo.share.ogDesc'),
  ogImage: `${siteBaseUrl.value}/og-image.png`,
  ogUrl: () => canonicalUrl.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.share.ogTitle'),
  twitterDescription: () => t('seo.share.ogDesc'),
  robots: 'index, follow',
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FileIO Quick Share',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  description: 'Temporary file sharing with a link and QR code. Upload a file, get a self-destructing download link that expires after first download or within 3 days. Up to 1 GB per file (files over 300 MB expire in 30 minutes), no signup, Turnstile-protected.',
  featureList: [
    'No app install required',
    'No signup or account needed',
    'Self-destructing download links (single-use by default)',
    'Flexible expiry: 1 hour, 24 hours, or 3 days',
    'QR code generated with every share',
    'Cloudflare Turnstile human verification',
    'Hosted on Cloudflare R2 with 3-day bucket lifecycle safety net',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  isAccessibleForFree: true,
  url: `${siteBaseUrl.value}/share`,
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does FileIO Quick Share differ from file.io or WeTransfer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Quick Share generates both a download link and a QR code in the same result page, and lets you pick expiry (1 hour, 24 hours, 3 days) on the free tier. file.io requires a paid plan for expiry choices; WeTransfer uses a fixed 7-day window and requires an email.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long are my files stored?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Only until first download (if you picked single-use) or your selected expiry time, whichever comes first. A 72-hour bucket-wide lifecycle rule on Cloudflare R2 deletes anything older regardless, as a safety net.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is signup required?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Uploads are anonymous. Human verification uses Cloudflare Turnstile only to prevent abuse; no account is created.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the maximum file size?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Up to 1 GB per file. Files over 300 MB can only be kept for 30 minutes. If both devices are online at the same time and the file is under 300 MB, the peer-to-peer tool at /transfer is even faster.',
      },
    },
  ],
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to share a file with a temporary download link',
  description: 'Upload a file to FileIO Quick Share and send the resulting link or QR code.',
  totalTime: 'PT1M',
  step: [
    { '@type': 'HowToStep', name: 'Open Quick Share', text: 'Open FileIO Quick Share in your browser.', url: `${siteBaseUrl.value}/share` },
    { '@type': 'HowToStep', name: 'Upload the file', text: 'Drop a file on the page or click to select. Pick expiry and download policy.' },
    { '@type': 'HowToStep', name: 'Verify', text: 'Complete the Cloudflare Turnstile human verification.' },
    { '@type': 'HowToStep', name: 'Share the link or QR code', text: 'Copy the generated download link or show the QR code to the recipient.' },
  ],
})

// ── state ────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const expiresIn = ref(86400) // 24h default
const maxDownloads = ref(1) // single-use default
const isUploading = ref(false)
const uploadProgress = ref(0)
const turnstileContainer = ref<HTMLElement | null>(null)
const turnstileWidgetId = ref<string | null>(null)

const MAX_BYTES = 1 * 1024 * 1024 * 1024 // 1 GB — matches server presign cap
const BIG_FILE_THRESHOLD = 300 * 1024 * 1024 // 300 MB — only 30 min expiry allowed above this

// Expiry options. When a big file is selected only the 30 min option remains
// selectable — others are displayed but disabled so the user sees the full
// menu and understands why the long options were removed.
const expiryOptions = computed(() => {
  const file = selectedFile.value
  const restricted = !!file && file.size > BIG_FILE_THRESHOLD
  return [
    { value: 1800, label: t('share.expires30m'), disabled: false },
    { value: 3600, label: t('share.expires1h'), disabled: restricted },
    { value: 86400, label: t('share.expires1d'), disabled: restricted },
    { value: 259200, label: t('share.expires3d'), disabled: restricted },
  ]
})
const downloadOptions = computed(() => [
  { value: 1, label: t('share.downloadsOnce') },
  { value: 0, label: t('share.downloadsUnlimited') },
])

const canSubmit = computed(() => !!selectedFile.value && selectedFile.value.size <= MAX_BYTES)
const isBigFile = computed(() => !!selectedFile.value && selectedFile.value.size > BIG_FILE_THRESHOLD)

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  setSelectedFile(file)
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0] ?? null
  setSelectedFile(file)
}

function setSelectedFile(file: File | null) {
  if (!file) return
  if (file.size > MAX_BYTES) {
    notify(t('share.errFileTooLarge'), 'error')
    return
  }
  selectedFile.value = file
  // Big files are forced to 30 min expiry to keep R2 storage bounded —
  // auto-pick that option so the user doesn't have to hunt for a non-
  // greyed button.
  if (file.size > BIG_FILE_THRESHOLD) {
    expiresIn.value = 1800
  }
}

function clearSelectedFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// ── Turnstile integration ────────────────────────────────
interface TurnstileGlobal {
  render: (el: HTMLElement, opts: { sitekey: string; theme?: string; language?: string }) => string
  reset: (id: string) => void
  getResponse: (id: string) => string | undefined
}
declare global {
  interface Window { turnstile?: TurnstileGlobal }
}

function mountTurnstile() {
  if (!turnstileSiteKey.value || !turnstileContainer.value) return
  const tries = 20
  let attempts = 0
  const timer = setInterval(() => {
    attempts++
    if (window.turnstile && turnstileContainer.value && !turnstileWidgetId.value) {
      turnstileWidgetId.value = window.turnstile.render(turnstileContainer.value, {
        sitekey: turnstileSiteKey.value,
        language: turnstileLang.value,
      })
      clearInterval(timer)
    }
    else if (attempts >= tries) {
      clearInterval(timer)
    }
  }, 250)
}

function resetTurnstile() {
  if (window.turnstile && turnstileWidgetId.value) {
    window.turnstile.reset(turnstileWidgetId.value)
  }
}

function getTurnstileToken(): string {
  if (!turnstileSiteKey.value) return ''
  if (window.turnstile && turnstileWidgetId.value) {
    return window.turnstile.getResponse(turnstileWidgetId.value) || ''
  }
  return ''
}

onMounted(() => {
  if (turnstileSiteKey.value) mountTurnstile()
})

// ── upload ───────────────────────────────────────────────
interface PresignResponse {
  id: string
  uploadUrl: string
  uploadHeaders: Record<string, string>
  expiresAt: number
  maxDownloads: number
}

async function handleUpload() {
  if (!selectedFile.value) {
    notify(t('share.errFileRequired'), 'error')
    return
  }
  if (selectedFile.value.size > MAX_BYTES) {
    notify(t('share.errFileTooLarge'), 'error')
    return
  }
  const token = getTurnstileToken()
  if (turnstileSiteKey.value && !token) {
    notify(t('share.errCaptcha'), 'error')
    return
  }

  const file = selectedFile.value
  isUploading.value = true
  uploadProgress.value = 0

  // Phase 1: ask the Worker to validate + mint a presigned R2 PUT URL.
  let presigned: PresignResponse
  try {
    presigned = await $fetch<PresignResponse>('/api/share/presign', {
      method: 'POST',
      body: {
        filename: file.name,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
        expiresInSec: expiresIn.value,
        maxDownloads: maxDownloads.value,
        turnstileToken: token,
      },
    })
  }
  catch (err) {
    const status = (err as { statusCode?: number; status?: number }).statusCode ?? (err as { status?: number }).status ?? 0
    if (status === 403) notify(t('share.errCaptcha'), 'error')
    else if (status === 413) notify(t('share.errFileTooLarge'), 'error')
    else if (status === 429) notify(t('share.errRateLimit'), 'error')
    else if (status === 400) notify(t('share.errBigFileExpiry'), 'error')
    else notify(t('share.errUpload'), 'error')
    isUploading.value = false
    resetTurnstile()
    return
  }

  // Phase 2: stream the file bytes directly to R2 with the presigned URL.
  // Use XHR (not fetch) so we can surface upload progress to the user.
  const xhr = new XMLHttpRequest()
  xhr.open('PUT', presigned.uploadUrl)
  // Replay every header that was signed — R2 rejects the request if any of
  // them are missing or mismatched. Omit any header whose value might be
  // auto-filled by the browser and would collide (not an issue for our set).
  for (const [name, value] of Object.entries(presigned.uploadHeaders)) {
    try {
      xhr.setRequestHeader(name, value)
    }
    catch {
      // Some browsers forbid setting certain headers (e.g. Content-Length),
      // and will throw. Silently ignore — the browser will set them itself
      // and R2's signature validation uses the same value we signed.
    }
  }
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      uploadProgress.value = Math.round((e.loaded / e.total) * 100)
    }
  }
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      // Carry all state on the URL fragment rather than the query string
      // so the share id never lands in Referer headers, browser history's
      // searchable text, or edge / analytics request logs.
      const hashParams = new URLSearchParams({
        id: presigned.id,
        exp: String(presigned.expiresAt),
        max: String(presigned.maxDownloads),
        name: file.name,
        size: String(file.size),
      })
      const target = `${localePath('/share/result')}#${hashParams.toString()}`
      window.location.assign(target)
      return
    }
    console.error('[share] R2 PUT failed', xhr.status, xhr.responseText)
    notify(t('share.errUpload'), 'error')
    isUploading.value = false
    resetTurnstile()
  }
  xhr.onerror = () => {
    isUploading.value = false
    notify(t('share.errUpload'), 'error')
    resetTurnstile()
  }
  xhr.send(file)
}
</script>
