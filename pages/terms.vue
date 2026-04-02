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
useHead({
  title: 'Terms of Service',
  meta: [
    { name: 'description', content: 'ToolPort terms of service: usage guidelines, intellectual property, disclaimers, and user responsibilities for our free online tools.' },
  ],
})
useSeoMeta({
  ogTitle: 'Terms of Service - ToolPort',
  ogDescription: 'ToolPort terms of service: usage guidelines, intellectual property, disclaimers, and user responsibilities for our free online tools.',
  ogImage: 'https://toolport.dev/og-image.png',
})

const sectionKeys = ['acceptance', 'description', 'responsibilities', 'privacy', 'ip', 'disclaimer', 'changes'] as const

const sections = computed(() =>
  sectionKeys.map(key => ({
    title: t(`terms.sections.${key}.title`),
    content: t(`terms.sections.${key}.content`),
  }))
)
</script>
