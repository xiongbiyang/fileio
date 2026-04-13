<template>
  <div class="min-h-screen bg-surface dark:bg-on-surface flex flex-col">
    <AppHeader />
    <AppNotifications />
    <main class="flex-1 pt-16">
      <slot />
    </main>
    <AppFooter />
    <MobileNav class="md:hidden" />
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const ogLocaleMap: Record<string, string> = { 'en': 'en_US', 'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW' }
const ogLocaleAlternates = computed(() =>
  Object.values(ogLocaleMap).filter(v => v !== ogLocaleMap[locale.value]),
)

const i18nHead = useLocaleHead({ dir: true, lang: true, seo: true })
useHead(() => ({
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
}))
useSeoMeta({
  ogLocale: () => ogLocaleMap[locale.value] || 'en_US',
})
useHead(() => ({
  meta: ogLocaleAlternates.value.map(alt => ({
    property: 'og:locale:alternate',
    content: alt,
  })),
}))
</script>
