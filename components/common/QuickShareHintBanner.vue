<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="reason"
      class="mx-auto mb-4 flex w-full max-w-3xl items-start gap-3 rounded-2xl border border-primary/20 bg-secondary-container/70 p-4 shadow-sm dark:bg-surface-container-high"
      role="status"
      aria-live="polite"
    >
      <span class="material-symbols-outlined mt-0.5 text-primary">lightbulb</span>
      <div class="flex-1 text-sm text-on-surface dark:text-surface">
        <p class="leading-relaxed">
          {{ message }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            class="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary shadow hover:bg-primary/90"
            @click="emit('switch-to-quick-share')"
          >
            <span class="material-symbols-outlined text-base">cloud_upload</span>
            {{ t('toolA.quickShareSwitch') }}
          </button>
          <button
            class="rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container"
            @click="emit('dismiss')"
          >
            {{ t('toolA.quickShareDismiss') }}
          </button>
        </div>
      </div>
      <button
        class="rounded-md p-1 text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container"
        :aria-label="t('toolA.quickShareDismiss')"
        @click="emit('dismiss')"
      >
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  reason: 'big-file' | 'relay' | 'retry' | null
}>()

const emit = defineEmits<{
  'dismiss': []
  'switch-to-quick-share': []
}>()

const { t } = useI18n()

const message = computed(() => {
  switch (props.reason) {
    case 'big-file': return t('toolA.quickShareHintBigFile')
    case 'relay': return t('toolA.quickShareHintRelay')
    case 'retry': return t('toolA.quickShareHintRetry')
    default: return ''
  }
})
</script>
