<template>
  <div class="w-full max-w-5xl">
    <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div class="bg-surface-container-low dark:bg-surface-container relative overflow-hidden rounded-xl p-10 md:p-12 lg:col-span-8">
        <div class="absolute top-0 right-0 p-8 opacity-10">
          <span class="material-symbols-outlined text-9xl text-primary" style="font-variation-settings: 'FILL' 1">check_circle</span>
        </div>

        <div class="mb-4 flex items-center gap-3">
          <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1">verified</span>
          <span class="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.transmissionComplete') }}</span>
        </div>

        <h2 class="font-headline mb-6 text-5xl leading-tight font-extrabold tracking-tight text-on-surface dark:text-surface md:text-6xl">{{ $t('toolA.transferSuccessful') }}</h2>
        <p class="mb-10 max-w-xl text-lg leading-relaxed text-on-surface-variant">{{ $t('toolA.successDesc') }}</p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8 shadow-ambient">
            <div class="mb-4 flex items-center gap-3">
              <div class="bg-primary-fixed/30 flex h-10 w-10 items-center justify-center rounded-lg"><span class="material-symbols-outlined text-primary">description</span></div>
              <span class="bg-primary-fixed text-on-primary-fixed-variant rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">{{ $t('toolA.encrypted') }}</span>
            </div>
            <h4 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ currentFile.name }}</h4>
            <div class="mt-3 space-y-1 text-sm text-on-surface-variant">
              <p>{{ $t('toolA.fileSize') }}: {{ currentFile.size }}</p>
              <p>{{ $t('toolA.fileType') }}: PDF</p>
            </div>
          </div>

          <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8 shadow-ambient">
            <div class="mb-4 flex items-center gap-3">
              <div class="bg-primary-fixed/30 flex h-10 w-10 items-center justify-center rounded-lg"><span class="material-symbols-outlined text-primary">speed</span></div>
              <span class="bg-primary-fixed text-on-primary-fixed-variant flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                <span class="h-1.5 w-1.5 rounded-full bg-primary" /> {{ $t('toolA.stable') }}
              </span>
            </div>
            <h4 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('toolA.transferMetrics') }}</h4>
            <div class="mt-3 space-y-1 text-sm text-on-surface-variant">
              <p>{{ $t('toolA.duration') }}: 1.4s</p>
              <p>{{ $t('toolA.throughput') }}: 256 MB/s</p>
            </div>
          </div>
        </div>

        <div class="mt-8 flex gap-4">
          <button class="primary-gradient rounded-xl px-6 py-3 text-sm font-bold text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98]" @click="$emit('startNewTransfer')">
            {{ $t('toolA.newTransfer') }}
          </button>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-4">
        <div class="bg-surface-container-high dark:bg-surface-container overflow-hidden rounded-xl p-8">
          <h3 class="font-headline mb-4 text-2xl font-bold text-on-surface dark:text-surface">{{ $t('toolA.beyondTransfer') }}</h3>
          <p class="mb-6 text-sm text-on-surface-variant">{{ $t('toolA.beyondTransferDesc') }}</p>
          <div class="bg-surface-container-lowest dark:bg-surface-container-high mb-6 rounded-lg p-6">
            <p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.needPersistentRoom') }}</p>
            <p class="mt-1 text-xs text-on-surface-variant">{{ $t('toolA.tryClipboard') }}</p>
          </div>
          <NuxtLink :to="localePath('/tools/clipboard')" class="primary-gradient flex w-full items-center justify-center gap-2 rounded-lg py-4 text-sm font-bold text-on-primary transition-transform hover:scale-[1.01] active:scale-[0.95]">
            {{ $t('toolA.initClipboard') }}
            <span class="material-symbols-outlined">arrow_forward</span>
          </NuxtLink>
        </div>

        <div class="bg-surface-container-low dark:bg-surface-container flex items-center gap-4 rounded-xl p-8">
          <span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1">shield_lock</span>
          <div>
            <h4 class="font-headline text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.zeroKnowledge') }}</h4>
            <p class="text-xs text-on-surface-variant">{{ $t('toolA.zeroKnowledgeDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TransferFileSummary {
  name: string
  size: string
}

defineProps<{
  currentFile: TransferFileSummary
}>()

defineEmits<{
  startNewTransfer: []
}>()

const localePath = useLocalePath()
</script>
