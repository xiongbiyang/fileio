<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition ease-in duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-on-surface/10 backdrop-blur-sm" @click="save" />

        <!-- Modal -->
        <div class="relative w-full max-w-2xl bg-surface-container-lowest dark:bg-surface-container-high rounded-4xl shadow-ambient overflow-hidden">
          <!-- Header -->
          <div class="px-10 pt-10 pb-6 flex justify-between items-start">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1">cookie</span>
              <div>
                <span class="text-xs font-bold text-primary uppercase tracking-widest">Digital Sanctuary</span>
                <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('cookie.title') }}</h2>
              </div>
            </div>
            <button class="hover:bg-surface-container-low p-2 rounded-full transition-colors" @click="save">
              <span class="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>

          <p class="px-10 text-on-surface-variant text-sm mb-6">{{ $t('cookie.desc') }}</p>

          <!-- Cookie Options -->
          <div class="px-10 pb-8 space-y-4 max-h-[512px] overflow-y-auto">
            <div v-for="cookie in cookies" :key="cookie.key" class="p-6 bg-surface-container-low dark:bg-surface-container rounded-2xl flex items-start gap-6">
              <span class="material-symbols-outlined text-primary mt-1">{{ cookie.icon }}</span>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-on-surface dark:text-surface text-sm">{{ cookie.title }}</h3>
                  <span v-if="cookie.required" class="text-[10px] font-bold text-primary-container bg-primary-fixed px-2 py-0.5 rounded-full">{{ $t('cookie.required') }}</span>
                </div>
                <p class="text-on-surface-variant text-xs leading-relaxed">{{ cookie.desc }}</p>
              </div>
              <button
                class="w-10 h-5 rounded-full relative transition-colors flex-shrink-0 mt-1"
                :class="cookie.required ? 'bg-primary-container/30 cursor-not-allowed' : (cookie.enabled ? 'bg-primary-container' : 'bg-surface-container-high')"
                :disabled="cookie.required"
                @click="cookie.enabled = !cookie.enabled"
              >
                <span class="absolute top-0.5 bg-surface-container-lowest w-4 h-4 rounded-full transition-all shadow-sm" :class="(cookie.required || cookie.enabled) ? 'left-5' : 'left-0.5'" />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-10 py-8 bg-surface-container-lowest dark:bg-surface-container-high flex items-center justify-between gap-4">
            <NuxtLink :to="localePath('/privacy')" class="text-xs text-primary font-medium hover:underline">{{ $t('cookie.privacyLink') }}</NuxtLink>
            <div class="flex gap-3">
              <button class="px-6 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-colors" @click="save">
                {{ $t('cookie.savePreferences') }}
              </button>
              <button class="px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform" @click="acceptAll">
                {{ $t('cookie.acceptAll') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

const show = ref(false)

const cookies = reactive([
  { key: 'necessary', icon: 'verified_user', title: 'Necessary', desc: 'Essential for the website to function. These cannot be disabled.', required: true, enabled: true },
  { key: 'analytics', icon: 'monitoring', title: 'Analytics', desc: 'Help us understand how visitors interact with our tools.', required: false, enabled: false },
  { key: 'functional', icon: 'settings_suggest', title: 'Functional', desc: 'Enable enhanced functionality and personalization.', required: false, enabled: false },
])

onMounted(() => {
  if (!localStorage.getItem('tp_cookie_consent')) {
    show.value = true
  }
})

function save() {
  localStorage.setItem('tp_cookie_consent', JSON.stringify(
    cookies.reduce((acc, c) => ({ ...acc, [c.key]: c.enabled }), {})
  ))
  show.value = false
}

function acceptAll() {
  cookies.forEach(c => c.enabled = true)
  save()
}
</script>
