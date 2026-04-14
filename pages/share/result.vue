<template>
  <AdRailWrapper page-key="share-result">
    <NuxtLink :to="localePath('/share')" class="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
      <span class="material-symbols-outlined text-base">arrow_back</span>
      {{ $t('nav.share') }}
    </NuxtLink>

    <!-- No query / invalid state -->
    <div v-if="!shareId" class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-8 text-center">
      <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">info</span>
      <p class="text-on-surface-variant mb-6">{{ $t('share.result.noData') }}</p>
      <NuxtLink :to="localePath('/share')" class="inline-block px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
        {{ $t('share.result.backToUpload') }}
      </NuxtLink>
    </div>

    <!-- Result view -->
    <template v-else>
      <header class="mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 text-primary-container text-xs font-bold uppercase tracking-wider mb-4">
          <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">check_circle</span>
          {{ $t('share.resultTitle') }}
        </div>
        <h1 class="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">
          {{ $t('share.result.heading') }}
        </h1>
        <p class="text-on-surface-variant text-sm md:text-base leading-relaxed mt-3 max-w-2xl">
          {{ $t('share.resultSubtitle') }}
        </p>
      </header>

      <section class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-6 md:p-8 shadow-ambient mb-6">
        <div class="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 items-start">
          <!-- QR -->
          <div class="flex justify-center md:justify-start">
            <div class="p-3 bg-surface-container-low dark:bg-surface-container rounded-xl">
              <canvas ref="qrCanvas" class="w-44 h-44 md:w-52 md:h-52" />
            </div>
          </div>

          <!-- Link + meta -->
          <div class="space-y-5 min-w-0">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('share.linkLabel') }}</p>
              <div class="flex items-center gap-2">
                <code class="flex-1 min-w-0 truncate bg-surface-container-high dark:bg-surface-container rounded-lg px-3 py-2 text-sm text-primary font-mono">
                  {{ shareUrl }}
                </code>
                <button
                  class="primary-gradient text-on-primary rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  @click="copyLink"
                >
                  <span class="material-symbols-outlined text-base">{{ copiedFlash ? 'check' : 'content_copy' }}</span>
                  {{ copiedFlash ? $t('share.copied') : $t('share.copyLink') }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{{ $t('share.expiresLabel') }}</p>
                <p class="font-medium text-on-surface dark:text-surface">{{ expiresText }}</p>
              </div>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">{{ $t('share.downloadsLabel') }}</p>
                <p class="font-medium text-on-surface dark:text-surface">
                  {{ maxDownloads === 0 ? $t('share.downloadsUnlimited') : $t('share.downloadsOnce') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Action -->
      <div class="flex flex-col sm:flex-row gap-3">
        <NuxtLink
          :to="localePath('/share')"
          class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container-highest text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          {{ $t('share.shareAnother') }}
        </NuxtLink>
      </div>

      <AdSlot slot="share-result-bottom" container-class="mt-10" :min-height="120" />
    </template>
  </AdRailWrapper>
</template>

<script setup lang="ts">
import { renderQrCodeToCanvas } from '~/utils/qrcode'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { notify } = useNotifier()

useHead({
  title: 'Share ready',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://fileio.top')

const shareId = computed(() => {
  const raw = String(route.query.id || '').trim()
  return /^[a-zA-Z0-9]{10}$/.test(raw) ? raw : ''
})
const expiresAt = computed(() => Number.parseInt(String(route.query.exp || '0'), 10) || 0)
const maxDownloads = computed(() => Number.parseInt(String(route.query.max || '1'), 10) || 1)

const shareUrl = computed(() =>
  shareId.value
    ? new URL(localePath(`/share/${shareId.value}`), siteBaseUrl.value).toString()
    : '',
)

const expiresText = computed(() => {
  if (!expiresAt.value) return '—'
  return new Date(expiresAt.value).toLocaleString()
})

const qrCanvas = ref<HTMLCanvasElement | null>(null)
const copiedFlash = ref(false)

async function copyLink() {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copiedFlash.value = true
    setTimeout(() => { copiedFlash.value = false }, 1500)
  }
  catch {
    notify(t('common.copyFailed'), 'error')
  }
}

onMounted(async () => {
  if (!shareUrl.value) return
  await nextTick()
  if (qrCanvas.value) {
    await renderQrCodeToCanvas(qrCanvas.value, shareUrl.value, { width: 220, margin: 2 })
  }
})
</script>
