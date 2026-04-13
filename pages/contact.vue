<template>
  <div class="pt-8 pb-16 px-8 min-h-screen">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="font-headline text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface">
        {{ $t('contact.title') }}
      </h1>
      <p class="text-on-surface-variant mt-2">{{ $t('contact.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Contact Form -->
      <div class="lg:col-span-7 bg-surface-container-low dark:bg-surface-container rounded-xl p-8 md:p-12">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1 mb-2">{{ $t('contact.nameLabel') }}</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-surface-container-highest dark:bg-surface-container-high border-none rounded-lg p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
              :placeholder="$t('contact.namePlaceholder')"
            >
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1 mb-2">{{ $t('contact.emailLabel') }}</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full bg-surface-container-highest dark:bg-surface-container-high border-none rounded-lg p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
              :placeholder="$t('contact.emailPlaceholder')"
              required
            >
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1 mb-2">{{ $t('contact.messageLabel') }}</label>
            <textarea
              v-model="form.message"
              class="w-full bg-surface-container-highest dark:bg-surface-container-high border-none rounded-lg p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              rows="6"
              :placeholder="$t('contact.messagePlaceholder')"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-[1.01] active:scale-[0.98] transition-transform disabled:opacity-50"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? $t('common.sending') : $t('common.sendMessage') }}
          </button>
          <p v-if="submitted" class="text-primary text-sm font-medium text-center">{{ $t('contact.successMsg') }}</p>
        </form>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-5 flex flex-col gap-6">
        <!-- Security Card -->
        <div class="bg-primary text-on-primary rounded-xl p-8 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary-container opacity-20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <span class="material-symbols-outlined text-3xl mb-4 block relative z-10">shield</span>
          <h3 class="font-headline text-lg font-bold mb-2 relative z-10">{{ $t('contact.secureTitle') }}</h3>
          <p class="text-on-primary/80 text-sm leading-relaxed mb-4 relative z-10">
            {{ $t('contact.secureDesc') }}
          </p>
          <div class="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10 relative z-10">
            <span class="text-xs text-on-primary/60 font-label uppercase tracking-wider">{{ $t('contact.directEmail') }}</span>
            <p class="font-medium mt-1">support@toolport.dev</p>
          </div>
        </div>

        <!-- Support Status -->
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-8 shadow-ambient">
          <div class="flex items-center gap-3 mb-4">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('contact.supportStatus') }}</span>
          </div>
          <p class="text-on-surface-variant text-sm">{{ $t('contact.responseTime') }} <span class="font-bold text-on-surface dark:text-surface">{{ $t('contact.within24h') }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'tool' })
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const canonicalUrl = computed(() =>
  new URL(localePath('/contact'), runtimeConfig.public.siteUrl || 'https://toolport.dev').toString(),
)
useHead({
  title: () => t('seo.contact.title'),
  meta: [
    { name: 'description', content: () => t('seo.contact.desc') },
  ],
  link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
})
useSeoMeta({
  ogTitle: () => t('seo.contact.title'),
  ogDescription: () => t('seo.contact.desc'),
  ogImage: 'https://toolport.dev/og-image.png',
})

const form = reactive({ name: '', email: '', message: '' })
const isSubmitting = ref(false)
const submitted = ref(false)
const { notify } = useNotifier()

async function handleSubmit() {
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  submitted.value = true
  isSubmitting.value = false
  notify(t('contact.successMsg'))
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>
