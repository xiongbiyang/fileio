<template>
  <AdRailWrapper page-key="share-download" inner-class="max-w-xl mx-auto">
    <NuxtLink :to="localePath('/share')" class="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
      <span class="material-symbols-outlined text-base">arrow_back</span>
      {{ $t('share.title') }}
    </NuxtLink>

    <h1 class="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface mb-8">
      {{ $t('share.download.heading') }}
    </h1>

    <!-- Loading -->
    <div v-if="loadState === 'loading'" class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-8 text-center">
      <span class="material-symbols-outlined text-3xl text-on-surface-variant animate-pulse mb-3 block">hourglass_top</span>
      <p class="text-sm text-on-surface-variant">{{ $t('share.download.loading') }}</p>
    </div>

    <!-- Error states -->
    <div v-else-if="loadState === 'error'" class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-8 text-center">
      <span class="material-symbols-outlined text-4xl text-error mb-3 block">error_outline</span>
      <p class="font-headline font-bold text-on-surface dark:text-surface mb-2">{{ errorMessage }}</p>
      <NuxtLink :to="localePath('/')" class="inline-block mt-4 px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
        {{ $t('share.download.backHome') }}
      </NuxtLink>
    </div>

    <!-- Ready -->
    <div v-else-if="loadState === 'ready' && meta" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-6 md:p-10 shadow-ambient">
      <div class="flex items-start gap-4 mb-6">
        <div class="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-primary text-3xl">{{ fileIcon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="font-headline font-bold text-on-surface dark:text-surface break-all">{{ meta.filename }}</h2>
          <p class="text-sm text-on-surface-variant mt-1">{{ formatBytes(meta.size) }}</p>
        </div>
      </div>

      <!-- Consumed state: shown after the user triggers a single-use download -->
      <div v-if="hasDownloaded && meta.maxDownloads === 1" class="rounded-xl bg-primary-container/20 text-on-surface dark:text-surface p-5 flex items-start gap-3">
        <span class="material-symbols-outlined text-primary mt-0.5" style="font-variation-settings: 'FILL' 1">check_circle</span>
        <div class="flex-1">
          <p class="font-headline font-bold">{{ $t('share.download.downloadedHeading') }}</p>
          <p class="text-sm text-on-surface-variant mt-1">{{ $t('share.download.downloadedBody') }}</p>
        </div>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 gap-3 mb-6 text-sm">
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-base">schedule</span>
            <span>{{ expiresLabel }}</span>
          </div>
          <div class="flex items-center gap-2 text-on-surface-variant">
            <span class="material-symbols-outlined text-base">{{ meta.maxDownloads === 1 ? 'local_fire_department' : 'all_inclusive' }}</span>
            <span>{{ meta.maxDownloads === 1 ? $t('share.download.singleUse') : $t('share.download.unlimited') }}</span>
          </div>
        </div>

        <button
          class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          :disabled="isDownloading"
          @click="triggerDownload"
        >
          <span class="material-symbols-outlined">download</span>
          {{ isDownloading ? $t('share.download.downloading') : $t('share.download.downloadBtn') }}
        </button>

        <p v-if="meta.maxDownloads === 1" class="text-xs text-on-surface-variant text-center mt-4">
          {{ $t('share.download.afterDownload') }}
        </p>
      </template>
    </div>

    <AdSlot v-if="loadState !== 'loading'" slot-key="share-download-bottom" container-class="mt-8" :min-height="120" />
  </AdRailWrapper>
</template>

<script setup lang="ts">
interface ShareMeta {
  id: string
  filename: string
  mime: string
  size: number
  expiresAt: number
  maxDownloads: number
  downloadsRemaining: number
}

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const id = computed(() => String(route.params.id))
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://fileio.top')

useSeoMeta({
  title: () => `${t('share.download.heading')} · ${t('share.title')}`,
  description: () => t('share.download.afterDownload'),
  robots: 'noindex, nofollow',
  ogTitle: () => t('share.download.heading'),
  ogDescription: () => t('share.download.afterDownload'),
  ogImage: `${siteBaseUrl.value}/og-image.png`,
  twitterCard: 'summary_large_image',
})

const loadState = ref<'loading' | 'ready' | 'error'>('loading')
const meta = ref<ShareMeta | null>(null)
const errorMessage = ref('')
const isDownloading = ref(false)
const hasDownloaded = ref(false)
const now = ref(Date.now())

let clockTimer: ReturnType<typeof setInterval> | null = null

const expiresLabel = computed(() => {
  if (!meta.value) return ''
  const remaining = meta.value.expiresAt - now.value
  if (remaining <= 0) return t('share.download.expiresNow')
  return t('share.download.expiresIn', { time: humanizeDuration(remaining) })
})

const fileIcon = computed(() => {
  if (!meta.value) return 'description'
  const mime = meta.value.mime
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'movie'
  if (mime.startsWith('audio/')) return 'music_note'
  if (mime.includes('pdf')) return 'picture_as_pdf'
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('7z')) return 'folder_zip'
  return 'description'
})

function humanizeDuration(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  const d = Math.floor(hr / 24)
  return `${d}d`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function loadMeta() {
  try {
    const data = await $fetch<ShareMeta>(`/api/share/${id.value}/meta`)
    meta.value = data
    loadState.value = 'ready'
  }
  catch (err) {
    const status = (err as { statusCode?: number; data?: { statusCode?: number } })?.statusCode
      ?? (err as { data?: { statusCode?: number } })?.data?.statusCode
    if (status === 404) errorMessage.value = t('share.download.errNotFound')
    else if (status === 410) {
      const msg = String((err as { statusMessage?: string })?.statusMessage ?? '').toLowerCase()
      errorMessage.value = msg.includes('consumed')
        ? t('share.download.errConsumed')
        : t('share.download.errExpired')
    }
    else errorMessage.value = t('share.download.errGeneric')
    loadState.value = 'error'
  }
}

function triggerDownload() {
  if (!meta.value || isDownloading.value || hasDownloaded.value) return
  isDownloading.value = true
  // Navigate to the streaming endpoint; the browser handles Content-Disposition
  // as a native file save. After a short delay we lock the UI: for single-use
  // the share is deleted server-side once the response streams, so any retry
  // would 404 — show the "consumed" card instead.
  const link = document.createElement('a')
  link.href = `/api/share/${id.value}/download`
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => {
    isDownloading.value = false
    if (meta.value?.maxDownloads === 1) hasDownloaded.value = true
  }, 1500)
}

onMounted(() => {
  loadMeta()
  clockTimer = setInterval(() => { now.value = Date.now() }, 1000)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>
