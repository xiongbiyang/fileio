<template>
  <aside class="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low dark:bg-surface-container p-4 space-y-2 overflow-y-auto z-40">
    <div class="flex items-center gap-3 px-4 py-3 mb-4">
      <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm">W</div>
      <div>
        <p class="text-on-surface font-bold text-sm">{{ $t('sidebar.workspace') }}</p>
        <p class="text-on-surface-variant text-xs">{{ $t('sidebar.professionalPlan') }}</p>
      </div>
    </div>
    <nav class="flex flex-col gap-1">
      <NuxtLink
v-for="item in navItems" :key="item.key" :to="localePath(item.path)"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
        :class="isActive(item.path) ? 'bg-surface-container-lowest dark:bg-surface-container-high text-primary shadow-sm' : 'text-on-surface-variant/70 hover:bg-surface-container-lowest dark:hover:bg-surface-container-high hover:translate-x-1'">
        <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
        {{ $t(item.key) }}
      </NuxtLink>
    </nav>
    <div class="mt-auto pt-4">
      <NuxtLink :to="localePath('/pro-waitlist')" class="block w-full py-3 px-4 primary-gradient text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-ambient hover:scale-[1.02] active:scale-[0.98] transition-transform text-center">
        {{ $t('common.upgradeToPro') }}
      </NuxtLink>
    </div>
    <div class="flex flex-col gap-2 pt-4">
      <NuxtLink :to="localePath('/about')" class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant/50 hover:text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-lg">help</span>{{ $t('common.help') }}
      </NuxtLink>
      <NuxtLink :to="localePath('/contact')" class="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant/50 hover:text-on-surface-variant transition-colors">
        <span class="material-symbols-outlined text-lg">feedback</span>{{ $t('common.feedback') }}
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const navItems = [
  { path: '/tools', icon: 'apps', key: 'nav.allTools' },
  { path: '/tools/text-transfer', icon: 'swap_horiz', key: 'nav.textTransfer' },
  { path: '/tools/qr-code', icon: 'qr_code_2', key: 'nav.qrCode' },
  { path: '/tools/clipboard', icon: 'content_paste', key: 'nav.clipboard' },
  { path: '/settings', icon: 'settings', key: 'nav.settings' },
]
function isActive(path: string) {
  const localized = localePath(path)
  if (path === '/tools') return route.path === localized || route.path === localized + '/'
  return route.path.startsWith(localized)
}
</script>
