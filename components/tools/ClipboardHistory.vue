<template>
  <div class="w-full max-w-5xl space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolC.roomHistoryTitle') }}</h1>
        <p class="mt-2 text-on-surface-variant">{{ $t('toolC.roomHistoryDesc') }}</p>
      </div>
      <button class="bg-surface-container-high dark:bg-surface-container rounded-lg px-4 py-2 text-sm font-semibold text-on-surface dark:text-surface" @click="$emit('goBack')">
        {{ $t('common.goBack') }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div v-for="stat in historyStats" :key="stat.icon" class="bg-surface-container-lowest dark:bg-surface-container-high flex h-32 items-center gap-4 rounded-xl p-6">
        <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
          <span class="material-symbols-outlined text-2xl text-primary">{{ stat.icon }}</span>
        </div>
        <div>
          <p class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface">{{ stat.value }}</p>
          <p class="text-xs font-medium text-on-surface-variant">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <div class="bg-surface-container dark:bg-surface-container-high overflow-hidden rounded-xl">
      <div class="bg-surface-container-low dark:bg-surface-container flex items-center gap-6 px-6 py-4">
        <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolC.allRooms') }}</span>
      </div>
      <div v-for="(histRoom, index) in pastRooms" :key="histRoom.id" class="hover:bg-surface-container-low/50 flex items-center gap-4 px-6 py-5 transition-colors">
        <div class="bg-primary-fixed-dim flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-primary">
          {{ histRoom.id.substring(0, 2) }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-on-surface dark:text-surface">{{ histRoom.name }}</p>
          <p class="truncate text-xs text-on-surface-variant">{{ histRoom.desc }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="histRoom.active" class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span v-else class="h-2 w-2 rounded-full bg-on-surface-variant/40" />
          <span class="text-xs font-medium" :class="histRoom.active ? 'text-primary' : 'text-on-surface-variant'">{{ histRoom.active ? $t('toolC.active') : $t('toolC.expired') }}</span>
        </div>
        <span class="text-xs text-on-surface-variant">{{ histRoom.time }}</span>
        <button v-if="histRoom.active" class="bg-primary/5 hover:bg-primary/10 rounded-lg px-4 py-2 text-xs font-bold text-primary transition-colors" @click="$emit('joinExistingRoom', histRoom.id)">{{ $t('toolC.rejoin') }}</button>
        <button v-else class="bg-surface-container-highest hover:bg-surface-container-high rounded-lg px-4 py-2 text-xs font-bold text-on-surface-variant transition-colors" @click="$emit('joinExistingRoom', histRoom.id)">{{ $t('toolC.revive') }}</button>
        <button class="p-2 text-on-surface-variant transition-colors hover:text-error" @click="$emit('deleteRoom', index)"><span class="material-symbols-outlined text-lg">delete</span></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HistoryStat {
  icon: string
  value: string
  label: string
}

interface PastRoomItem {
  id: string
  name: string
  desc: string
  active: boolean
  time: string
}

defineProps<{
  historyStats: HistoryStat[]
  pastRooms: PastRoomItem[]
}>()

defineEmits<{
  goBack: []
  joinExistingRoom: [id: string]
  deleteRoom: [index: number]
}>()
</script>
