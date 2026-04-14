<template>
  <header class="fixed top-0 w-full z-50 px-8 h-16 glass-panel">
    <div class="max-w-[1800px] mx-auto h-full flex items-center justify-between">
      <NuxtLink :to="localePath('/text-transfer')" class="flex items-center gap-2">
        <span class="text-2xl font-bold tracking-tight text-on-surface dark:text-surface font-headline">FileIO</span>
      </NuxtLink>
      <nav class="hidden md:flex items-center gap-1 font-headline">
        <NuxtLink
v-for="item in navItems" :key="item.key" :to="localePath(item.path)"
          class="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface dark:hover:text-surface transition-colors"
          :class="{ 'text-primary border-b-2 border-primary': isActive(item.path) }">
          {{ $t(item.key) }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-3">
        <button
class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          :aria-label="isDark ? $t('common.lightMode') : $t('common.darkMode')" @click="toggleTheme">
          <span class="material-symbols-outlined text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>
        <LanguageSwitcher />
        <NuxtLink
          :to="localePath('/settings')"
          class="hidden md:inline-flex p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          :aria-label="$t('nav.settings')">
          <span class="material-symbols-outlined text-xl">settings</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const { isDark, toggle: toggleTheme } = useTheme()
const navItems = [
  { path: '/text-transfer', key: 'nav.transfer' },
  { path: '/blog', key: 'nav.blog' },
  { path: '/about', key: 'nav.about' },
]
function isActive(path: string) { return route.path.startsWith(localePath(path)) }
</script>
