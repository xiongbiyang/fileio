<template>
  <div class="w-full max-w-5xl">
    <div class="mb-10">
      <h1 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface md:text-5xl">
        {{ $t('toolC.title') }}
      </h1>
      <p class="mt-2 max-w-2xl text-on-surface-variant">
        {{ $t('toolC.subtitle') }}
      </p>
      <div class="bg-secondary-container/30 mt-4 max-w-2xl rounded-xl px-4 py-3">
        <p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolC.cloudNoticeTitle') }}</p>
        <p class="mt-1 text-xs leading-relaxed text-on-surface-variant">{{ $t('toolC.cloudNoticeDesc') }}</p>
      </div>
    </div>

    <div class="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div class="bg-surface-container-lowest dark:bg-surface-container-high flex flex-col gap-6 rounded-4xl p-10 shadow-ambient lg:col-span-5">
        <div class="bg-primary-fixed flex h-14 w-14 items-center justify-center rounded-2xl">
          <span class="material-symbols-outlined text-2xl text-primary">add_circle</span>
        </div>
        <div>
          <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('toolC.createTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-on-surface-variant">
            {{ $t('toolC.createDesc') }}
          </p>
        </div>

        <label class="flex cursor-pointer items-center gap-3">
          <input v-model="enableE2ee" class="h-5 w-5 rounded border-outline-variant accent-primary" type="checkbox">
          <div>
            <span class="text-sm font-medium text-on-surface dark:text-surface">{{ $t('toolC.enableE2ee') }}</span>
            <p class="text-xs text-on-surface-variant">{{ $t('toolC.e2eeHelp') }}</p>
          </div>
        </label>

        <button class="primary-gradient w-full rounded-2xl py-5 text-sm font-bold uppercase tracking-wider text-on-primary shadow-[0_10px_20px_rgba(0,81,71,0.2)] transition-transform hover:scale-[1.02] active:scale-95" @click="$emit('createRoom')">
          {{ $t('toolC.createBtn') }}
        </button>
      </div>

      <div class="bg-surface-container-low dark:bg-surface-container flex flex-col gap-6 rounded-4xl p-10 lg:col-span-7">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-2xl text-primary">key</span>
          <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('toolC.joinTitle') }}</h2>
        </div>
        <p class="text-sm leading-relaxed text-on-surface-variant">
          {{ $t('toolC.joinDesc') }}
        </p>

        <div class="flex gap-3">
          <div class="relative flex-1">
            <span class="font-label text-outline absolute top-2 left-4 text-xs font-bold uppercase tracking-widest">{{ $t('toolC.roomIdLabel') }}</span>
            <input
              v-model="joinRoomId"
              type="text"
              class="bg-surface-container-lowest dark:bg-surface-container-high w-full rounded-2xl border-none px-6 pt-8 pb-4 text-2xl font-headline font-extrabold tracking-wider text-primary uppercase focus:ring-2 focus:ring-primary/20"
              :placeholder="$t('toolC.roomIdPlaceholder')"
              maxlength="6"
              @keydown.enter="$emit('joinRoom')"
            >
          </div>
          <button class="bg-primary rounded-2xl px-10 py-5 text-sm font-bold uppercase tracking-wider text-on-primary transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50" :disabled="joinRoomId.length < 6" @click="$emit('joinRoom')">
            {{ $t('common.join') }}
          </button>
        </div>
      </div>
    </div>

    <div class="mb-6 flex justify-end">
      <button class="bg-surface-container-high dark:bg-surface-container hover:bg-surface-container flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-on-surface dark:text-surface transition-colors" @click="$emit('openHistory')">
        <span class="material-symbols-outlined text-lg">history</span>
        {{ $t('toolC.roomHistoryTitle') }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div v-for="step in howItWorks" :key="step.num" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 shadow-ambient">
        <span class="font-headline text-4xl font-extrabold text-primary-fixed-dim/40">{{ step.num }}</span>
        <h3 class="font-headline mt-2 mb-1 font-bold text-on-surface dark:text-surface">{{ step.title }}</h3>
        <p class="text-sm leading-relaxed text-on-surface-variant">{{ step.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HowItWorksStep {
  num: string
  title: string
  desc: string
}

defineProps<{
  howItWorks: HowItWorksStep[]
}>()

const joinRoomId = defineModel<string>('joinRoomId', { required: true })
const enableE2ee = defineModel<boolean>('enableE2ee', { required: true })

defineEmits<{
  createRoom: []
  joinRoom: []
  openHistory: []
}>()
</script>
