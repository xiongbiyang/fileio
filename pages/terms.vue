<template>
  <div class="max-w-4xl mx-auto px-8 py-24">
    <div class="mb-12">
      <h1 class="font-headline text-5xl font-extrabold text-primary tracking-tight">{{ $t('terms.title') }}</h1>
      <p class="text-on-surface-variant mt-4">{{ $t('terms.lastUpdated') }}</p>
    </div>

    <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-10 space-y-10">
      <div v-for="section in sections" :key="section.title" class="border-l-4 border-primary pl-8">
        <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-3">{{ section.title }}</h2>
        <p class="text-on-surface-variant leading-relaxed">{{ section.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://fileio.top')
const canonicalUrl = computed(() => new URL(localePath('/terms'), siteBaseUrl.value).toString())
useHead({
  title: () => t('seo.terms.title'),
  meta: [
    { name: 'description', content: () => t('seo.terms.desc') },
  ],
  link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
})
useSeoMeta({
  ogTitle: () => t('seo.terms.title'),
  ogDescription: () => t('seo.terms.desc'),
  ogImage: `${siteBaseUrl.value}/og-image.png`,
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: t('seo.terms.title'),
  description: t('seo.terms.desc'),
  url: canonicalUrl.value,
})

const sectionKeys = ['acceptance', 'description', 'responsibilities', 'privacy', 'usercontent', 'ip', 'disclaimer', 'changes'] as const

const sections = computed(() =>
  sectionKeys.map(key => ({
    title: t(`terms.sections.${key}.title`),
    content: t(`terms.sections.${key}.content`),
  }))
)
</script>
