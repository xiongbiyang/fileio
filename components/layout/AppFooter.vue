<template>
  <footer class="w-full py-8 px-12 bg-surface-container-lowest dark:bg-on-surface">
    <div class="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex flex-col md:flex-row items-center gap-4">
        <span class="text-lg font-black tracking-tight text-on-surface dark:text-surface font-headline">FILEIO</span>
        <span class="text-xs text-on-surface-variant/60">{{ $t('footer.copyright', { year: new Date().getFullYear() }) }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-6">
        <NuxtLink
v-for="link in links" :key="link.key" :to="localePath(link.path)"
          class="text-xs font-semibold text-on-surface-variant dark:text-on-surface-variant/60 uppercase tracking-widest hover:text-primary transition-colors">
          {{ $t(link.key) }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const links = [
  { path: '/privacy', key: 'footer.privacyPolicy' },
  { path: '/terms', key: 'footer.termsOfService' },
  { path: '/contact', key: 'footer.cookieSettings' },
  { path: '/contact', key: 'footer.contactSupport' },
]
</script>
