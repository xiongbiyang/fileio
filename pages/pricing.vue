<template>
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
    <!-- Header -->
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold tracking-widest uppercase mb-4">
        {{ $t('pricing.badge') }}
      </div>
      <h1 class="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface dark:text-surface">
        {{ $t('pricing.title') }}
      </h1>
      <p class="text-on-surface-variant mt-4 text-lg">{{ $t('pricing.subtitle') }}</p>
      <div class="mt-8 flex flex-col items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('pricing.billingToggleLabel') }}</span>
        <div class="w-full max-w-md overflow-x-auto no-scrollbar">
          <div class="inline-flex min-w-full items-center bg-surface-container-low dark:bg-surface-container rounded-full p-1 border border-outline-variant/20">
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
            :class="billingCycle === 'monthly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
            @click="billingCycle = 'monthly'"
          >
            {{ $t('pricing.monthlyOption') }}
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
            :class="billingCycle === 'yearly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
            @click="billingCycle = 'yearly'"
          >
            {{ $t('pricing.yearlyOption') }}
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
            :class="billingCycle === 'lifetime' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'"
            @click="billingCycle = 'lifetime'"
          >
            {{ $t('pricing.lifetimeOption') }}
          </button>
          </div>
        </div>
        <p class="text-sm font-semibold mt-2" :class="billingCycle === 'lifetime' ? 'text-primary' : 'text-on-surface-variant'">
          {{ billingHint }}
        </p>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8 mb-20 lg:mb-24">
      <!-- Free -->
      <div class="bg-surface-container-low dark:bg-surface-container p-6 lg:p-8 rounded-xl flex flex-col h-full min-h-0 xl:min-h-[720px]">
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{{ $t('pricing.freeLabel') }}</span>
        <div class="mt-4 mb-6 inline-flex items-end gap-1.5 whitespace-nowrap">
          <span class="text-3xl lg:text-4xl font-extrabold text-on-surface dark:text-surface font-headline">{{ $t('pricing.freePrice') }}</span>
          <span class="text-on-surface-variant text-sm">{{ $t('pricing.perMonth') }}</span>
        </div>
        <p class="text-on-surface-variant text-sm mb-8">{{ $t('pricing.freeDesc') }}</p>

        <ul class="space-y-4 mb-10 flex-1">
          <li v-for="f in freeFeatures" :key="f" class="flex items-center gap-3 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
            {{ f }}
          </li>
        </ul>

        <NuxtLink
          :to="localePath('/tools')"
          class="block w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-sm text-center hover:scale-[1.01] active:scale-[0.98] transition-transform mt-auto"
        >
          {{ $t('pricing.freeCta') }}
        </NuxtLink>
      </div>

      <!-- Pro Monthly -->
      <div class="bg-surface-container-low dark:bg-surface-container p-6 lg:p-8 rounded-xl text-on-surface dark:text-surface relative border shadow-ambient transition-all flex flex-col h-full min-h-0 xl:min-h-[720px]" :class="billingCycle === 'monthly' ? 'border-primary scale-[1.01] ring-2 ring-primary/25' : 'border-primary/20'">
        <div class="absolute top-4 right-4 flex flex-col items-end gap-2">
          <span class="px-3 py-1 bg-[#facc15] text-[#3f2a00] text-[10px] font-bold tracking-widest uppercase rounded-full">
            {{ $t('pricing.proDiscountBadge') }}
          </span>
        </div>
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{{ $t('pricing.proMonthlyLabel') }}</span>
        <div class="mt-4 mb-6 inline-flex items-end gap-1.5 whitespace-nowrap">
          <span class="text-on-surface-variant text-sm line-through mr-2">{{ $t('pricing.proOldPrice') }}</span>
          <span class="text-3xl lg:text-4xl font-extrabold font-headline">{{ $t('pricing.proPrice') }}</span>
          <span class="text-on-surface-variant text-sm">{{ $t('pricing.perMonth') }}</span>
        </div>
        <p class="text-on-surface-variant text-sm mb-8">{{ $t('pricing.proDesc') }}</p>

        <ul class="space-y-4 mb-10 flex-1">
          <li v-for="f in proFeatures" :key="f" class="flex items-center gap-3 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
            {{ f }}
          </li>
        </ul>

        <NuxtLink :to="waitlistPath('monthly')" class="block w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-sm text-center hover:scale-[1.01] active:scale-[0.98] transition-transform mt-auto">
          {{ $t('pricing.monthlyCta') }}
        </NuxtLink>
      </div>

      <!-- Pro Yearly -->
      <div class="bg-surface-container-low dark:bg-surface-container p-6 lg:p-8 rounded-xl relative border transition-all flex flex-col h-full min-h-0 xl:min-h-[720px]" :class="billingCycle === 'yearly' ? 'border-primary ring-2 ring-primary/25 scale-[1.01]' : 'border-primary/20'">
        <div class="absolute top-4 right-4 flex flex-col items-end gap-2">
          <span class="px-3 py-1 bg-[#facc15] text-[#3f2a00] text-[10px] font-bold tracking-widest uppercase rounded-full">
            {{ $t('pricing.yearDiscountBadge') }}
          </span>
        </div>
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{{ $t('pricing.yearLabel') }}</span>
        <div class="mt-4 mb-6 inline-flex items-end gap-1.5 whitespace-nowrap">
          <span class="text-on-surface-variant text-sm line-through mr-2">{{ $t('pricing.yearOldPrice') }}</span>
          <span class="text-3xl lg:text-4xl font-extrabold text-on-surface dark:text-surface font-headline">{{ $t('pricing.yearPrice') }}</span>
          <span class="text-on-surface-variant text-sm">{{ $t('pricing.perYear') }}</span>
        </div>
        <p class="text-on-surface-variant text-sm mb-8">{{ $t('pricing.yearDesc') }}</p>

        <ul class="space-y-4 mb-10 flex-1">
          <li v-for="f in yearFeatures" :key="f" class="flex items-center gap-3 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
            {{ f }}
          </li>
        </ul>

        <NuxtLink :to="waitlistPath('yearly')" class="block w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-sm text-center hover:scale-[1.01] active:scale-[0.98] transition-transform mt-auto">
          {{ $t('pricing.yearlyCta') }}
        </NuxtLink>
      </div>

      <!-- Lifetime -->
      <div class="bg-surface-container-low dark:bg-surface-container p-6 lg:p-8 rounded-xl relative border transition-all flex flex-col h-full min-h-0 xl:min-h-[720px]" :class="billingCycle === 'lifetime' ? 'border-primary ring-2 ring-primary/25 scale-[1.01]' : 'border-primary/20'">
        <div class="absolute top-4 right-4 flex flex-col items-end gap-2">
          <span class="px-3 py-1 bg-[#facc15] text-[#3f2a00] text-[10px] font-bold tracking-widest uppercase rounded-full">
            {{ $t('pricing.lifeDiscountBadge') }}
          </span>
        </div>
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{{ $t('pricing.lifeLabel') }}</span>
        <div class="mt-4 mb-6 inline-flex items-end gap-1.5 whitespace-nowrap">
          <span class="text-on-surface-variant text-sm line-through mr-2">{{ $t('pricing.lifeOldPrice') }}</span>
          <span class="text-3xl lg:text-4xl font-extrabold text-on-surface dark:text-surface font-headline">{{ $t('pricing.lifePrice') }}</span>
          <span class="text-on-surface-variant text-sm">{{ $t('pricing.lifeUnit') }}</span>
        </div>
        <p class="text-on-surface-variant text-sm mb-8">{{ $t('pricing.lifeDesc') }}</p>

        <ul class="space-y-4 mb-10 flex-1">
          <li v-for="f in lifeFeatures" :key="f" class="flex items-center gap-3 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-lg">check_circle</span>
            {{ f }}
          </li>
        </ul>

        <NuxtLink :to="waitlistPath('lifetime')" class="block w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-sm text-center hover:scale-[1.01] active:scale-[0.98] transition-transform mt-auto">
          {{ $t('pricing.lifetimeCta') }}
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
const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() =>
  new URL(localePath('/pricing'), runtimeConfig.public.siteUrl || 'https://toolport.dev').toString(),
)
const billingCycle = ref<'monthly' | 'yearly' | 'lifetime'>('lifetime')

