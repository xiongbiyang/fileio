<template>
  <div class="w-full max-w-5xl space-y-6">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <span class="bg-primary-fixed text-on-primary-fixed-variant rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{{ $t('toolC.activeSessionLabel') }}</span>
        <h2 class="font-headline mt-2 text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface md:text-5xl">{{ $t('toolC.projectTitle') }}</h2>
      </div>
      <div class="flex gap-3">
        <button class="bg-surface-container-high dark:bg-surface-container flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-on-surface dark:text-surface" @click="$emit('goBack')">
          <span class="material-symbols-outlined text-lg">arrow_back</span>{{ $t('common.goBack') }}
        </button>
        <NuxtLink :to="proWaitlistPath" class="primary-gradient flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">bolt</span>{{ $t('toolC.goPro') }}
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
      <div class="bg-surface-container-low dark:bg-surface-container flex flex-col rounded-[1.5rem] p-8 md:col-span-4">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('toolC.members') }}</h3>
          <span class="bg-surface-container-highest dark:bg-surface-container-high rounded-full px-3 py-1 text-sm font-medium text-on-surface-variant">{{ roomMembers.length }} / 10</span>
        </div>
        <div class="flex-1 space-y-3">
          <div v-for="member in roomMembers" :key="member.name" class="flex items-center gap-3 rounded-xl p-3 transition-colors" :class="member.isAdmin ? 'bg-surface-container-lowest dark:bg-surface-container-high shadow-sm' : 'hover:bg-surface-container'">
            <div class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold" :class="member.avatarClass">{{ member.initials }}</div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-on-surface dark:text-surface">{{ member.name }}</p>
              <p class="text-[10px] uppercase tracking-tight" :class="member.isAdmin ? 'font-bold text-primary' : 'text-on-surface-variant'">{{ member.role }}</p>
            </div>
          </div>
        </div>
        <button class="bg-surface-container-highest dark:bg-surface-container-high mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-error" @click="$emit('clearRoom')">
          <span class="material-symbols-outlined text-lg">delete_sweep</span>{{ $t('toolC.clearRoomBtn') }}
        </button>
      </div>

      <div class="space-y-6 md:col-span-8">
        <div class="bg-surface-container-low dark:bg-surface-container rounded-[1.5rem] p-8">
          <div class="mb-6 flex items-start gap-4">
            <span class="material-symbols-outlined text-4xl text-primary-fixed-dim">how_to_vote</span>
            <div>
              <h3 class="font-headline text-2xl font-bold text-on-surface dark:text-surface">{{ $t('toolC.voteNextFeature') }}</h3>
              <p class="mt-1 text-sm text-on-surface-variant">{{ $t('toolC.voteDesc') }}</p>
              <p class="mt-1 text-xs text-on-surface-variant/70">{{ $t('toolC.voteMockHint') }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div v-for="feature in voteFeatures" :key="feature.icon" class="bg-surface-container-lowest dark:bg-surface-container-high group cursor-pointer rounded-2xl p-5 transition-all hover:bg-primary-fixed/20 hover:ring-2 hover:ring-primary-fixed-dim">
              <div class="mb-2 flex items-center justify-between">
                <span class="bg-primary-fixed rounded-lg p-2"><span class="material-symbols-outlined text-lg text-primary">{{ feature.icon }}</span></span>
                <span class="text-[10px] font-bold text-primary">{{ feature.votes }}</span>
              </div>
              <h4 class="mt-3 text-sm font-bold text-on-surface dark:text-surface">{{ feature.title }}</h4>
              <p class="mt-2 text-xs leading-relaxed text-on-surface-variant">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <div class="primary-gradient relative flex flex-col items-center gap-8 overflow-hidden rounded-[1.5rem] p-10 md:flex-row">
          <div class="flex-1">
            <h3 class="font-headline text-3xl font-extrabold text-on-primary">{{ $t('toolC.unlockPro') }}</h3>
            <p class="mt-2 text-lg text-primary-fixed/80">{{ $t('toolC.unlockProDesc') }}</p>
          </div>
          <NuxtLink :to="proWaitlistPath" class="bg-primary-fixed text-on-primary-fixed-variant whitespace-nowrap rounded-xl px-8 py-4 font-bold transition-transform hover:scale-105">
            {{ $t('toolC.joinWaitlist') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RoomMember {
  name: string
  initials: string
  role: string
  isAdmin: boolean
  avatarClass: string
}

interface VoteFeature {
  icon: string
  title: string
  votes: string
  desc: string
}

defineProps<{
  proWaitlistPath: string
  roomMembers: RoomMember[]
  voteFeatures: VoteFeature[]
}>()

defineEmits<{
  clearRoom: []
  goBack: []
}>()
</script>
