<template>
  <header class="fixed top-0 w-full z-50 px-8 h-16 glass-panel">
    <div class="max-w-[1800px] mx-auto h-full flex items-center justify-between">
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2">
        <span class="text-2xl font-bold tracking-tight text-on-surface dark:text-surface font-headline">ToolPort</span>
      </NuxtLink>
      <nav class="hidden md:flex items-center gap-1 font-headline">
        <NuxtLink v-for="item in navItems" :key="item.key" :to="localePath(item.path)"
          class="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface dark:hover:text-surface transition-colors"
          :class="{ 'text-primary border-b-2 border-primary': isActive(item.path) }">
          {{ $t(item.key) }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-3">
        <button class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          :aria-label="isDark ? $t('common.lightMode') : $t('common.darkMode')" @click="toggleTheme">
          <span class="material-symbols-outlined text-xl">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </button>
        <LanguageSwitcher />
        <button class="hidden md:inline-flex px-5 py-2 primary-gradient text-on-primary rounded-lg text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform">
          {{ $t('common.signIn') }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const { isDark, toggle: toggleTheme } = useTheme()
const navItems = [
  { path: '/tools', key: 'nav.tools' },
  { path: '/blog', key: 'nav.blog' },
  { path: '/pricing', key: 'nav.pricing' },
  { path: '/about', key: 'nav.about' },
]
function isActive(path: string) { return route.path.startsWith(localePath(path)) }
</script>
