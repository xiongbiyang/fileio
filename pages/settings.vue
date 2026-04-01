<template>
  <div class="min-h-screen">

    <!-- ============ MOBILE SETTINGS ============ -->
    <div class="md:hidden px-5 pt-6 pb-28">
      <div class="flex items-center justify-between mb-6">
        <span class="font-headline text-lg font-bold text-on-surface dark:text-surface">ToolPort</span>
        <div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm">AR</div>
      </div>

      <h1 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-6">{{ $t('settings.title') }}</h1>

      <!-- Profile Card -->
      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient mb-6 flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center">
          <span class="material-symbols-outlined text-primary text-2xl">person</span>
        </div>
        <div class="flex-1">
          <p class="font-headline font-bold text-on-surface dark:text-surface">Alex Rivet</p>
          <p class="text-xs text-on-surface-variant">Lead Technician</p>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('settings.mobileAccountStatus') }}</span>
          <div class="flex items-center gap-1 mt-0.5 justify-end">
            <span class="material-symbols-outlined text-primary text-xs" style="font-variation-settings: 'FILL' 1">verified</span>
            <span class="text-xs font-bold text-primary">{{ $t('settings.mobileVerified') }}</span>
          </div>
        </div>
      </div>

      <!-- P2P Status Card -->
      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient mb-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="material-symbols-outlined text-primary text-xl">hub</span>
          <span class="font-headline font-bold text-sm text-on-surface dark:text-surface">{{ $t('settings.p2pProtocol') }}</span>
          <span class="ml-auto px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold rounded-full flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-primary" />{{ $t('toolA.deviceConnected') }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-center">
          <div><span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Latency</span><p class="text-xl font-headline font-extrabold text-on-surface dark:text-surface">24ms</p></div>
          <div><span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Peers</span><p class="text-xl font-headline font-extrabold text-on-surface dark:text-surface">12 Active</p></div>
        </div>
      </div>

      <!-- Settings List -->
      <div class="space-y-2">
        <button class="w-full bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 flex items-center gap-4 active:bg-surface-container transition-colors" @click="toggleMobileTheme">
          <span class="material-symbols-outlined text-on-surface-variant">{{ isDark ? 'dark_mode' : 'light_mode' }}</span>
          <span class="flex-1 text-left text-sm font-medium text-on-surface dark:text-surface">{{ $t('settings.darkMode') }}</span>
          <div class="w-11 h-6 rounded-full relative transition-colors" :class="isDark ? 'bg-primary' : 'bg-surface-container-high'">
            <span class="absolute top-1 bg-surface-container-lowest w-4 h-4 rounded-full transition-all shadow-sm" :class="isDark ? 'left-6' : 'left-1'" />
          </div>
        </button>
        <button class="w-full bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 flex items-center gap-4 active:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-on-surface-variant">language</span>
          <span class="flex-1 text-left text-sm font-medium text-on-surface dark:text-surface">{{ $t('settings.language') }}</span>
          <span class="text-xs text-on-surface-variant">{{ locale === 'zh-CN' ? '中文' : 'English' }}</span>
          <span class="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
        </button>
        <button class="w-full bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 flex items-center gap-4 active:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span class="flex-1 text-left text-sm font-medium text-on-surface dark:text-surface">{{ $t('settings.mobileNotifications') }}</span>
          <span class="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
        </button>
        <button class="w-full bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 flex items-center gap-4 active:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-on-surface-variant">shield</span>
          <span class="flex-1 text-left text-sm font-medium text-on-surface dark:text-surface">{{ $t('settings.mobileSecurityVault') }}</span>
          <span class="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
        </button>
      </div>

      <!-- Sign Out -->
      <button class="w-full mt-6 py-4 bg-error-container/20 text-error rounded-xl font-bold text-sm active:scale-95 transition-transform">
        {{ $t('settings.mobileSignOut') }}
      </button>
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

        <!-- Connection & P2P -->
        <section class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-primary">hub</span>
            <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('settings.connectionP2p') }}</h2>
          </div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-semibold text-on-surface dark:text-surface">{{ $t('settings.p2pProtocol') }}</p>
              <p class="text-xs text-on-surface-variant">{{ $t('settings.p2pDesc') }}</p>
            </div>
            <button class="w-11 h-6 bg-primary rounded-full relative transition-colors" @click="p2pEnabled = !p2pEnabled">
              <span class="absolute top-1 bg-surface-container-lowest w-4 h-4 rounded-full transition-all shadow-sm" :class="p2pEnabled ? 'left-6' : 'left-1'" />
            </button>
          </div>
          <div class="space-y-2 text-xs text-on-surface-variant">
            <p>STUN: stun.toolport.io:19302</p>
            <p>TURN: turn.toolport.io:3478</p>
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
  title: 'Settings - ToolPort',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { isDark, toggle } = useTheme()

const p2pEnabled = ref(true)

const languages = [
  { code: 'en', label: 'English (US)' },
  { code: 'zh-CN', label: '中文' },
  { code: 'zh-TW', label: '繁體中文' },
]

function toggleMobileTheme() {
  toggle()
}

function setTheme(dark: boolean) {
  if (isDark.value !== dark) toggle()
}

function switchLang(code: string) {
  setLocale(code as 'en' | 'zh-CN' | 'zh-TW')
  navigateTo(switchLocalePath(code as 'en' | 'zh-CN' | 'zh-TW'))
}
</script>
