<template>
  <div class="min-h-screen">
    <!-- ============ MOBILE TOOLS DIRECTORY ============ -->
    <div class="md:hidden px-5 pt-6 pb-28">
      <h1 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('toolsDir.title') }}</h1>
      <p class="text-on-surface-variant text-sm mt-1 mb-6">{{ $t('toolsDir.subtitle') }}</p>

      <!-- Search -->
      <div class="relative mb-6">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">search</span>
        <input class="w-full pl-11 pr-4 py-3 bg-surface-container-low dark:bg-surface-container rounded-xl text-sm text-on-surface dark:text-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20" :placeholder="$t('toolsDir.searchPlaceholder')" />
      </div>

      <!-- Featured Tool -->
      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient mb-4">
        <span class="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">{{ $t('home.toolATag') }}</span>
        <h2 class="font-headline text-lg font-bold text-on-surface dark:text-surface mt-1">Tool A: {{ $t('home.toolAName') }}</h2>
        <p class="text-on-surface-variant text-xs mt-1 mb-3">{{ $t('home.toolADesc') }}</p>
        <NuxtLink :to="localePath('/tools/text-transfer')" class="text-primary text-sm font-bold flex items-center gap-1">
          {{ $t('common.openTool') }} <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </NuxtLink>
      </div>

      <!-- Tool Cards -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <NuxtLink :to="localePath('/tools/qr-code')" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient active:scale-95 transition-transform">
          <span class="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">{{ $t('home.toolBTag') }}</span>
          <h3 class="font-headline font-bold text-on-surface dark:text-surface mt-1 text-sm">Tool B: {{ $t('home.toolBName') }}</h3>
          <p class="text-on-surface-variant text-[11px] mt-1">{{ $t('toolsDir.mobileQrDesc') }}</p>
        </NuxtLink>
        <NuxtLink :to="localePath('/tools/clipboard')" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient active:scale-95 transition-transform">
          <span class="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">{{ $t('home.toolCTag') }}</span>
          <h3 class="font-headline font-bold text-on-surface dark:text-surface mt-1 text-sm">Tool C: {{ $t('home.toolCName') }}</h3>
          <p class="text-on-surface-variant text-[11px] mt-1">{{ $t('toolsDir.mobileClipDesc') }}</p>
        </NuxtLink>
      </div>

      <!-- Privacy Footer -->
      <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-4 flex items-center gap-3">
        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1">verified_user</span>
        <p class="text-xs text-on-surface-variant leading-relaxed">{{ $t('toolsDir.mobilePrivacy') }}</p>
      </div>
    </div>

    <!-- ============ DESKTOP TOOLS DIRECTORY ============ -->
    <div class="hidden md:block pt-8 pb-12 px-8">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="font-headline text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface">
        {{ $t('toolsDir.title') }}
      </h1>
      <p class="text-on-surface-variant mt-2 max-w-2xl">
        {{ $t('toolsDir.subtitle') }}
      </p>
    </div>

    <!-- Bento Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Featured Large Card - Carousel -->
      <div class="md:col-span-8 bg-surface-container-low dark:bg-surface-container rounded-xl p-8 relative">
        <!-- Nav arrows -->
        <div class="absolute top-6 right-6 flex items-center gap-2">
          <button class="w-8 h-8 rounded-lg bg-surface-container-lowest dark:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" @click="prevFeatured">
            <span class="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button class="w-8 h-8 rounded-lg bg-surface-container-lowest dark:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" @click="nextFeatured">
            <span class="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>

        <!-- Badge -->
        <span class="inline-block px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold tracking-widest uppercase mb-4">
          {{ $t('toolsDir.featuredBadge') }}
        </span>

        <!-- Slide content -->
        <Transition name="featured-slide" mode="out-in">
          <div :key="featuredIndex">
            <h2 class="font-headline text-3xl font-bold text-primary mb-3">{{ featured.title }}</h2>
            <p class="text-on-surface-variant text-sm leading-relaxed mb-6 max-w-lg">{{ featured.desc }}</p>
            <NuxtLink
              :to="localePath(featured.path)"
              class="inline-flex items-center gap-2 px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {{ $t('common.openTool') }}
              <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </NuxtLink>
            <div class="grid grid-cols-3 gap-4 mt-8">
              <div v-for="sub in featured.subs" :key="sub.icon" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 flex flex-col items-center text-center gap-2">
                <span class="material-symbols-outlined text-2xl text-on-surface-variant">{{ sub.icon }}</span>
                <span class="text-xs font-medium text-on-surface-variant">{{ sub.label }}</span>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Dot indicators -->
        <div class="flex items-center gap-2 mt-6">
          <button
            v-for="(_, i) in featuredItems"
            :key="i"
            class="h-1.5 rounded-full transition-all"
            :class="i === featuredIndex ? 'w-6 bg-primary' : 'w-1.5 bg-on-surface-variant/30'"
            @click="featuredIndex = i"
          />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="md:col-span-4 flex flex-col gap-6">
        <!-- How-to Guides -->
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary">menu_book</span>
            <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolsDir.howToGuides') }}</h3>
          </div>
          <div class="flex flex-col gap-3 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
            <NuxtLink
              v-for="guide in guides"
              :key="guide.title"
              :to="localePath(guide.path)"
              class="group cursor-pointer flex-shrink-0"
            >
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span class="text-sm font-medium text-on-surface dark:text-surface group-hover:text-primary transition-colors">{{ guide.title }}</span>
              </div>
              <span class="ml-4 text-xs text-on-surface-variant">{{ guide.time }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Similar Tools -->
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary">compare_arrows</span>
            <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolsDir.similarTools') }}</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-for="alt in alternatives" :key="alt" class="px-3 py-1 bg-surface-container-high dark:bg-surface-container-highest rounded-full text-xs font-medium text-on-surface-variant">
              {{ alt }}
            </span>
          </div>
        </div>
      </div>

      <!-- Category Cards -->
      <NuxtLink
        v-for="cat in categories"
        :key="cat.name"
        :to="localePath(cat.path)"
        class="md:col-span-4 bg-surface-container-low dark:bg-surface-container rounded-xl p-8 hover:bg-surface-container transition-colors cursor-pointer group"
      >
        <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <span class="material-symbols-outlined text-2xl">{{ cat.icon }}</span>
        </div>
        <h3 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-2">{{ cat.name }}</h3>
        <p class="text-on-surface-variant text-sm leading-relaxed mb-4">{{ cat.desc }}</p>
        <span class="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
          {{ $t('common.browseTools') }}
          <span class="material-symbols-outlined text-lg">arrow_right_alt</span>
        </span>
      </NuxtLink>

      <!-- CTA Banner -->
      <div class="md:col-span-12 relative rounded-4xl overflow-hidden primary-gradient p-12 text-center">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div class="relative z-10">
          <h3 class="font-headline text-3xl font-bold text-white mb-4">{{ $t('toolsDir.ctaTitle') }}</h3>
          <p class="text-primary-fixed mb-6 max-w-lg mx-auto">{{ $t('toolsDir.ctaDesc') }}</p>
          <NuxtLink :to="localePath('/tool-request')" class="inline-block px-8 py-3 bg-white text-primary rounded-xl font-bold hover:scale-[1.02] transition-transform">
            {{ $t('toolsDir.ctaBtn') }}
          </NuxtLink>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ layout: 'tool' })
