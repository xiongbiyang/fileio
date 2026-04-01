<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition ease-in duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <!-- Glass Backdrop -->
        <div class="absolute inset-0 bg-on-surface/10 backdrop-blur-sm" />

        <!-- Modal -->
        <div class="relative w-full max-w-lg bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-10 shadow-ambient">
          <!-- Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-error/10 rounded-t-xl" />

          <!-- Error Icon -->
          <div class="flex justify-center mb-6">
            <div class="w-20 h-20 rounded-full bg-error-container/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-error" style="font-variation-settings: 'FILL' 1">warning</span>
            </div>
          </div>

          <!-- Error Code -->
          <div class="text-center mb-4">
            <span class="text-xs uppercase tracking-widest text-on-surface-variant font-semibold bg-surface-container-highest dark:bg-surface-container px-3 py-1 rounded-full">
              {{ $t('errorModal.errorCode') }}: {{ code }}
            </span>
          </div>

          <!-- Message -->
          <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface text-center mb-4 leading-tight">{{ title }}</h2>
          <p class="text-on-surface-variant text-center leading-relaxed mb-8">{{ description }}</p>

          <!-- Buttons -->
          <div class="flex flex-col gap-3">
            <button class="w-full py-4 px-8 primary-gradient text-on-primary font-semibold rounded-lg shadow-ambient flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform" @click="$emit('retry')">
              <span class="material-symbols-outlined">refresh</span>
              {{ $t('errorModal.retry') }}
            </button>
            <button class="w-full py-4 px-8 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container transition-colors" @click="$emit('dashboard')">
              <span class="material-symbols-outlined">dashboard</span>
              {{ $t('errorModal.returnDashboard') }}
            </button>
          </div>

          <!-- Support Link -->
          <div class="mt-6 pt-6 text-center">
            <a href="#" class="text-sm text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1">
              {{ $t('errorModal.contactSupport') }}
              <span class="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  code?: string
  title: string
  description: string
}>()

defineEmits<{
  retry: []
  dashboard: []
}>()
</script>
