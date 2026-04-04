<template>
  <div class="w-full max-w-4xl">
    <div class="md:hidden space-y-4 pb-28">
      <div class="flex items-center justify-between">
        <span class="font-headline text-lg font-bold text-on-surface dark:text-surface">ToolPort</span>
        <div v-if="isConnected" class="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full">
          <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
          <span class="text-xs font-medium text-primary">{{ $t('toolA.mobileConnectedToDynamic', { device: connectedDeviceName }) }}</span>
        </div>
        <div v-else class="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
          <span class="w-2 h-2 rounded-full bg-outline animate-pulse" />
          <span class="text-xs font-medium text-on-surface-variant">{{ $t('toolA.waitingConnection') }}</span>
        </div>
      </div>

      <div class="space-y-3 min-h-[60px]">
        <p v-if="!receivedMessages.length" class="text-center text-sm text-on-surface-variant py-4">
          {{ isConnected ? $t('toolA.noMessagesYet') : $t('toolA.waitingConnection') }}
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
          <button class="flex-1 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50" :disabled="!isConnected || !mobileTextInput.trim()" @click="$emit('mobileSend')">
            <span class="material-symbols-outlined text-lg">send</span>{{ $t('toolA.mobileTransfer') }}
          </button>
        </div>
        <input ref="mobileFileInput" type="file" hidden @change="$emit('mobileFileSelect', $event)" >
      </div>

      <div>
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
    </div>

    <div class="hidden md:block bg-surface-container-low dark:bg-surface-container rounded-xl overflow-hidden shadow-ambient">
      <div class="px-8 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolA.title') }}</h1>
          <div class="flex items-center gap-2 mt-2">
            <span class="px-3 py-1 bg-primary-container/20 text-primary-container rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">verified_user</span>
              {{ $t('toolA.e2eeSecure') }}
            </span>
          </div>
        </div>
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
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 md:p-8 mx-2 md:mx-4 mb-4">
        <div class="flex flex-col items-center text-center gap-4 md:gap-6">
          <div class="p-4 md:p-6 bg-surface-container-low dark:bg-surface-container rounded-xl shadow-inner relative group">
            <div class="w-48 h-48 md:w-64 md:h-64 bg-surface-container dark:bg-surface-container-high rounded-lg flex items-center justify-center relative">
              <canvas ref="qrCanvas" class="w-40 h-40 md:w-56 md:h-56" />
              <div v-if="qrExpired" class="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest/40 dark:bg-on-surface/40 backdrop-blur-md rounded-lg p-4 text-center">
                <button class="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg mb-3 active:rotate-180 transition-transform duration-500" @click="$emit('refreshQr')">
                  <span class="material-symbols-outlined text-2xl">refresh</span>
                </button>
                <span class="text-sm font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolA.qrExpired') }}</span>
                <span class="text-xs text-on-surface-variant mt-1">{{ $t('toolA.qrExpiredDesc') }}</span>
              </div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden md:flex">
              <span class="text-on-primary font-bold text-sm">{{ $t('toolA.clickEnlarge') }}</span>
            </div>
          </div>
          <div class="text-on-surface-variant text-sm font-medium">
            <p>{{ $t('toolA.scanQr') }}</p>
            <p class="mt-1 px-3 py-1 bg-surface-container-high dark:bg-surface-container rounded text-primary font-mono text-sm">toolport.dev/tools/text-transfer?r={{ roomId }}</p>
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

      <div class="mx-4 mb-4 p-6 bg-primary/5 rounded-xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-primary text-2xl">content_paste</span>
        </div>
        <div class="flex-1">
          <p class="text-on-surface dark:text-surface font-medium text-sm">{{ $t('toolA.crossPromoTitle') }}</p>
          <p class="text-on-surface-variant text-xs">{{ $t('toolA.crossPromoDesc') }}</p>
        </div>
        <NuxtLink :to="localePath('/tools/clipboard')" class="text-primary font-bold text-sm flex items-center gap-1 hover:underline whitespace-nowrap">
          {{ $t('toolA.crossPromoLink') }}
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </NuxtLink>
      </div>
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
interface WaitingMessage {
  id: string
  content: string
  isSelf: boolean
}

interface RecentTransferItem {
  icon: string
  name: string
  desc: string
  time: string
}

interface DocCard {
  icon: string
  title: string
  desc: string
}

defineProps<{
  isConnected: boolean
  connectedDeviceName: string
  receivedMessages: WaitingMessage[]
  mobileRecentTransfers: RecentTransferItem[]
  qrExpired: boolean
  roomId: string
  docCards: DocCard[]
}>()

const emit = defineEmits<{
  copyLink: []
  mobileFileSelect: [event: Event]
  mobileSend: []
  qrCanvasReady: [element: HTMLCanvasElement | null]
  refreshQr: []
}>()

const mobileTextInput = defineModel<string>('mobileTextInput', { required: true })
const localePath = useLocalePath()
const mobileFileInput = ref<HTMLInputElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)

function triggerMobileFileInput() {
  mobileFileInput.value?.click()
}

onMounted(() => {
  emit('qrCanvasReady', qrCanvas.value)
})
</script>
