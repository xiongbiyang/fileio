<template>
  <div class="w-full max-w-4xl">
    <div class="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
      <div class="space-y-6 md:col-span-5">
        <div class="bg-primary-fixed/30 inline-flex items-center gap-3 rounded-full px-4 py-2">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span class="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
          <span class="text-sm font-semibold text-primary">{{ $t('toolA.pairingInProgress') }}</span>
        </div>
        <h2 class="font-headline text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolA.verifyConnection') }}</h2>
        <p class="text-xl leading-relaxed text-on-surface-variant">{{ $t('toolA.deviceRequesting') }}</p>

        <div class="bg-surface-container-low dark:bg-surface-container space-y-4 rounded-xl p-6">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">shield_lock</span>
            <span class="text-sm font-semibold uppercase tracking-wider text-on-surface dark:text-surface">{{ $t('toolA.securityTip') }}</span>
          </div>
          <p class="text-sm leading-relaxed text-on-surface-variant">{{ $t('toolA.securityTipDesc') }}</p>
        </div>
      </div>

      <div class="bg-surface-container-lowest dark:bg-surface-container-high flex flex-col items-center rounded-xl p-10 text-center shadow-ambient md:col-span-7 md:p-14">
        <div class="mb-6 grid grid-cols-4 gap-4">
          <div v-for="digit in verificationDigits" :key="digit" class="bg-surface-container dark:bg-surface-container flex h-20 w-16 items-center justify-center rounded-xl font-headline text-4xl font-black text-primary shadow-inner md:h-24 md:w-20 md:text-5xl">
            {{ digit }}
          </div>
        </div>
        <p class="mb-10 text-on-surface-variant">{{ $t('toolA.checkDeviceCode') }}</p>

        <div class="flex w-full flex-col justify-center gap-4 sm:flex-row">
          <button class="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-container px-8 py-4 font-bold text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98]" @click="$emit('confirmPairing')">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">check_circle</span>
            {{ $t('toolA.confirmConnect') }}
          </button>
          <button class="bg-surface-container-high dark:bg-surface-container flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-semibold text-on-surface dark:text-surface" @click="$emit('denyPairing')">
            <span class="material-symbols-outlined">close</span>
            {{ $t('toolA.deny') }}
          </button>
        </div>

        <div class="mt-12 flex w-full items-center justify-center gap-6 pt-8">
          <div class="flex flex-col items-center gap-2">
            <div class="bg-secondary-container flex h-12 w-12 items-center justify-center rounded-full">
              <span class="material-symbols-outlined text-on-surface-variant">laptop_mac</span>
            </div>
            <span class="text-xs font-medium text-on-surface-variant">Vault Node</span>
          </div>
          <span class="material-symbols-outlined text-primary">sync_alt</span>
          <div class="flex flex-col items-center gap-2">
            <div class="bg-secondary-container flex h-12 w-12 items-center justify-center rounded-full">
              <span class="material-symbols-outlined text-on-surface-variant">smartphone</span>
            </div>
            <span class="text-xs font-medium text-on-surface-variant">iPhone 15</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  verificationDigits: string[]
}>()

defineEmits<{
  confirmPairing: []
  denyPairing: []
}>()
</script>