useHead({
  title: 'Free Online Tools - File Transfer, QR Code, Clipboard | ToolPort',
  meta: [
    { name: 'description', content: 'Browse all free online tools: encrypted phone-to-PC file transfer, QR code generator & scanner, real-time online clipboard. Privacy-first, no signup required.' },
    { name: 'keywords', content: 'free online tools,file transfer tool,QR code generator,QR code scanner,online clipboard,browser tools,privacy tools,no install' },
  ],
})
useSeoMeta({
  ogTitle: 'Free Online Tools - File Transfer, QR Code, Clipboard | ToolPort',
  ogDescription: 'Encrypted file transfer, QR code generator & scanner, real-time clipboard — all free, no signup, privacy-first.',
  ogImage: 'https://toolport.dev/og-image.png',
})

const localePath = useLocalePath()

const featuredIndex = ref(0)
const featuredItems = computed(() => [
  {
    title: t('toolsDir.featuredTitle'),
    desc: t('toolsDir.featuredDesc'),
    path: '/tools/text-transfer',
    subs: [
      { icon: 'swap_horiz', label: t('toolsDir.subTransfer') },
      { icon: 'lock', label: t('toolA.e2eeSecure') },
      { icon: 'timer', label: t('toolA.docExpiringTitle') },
    ],
  },
  {
    title: t('toolB.title'),
    desc: t('toolB.subtitle'),
    path: '/tools/qr-code',
    subs: [
      { icon: 'qr_code_2', label: t('toolsDir.subQrCode') },
      { icon: 'photo_camera', label: t('toolB.tabScan') },
      { icon: 'download', label: t('toolB.downloadSvg') },
    ],
  },
  {
    title: t('toolC.title'),
    desc: t('toolC.subtitle'),
    path: '/tools/clipboard',
    subs: [
      { icon: 'content_paste', label: t('toolsDir.subClipboard') },
      { icon: 'timer', label: t('toolA.docExpiringTitle') },
      { icon: 'lock', label: t('toolA.e2eeSecure') },
    ],
  },
])
const featured = computed(() => featuredItems.value[featuredIndex.value])
function prevFeatured() { featuredIndex.value = (featuredIndex.value - 1 + featuredItems.value.length) % featuredItems.value.length }
function nextFeatured() { featuredIndex.value = (featuredIndex.value + 1) % featuredItems.value.length }

