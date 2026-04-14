<template>
  <nav class="fixed bottom-0 left-0 w-full bg-surface-container-lowest dark:bg-on-surface px-4 py-3 flex justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
    <NuxtLink
v-for="item in navItems" :key="item.key" :to="localePath(item.path)"
      class="flex flex-col items-center gap-0.5 text-xs font-medium transition-colors"
      :class="isActive(item.path) ? 'text-primary' : 'text-on-surface-variant'">
      <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
      <span>{{ $t(item.key) }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const navItems = [
  { path: '/text-transfer', icon: 'swap_horiz', key: 'nav.transfer' },
  { path: '/blog', icon: 'article', key: 'nav.blog' },
  { path: '/about', icon: 'info', key: 'nav.about' },
  { path: '/settings', icon: 'settings', key: 'nav.settings' },
]
function isActive(path: string) {
  const localized = localePath(path)
  return route.path === localized || route.path.startsWith(localized + '/')
}
</script>
