<template>
  <div class="relative w-full max-w-4xl">
    <div class="absolute top-0 left-1/2 z-50 -translate-x-1/2 -translate-y-4 animate-bounce">
      <div class="bg-error-container text-on-error-container flex items-center gap-2 rounded-full px-6 py-3 shadow-lg">
        <span class="material-symbols-outlined">cloud_off</span>
        <span class="text-sm font-bold uppercase tracking-wide">{{ $t('toolA.systemOffline') }}</span>
      </div>
    </div>

    <div class="pointer-events-none opacity-30 blur-md">
      <div class="bg-surface-container-low dark:bg-surface-container h-64 rounded-xl p-8" />
    </div>

    <div class="bg-surface-container-lowest/20 absolute inset-0 z-40 flex items-center justify-center backdrop-blur-[2px]">
      <div class="bg-surface-container-lowest dark:bg-surface-container-high w-full max-w-md rounded-xl p-10 text-center shadow-ambient">
        <div class="relative mx-auto mb-8 h-24 w-24">
          <div class="absolute inset-0 rounded-full border-4 border-primary/10" />
          <div class="absolute inset-0 animate-spin rounded-full border-4 border-t-primary" style="animation-duration: 3s" />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="material-symbols-outlined animate-pulse text-4xl text-primary">sync</span>
          </div>
        </div>

        <span class="bg-error/10 rounded px-2 py-0.5 text-[10px] font-black uppercase text-error">{{ $t('toolA.offline') }}</span>
        <h3 class="font-headline mt-4 text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('toolA.connectionInterrupted') }}</h3>
        <p class="mt-2 text-sm font-medium text-on-surface-variant">{{ $t('toolA.reconnectAttempt', { n: reconnectAttempt, max: 3 }) }}</p>

        <div class="mt-8 flex flex-col gap-3">
          <button v-if="!isReceiver" class="bg-surface-container-high dark:bg-surface-container hover:bg-surface-container-highest flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-on-surface dark:text-surface" @click="$emit('refreshQr')">
            <span class="material-symbols-outlined">qr_code_2</span>
            {{ $t('toolA.refreshQrFallback') }}
          </button>
          <p v-else class="text-center text-sm text-on-surface-variant">{{ $t('toolA.askPcToRefresh') }}</p>
          <button class="w-full py-3 font-bold text-primary hover:underline">{{ $t('toolA.checkNetwork') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reconnectAttempt: number
  isReceiver: boolean
}>()

defineEmits<{
  refreshQr: []
}>()
</script>
