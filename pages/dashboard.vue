<template>
  <div class="pt-8 pb-12 px-8 min-h-screen">
    <!-- Hero Card -->
    <div class="bg-primary primary-gradient rounded-xl p-8 relative overflow-hidden mb-10">
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p class="text-on-primary/60 text-sm font-medium mb-1">{{ $t('dashboard.greeting') }}</p>
          <h1 class="font-headline text-3xl font-extrabold text-on-primary">{{ $t('dashboard.heroTitle') }}</h1>
          <p class="text-on-primary/80 text-sm mt-2">{{ $t('dashboard.heroDesc') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-primary-fixed/20 text-primary-fixed text-xs font-bold uppercase tracking-wider rounded-full">{{ $t('dashboard.freeTier') }}</span>
          <NuxtLink :to="localePath('/pricing')" class="px-4 py-2 bg-primary-fixed text-on-primary-fixed-variant rounded-lg font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform">
            {{ $t('dashboard.upgradePro') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div v-for="stat in stats" :key="stat.icon" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-2xl text-primary">{{ stat.icon }}</span>
        </div>
        <div>
          <p class="text-2xl font-headline font-extrabold text-on-surface dark:text-surface">{{ stat.value }}</p>
          <p class="text-xs text-on-surface-variant font-medium">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Major Tools -->
    <div class="mb-10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('dashboard.majorTools') }}</h2>
        <NuxtLink :to="localePath('/tools')" class="text-sm text-primary font-bold hover:underline flex items-center gap-1">
          {{ $t('dashboard.viewAll') }}
          <span class="material-symbols-outlined text-lg">north_east</span>
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink v-for="tool in tools" :key="tool.icon" :to="localePath(tool.path)" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-6 hover:shadow-ambient transition-shadow group">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-2xl text-primary">{{ tool.icon }}</span>
          </div>
          <h3 class="font-headline font-bold text-on-surface dark:text-surface mb-1">{{ tool.name }}</h3>
          <p class="text-on-surface-variant text-sm">{{ tool.desc }}</p>
          <div class="flex items-center gap-2 mt-3">
            <span class="w-1.5 h-1.5 rounded-full bg-primary" />
            <span class="text-xs text-primary font-medium">{{ $t('dashboard.activeNow') }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Devices -->
    <div>
      <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-6">{{ $t('dashboard.recentDevices') }}</h2>
      <div class="space-y-3">
        <div v-for="device in devices" :key="device.name" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-container flex items-center justify-center">
            <span class="material-symbols-outlined text-on-surface-variant">{{ device.icon }}</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-on-surface dark:text-surface">{{ device.name }}</p>
            <p class="text-xs text-on-surface-variant">{{ device.location }}</p>
          </div>
          <span class="text-xs text-on-surface-variant">{{ device.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'tool' })
useHead({
  title: 'Dashboard - ToolPort',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const localePath = useLocalePath()

const stats = [
  { icon: 'speed', value: '42ms', label: 'Avg. Latency' },
  { icon: 'cloud_done', value: '2.4 GB', label: 'Storage Used' },
  { icon: 'bar_chart', value: '99.9%', label: 'Uptime' },
]

const tools = [
  { icon: 'devices', name: 'Text Transfer', desc: 'P2P encrypted file & text sharing', path: '/tools/text-transfer' },
  { icon: 'qr_code_2', name: 'QR Code Tools', desc: 'Generate and scan QR codes locally', path: '/tools/qr-code' },
  { icon: 'content_paste', name: 'Online Clipboard', desc: 'Room-based cross-device sync', path: '/tools/clipboard' },
]

const devices = [
  { icon: 'laptop_mac', name: 'MacBook Pro 16"', location: 'San Francisco, USA', time: 'Active now' },
  { icon: 'smartphone', name: 'iPhone 15 Pro', location: 'London, UK', time: '4 hours ago' },
]
</script>
