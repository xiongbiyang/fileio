<template>
  <div class="w-full max-w-5xl">
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div class="space-y-6 lg:col-span-3">
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolC.roomPrefix', { id: currentRoom }) }}</h3>
            <div class="bg-primary-fixed text-on-primary-fixed-variant flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold">
              <span class="h-2 w-2 animate-pulse rounded-full bg-primary" />{{ $t('toolC.active') }}
            </div>
          </div>
          <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-lg p-3 text-xs text-on-surface-variant">
            <p>{{ $t('toolC.devicesOnline', { n: deviceCount }) }}</p>
          </div>
          <button class="bg-surface-container-high dark:bg-surface-container mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-on-surface-variant" @click="$emit('copyRoomLink')">
            <span class="material-symbols-outlined text-lg">share</span>{{ $t('toolC.inviteMembers') }}
          </button>
        </div>

        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
          <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolC.storage') }}</span>
          <div class="bg-surface-container-high mt-3 h-2 overflow-hidden rounded-full"><div class="h-full rounded-full bg-primary" :style="{ width: `${storageUsagePercent}%` }" /></div>
          <div class="mt-2 flex justify-between text-xs text-on-surface-variant"><span>{{ storageUsageLabel }}</span><span>{{ $t('toolC.storageHint') }}</span></div>
        </div>
      </div>

      <div class="bg-surface-container dark:bg-surface-container-high flex min-h-[700px] flex-col rounded-xl p-8 lg:col-span-9">
        <h2 class="font-headline mb-6 text-3xl font-extrabold text-on-surface dark:text-surface">{{ $t('toolC.title') }}</h2>

        <div class="relative mb-4 max-w-md">
          <span class="material-symbols-outlined text-on-surface-variant absolute top-1/2 left-4 -translate-y-1/2">search</span>
          <input v-model="searchQuery" class="bg-surface-container-highest dark:bg-surface-container w-full rounded-xl border-none py-3 pr-4 pl-12 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-fixed dark:text-surface" :placeholder="$t('toolC.searchPlaceholder')">
        </div>

        <div class="mb-6 flex items-center gap-3">
          <button
            v-for="filter in searchFilters"
            :key="filter.key"
            class="rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            :class="activeSearchFilter === filter.key ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant'"
            @click="activeSearchFilter = filter.key"
          >
            {{ filter.label }}
          </button>
          <label class="ml-auto flex items-center gap-2 text-xs text-on-surface-variant" for="clipboard-sort">
            <span class="material-symbols-outlined text-sm">filter_list</span>
            <span>{{ $t('toolC.sortByLabel') }}</span>
            <select
              id="clipboard-sort"
              v-model="activeSort"
              class="bg-surface-container-high dark:bg-surface-container rounded-lg border-none px-2 py-1 text-xs text-on-surface focus:ring-2 focus:ring-primary-fixed dark:text-surface"
            >
              <option v-for="option in sortOptions" :key="option.key" :value="option.key">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="flex-1 space-y-4 overflow-y-auto">
          <div v-if="!filteredMessages.length" class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-10 text-center">
            <p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolC.searchEmptyTitle') }}</p>
            <p class="mt-1 text-xs text-on-surface-variant">{{ $t('toolC.searchEmptyDesc') }}</p>
          </div>
          <div v-for="result in filteredMessages" :key="result.id" class="bg-surface-container-lowest dark:bg-surface-container group rounded-xl p-6 transition-all hover:shadow-ambient">
            <div class="mb-3 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full" :class="result.avatarClass">
                <span class="material-symbols-outlined text-sm text-on-surface-variant">{{ result.avatarIcon }}</span>
              </div>
              <div class="flex-1">
                <span class="text-sm font-bold text-on-surface dark:text-surface">{{ result.sender }}</span>
                <span class="font-label ml-2 text-[10px] uppercase tracking-widest text-on-surface-variant">{{ result.type }} &bull; {{ result.time }}</span>
              </div>
              <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button v-if="result.textContent" class="hover:bg-surface-container-low rounded-lg p-2" @click="$emit('copyToClipboard', result.textContent)"><span class="material-symbols-outlined text-sm text-on-surface-variant">content_copy</span></button>
              </div>
            </div>
            <img v-if="result.type === 'Image'" :src="result.imageSrc" alt="Shared image" class="max-w-xs rounded-lg">
            <a v-else-if="result.type === 'Link'" :href="result.textContent" target="_blank" rel="noopener noreferrer" class="break-all text-sm text-primary hover:underline">
              {{ result.textContent }}
            </a>
            <p v-else class="whitespace-pre-wrap break-words text-sm leading-relaxed text-on-surface-variant">
              {{ result.textContent }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <button class="px-4 py-2 text-sm font-bold text-primary hover:underline" @click="$emit('goBack')">{{ $t('common.goBack') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SearchFilter {
  key: string
  label: string
}

interface SearchSortOption {
  key: string
  label: string
}

interface SearchMessage {
  id: string
  sender: string
  type: string
  time: string
  avatarClass: string
  avatarIcon: string
  imageSrc: string
  textContent: string
}

defineProps<{
  currentRoom: string
  deviceCount: number
  filteredMessages: SearchMessage[]
  searchFilters: SearchFilter[]
  sortOptions: SearchSortOption[]
  storageUsageLabel: string
  storageUsagePercent: number
}>()

const searchQuery = defineModel<string>('searchQuery', { required: true })
const activeSearchFilter = defineModel<string>('activeSearchFilter', { required: true })
const activeSort = defineModel<string>('activeSort', { required: true })

defineEmits<{
  copyRoomLink: []
  copyToClipboard: [text: string]
  goBack: []
}>()
</script>
