<template>
  <div>
    <!-- Hero -->
    <section class="relative bg-surface-container-low dark:bg-surface-container overflow-hidden" style="min-height: 614px">
      <div class="max-w-6xl mx-auto px-8 py-24 relative z-10">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container mb-8">
          <span class="material-symbols-outlined text-sm">emoji_objects</span>
          <span class="font-label text-xs font-bold tracking-widest uppercase">{{ $t('about.badge') }}</span>
        </div>
        <h1 class="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface dark:text-surface leading-tight max-w-3xl">
          {{ $t('about.heroTitle') }} <span class="text-primary">{{ $t('about.heroHighlight') }}</span>.
        </h1>
        <p class="text-xl text-on-surface-variant mt-6 max-w-2xl leading-relaxed">
          {{ $t('about.heroDesc') }}
        </p>
      </div>
    </section>

    <!-- Values Bento Grid -->
    <section class="max-w-6xl mx-auto px-8 py-24">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="md:col-span-8 bg-surface-container-low dark:bg-surface-container rounded-4xl p-10 relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <span class="material-symbols-outlined text-4xl text-primary mb-6 block">privacy_tip</span>
          <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface mb-3">{{ $t('about.privacyTitle') }}</h2>
          <p class="text-on-surface-variant leading-relaxed max-w-lg">
            {{ $t('about.privacyDesc') }}
          </p>
        </div>

        <div class="md:col-span-4 primary-gradient rounded-4xl p-10 text-on-primary flex flex-col justify-between">
          <span class="material-symbols-outlined text-4xl mb-6">volunteer_activism</span>
          <div>
            <h2 class="font-headline text-2xl font-extrabold mb-3">{{ $t('about.accessTitle') }}</h2>
            <p class="text-on-primary/80 text-sm leading-relaxed">{{ $t('about.accessDesc') }}</p>
          </div>
        </div>

        <div class="md:col-span-4 bg-surface-container-highest dark:bg-surface-container-high rounded-4xl p-10">
          <span class="material-symbols-outlined text-4xl text-primary mb-6 block">terminal</span>
          <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-3">{{ $t('about.transparentTitle') }}</h2>
          <p class="text-on-surface-variant text-sm leading-relaxed">{{ $t('about.transparentDesc') }}</p>
        </div>

        <div class="md:col-span-8 bg-secondary-container rounded-4xl p-10 relative overflow-hidden">
          <div class="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
          <span class="material-symbols-outlined text-4xl text-primary mb-6 block">spa</span>
          <h2 class="font-headline text-3xl font-extrabold text-on-surface mb-3">{{ $t('about.noNoiseTitle') }}</h2>
          <p class="text-on-surface-variant leading-relaxed max-w-lg">
            {{ $t('about.noNoiseDesc') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Security Promise -->
    <section class="max-w-6xl mx-auto px-8 pb-24">
      <div class="bg-surface-container-high dark:bg-surface-container rounded-5xl p-12 shadow-ambient text-center">
        <span class="material-symbols-outlined text-5xl text-primary mb-6 block mx-auto">shield_lock</span>
        <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface mb-4">{{ $t('about.securityTitle') }}</h2>
        <p class="text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {{ $t('about.securityDesc') }}
        </p>
        <div class="flex items-center justify-center gap-8 mt-8">
          <div v-for="badge in badges" :key="badge.icon" class="flex items-center gap-2 text-sm text-on-surface-variant">
            <span class="material-symbols-outlined text-primary">{{ badge.icon }}</span>
            {{ badge.label }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() =>
  new URL(localePath('/about'), runtimeConfig.public.siteUrl || 'https://toolport.dev').toString(),
)

useHead({
  title: () => t('seo.about.title'),
  meta: [
    { name: 'description', content: () => t('seo.about.desc') },
    { name: 'keywords', content: () => t('seo.about.keywords') },
  ],
  link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
})
useSeoMeta({
  ogTitle: () => t('seo.about.title'),
  ogDescription: () => t('seo.about.desc'),
  ogImage: 'https://toolport.dev/og-image.png',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: t('seo.about.title'),
  description: t('seo.about.desc'),
  url: 'https://toolport.dev/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'ToolPort',
    url: 'https://toolport.dev',
    logo: 'https://toolport.dev/og-image.png',
  },
})

const badges = computed(() => [
  { icon: 'verified_user', label: t('about.badgeE2ee') },
  { icon: 'delete_sweep', label: t('about.badgeExpiry') },
  { icon: 'visibility_off', label: t('about.badgeTracking') },
])
</script>
