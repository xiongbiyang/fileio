<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- Ad-blocker nudge is only relevant when ads are actually served. -->
  <AdBlockNotice v-if="adsEnabled" />
  <CookieConsent />
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const adsEnabled = computed(() => Boolean(runtimeConfig.public.adsEnabled))

useHead({
  script: [
    {
      // Prevent dark mode flash: apply 'dark' class before first paint
      innerHTML: `(function(){if(localStorage.getItem('tp_theme')==='dark'){var e=document.documentElement;e.classList.add('dark');var s=e.style;s.setProperty('--color-surface-container-lowest','14 17 17');s.setProperty('--color-surface-container-low','25 28 29');s.setProperty('--color-surface-container','29 33 32');s.setProperty('--color-surface-container-high','39 43 42');s.setProperty('--color-surface-container-highest','50 54 54');s.setProperty('--color-on-surface-variant','188 201 197');s.setProperty('--color-outline','136 148 145');s.setProperty('--color-outline-variant','62 73 70');}})();`,
      tagPosition: 'head',
    },
  ],
})
</script>
