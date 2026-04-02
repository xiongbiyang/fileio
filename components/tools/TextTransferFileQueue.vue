<template>
  <div class="w-full max-w-4xl space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <span class="bg-primary-fixed text-on-primary-fixed-variant rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{{ $t('toolA.activeSession') }}</span>
        <h2 class="font-headline mt-2 text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolA.fileQueue') }}</h2>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-primary">{{ fileQueue.length }} / 10 {{ $t('toolA.filesSelected') }}</p>
        <button class="mt-1 text-sm text-on-surface-variant transition-colors hover:text-error" @click="$emit('clearQueue')">{{ $t('toolA.cancelAll') }}</button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 space-y-4 lg:col-span-8">
        <div class="bg-surface-container-low dark:bg-surface-container group flex cursor-pointer items-center gap-4 rounded-xl p-8 transition-colors hover:bg-primary-fixed/10" @click="triggerFileInput">
          <span class="material-symbols-outlined text-3xl text-primary">add_circle</span>
          <div>
            <p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.addMoreFiles') }}</p>
            <p class="text-xs text-on-surface-variant">{{ $t('toolA.dragOrClick') }}</p>
          </div>
        </div>
        <input ref="fileInput" multiple hidden type="file" @change="handleFileSelect">

        <div class="bg-surface-container dark:bg-surface-container-high overflow-hidden rounded-xl">
          <div v-for="(file, index) in fileQueue" :key="`${file.name}-${index}`" class="bg-surface-container-lowest dark:bg-surface-container-high flex items-center p-5" :class="{ 'mt-3 rounded-xl': index > 0 }">
            <div class="bg-primary-fixed/30 text-primary-container flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
              <span class="material-symbols-outlined">description</span>
            </div>
            <div class="ml-3 min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-on-surface dark:text-surface">{{ file.name }}</p>
              <p class="text-xs text-on-surface-variant">{{ file.size }}</p>
            </div>
            <span class="bg-primary-fixed text-on-primary-fixed-variant rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{{ $t('toolA.ready') }}</span>
            <button class="ml-3 text-outline transition-colors hover:text-error" @click="$emit('removeFile', index)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <button v-if="fileQueue.length" class="primary-gradient flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-on-primary transition-transform hover:scale-[1.01] active:scale-[0.98]" @click="$emit('startTransfer')">
          <span class="material-symbols-outlined">send</span>
          {{ $t('toolA.startTransfer') }}
        </button>
      </div>

      <div class="col-span-12 space-y-6 lg:col-span-4">
        <div class="bg-surface-container-low dark:bg-surface-container space-y-4 rounded-xl p-6">
          <span class="text-sm font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.statusDetails') }}</span>
          <div class="flex justify-between text-xs"><span class="text-on-surface-variant">{{ $t('toolA.connectedNode') }}</span><span class="flex items-center gap-1 font-bold text-primary"><span class="h-1.5 w-1.5 rounded-full bg-primary" />US-East-1</span></div>
          <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Encryption</span><span class="font-bold text-on-surface dark:text-surface">AES-256-GCM</span></div>
          <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Avg. Speed</span><span class="font-bold text-on-surface dark:text-surface">12.5 MB/s</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface QueuedFileItem {
  name: string
  size: string
}

defineProps<{
  fileQueue: QueuedFileItem[]
}>()

const emit = defineEmits<{
  clearQueue: []
  addFiles: [files: File[]]
  removeFile: [index: number]
  startTransfer: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (files.length) emit('addFiles', files)
  input.value = ''
}
</script>
