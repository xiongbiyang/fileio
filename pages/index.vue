<template>
  <div class="bg-surface dark:bg-on-surface">

    <!-- ============ MOBILE LAYOUT ============ -->
    <div class="md:hidden">
      <!-- Mobile Hero -->
      <section class="px-5 pt-20 pb-10">
        <span class="font-label text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">{{ $t('home.badge') }}</span>
        <h1 class="font-headline text-4xl font-extrabold tracking-tighter text-on-surface dark:text-surface leading-[0.95] mt-3">
          {{ $t('home.heroTitle1') }}<br/><span class="text-primary-container dark:text-primary-fixed">{{ $t('home.heroTitle2') }}</span>
        </h1>
        <p class="mt-4 text-base text-on-surface-variant leading-relaxed">{{ $t('home.heroSubtitle') }}</p>
        <NuxtLink :to="localePath('/tools')" class="inline-flex items-center gap-2 mt-6 px-8 py-4 primary-gradient text-on-primary rounded-xl font-bold text-base active:scale-95 transition-transform w-full justify-center">
          {{ $t('common.startNow') }}
          <span class="material-symbols-outlined">arrow_forward</span>
        </NuxtLink>
        <div class="flex items-center gap-6 mt-4">
          <div class="flex items-center gap-1.5 text-on-surface-variant text-xs">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1">check_circle</span>{{ $t('home.noTracking') }}
          </div>
          <div class="flex items-center gap-1.5 text-on-surface-variant text-xs">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1">check_circle</span>{{ $t('home.browserLocal') }}
          </div>
        </div>
      </section>

      <!-- Mobile Trust -->
      <section class="px-5 pb-8">
        <div class="flex overflow-x-auto gap-4 pb-2 -mx-1 px-1 snap-x">
          <div v-for="card in trustCards" :key="card.icon" class="min-w-[260px] snap-start bg-surface-container-low dark:bg-surface-container rounded-2xl p-6 shadow-ambient flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <span class="material-symbols-outlined text-xl">{{ card.icon }}</span>
            </div>
            <h3 class="font-headline text-sm font-bold text-on-surface dark:text-surface mb-1">{{ card.title }}</h3>
            <p class="text-on-surface-variant text-xs leading-relaxed">{{ card.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Mobile Tools Label -->
      <section class="px-5 pb-6">
        <span class="font-label text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">{{ $t('home.sectionLabel') }}</span>
        <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mt-1">{{ $t('home.sectionTitle') }}</h2>
      </section>

      <!-- Mobile Tool Cards -->
      <section class="px-5 pb-24 space-y-4">
        <NuxtLink v-for="tool in tools" :key="tool.id" :to="localePath(tool.path)" class="block bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient active:scale-[0.98] transition-transform">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-2xl">{{ tool.icon }}</span>
            </div>
            <div class="flex-1">
              <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ tool.name }}</h3>
              <span class="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">{{ tool.tag }}</span>
            </div>
            <span class="material-symbols-outlined text-outline-variant">chevron_right</span>
          </div>
          <p class="text-on-surface-variant text-sm leading-relaxed">{{ tool.desc }}</p>
        </NuxtLink>
      </section>
    </div>

    <!-- ============ DESKTOP LAYOUT ============ -->
    <!-- Hero Section -->
    <section class="relative min-h-[716px] hidden md:flex flex-col items-center justify-center px-6 overflow-hidden">
      <!-- Background blur -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />

      <div class="relative z-10 text-center max-w-4xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container mb-8">
          <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">verified_user</span>
          <span class="font-label text-xs font-bold tracking-widest uppercase">{{ $t('home.badge') }}</span>
        </div>

        <!-- Heading -->
        <h1 class="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter text-on-surface dark:text-surface leading-[0.95]">
          {{ $t('home.heroTitle1') }}<br/>
          <span class="text-primary-container dark:text-primary-fixed">{{ $t('home.heroTitle2') }}</span>
        </h1>

        <!-- Subtitle -->
        <p class="mt-8 text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
          {{ $t('home.heroSubtitle') }}
        </p>

        <!-- CTA -->
        <NuxtLink
          :to="localePath('/tools')"
          class="inline-flex items-center gap-2 mt-10 px-10 py-4 primary-gradient text-on-primary rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          {{ $t('common.startNow') }}
          <span class="material-symbols-outlined">arrow_forward</span>
        </NuxtLink>

        <!-- Info badges -->
        <div class="flex items-center justify-center gap-8 mt-8">
          <div class="flex items-center gap-2 text-on-surface-variant text-sm">
            <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">check_circle</span>
            {{ $t('home.noTracking') }}
          </div>
          <div class="flex items-center gap-2 text-on-surface-variant text-sm">
            <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">check_circle</span>
            {{ $t('home.browserLocal') }}
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Signals / Bento Section -->
    <section class="hidden md:block px-8 pb-24">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="card in trustCards"
          :key="card.icon"
          class="bg-surface-container-low dark:bg-surface-container rounded-4xl p-10 flex flex-col justify-between shadow-ambient group"
        >
          <div>
            <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl">{{ card.icon }}</span>
            </div>
            <h3 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-3">{{ card.title }}</h3>
            <p class="text-on-surface-variant text-sm leading-relaxed">{{ card.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tool Directory Gallery -->
    <section class="hidden md:block bg-surface-container-lowest dark:bg-surface-container-low py-32 px-8">
      <div class="max-w-6xl mx-auto">
        <div class="mb-12">
          <span class="font-label text-xs font-bold tracking-widest uppercase text-on-surface-variant">{{ $t('home.sectionLabel') }}</span>
          <h2 class="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface mt-3">
            {{ $t('home.sectionTitle') }}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="tool in tools"
            :key="tool.id"
            :to="localePath(tool.path)"
            class="bg-surface-container-low dark:bg-surface-container rounded-4xl p-8 flex flex-col gap-6 group hover:shadow-lg transition-all"
          >
            <div class="flex items-start justify-between">
              <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-3xl">{{ tool.icon }}</span>
              </div>
              <span class="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">{{ tool.tag }}</span>
            </div>
            <div>
              <h3 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-2">{{ tool.name }}</h3>
              <p class="text-on-surface-variant text-sm leading-relaxed">{{ tool.desc }}</p>
            </div>
            <button class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform">
              {{ $t('common.openTool') }}
              <span class="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Trust Badge Section -->
    <section class="hidden md:block py-24 px-8 bg-surface dark:bg-on-surface">
      <div class="max-w-4xl mx-auto bg-surface-container-high dark:bg-surface-container rounded-5xl p-12 shadow-ambient">
        <h2 class="font-headline text-2xl font-bold text-center text-on-surface dark:text-surface mb-10">
          {{ $t('home.trustBadgeTitle') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="badge in trustBadges" :key="badge.icon" class="flex flex-col items-center text-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-2xl">{{ badge.icon }}</span>
            </div>
            <span class="text-sm font-bold text-on-surface dark:text-surface">{{ badge.label }}</span>
            <span class="text-xs text-on-surface-variant leading-relaxed">{{ badge.desc }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: 'ToolPort - Free Online Tools | File Transfer, QR Code, Clipboard',
  meta: [
    { name: 'description', content: 'Free privacy-first online tools: encrypted file transfer between phone and PC, QR code generator & scanner, real-time online clipboard. No signup, no install, all data processed locally.' },
    { name: 'keywords', content: 'online tools,file transfer,QR code generator,online clipboard,free tools,privacy tools,encrypted transfer,WebRTC,P2P' },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ToolPort',
  url: 'https://toolport.dev',
  description: 'Free, privacy-first browser tools for file transfer, QR codes, and clipboard sharing.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
})

const trustCards = computed(() => [
  { icon: 'encrypted', title: t('home.trustEncTitle'), desc: t('home.trustEncDesc') },
  { icon: 'memory', title: t('home.trustLocalTitle'), desc: t('home.trustLocalDesc') },
  { icon: 'auto_delete', title: t('home.trustAutoTitle'), desc: t('home.trustAutoDesc') },
])

const tools = computed(() => [
  { id: 'text-transfer', name: t('home.toolAName'), desc: t('home.toolADesc'), icon: 'devices', tag: t('home.toolATag'), path: '/tools/text-transfer' },
  { id: 'qr-code', name: t('home.toolBName'), desc: t('home.toolBDesc'), icon: 'qr_code_2', tag: t('home.toolBTag'), path: '/tools/qr-code' },
  { id: 'clipboard', name: t('home.toolCName'), desc: t('home.toolCDesc'), icon: 'content_paste', tag: t('home.toolCTag'), path: '/tools/clipboard' },
])

const trustBadges = computed(() => [
  { icon: 'shield_with_heart', label: t('home.zeroKnowledge'), desc: t('home.zeroKnowledgeDesc') },
  { icon: 'no_accounts', label: t('home.noAccount'), desc: t('home.noAccountDesc') },
  { icon: 'lock', label: t('home.openArch'), desc: t('home.openArchDesc') },
])
</script>
