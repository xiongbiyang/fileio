<template>
  <div class="min-h-screen bg-surface dark:bg-on-surface pt-20 pb-32 px-4">
    <div class="max-w-md mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm">S</div>
          <span class="font-headline text-lg font-bold text-on-surface dark:text-surface">ToolPort</span>
        </div>
        <NuxtLink :to="localePath('/settings')" class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
          <span class="material-symbols-outlined">settings</span>
        </NuxtLink>
      </div>

      <!-- Welcome -->
      <div>
        <h1 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface tracking-tight">{{ $t('welcome.greeting') }}</h1>
        <p class="text-on-surface-variant mt-2">{{ $t('welcome.subtitle') }}</p>
      </div>

      <!-- Main CTA Card -->
      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-6 shadow-ambient space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl text-primary">swap_horiz</span>
            </div>
            <div>
              <h2 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('welcome.transferTitle') }}</h2>
              <p class="text-xs text-on-surface-variant">{{ $t('welcome.transferDesc') }}</p>
            </div>
          </div>
          <span class="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase rounded-full tracking-wider">{{ $t('welcome.mostUsed') }}</span>
        </div>
        <NuxtLink :to="localePath('/tools/text-transfer')" class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
          {{ $t('welcome.startTransfer') }}
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </NuxtLink>
      </div>

      <!-- Pro Waitlist Card -->
      <div class="primary-gradient rounded-xl p-6 text-on-primary">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">verified</span>
          <span class="text-xs font-bold uppercase tracking-wider text-on-primary/80">PRO</span>
        </div>
        <h3 class="font-headline font-bold text-lg mb-1">{{ $t('welcome.proTitle') }}</h3>
        <p class="text-on-primary/70 text-sm mb-4">{{ $t('welcome.proDesc') }}</p>
        <NuxtLink :to="localePath('/pro-waitlist')" class="inline-flex px-5 py-2 bg-primary-fixed text-on-primary-fixed-variant rounded-lg text-sm font-bold active:scale-95 transition-transform">
          {{ $t('welcome.proBtn') }}
        </NuxtLink>
      </div>

      <!-- Recent Activity -->
      <div>
        <h3 class="font-headline font-bold text-on-surface dark:text-surface mb-4">{{ $t('welcome.recentActivity') }}</h3>
        <div class="space-y-3">
          <div v-for="item in recentItems" :key="item.name" class="bg-surface-container-low dark:bg-surface-container hover:bg-surface-container-high transition-colors p-4 rounded-xl flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-container-highest flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-on-surface-variant">{{ item.icon }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">{{ item.name }}</p>
              <p class="text-xs text-on-surface-variant">{{ item.desc }}</p>
            </div>
            <span class="text-xs text-on-surface-variant whitespace-nowrap">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <!-- Connectivity -->
      <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-4 flex items-center gap-3">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span class="text-sm text-on-surface dark:text-surface font-medium flex-1">{{ $t('welcome.deviceSynced') }}</span>
        <span class="text-xs font-bold text-primary uppercase tracking-wider">{{ $t('welcome.live') }}</span>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest/80 dark:bg-on-surface/80 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-6 pt-3 pb-6">
      <div class="flex justify-around items-center max-w-md mx-auto">
        <NuxtLink :to="localePath('/tools/text-transfer')" class="flex flex-col items-center gap-1 text-primary">
          <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1">swap_horiz</span>
          <span class="text-[11px] font-bold uppercase tracking-wider">Transfer</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/tools/qr-code')" class="flex flex-col items-center gap-1 text-on-surface-variant">
          <span class="material-symbols-outlined text-xl">qr_code_scanner</span>
          <span class="text-[11px] font-bold uppercase tracking-wider">QR Scan</span>
        </NuxtLink>
        <NuxtLink :to="localePath('/tools/clipboard')" class="flex flex-col items-center gap-1 text-on-surface-variant">
          <span class="material-symbols-outlined text-xl">content_paste</span>
          <span class="text-[11px] font-bold uppercase tracking-wider">Clipboard</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({
  title: 'Welcome',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const localePath = useLocalePath()

const recentItems = [
  { icon: 'description', name: 'Meeting_Notes.txt', desc: 'Transferred to MacBook Pro', time: '2m ago' },
  { icon: 'link', name: 'github.com/toolport/ui', desc: 'Shared via QR Code', time: '1h ago' },
  { icon: 'image', name: 'Design_Specs_v2.png', desc: 'Synced from iPad Air', time: '4h ago' },
]
</script>
