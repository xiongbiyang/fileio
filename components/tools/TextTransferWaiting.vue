<template>
  <div class="w-full max-w-4xl">
    <div class="md:hidden space-y-4 pb-28">
      <div class="flex items-center justify-between">
        <span class="font-headline text-lg font-bold text-on-surface dark:text-surface">FileIO</span>
        <div v-if="isConnected" class="flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full">
            <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
            <span class="text-xs font-medium text-primary">{{ $t('toolA.mobileConnectedToDynamic', { device: connectedDeviceName }) }}</span>
          </div>
          <button class="p-2 rounded-full bg-surface-container-high dark:bg-surface-container text-on-surface-variant active:scale-90 transition-transform" @click="$emit('disconnect')">
            <span class="material-symbols-outlined text-lg">qr_code_2</span>
          </button>
        </div>
        <div v-else class="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
          <span class="w-2 h-2 rounded-full bg-outline animate-pulse" />
          <span class="text-xs font-medium text-on-surface-variant">{{ $t('toolA.waitingConnection') }}</span>
        </div>
      </div>

      <!-- Mobile: Connected — transfer interface -->
      <template v-if="isConnected">
        <div class="space-y-3 min-h-[60px]">
          <p v-if="!receivedMessages.length" class="text-center text-sm text-on-surface-variant py-4">
            {{ $t('toolA.noMessagesYet') }}
          </p>
          <div v-for="msg in receivedMessages" :key="msg.id" class="flex" :class="msg.isSelf ? 'justify-end' : 'justify-start'">
            <div class="max-w-[85%] px-4 py-3 rounded-2xl text-sm" :class="msg.isSelf ? 'primary-gradient text-on-primary rounded-tr-none' : 'bg-surface-container-lowest dark:bg-surface-container-high text-on-surface dark:text-surface rounded-tl-none'">
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </div>

        <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient">
          <h3 class="font-headline font-bold text-on-surface dark:text-surface mb-3">{{ $t('toolA.mobileTransferContent') }}</h3>
          <textarea v-model="mobileTextInput" class="w-full bg-surface-container-low dark:bg-surface-container rounded-xl p-4 text-sm text-on-surface dark:text-surface placeholder:text-outline resize-none focus:ring-2 focus:ring-primary/20" rows="3" :placeholder="$t('toolA.mobilePastePlaceholder')" />
          <div class="flex gap-3 mt-3">
            <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" @click="triggerMobileFileInput">
              <span class="material-symbols-outlined text-lg">attach_file</span>{{ $t('toolA.mobileFile') }}
            </button>
            <button class="flex-1 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50" :disabled="!mobileTextInput.trim()" @click="$emit('mobileSend')">
              <span class="material-symbols-outlined text-lg">send</span>{{ $t('toolA.mobileTransfer') }}
            </button>
          </div>
          <input ref="mobileFileInput" type="file" hidden @change="$emit('mobileFileSelect', $event)" >
        </div>

        <div v-if="mobileRecentTransfers.length">
          <h3 class="font-headline font-bold text-sm text-on-surface dark:text-surface mb-3 uppercase tracking-wider">{{ $t('toolA.mobileRecentTransfers') }}</h3>
          <div class="space-y-2">
            <div v-for="item in mobileRecentTransfers" :key="item.name" class="bg-surface-container-low dark:bg-surface-container rounded-xl p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-on-surface-variant">{{ item.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">{{ item.name }}</p>
                <p class="text-xs text-on-surface-variant">{{ item.desc }}</p>
              </div>
              <span class="text-xs text-on-surface-variant whitespace-nowrap">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Mobile: Not connected — receiver: connecting spinner -->
      <template v-else-if="isReceiver">
        <div class="flex flex-col items-center justify-center py-16 gap-6">
          <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-4xl animate-pulse">sync</span>
          </div>
          <div class="text-center space-y-2">
            <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('toolA.mobileConnecting') }}</h2>
            <p class="text-sm text-on-surface-variant max-w-[280px]">{{ $t('toolA.mobileConnectingDesc') }}</p>
          </div>
          <div class="bg-surface-container-low dark:bg-surface-container rounded-xl px-6 py-3">
            <span class="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{{ $t('toolA.roomId') }}</span>
            <span class="ml-2 text-lg font-extrabold text-primary font-headline">{{ roomId }}</span>
          </div>
        </div>
      </template>

      <!-- Mobile: Not connected — sender: show QR code for other device to scan -->
      <template v-else>
        <div class="flex flex-col items-center gap-6 py-4">
          <div class="p-4 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl shadow-ambient">
            <div class="w-52 h-52 bg-surface-container dark:bg-surface-container rounded-lg flex items-center justify-center relative">
              <canvas ref="mobileQrCanvas" class="w-44 h-44" />
            </div>
          </div>
          <div class="text-center space-y-2">
            <p class="text-sm text-on-surface-variant">{{ $t('toolA.scanQr') }}</p>
            <div class="bg-surface-container-low dark:bg-surface-container rounded-xl px-5 py-2.5 inline-flex items-center gap-2">
              <span class="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{{ $t('toolA.roomId') }}</span>
              <span class="text-lg font-extrabold text-primary font-headline">{{ roomId }}</span>
            </div>
          </div>
          <div class="w-full space-y-3 px-2">
            <button class="w-full py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" @click="$emit('copyLink')">
              <span class="material-symbols-outlined text-lg">content_copy</span>
              {{ $t('common.copyLink') }}
            </button>
            <button class="w-full py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" @click="$emit('refreshQr')">
              <span class="material-symbols-outlined text-lg">refresh</span>
              {{ $t('toolA.refreshQr') }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <div class="hidden md:block bg-surface-container-low dark:bg-surface-container rounded-xl overflow-hidden shadow-ambient">
      <div class="px-8 py-8 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 bg-primary-container/20 text-primary-container rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">verified_user</span>
              {{ $t('toolA.e2eeSecure') }}
            </span>
          </div>
          <h1 class="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface dark:text-surface">
            {{ isConnected ? $t('toolA.title') : $t('toolA.introHeading') }}
          </h1>
          <p v-if="!isConnected" class="text-on-surface-variant text-sm leading-relaxed mt-3 max-w-xl">
            {{ $t('toolA.introSubtitle') }}
          </p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <div class="flex items-center gap-3 px-4 py-2 rounded-xl shadow-ambient" :class="isConnected ? 'bg-primary/5' : 'bg-surface-container-lowest dark:bg-surface-container-high'">
            <div v-if="isConnected" class="relative flex items-center justify-center">
              <span class="w-3 h-3 bg-primary rounded-full z-10" />
              <span class="absolute w-3 h-3 bg-primary-fixed-dim rounded-full soft-pulse" />
            </div>
            <span v-else class="w-3 h-3 rounded-full bg-outline animate-pulse" />
            <span class="text-sm font-medium" :class="isConnected ? 'text-primary' : 'text-on-surface-variant'">
              {{ isConnected ? $t('toolA.mobileConnectedToDynamic', { device: connectedDeviceName }) : $t('toolA.waitingConnection') }}
            </span>
          </div>
          <button v-if="isConnected" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high dark:bg-surface-container text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-colors" @click="$emit('disconnect')">
            <span class="material-symbols-outlined text-lg">qr_code_2</span>
            {{ $t('toolA.newConnection') }}
          </button>
        </div>
      </div>

      <!-- Desktop: Connected — transfer interface -->
      <template v-if="isConnected">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 md:p-8 mx-2 md:mx-4 mb-4">
          <!-- Left: messages -->
          <div class="flex flex-col gap-4">
            <h2 class="font-headline text-lg font-bold text-on-surface dark:text-surface">{{ $t('toolA.desktopMessages') }}</h2>
            <div class="flex-1 min-h-[200px] max-h-[360px] overflow-y-auto space-y-3 p-4 bg-surface-container-low dark:bg-surface-container rounded-xl">
              <p v-if="!receivedMessages.length" class="text-center text-sm text-on-surface-variant py-8">
                {{ $t('toolA.noMessagesYet') }}
              </p>
              <div v-for="msg in receivedMessages" :key="msg.id" class="flex" :class="msg.isSelf ? 'justify-end' : 'justify-start'">
                <div class="max-w-[80%] px-4 py-3 rounded-2xl text-sm" :class="msg.isSelf ? 'primary-gradient text-on-primary rounded-tr-none' : 'bg-surface-container dark:bg-surface-container-highest text-on-surface dark:text-surface rounded-tl-none'">
                  <p>{{ msg.content }}</p>
                </div>
              </div>
            </div>
            <div class="flex gap-3">
              <textarea v-model="desktopTextInput" class="flex-1 bg-surface-container-low dark:bg-surface-container rounded-xl p-4 text-sm text-on-surface dark:text-surface placeholder:text-outline resize-none focus:ring-2 focus:ring-primary/20" rows="2" :placeholder="$t('toolA.desktopTextPlaceholder')" @keydown.enter.exact.prevent="$emit('desktopSend')" />
              <button class="px-6 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform disabled:opacity-50" :disabled="!desktopTextInput.trim()" @click="$emit('desktopSend')">
                <span class="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>

          <!-- Right: file transfer -->
          <div class="flex flex-col gap-4">
            <h2 class="font-headline text-lg font-bold text-on-surface dark:text-surface">{{ $t('toolA.desktopFileTransfer') }}</h2>
            <div
              class="flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 p-8 transition-colors cursor-pointer"
              :class="isDragOver ? 'border-primary bg-primary/5' : 'border-outline/30 bg-surface-container-low dark:bg-surface-container hover:border-primary/50'"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDesktopDrop"
              @click="desktopFileInput?.click()"
            >
              <span class="material-symbols-outlined text-5xl" :class="isDragOver ? 'text-primary' : 'text-on-surface-variant'">upload_file</span>
              <p class="text-sm font-medium" :class="isDragOver ? 'text-primary' : 'text-on-surface-variant'">{{ $t('toolA.desktopDropFiles') }}</p>
              <p class="text-xs text-on-surface-variant">{{ $t('toolA.desktopOrClick') }}</p>
            </div>
            <input ref="desktopFileInput" type="file" multiple hidden @change="handleDesktopFileChange">
            <div v-if="mobileRecentTransfers.length" class="space-y-2">
              <h3 class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('toolA.mobileRecentTransfers') }}</h3>
              <div v-for="item in mobileRecentTransfers" :key="item.name" class="bg-surface-container-low dark:bg-surface-container rounded-xl p-3 flex items-center gap-3">
                <span class="material-symbols-outlined text-on-surface-variant">{{ item.icon }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">{{ item.name }}</p>
                  <p class="text-xs text-on-surface-variant">{{ item.desc }}</p>
                </div>
                <span class="text-xs text-on-surface-variant whitespace-nowrap">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Desktop: Not connected — QR code + room ID -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 md:p-8 mx-2 md:mx-4 mb-4">
          <div class="flex flex-col items-center text-center gap-4 md:gap-6">
            <div class="p-4 md:p-6 bg-surface-container-low dark:bg-surface-container rounded-xl shadow-inner relative group">
              <div class="w-48 h-48 md:w-64 md:h-64 bg-surface-container dark:bg-surface-container-high rounded-lg flex items-center justify-center relative">
                <canvas ref="qrCanvas" class="w-40 h-40 md:w-56 md:h-56" />
              </div>
              <div class="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden md:flex">
                <span class="text-on-primary font-bold text-sm">{{ $t('toolA.clickEnlarge') }}</span>
              </div>
            </div>
            <div class="text-on-surface-variant text-sm font-medium">
              <p>{{ $t('toolA.scanQr') }}</p>
              <p class="mt-1 px-3 py-1 bg-surface-container-high dark:bg-surface-container rounded text-primary font-mono text-sm">{{ shareHostDisplay }}/text-transfer?r={{ roomId }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-6">
            <div>
              <h2 class="font-headline text-lg font-bold text-on-surface dark:text-surface">{{ $t('toolA.manualTitle') }}</h2>
              <p class="text-on-surface-variant text-sm leading-relaxed mt-2">{{ $t('toolA.manualDesc') }}</p>
            </div>
            <div class="bg-surface-container-low dark:bg-surface-container p-6 rounded-xl flex flex-col items-center justify-center gap-2">
              <span class="text-on-surface-variant text-xs font-bold uppercase tracking-widest font-label">{{ $t('toolA.roomId') }}</span>
              <span class="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary font-headline">{{ roomId }}</span>
            </div>
            <div class="flex flex-col gap-3">
              <button class="w-full py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform" @click="$emit('copyLink')">
                <span class="material-symbols-outlined text-lg">content_copy</span>
                {{ $t('common.copyLink') }}
              </button>
              <button class="w-full py-3 bg-surface-container-high dark:bg-surface-container-highest text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container transition-colors" @click="$emit('refreshQr')">
                <span class="material-symbols-outlined text-lg">refresh</span>
                {{ $t('toolA.refreshQr') }}
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>

    <div class="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="doc in docCards" :key="doc.icon" class="flex flex-col gap-3">
        <span class="material-symbols-outlined text-3xl text-primary">{{ doc.icon }}</span>
        <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ doc.title }}</h3>
        <p class="text-on-surface-variant text-sm leading-relaxed">{{ doc.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecentTransferItem } from '~/types/toolPages'

interface WaitingMessage {
  id: string
  content: string
  isSelf: boolean
}

interface DocCard {
  icon: string
  title: string
  desc: string
}

const emit = defineEmits<{
  copyLink: []
  mobileFileSelect: [event: Event]
  mobileSend: []
  desktopSend: []
  desktopFileSelect: [files: File[]]
  qrCanvasReady: [elements: (HTMLCanvasElement | null)[]]
  refreshQr: []
  disconnect: []
}>()

const mobileTextInput = defineModel<string>('mobileTextInput', { required: true })
const desktopTextInput = defineModel<string>('desktopTextInput', { required: true })
const runtimeConfig = useRuntimeConfig()
const shareHostDisplay = computed(() => {
  const raw = runtimeConfig.public.siteUrl || 'https://fileio.top'
  return raw.replace(/^https?:\/\//, '').replace(/\/$/, '')
})
const mobileFileInput = ref<HTMLInputElement | null>(null)
const desktopFileInput = ref<HTMLInputElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const mobileQrCanvas = ref<HTMLCanvasElement | null>(null)
const isDragOver = ref(false)

function triggerMobileFileInput() {
  mobileFileInput.value?.click()
}

function handleDesktopDrop(event: DragEvent) {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length) emit('desktopFileSelect', files)
}

function handleDesktopFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  if (files.length) emit('desktopFileSelect', files)
}

const props = defineProps<{
  isConnected: boolean
  isReceiver: boolean
  connectedDeviceName: string
  receivedMessages: WaitingMessage[]
  mobileRecentTransfers: RecentTransferItem[]
  roomId: string
  docCards: DocCard[]
}>()

function emitQrCanvas() {
  emit('qrCanvasReady', [qrCanvas.value, mobileQrCanvas.value])
}

onMounted(() => emitQrCanvas())

// When view switches (connected ↔ disconnected), canvas DOM changes — re-emit
watch([() => props.isConnected, () => props.isReceiver], () => {
  nextTick(() => emitQrCanvas())
})
</script>
