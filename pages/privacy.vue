<template>
  <div class="max-w-6xl mx-auto px-8 py-24">
    <!-- Hero -->
    <div class="mb-16">
      <h1 class="font-headline text-5xl md:text-6xl font-extrabold text-primary tracking-tight">{{ $t('privacy.title') }}</h1>
      <div class="flex items-center gap-4 mt-6">
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-xs font-bold uppercase tracking-wider">
          <span class="material-symbols-outlined text-sm">verified_user</span>
          {{ $t('privacy.badgeZero') }}
        </span>
        <span class="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-wider">
          <span class="material-symbols-outlined text-sm">auto_delete</span>
          {{ $t('privacy.badgeAuto') }}
        </span>
      </div>
    </div>

    <!-- Overview Bento -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <div class="md:col-span-2 bg-surface-container-low dark:bg-surface-container p-10 rounded-xl relative overflow-hidden">
        <span class="material-symbols-outlined absolute -top-4 -right-4 text-[120px] text-primary/5">shield</span>
        <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-4 relative z-10">{{ $t('privacy.commitTitle') }}</h2>
        <p class="text-on-surface-variant leading-relaxed relative z-10">
          {{ $t('privacy.commitDesc') }}
        </p>
      </div>
      <div class="bg-primary text-on-primary p-10 rounded-xl">
        <span class="text-xs font-bold uppercase tracking-widest text-on-primary/60 font-label">{{ $t('privacy.lastUpdated') }}</span>
        <p class="font-headline text-3xl font-extrabold mt-2">{{ $t('privacy.lastUpdatedDate') }}</p>
        <div class="mt-6 pt-6 border-t border-primary-container">
          <p class="text-on-primary/80 text-sm">{{ $t('privacy.appliesToAll') }}</p>
        </div>
      </div>
    </div>

    <!-- Tool-Specific -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
      <div v-for="tool in toolPrivacy" :key="tool.name" class="bg-surface-container-lowest dark:bg-surface-container-high p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-on-primary-container text-xl">{{ tool.icon }}</span>
        </div>
        <h3 class="font-headline text-lg font-bold text-on-surface dark:text-surface mb-2">{{ tool.name }}</h3>
        <p class="text-on-surface-variant text-sm leading-relaxed mb-4">{{ tool.desc }}</p>
        <ul class="space-y-2">
          <li v-for="item in tool.points" :key="item" class="flex items-center gap-2 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-sm">check</span>
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Detailed Clauses -->
    <div class="space-y-12">
      <div v-for="clause in clauses" :key="clause.title" class="border-l-4 border-primary pl-8">
        <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-4">{{ clause.title }}</h2>
        <p class="text-on-surface-variant leading-relaxed">{{ clause.content }}</p>
      </div>
    </div>

    <!-- Contact CTA -->
    <div class="mt-16 bg-secondary-container rounded-2xl p-12 flex flex-col md:flex-row items-center justify-between gap-8">
      <div>
        <h3 class="font-headline text-2xl font-extrabold text-on-surface mb-2">{{ $t('privacy.ctaTitle') }}</h3>
        <p class="text-on-surface-variant">{{ $t('privacy.ctaDesc') }}</p>
      </div>
      <NuxtLink
        :to="localePath('/contact')"
        class="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform whitespace-nowrap"
      >
        {{ $t('common.contactUs') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() =>
  new URL(localePath('/privacy'), runtimeConfig.public.siteUrl || 'https://fileio.top').toString(),
)
useHead({
  title: () => t('seo.privacy.title'),
  meta: [
    { name: 'description', content: () => t('seo.privacy.desc') },
    { name: 'keywords', content: () => t('seo.privacy.keywords') },
  ],
  link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
})
useSeoMeta({
  ogTitle: () => t('seo.privacy.title'),
  ogDescription: () => t('seo.privacy.desc'),
  ogImage: 'https://fileio.top/og-image.png',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: t('seo.privacy.title'),
  description: t('seo.privacy.desc'),
  url: 'https://fileio.top/privacy',
})

const toolPrivacy = computed(() => [
  {
    name: t('privacy.toolAName'),
    icon: 'devices',
    desc: t('privacy.toolADesc'),
    points: [t('privacy.toolAPoint1'), t('privacy.toolAPoint2'), t('privacy.toolAPoint3')],
  },
])

const clauses = computed(() => [
  { title: t('privacy.clauseCookies'), content: t('privacy.clauseCookiesContent') },
  { title: t('privacy.clauseAnalytics'), content: t('privacy.clauseAnalyticsContent') },
  { title: t('privacy.clauseThirdParty'), content: t('privacy.clauseThirdPartyContent') },
  { title: t('privacy.clauseRetention'), content: t('privacy.clauseRetentionContent') },
])
</script>