const guides = computed(() => [
  { title: t('toolsDir.guideBatch'), time: t('toolsDir.minRead', { n: 3 }), path: '/guides/file-transfer' },
  { title: t('toolsDir.guideApi'), time: t('toolsDir.minRead', { n: 2 }), path: '/guides/qr-code' },
  { title: t('toolsDir.guideMarkdown'), time: t('toolsDir.minRead', { n: 2 }), path: '/guides/clipboard' },
  { title: t('toolsDir.guide4'), time: t('toolsDir.minRead', { n: 4 }), path: '/guides/file-transfer' },
  { title: t('toolsDir.guide5'), time: t('toolsDir.minRead', { n: 2 }), path: '/guides/qr-code' },
  { title: t('toolsDir.guide6'), time: t('toolsDir.minRead', { n: 3 }), path: '/guides/clipboard' },
  { title: t('toolsDir.guide7'), time: t('toolsDir.minRead', { n: 2 }), path: '/guides/file-transfer' },
])

const alternatives = ['AirDrop', 'Snapdrop', 'Pastebin', 'QR Code Monkey']

const categories = computed(() => [
  { name: t('toolsDir.catTransfer'), icon: 'swap_horiz', desc: t('toolsDir.catTransferDesc'), path: '/tools/text-transfer' },
  { name: t('toolsDir.catConvert'), icon: 'qr_code_2', desc: t('toolsDir.catConvertDesc'), path: '/tools/qr-code' },
  { name: t('toolsDir.catFormat'), icon: 'content_paste', desc: t('toolsDir.catFormatDesc'), path: '/tools/clipboard' },
])
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--color-outline-variant)) transparent;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-outline-variant));
  border-radius: 9999px;
}

.featured-slide-enter-active,
.featured-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.featured-slide-enter-from { opacity: 0; transform: translateX(12px); }
.featured-slide-leave-to  { opacity: 0; transform: translateX(-12px); }
</style>
