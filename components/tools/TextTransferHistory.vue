<template>
  <div class="w-full max-w-5xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolA.transferHistoryTitle') }}</h2>
        <p class="mt-2 text-on-surface-variant">{{ $t('toolA.transferHistoryDesc') }}</p>
      </div>
      <button class="bg-surface-container-high dark:bg-surface-container rounded-lg px-4 py-2 text-sm font-semibold text-on-surface dark:text-surface" @click="$emit('goBack')">{{ $t('common.goBack') }}</button>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div v-for="stat in historyStats" :key="stat.icon" class="bg-surface-container-lowest dark:bg-surface-container-high relative overflow-hidden rounded-xl p-6">
        <span class="material-symbols-outlined absolute top-4 right-4 text-5xl text-primary/5">{{ stat.icon }}</span>
        <p class="font-headline relative z-10 text-3xl font-extrabold text-on-surface dark:text-surface">{{ stat.value }}</p>
        <p class="relative z-10 mt-1 text-xs font-medium text-on-surface-variant">{{ stat.label }}</p>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        v-for="tab in historyTabs"
        :key="tab.key"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        :class="historyFilter === tab.key ? 'primary-gradient text-on-primary' : 'bg-surface-container-high dark:bg-surface-container text-on-surface-variant'"
        @click="$emit('updateHistoryFilter', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="bg-surface-container dark:bg-surface-container-high overflow-hidden rounded-xl">
      <div class="bg-surface-container-low dark:bg-surface-container grid grid-cols-12 px-6 py-4">
        <span class="col-span-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.contentType') }}</span>
        <span class="col-span-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.deviceOrigin') }}</span>
        <span class="col-span-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.timestamp') }}</span>
        <span class="col-span-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.status') }}</span>
        <span class="col-span-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.actions') }}</span>
      </div>
      <div v-for="item in transferHistoryItems" :key="item.name" class="group grid grid-cols-12 items-center px-6 py-5 transition-colors hover:bg-surface-container-low/50">
        <div class="col-span-4 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="item.iconBg"><span class="material-symbols-outlined" :class="item.iconColor">{{ item.icon }}</span></div>
          <div><p class="text-sm font-semibold text-on-surface dark:text-surface">{{ item.name }}</p><p class="text-xs text-on-surface-variant">{{ item.size }}</p></div>
        </div>
        <div class="col-span-3 flex items-center gap-2"><span class="material-symbols-outlined text-lg text-on-surface-variant">{{ item.deviceIcon }}</span><span class="text-sm text-on-surface dark:text-surface">{{ item.device }}</span></div>
        <span class="col-span-2 text-sm text-on-surface-variant">{{ item.time }}</span>
        <div class="col-span-2">
          <span class="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold" :class="item.statusClass">
            <span class="h-1.5 w-1.5 rounded-full" :class="item.dotClass" />{{ item.status }}
          </span>
        </div>
        <div class="col-span-1 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button class="rounded p-1.5 text-on-surface-variant transition-colors hover:text-error"><span class="material-symbols-outlined text-lg">delete</span></button>
        </div>
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

interface TransferHistoryItem {
  name: string
  size: string
  icon: string
  iconBg: string
  iconColor: string
  device: string
  deviceIcon: string
  time: string
  status: string
  statusClass: string
  dotClass: string
}

defineProps<{
  historyFilter: string
  historyStats: HistoryStat[]
  transferHistoryItems: TransferHistoryItem[]
}>()

defineEmits<{
  goBack: []
  updateHistoryFilter: [value: string]
}>()

const { t } = useI18n()
const historyTabs = computed(() => [
  { key: 'All', label: t('toolA.historyTabAll') },
  { key: 'Pending', label: t('toolA.historyTabPending') },
  { key: 'Failed', label: t('toolA.historyTabFailed') },
])
</script>
