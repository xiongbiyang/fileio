<template>
  <div class="w-full max-w-4xl space-y-4 md:space-y-6">
    <div class="bg-surface-container-lowest dark:bg-surface-container-high flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 shadow-ambient md:p-6">
      <div class="flex items-center gap-3">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span class="relative inline-flex h-3 w-3 rounded-full bg-primary" />
        </span>
        <span class="font-headline text-base font-bold text-on-surface dark:text-surface md:text-lg">{{ $t('toolA.title') }}</span>
      </div>
      <span class="bg-primary-fixed/20 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">shield</span>
        {{ $t('toolA.e2eeTunnelActive') }}
      </span>
    </div>

    <div class="bg-surface-container-lowest dark:bg-surface-container-high relative space-y-6 overflow-hidden rounded-2xl p-5 shadow-ambient md:space-y-8 md:p-8">
      <div class="bg-primary/5 pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full blur-3xl" />

      <div class="space-y-3 text-center md:hidden">
        <span class="font-headline text-5xl font-extrabold text-on-surface dark:text-surface">{{ transferProgress }}%</span>
        <p class="text-sm text-on-surface-variant">{{ $t('toolA.mobileComplete') }}</p>
        <div class="bg-surface-container-high dark:bg-surface-container h-3 w-full overflow-hidden rounded-full">
          <div class="primary-gradient h-full rounded-full transition-all duration-300" :style="{ width: `${transferProgress}%` }" />
        </div>
        <p class="text-xs text-on-surface-variant">{{ transferredSize }} / {{ currentFile.size }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3 md:hidden">
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-4 text-center">
          <span class="material-symbols-outlined mb-1 block text-xl text-primary">speed</span>
          <p class="text-lg font-bold text-on-surface dark:text-surface">{{ transferSpeed }}</p>
          <p class="text-[10px] uppercase tracking-wider text-on-surface-variant">{{ $t('toolA.transferSpeedLabel') }}</p>
        </div>
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-4 text-center">
          <span class="material-symbols-outlined mb-1 block text-xl text-primary">schedule</span>
          <p class="text-lg font-bold text-on-surface dark:text-surface">{{ timeRemaining }}</p>
          <p class="text-[10px] uppercase tracking-wider text-on-surface-variant">{{ $t('toolA.estTime') }}</p>
        </div>
      </div>

      <div class="hidden items-start gap-4 md:flex">
        <div class="bg-surface-container-high dark:bg-surface-container flex h-16 w-16 items-center justify-center rounded-xl text-primary">
          <span class="material-symbols-outlined text-4xl">description</span>
        </div>
        <div class="flex-1">
          <h3 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ currentFile.name }}</h3>
          <p class="text-sm text-on-surface-variant">{{ $t('toolA.readyForAssembly') }}</p>
        </div>
        <button class="hover:bg-error-container/20 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-error transition-colors" @click="$emit('cancelTransfer')">
          <span class="material-symbols-outlined">cancel</span>
          {{ $t('common.clear') }}
        </button>
      </div>

      <div class="hidden items-end justify-between md:flex">
        <div>
          <span class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface">{{ transferProgress }}%</span>
          <p class="text-sm font-medium text-on-surface-variant">{{ transferredSize }} / {{ currentFile.size }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold text-primary">{{ transferSpeed }}</p>
          <p class="text-xs text-on-surface-variant">{{ $t('toolA.timeRemaining', { time: timeRemaining }) }}</p>
        </div>
      </div>

      <div class="bg-surface-container-high dark:bg-surface-container hidden h-4 w-full overflow-hidden rounded-full md:block">
        <div class="primary-gradient h-full rounded-full transition-all duration-300" :style="{ width: `${transferProgress}%` }" />
      </div>

      <div class="flex gap-3 md:hidden">
        <button class="bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface flex-1 rounded-xl py-3 text-sm font-semibold transition-transform active:scale-95">
          <span class="material-symbols-outlined text-lg">pause</span>{{ $t('toolA.pause') }}
        </button>
        <button class="bg-error-container/20 flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-error transition-transform active:scale-95" @click="$emit('cancelTransfer')">
          <span class="material-symbols-outlined text-lg">cancel</span>{{ $t('common.clear') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="bg-surface-container dark:bg-surface-container-high space-y-4 rounded-2xl p-6">
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.connectionNodes') }}</span>
        <div class="flex items-center gap-3">
          <div class="bg-surface-container-lowest flex h-10 w-10 items-center justify-center rounded-lg"><span class="material-symbols-outlined text-primary">laptop_mac</span></div>
          <div><p class="truncate text-sm font-bold text-on-surface dark:text-surface">MacBook Pro</p><p class="text-xs text-on-surface-variant">Local</p></div>
          <span class="ml-auto h-2 w-2 rounded-full bg-primary" />
        </div>
        <div class="flex justify-center"><span class="material-symbols-outlined text-outline-variant">sync_alt</span></div>
        <div class="flex items-center gap-3">
          <div class="bg-surface-container-lowest flex h-10 w-10 items-center justify-center rounded-lg"><span class="material-symbols-outlined text-primary">smartphone</span></div>
          <div><p class="truncate text-sm font-bold text-on-surface dark:text-surface">iPhone 15</p><p class="text-xs text-on-surface-variant">Remote</p></div>
          <span class="ml-auto h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>

      <div class="bg-surface-container dark:bg-surface-container-high space-y-3 rounded-2xl p-6">
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.securityParams') }}</span>
        <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Encryption</span><span class="font-bold text-on-surface dark:text-surface">AES-256-GCM</span></div>
        <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Key Length</span><span class="font-bold text-on-surface dark:text-surface">256-bit</span></div>
        <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Tunneling</span><span class="font-bold text-on-surface dark:text-surface">WebRTC P2P</span></div>
      </div>

      <div class="bg-surface-container group relative aspect-video overflow-hidden rounded-2xl">
        <div class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/90 to-primary/30 p-6">
          <p class="text-sm font-bold text-on-primary">{{ $t('toolA.dataNotStored') }}</p>
          <p class="mt-1 text-xs text-on-primary/80">{{ $t('toolA.dataNotStoredDesc') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransferFileSummary } from '~/types/toolPages'

defineProps<{
  currentFile: TransferFileSummary
  transferProgress: number
  transferredSize: string
  transferSpeed: string
  timeRemaining: string
}>()

defineEmits<{
  cancelTransfer: []
}>()
</script>
