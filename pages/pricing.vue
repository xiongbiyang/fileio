<template>
  <div class="max-w-5xl mx-auto px-8 py-24">
    <!-- Header -->
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold tracking-widest uppercase mb-4">
        {{ $t('pricing.badge') }}
      </div>
      <h1 class="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface dark:text-surface">
        {{ $t('pricing.title') }}
      </h1>
      <p class="text-on-surface-variant mt-4 text-lg">{{ $t('pricing.subtitle') }}</p>
    </div>

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
      <!-- Free -->
      <div class="bg-surface-container-low dark:bg-surface-container p-10 rounded-xl">
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{{ $t('pricing.freeLabel') }}</span>
        <div class="mt-4 mb-6">
          <span class="text-4xl font-extrabold text-on-surface dark:text-surface font-headline">{{ $t('pricing.freePrice') }}</span>
          <span class="text-on-surface-variant text-sm">{{ $t('pricing.perMonth') }}</span>
        </div>
        <p class="text-on-surface-variant text-sm mb-8">{{ $t('pricing.freeDesc') }}</p>

        <ul class="space-y-4 mb-10">
          <li v-for="f in freeFeatures" :key="f" class="flex items-center gap-3 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
            {{ f }}
          </li>
        </ul>

        <NuxtLink
          :to="localePath('/tools')"
          class="block w-full py-4 bg-surface-container-high dark:bg-surface-container-highest text-on-surface dark:text-surface rounded-xl font-bold text-sm text-center hover:bg-surface-container transition-colors"
        >
          {{ $t('common.getStartedFree') }}
        </NuxtLink>
      </div>

      <!-- Pro -->
      <div class="primary-gradient p-10 rounded-xl text-on-primary relative md:-translate-y-4 shadow-ambient">
        <span class="absolute top-4 right-4 px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold tracking-widest uppercase rounded-full">
          {{ $t('pricing.recommended') }}
        </span>
        <span class="text-xs font-bold uppercase tracking-widest text-on-primary/80 font-label">{{ $t('pricing.proLabel') }}</span>
        <div class="mt-4 mb-6">
          <span class="text-4xl font-extrabold font-headline">{{ $t('pricing.proPrice') }}</span>
          <span class="text-on-primary/80 text-sm">{{ $t('pricing.perMonth') }}</span>
        </div>
        <p class="text-on-primary/80 text-sm mb-8">{{ $t('pricing.proDesc') }}</p>

        <ul class="space-y-4 mb-10">
          <li v-for="f in proFeatures" :key="f" class="flex items-center gap-3 text-sm text-on-primary/90">
            <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">check_circle</span>
            {{ f }}
          </li>
        </ul>

        <NuxtLink :to="localePath('/pro-waitlist')" class="block w-full py-4 bg-primary-fixed text-on-primary-fixed-variant rounded-xl font-bold text-sm text-center hover:scale-[1.01] active:scale-[0.98] transition-transform">
          {{ $t('common.joinProWaitlist') }}
        </NuxtLink>
      </div>
    </div>

    <!-- FAQ -->
    <div>
      <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface mb-8 text-center">
        {{ $t('pricing.faqTitle') }}
      </h2>
      <div class="max-w-3xl mx-auto space-y-4">
        <details v-for="faq in faqs" :key="faq.q" class="group bg-surface-container-low dark:bg-surface-container rounded-xl overflow-hidden">
          <summary class="list-none p-6 flex justify-between items-center cursor-pointer hover:bg-surface-container/50 transition-colors">
            <span class="font-medium text-on-surface dark:text-surface">{{ faq.q }}</span>
            <span class="material-symbols-outlined text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div class="px-6 pb-6 text-on-surface-variant text-sm leading-relaxed">{{ faq.a }}</div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({
  title: 'Pricing - Free & Pro Plans | ToolPort',
  meta: [
    { name: 'description', content: 'ToolPort is free forever. Pro unlocks 1GB transfers, 30-day history, permanent rooms, and priority support starting at $29.9/month.' },
    { name: 'keywords', content: 'ToolPort pricing,free online tools,pro plan,file transfer pro,QR code pro,clipboard pro' },
  ],
})
useSeoMeta({
  ogTitle: 'Pricing - Free & Pro Plans | ToolPort',
  ogDescription: 'ToolPort is free forever. Pro unlocks 1GB transfers, 30-day history, permanent rooms, and priority support.',
  ogImage: 'https://toolport.dev/og-image.png',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'ToolPort Pro',
  description: 'Professional plan with 1GB transfers, 30-day history, custom room IDs, and priority support.',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro', price: '29.9', priceCurrency: 'CNY', billingPeriod: 'P1M' },
  ],
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: t('pricing.faq1Q'), acceptedAnswer: { '@type': 'Answer', text: t('pricing.faq1A') } },
    { '@type': 'Question', name: t('pricing.faq2Q'), acceptedAnswer: { '@type': 'Answer', text: t('pricing.faq2A') } },
    { '@type': 'Question', name: t('pricing.faq3Q'), acceptedAnswer: { '@type': 'Answer', text: t('pricing.faq3A') } },
    { '@type': 'Question', name: t('pricing.faq4Q'), acceptedAnswer: { '@type': 'Answer', text: t('pricing.faq4A') } },
  ],
})

const freeFeatures = computed(() => [
  t('pricing.freeFeature1'), t('pricing.freeFeature2'), t('pricing.freeFeature3'),
  t('pricing.freeFeature4'), t('pricing.freeFeature5'),
])

const proFeatures = computed(() => [
  t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'),
  t('pricing.proFeature4'), t('pricing.proFeature5'), t('pricing.proFeature6'), t('pricing.proFeature7'),
])

const faqs = computed(() => [
  { q: t('pricing.faq1Q'), a: t('pricing.faq1A') },
  { q: t('pricing.faq2Q'), a: t('pricing.faq2A') },
  { q: t('pricing.faq3Q'), a: t('pricing.faq3A') },
  { q: t('pricing.faq4Q'), a: t('pricing.faq4A') },
])
</script>
