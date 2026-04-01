<template>
  <div class="min-h-screen flex items-center justify-center p-6 md:p-12 bg-surface dark:bg-on-surface">
    <div class="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-4xl overflow-hidden shadow-ambient">
      <!-- Left: Brand Panel -->
      <div class="lg:col-span-5 primary-gradient p-10 lg:p-12 text-on-primary flex flex-col justify-between min-h-[400px]">
        <div>
          <div class="flex items-center gap-2 mb-10">
            <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">handyman</span>
            <span class="font-headline text-xl font-bold">ToolPort</span>
          </div>
          <h2 class="font-headline text-3xl lg:text-4xl font-extrabold leading-tight mb-6">{{ $t('auth.heroTitle') }}</h2>
          <div class="space-y-4">
            <div v-for="feat in features" :key="feat.icon" class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary-fixed" style="font-variation-settings: 'FILL' 1">{{ feat.icon }}</span>
              <span class="text-on-primary/90 text-sm font-medium">{{ feat.label }}</span>
            </div>
          </div>
        </div>
        <div class="hidden lg:flex items-center gap-2 mt-12">
          <span class="material-symbols-outlined text-sm text-on-primary/40">terminal</span>
          <span class="text-xs text-on-primary/40 font-mono">v2.4.0-stable</span>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="lg:col-span-7 bg-surface-container-lowest dark:bg-surface-container-high p-10 lg:p-14 flex flex-col justify-center">
        <h1 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface mb-2">{{ $t('auth.welcome') }}</h1>
        <p class="text-on-surface-variant mb-8">{{ $t('auth.signInDesc') }}</p>

        <!-- OAuth -->
        <div class="flex gap-3 mb-6">
          <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container rounded-xl font-semibold text-sm text-on-surface dark:text-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
            Google
          </button>
          <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container rounded-xl font-semibold text-sm text-on-surface dark:text-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
            GitHub
          </button>
        </div>

        <div class="flex items-center gap-4 mb-6">
          <div class="flex-1 h-px bg-outline-variant/20" />
          <span class="text-xs text-on-surface-variant font-medium">{{ $t('auth.orUseEmail') }}</span>
          <div class="flex-1 h-px bg-outline-variant/20" />
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSignIn" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('auth.emailLabel') }}</label>
            <input v-model="email" type="email" class="w-full bg-surface-container-highest dark:bg-surface-container border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" placeholder="name{'@'}example.com" required />
          </div>
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('auth.passwordLabel') }}</label>
              <button type="button" class="text-xs text-primary font-medium hover:underline">{{ $t('auth.forgot') }}</button>
            </div>
            <input v-model="password" type="password" class="w-full bg-surface-container-highest dark:bg-surface-container border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••••••" required />
          </div>
          <button type="submit" class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-[1.01] active:scale-[0.98] transition-transform shadow-ambient">
            {{ $t('auth.signInBtn') }}
          </button>
        </form>

        <!-- Anonymous -->
        <div class="mt-6 p-4 bg-surface-container-low dark:bg-surface-container rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1">incognito</span>
          <div class="flex-1">
            <span class="text-sm font-semibold text-on-surface dark:text-surface">{{ $t('auth.enterAnonymously') }}</span>
            <p class="text-xs text-on-surface-variant">{{ $t('auth.anonymousDesc') }}</p>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </div>

        <p class="text-center text-sm text-on-surface-variant mt-6">
          {{ $t('auth.noAccount') }} <NuxtLink :to="localePath('/auth/signin')" class="text-primary font-semibold hover:underline">{{ $t('auth.createAccount') }}</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({
  title: 'Sign In - ToolPort',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const localePath = useLocalePath()
const email = ref('')
const password = ref('')

const features = [
  { icon: 'sync', label: 'Seamless Synchronization' },
  { icon: 'verified_user', label: 'Privacy-First Engine' },
  { icon: 'bolt', label: 'Pro Performance' },
]

function handleSignIn() {
  // Auth logic will go here
}
</script>