function waitlistPath(plan: 'monthly' | 'yearly' | 'lifetime') {
  return {
    path: localePath('/pro-waitlist'),
    query: { plan },
  }
}
useHead({
  title: () => t('seo.pricing.title'),
  meta: [
    { name: 'description', content: () => t('seo.pricing.desc') },
    { name: 'keywords', content: () => t('seo.pricing.keywords') },
  ],
  link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
})
useSeoMeta({
  ogTitle: () => t('seo.pricing.title'),
  ogDescription: () => t('seo.pricing.ogDesc'),
  ogImage: 'https://toolport.dev/og-image.png',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'ToolPort Pro',
  description: 'Professional plan with 1GB transfers, 30-day history, custom room IDs, and priority support.',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro Monthly', price: '6.99', priceCurrency: 'USD', billingPeriod: 'P1M' },
    { '@type': 'Offer', name: 'Pro Yearly', price: '69.9', priceCurrency: 'USD', billingPeriod: 'P1Y' },
    { '@type': 'Offer', name: 'Pro Lifetime', price: '199.9', priceCurrency: 'USD' },
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
    { '@type': 'Question', name: t('pricing.faq5Q'), acceptedAnswer: { '@type': 'Answer', text: t('pricing.faq5A') } },
  ],
})

const freeFeatures = computed(() => [
  t('pricing.freeFeature1'), t('pricing.freeFeature2'), t('pricing.freeFeature3'),
  t('pricing.freeFeature4'), t('pricing.freeFeature5'),
])

const proFeatures = computed(() => [
  t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'),
  t('pricing.proFeature4'), t('pricing.proFeature5'), t('pricing.proFeature6'), t('pricing.proFeature7'),
  t('pricing.proFeatureExtra'),
])

const yearFeatures = computed(() => [
  t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'),
  t('pricing.proFeature4'), t('pricing.proFeature5'), t('pricing.proFeature6'), t('pricing.proFeature7'),
  t('pricing.yearFeatureExtra'),
])

const lifeFeatures = computed(() => [
  t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'),
  t('pricing.proFeature4'), t('pricing.proFeature5'), t('pricing.proFeature6'), t('pricing.proFeature7'),
  t('pricing.lifeFeatureExtra'), t('pricing.lifeFutureToolsFeature'),
])

const billingHint = computed(() => {
  if (billingCycle.value === 'yearly') return t('pricing.yearlyHint')
  if (billingCycle.value === 'lifetime') return t('pricing.lifetimeHint')
  return t('pricing.monthlyHint')
})

const faqs = computed(() => [
  { q: t('pricing.faq1Q'), a: t('pricing.faq1A') },
  { q: t('pricing.faq2Q'), a: t('pricing.faq2A') },
  { q: t('pricing.faq3Q'), a: t('pricing.faq3A') },
  { q: t('pricing.faq4Q'), a: t('pricing.faq4A') },
  { q: t('pricing.faq5Q'), a: t('pricing.faq5A') },
])
</script>
