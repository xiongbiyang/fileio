<template>
  <div class="flex-grow flex flex-col items-center justify-center px-8 py-24 min-h-[70vh]">
    <div class="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <!-- Content -->
      <div class="lg:col-span-7 order-2 lg:order-1">
        <!-- Error Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold uppercase tracking-wider mb-6">
          <span class="material-symbols-outlined text-sm">error</span>
          {{ $t('error404.badge') }}
        </div>

        <h1 class="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-on-surface dark:text-surface mb-6">
          {{ $t('error404.title') }} <span class="text-primary">{{ $t('error404.highlight') }}</span>.
        </h1>

        <p class="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-lg">
          {{ $t('error404.desc') }}
        </p>

        <!-- Popular Tools -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.path"
            :to="localePath(link.path)"
            class="p-5 bg-surface-container-low dark:bg-surface-container rounded-xl group hover:translate-x-1 hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-all"
          >
            <span class="material-symbols-outlined text-primary mb-3 block">{{ link.icon }}</span>
            <span class="text-sm font-bold text-on-surface dark:text-surface group-hover:text-primary transition-colors">{{ link.label }}</span>
          </NuxtLink>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-6">
          <NuxtLink
            :to="localePath('/')"
            class="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {{ $t('common.backToHome') }}
          </NuxtLink>
          <button class="text-primary font-bold hover:underline" @click="$router.back()">
            {{ $t('common.goBack') }}
          </button>
        </div>
      </div>

      <!-- Illustration -->
      <div class="lg:col-span-5 order-1 lg:order-2 relative flex items-center justify-center">
        <div class="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div class="relative z-10 p-8 bg-surface-container-low dark:bg-surface-container rounded-4xl shadow-2xl shadow-primary/5">
          <div class="text-center">
            <span class="font-headline text-8xl font-extrabold text-primary/20">404</span>
            <p class="text-on-surface-variant text-sm mt-4">{{ $t('error404.wandered') }}</p>
          </div>
          <!-- Floating elements -->
          <div class="absolute -top-4 -right-4 bg-primary p-4 rounded-2xl shadow-lg">
            <span class="material-symbols-outlined text-on-primary text-2xl">search_off</span>
          </div>
          <div class="absolute -bottom-6 -left-6 bg-surface-container-lowest dark:bg-surface-container-highest p-4 rounded-2xl shadow-ambient">
            <span class="material-symbols-outlined text-primary text-2xl">explore</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: '404 - ToolPort' })

const quickLinks = computed(() => [
  { path: '/tools/text-transfer', icon: 'devices', label: t('error404.linkTransfer') },
  { path: '/tools/qr-code', icon: 'qr_code_2', label: t('error404.linkQr') },
  { path: '/tools/clipboard', icon: 'content_paste', label: t('error404.linkClipboard') },
])
</script>
