<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-surface to-surface-container dark:from-on-surface dark:to-surface-container">
    <!-- Main Content -->
    <div class="flex-grow flex items-center justify-center p-6">
      <div class="max-w-3xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <!-- Visual -->
        <div class="md:col-span-5 flex justify-center md:justify-end">
          <div class="w-64 h-64 md:w-80 md:h-80 glass-panel rounded-xl flex items-center justify-center relative">
            <span class="material-symbols-outlined text-9xl text-primary/30">power_off</span>
            <div class="absolute inset-0 bg-primary/5 rounded-xl" />
          </div>
        </div>

        <!-- Content -->
        <div class="md:col-span-7 flex flex-col text-center md:text-left">
          <div class="flex items-center gap-2 px-4 py-2 bg-surface-container dark:bg-surface-container-high rounded-full w-fit mx-auto md:mx-0 mb-6">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span class="font-label text-sm font-bold text-primary uppercase tracking-widest">{{ $t('maintenance.statusLabel') }}</span>
          </div>

          <h1 class="font-headline text-5xl md:text-6xl font-extrabold text-on-surface dark:text-surface tracking-tighter mb-6">{{ $t('maintenance.title') }}</h1>
          <p class="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-md">{{ $t('maintenance.desc') }}</p>

          <div class="flex flex-col sm:flex-row gap-4 mb-10">
            <button class="px-8 py-4 primary-gradient text-on-primary rounded-lg font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.95] transition-transform">
              <span class="material-symbols-outlined">sync</span>
              {{ $t('maintenance.checkConnection') }}
            </button>
            <NuxtLink :to="localePath('/tools')" class="px-8 py-4 text-primary font-bold flex items-center justify-center gap-2 hover:underline">
              {{ $t('maintenance.backToTools') }}
              <span class="material-symbols-outlined">arrow_forward</span>
            </NuxtLink>
          </div>

          <div class="grid grid-cols-2 gap-8 pt-8">
            <div>
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('maintenance.lastUpdate') }}</span>
              <p class="text-on-surface dark:text-surface font-medium mt-1">2 mins ago</p>
            </div>
            <div>
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('maintenance.expectedDuration') }}</span>
              <p class="text-on-surface dark:text-surface font-medium mt-1">~15 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({
  title: 'Maintenance',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
const localePath = useLocalePath()
</script>
