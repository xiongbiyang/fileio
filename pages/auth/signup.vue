<template>
  <div class="min-h-screen flex items-center justify-center p-6 md:p-12 bg-surface dark:bg-on-surface">
    <div class="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-4xl overflow-hidden shadow-ambient">
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

      <div class="lg:col-span-7 bg-surface-container-lowest dark:bg-surface-container-high p-10 lg:p-14 flex flex-col justify-center">
        <h1 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface mb-2">{{ $t('auth.signUpTitle') }}</h1>
        <p class="text-on-surface-variant mb-8">{{ $t('auth.signUpDesc') }}</p>

        <form class="space-y-4" @submit.prevent="handleSignUp">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('auth.emailLabel') }}</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              class="w-full bg-surface-container-highest dark:bg-surface-container border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="name{'@'}example.com"
              required
            >
            <p v-if="emailError" class="mt-2 text-xs text-error">{{ emailError }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('auth.passwordLabel') }}</label>
            <input
              v-model="password"
              type="password"
              autocomplete="new-password"
              class="w-full bg-surface-container-highest dark:bg-surface-container border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
              :placeholder="$t('auth.passwordPlaceholder')"
              required
            >
            <p v-if="passwordError" class="mt-2 text-xs text-error">{{ passwordError }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('auth.confirmPasswordLabel') }}</label>
            <input
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              class="w-full bg-surface-container-highest dark:bg-surface-container border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
              required
            >
            <p v-if="confirmPasswordError" class="mt-2 text-xs text-error">{{ confirmPasswordError }}</p>
          </div>

          <button type="submit" class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-[1.01] active:scale-[0.98] transition-transform shadow-ambient disabled:cursor-not-allowed disabled:opacity-70" :disabled="isSubmitting">
            {{ isSubmitting ? $t('common.sending') : $t('auth.signUpBtn') }}
          </button>
        </form>

        <p class="text-center text-sm text-on-surface-variant mt-6">
          {{ $t('auth.haveAccount') }}
          <NuxtLink :to="signInLink" class="text-primary font-semibold hover:underline">
            {{ $t('auth.signInLink') }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({
  title: 'Sign Up',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const localePath = useLocalePath()
const route = useRoute()
const { t } = useI18n()
const { notify } = useNotifier()
const auth = useAuthState()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isSubmitting = ref(false)

const features = [
  { icon: 'sync', label: 'Seamless Synchronization' },
  { icon: 'verified_user', label: 'Privacy-First Engine' },
  { icon: 'bolt', label: 'Pro Performance' },
]

const signInLink = computed(() => {
  const redirect = normalizeRedirectPath(String(route.query.redirect || '').trim())
  return {
    path: localePath('/auth/signin'),
    query: { redirect },
  }
})

function normalizeRedirectPath(pathValue: string) {
  if (!pathValue || !pathValue.startsWith('/')) return localePath('/tools/clipboard')
  if (pathValue.startsWith('//')) return localePath('/tools/clipboard')
  return pathValue
}

async function handleSignUp() {
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  const normalizedEmail = email.value.trim().toLowerCase()
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  if (!isEmailValid) {
    emailError.value = t('auth.emailInvalid')
    return
  }
  if (password.value.trim().length < 6) {
    passwordError.value = t('auth.passwordTooShort')
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = t('auth.passwordMismatch')
    return
  }
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    const result = await $fetch<{
      ok: boolean
      reason?: string
      user?: { email: string }
    }>('/api/auth/signup', {
      method: 'POST',
      body: {
        email: normalizedEmail,
        password: password.value,
      },
    })

    if (result.ok && result.user?.email) {
      auth.signIn(result.user.email)
      notify(t('auth.registerSuccess'))
    }
    else if (result.reason === 'AUTH_STORAGE_NOT_CONFIGURED') {
      auth.signIn(normalizedEmail)
      notify(t('auth.signUpLocalFallback'))
    }
    else {
      notify(t('auth.signUpFailed'))
      return
    }
    const redirect = normalizeRedirectPath(String(route.query.redirect || '').trim())
    await navigateTo(redirect)
  }
  catch (error: unknown) {
    const statusCode = Number((error as { statusCode?: number })?.statusCode || (error as { data?: { statusCode?: number } })?.data?.statusCode || 0)
    if (statusCode === 409) {
      notify(t('auth.accountExists'))
      return
    }
    notify(t('auth.signUpFailed'))
  }
  finally {
    isSubmitting.value = false
  }
}

watch(() => auth.isLoggedIn.value, async (loggedIn) => {
  if (!loggedIn) return
  const redirect = normalizeRedirectPath(String(route.query.redirect || '').trim())
  await navigateTo(redirect)
}, { immediate: true })
</script>
