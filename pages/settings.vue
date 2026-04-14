<template>
  <div class="min-h-screen">
    <!-- ============ MOBILE SETTINGS ============ -->
    <div class="md:hidden px-5 pt-6 pb-28">
      <h1 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-6">{{ $t('settings.title') }}</h1>

      <div class="space-y-2">
        <button class="w-full bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 flex items-center gap-4 active:bg-surface-container transition-colors" @click="toggle()">
          <span class="material-symbols-outlined text-on-surface-variant">{{ isDark ? 'dark_mode' : 'light_mode' }}</span>
          <span class="flex-1 text-left text-sm font-medium text-on-surface dark:text-surface">{{ $t('settings.darkMode') }}</span>
          <div class="w-11 h-6 rounded-full relative transition-colors" :class="isDark ? 'bg-primary' : 'bg-surface-container-high'">
            <span class="absolute top-1 bg-surface-container-lowest w-4 h-4 rounded-full transition-all shadow-sm" :class="isDark ? 'left-6' : 'left-1'" />
          </div>
        </button>
      </div>

      <div class="mt-6">
        <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('settings.language') }}</span>
        <div class="grid grid-cols-3 gap-2 mt-3">
          <button v-for="lang in languages" :key="lang.code" class="px-3 py-2.5 rounded-xl text-xs font-medium transition-all" :class="locale === lang.code ? 'bg-primary-fixed text-on-primary-fixed-variant font-semibold' : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant'" @click="switchLang(lang.code)">
            {{ lang.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============ DESKTOP SETTINGS ============ -->
    <div class="hidden md:block pt-8 pb-12 px-8">
      <div class="max-w-5xl mx-auto">
        <h1 class="font-headline text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight mb-2">{{ $t('settings.title') }}</h1>
        <p class="text-on-surface-variant mb-10">{{ $t('settings.subtitle') }}</p>

        <div class="space-y-8">
          <!-- Appearance -->
          <section class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-primary">palette</span>
              <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('settings.appearance') }}</h2>
            </div>
            <p class="text-on-surface-variant text-sm mb-6">{{ $t('settings.appearanceDesc') }}</p>
            <div class="grid grid-cols-2 gap-4 max-w-sm">
              <button class="h-24 bg-surface-container-lowest rounded-lg flex flex-col items-center justify-center gap-2 transition-all" :class="!isDark ? 'ring-2 ring-primary' : 'hover:bg-surface-container'" @click="setTheme(false)">
                <span class="material-symbols-outlined text-on-surface-variant">light_mode</span>
                <span class="text-xs font-bold text-on-surface-variant">{{ $t('settings.lightMode') }}</span>
              </button>
              <button class="h-24 bg-surface-container-high rounded-lg flex flex-col items-center justify-center gap-2 transition-all" :class="isDark ? 'ring-2 ring-primary' : 'hover:bg-surface-container'" @click="setTheme(true)">
                <span class="material-symbols-outlined text-on-surface-variant">dark_mode</span>
                <span class="text-xs font-bold text-on-surface-variant">{{ $t('settings.darkMode') }}</span>
              </button>
            </div>
          </section>

          <!-- Language -->
          <section class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-primary">language</span>
              <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('settings.language') }}</h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button v-for="lang in languages" :key="lang.code" class="px-4 py-3 rounded-xl text-sm font-medium transition-all" :class="locale === lang.code ? 'bg-primary-fixed text-on-primary-fixed-variant font-semibold' : 'bg-surface-container-low dark:bg-surface-container hover:bg-surface-container text-on-surface-variant'" @click="switchLang(lang.code)">
                {{ lang.label }}
              </button>
            </div>
          </section>

          <!-- Data Management -->
          <section class="bg-error-container/20 rounded-xl p-8" style="border-left: 4px solid var(--color-error, #ba1a1a)">
            <div class="flex items-center gap-3 mb-4">
              <span class="material-symbols-outlined text-error">storage</span>
              <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('settings.dataManagement') }}</h2>
            </div>
            <p class="text-on-surface-variant text-sm mb-4">{{ $t('settings.dataManagementDesc') }}</p>
            <button class="px-6 py-3 bg-error text-on-error rounded-xl font-bold text-sm hover:bg-error/90 transition-colors">
              {{ $t('settings.deleteData') }}
            </button>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'tool' })
useHead({
  title: 'Settings',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { isDark, toggle } = useTheme()

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'zh-TW', label: '繁體中文' },
]

function setTheme(dark: boolean) {
  if (isDark.value !== dark) toggle()
}

function switchLang(code: string) {
  setLocale(code as 'en' | 'zh-CN' | 'zh-TW')
  navigateTo(switchLocalePath(code as 'en' | 'zh-CN' | 'zh-TW'))
}
</script>
