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
          <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container rounded-xl font-semibold text-sm text-on-surface dark:text-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed" :disabled="isOauthLoading" @click="handleOauth('google')">
            {{ oauthProviderLoading === 'google' ? $t('common.sending') : 'Google' }}
          </button>
          <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container rounded-xl font-semibold text-sm text-on-surface dark:text-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed" :disabled="isOauthLoading" @click="handleOauth('github')">
            {{ oauthProviderLoading === 'github' ? $t('common.sending') : 'GitHub' }}
          </button>
        </div>

        <div class="flex items-center gap-4 mb-6">
          <div class="flex-1 h-px bg-outline-variant/20" />
          <span class="text-xs text-on-surface-variant font-medium">{{ $t('auth.orUseEmail') }}</span>
          <div class="flex-1 h-px bg-outline-variant/20" />
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSignIn">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('auth.emailLabel') }}</label>
            <input v-model="email" type="email" autocomplete="email" class="w-full bg-surface-container-highest dark:bg-surface-container border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" placeholder="name{'@'}example.com" required >
            <p v-if="emailError" class="mt-2 text-xs text-error">{{ emailError }}</p>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('auth.passwordLabel') }}</label>
              <button type="button" class="text-xs text-primary font-medium hover:underline" @click="handleForgotPassword">{{ $t('auth.forgot') }}</button>
            </div>
            <input v-model="password" type="password" autocomplete="current-password" class="w-full bg-surface-container-highest dark:bg-surface-container border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" :placeholder="$t('auth.passwordPlaceholder')" required >
            <p v-if="passwordError" class="mt-2 text-xs text-error">{{ passwordError }}</p>
          </div>
          <button type="submit" class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-[1.01] active:scale-[0.98] transition-transform shadow-ambient disabled:cursor-not-allowed disabled:opacity-70" :disabled="isSubmitting">
            {{ isSubmitting ? $t('common.sending') : $t('auth.signInBtn') }}
          </button>
        </form>

        <!-- Anonymous -->
        <button class="mt-6 p-4 w-full bg-surface-container-low dark:bg-surface-container rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-container transition-colors text-left" @click="handleAnonymousAccess">
          <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1">incognito</span>
          <div class="flex-1">
            <span class="text-sm font-semibold text-on-surface dark:text-surface">{{ $t('auth.enterAnonymously') }}</span>
            <p class="text-xs text-on-surface-variant">{{ $t('auth.anonymousDesc') }}</p>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </button>

        <p class="text-center text-sm text-on-surface-variant mt-6">
          {{ $t('auth.noAccount') }} <button type="button" class="text-primary font-semibold hover:underline" @click="handleCreateAccount">{{ $t('auth.createAccount') }}</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({
  title: 'Sign In',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const localePath = useLocalePath()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { notify } = useNotifier()
const auth = useAuthState()
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const emailError = ref('')
const passwordError = ref('')
const oauthProviderLoading = ref<'' | 'google' | 'github'>('')
const isOauthLoading = computed(() => oauthProviderLoading.value !== '')
const oauthHandled = ref(false)

const features = [
  { icon: 'sync', label: 'Seamless Synchronization' },
  { icon: 'verified_user', label: 'Privacy-First Engine' },
  { icon: 'bolt', label: 'Pro Performance' },
]

function normalizeRedirectPath(pathValue: string) {
  if (!pathValue || !pathValue.startsWith('/')) return localePath('/tools/clipboard')
  if (pathValue.startsWith('//')) return localePath('/tools/clipboard')
  return pathValue
}

async function handleSignIn() {
  emailError.value = ''
  passwordError.value = ''
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
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    const result = await $fetch<{
      ok: boolean
      reason?: string
      user?: { email: string }
    }>('/api/auth/signin', {
      method: 'POST',
      body: {
        email: normalizedEmail,
        password: password.value,
      },
    })
    if (result.ok && result.user?.email) {
      auth.signIn(result.user.email)
      notify(t('auth.signInSuccess'))
    }
    else if (result.reason === 'AUTH_STORAGE_NOT_CONFIGURED') {
      auth.signIn(normalizedEmail)
      notify(t('auth.signInLocalFallback'))
    }
    else {
      notify(t('auth.signInFailed'))
      return
    }
    const redirect = normalizeRedirectPath(String(route.query.redirect || '').trim())
    await navigateTo(redirect)
  }
  catch (error: unknown) {
    const statusCode = Number((error as { statusCode?: number })?.statusCode || (error as { data?: { statusCode?: number } })?.data?.statusCode || 0)
    if (statusCode === 401) {
      notify(t('auth.invalidCredentials'))
      return
    }
    notify(t('auth.signInFailed'))
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleOauth(provider: 'google' | 'github') {
  if (!runtimeConfig.public.oauthEnabled) {
    notify(t('auth.oauthDisabled'))
    return
  }
  if (oauthProviderLoading.value) return

  oauthProviderLoading.value = provider
  try {
    const redirect = normalizeRedirectPath(String(route.query.redirect || '').trim())
    const response = await $fetch<{ url: string }>('/api/auth/oauth-url', {
      query: {
        provider,
        redirect,
      },
    })
    if (!response.url) throw new Error('Missing auth URL')
    await navigateTo(response.url, { external: true })
  }
  catch (error) {
    console.error(error)
    notify(t('auth.oauthStartFailed'))
  }
  finally {
    oauthProviderLoading.value = ''
  }
}

function handleForgotPassword() {
  notify(t('auth.passwordResetComingSoon'))
}

async function handleAnonymousAccess() {
  await navigateTo(localePath('/tools'))
}

function handleCreateAccount() {
  const redirect = normalizeRedirectPath(String(route.query.redirect || '').trim())
  void navigateTo({
    path: localePath('/auth/signup'),
    query: { redirect },
  })
}

onMounted(async () => {
  if (oauthHandled.value) return
  oauthHandled.value = true

  const oauthStatus = String(route.query.oauth || '').trim().toLowerCase()
  if (!oauthStatus) return

  if (oauthStatus !== 'success') {
    notify(t('auth.oauthFailed'))
    return
  }

  const emailFromCallback = String(route.query.email || '').trim().toLowerCase()
  if (!emailFromCallback) {
    notify(t('auth.oauthFailed'))
    return
  }

  auth.signIn(emailFromCallback)
  notify(t('auth.signInSuccess'))

  const redirect = String(route.query.redirect || '').trim()
  await navigateTo(normalizeRedirectPath(redirect))
})

watch(() => auth.isLoggedIn.value, async (loggedIn) => {
  if (!loggedIn) return
  const redirect = String(route.query.redirect || '').trim()
  await navigateTo(normalizeRedirectPath(redirect))
}, { immediate: true })
</script>
