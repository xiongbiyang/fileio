<template>
  <div class="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-12">
    <div class="bg-surface-container-low dark:bg-surface-container flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-xl shadow-ambient md:h-[819px] lg:col-span-8">
      <div class="bg-surface-container-lowest dark:bg-surface-container-high flex items-center justify-between px-4 py-3 md:hidden">
        <div>
          <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant/60">Room ID</span>
          <h2 class="font-headline text-base font-extrabold text-primary">{{ currentRoom }}</h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-primary/5 flex items-center gap-1.5 rounded-full px-2 py-1">
            <span class="relative flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" /></span>
            <span class="text-[10px] font-bold text-primary">{{ $t('toolC.devicesOnline', { n: deviceCount }) }}</span>
          </div>
          <div class="text-center">
            <span class="material-symbols-outlined text-sm text-primary">schedule</span>
            <span class="block text-xs font-mono font-bold text-on-surface dark:text-surface">23:54</span>
          </div>
        </div>
      </div>

      <div class="bg-surface-container-lowest dark:bg-surface-container-high hidden flex-wrap items-center justify-between gap-4 px-8 py-5 md:flex">
        <div class="flex items-center gap-4">
          <div>
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant/60">{{ $t('toolC.sessionId') }}</span>
            <div class="flex items-center gap-2">
              <h2 class="font-headline text-xl font-extrabold text-primary">{{ $t('toolC.roomPrefix', { id: currentRoom }) }}</h2>
              <span v-if="isE2ee" class="bg-primary-fixed text-on-primary-fixed-variant flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
                <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1">lock</span>
                E2EE
              </span>
            </div>
          </div>
          <div class="h-8 w-px bg-outline-variant/20" />
          <div v-if="isConnected" class="bg-primary/5 flex items-center gap-2 rounded-full px-3 py-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span class="text-sm font-medium text-primary">{{ $t('toolC.connected') }}</span>
          </div>
          <div v-else class="bg-surface-container-high flex items-center gap-2 rounded-full px-3 py-1">
            <span class="h-2 w-2 animate-pulse rounded-full bg-outline" />
            <span class="text-sm font-medium text-on-surface-variant">{{ $t('toolC.connecting') }}</span>
          </div>
          <span class="text-sm font-medium text-on-surface-variant/70">{{ $t('toolC.devicesOnline', { n: deviceCount }) }}</span>
        </div>

        <div class="flex items-center gap-2">
          <button class="hover:bg-surface-container flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors" @click="$emit('copyRoomLink')">
            <span class="material-symbols-outlined text-lg">content_copy</span> {{ $t('common.copyLink') }}
          </button>
          <button class="hover:bg-surface-container flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors" @click="showQrModal = !showQrModal">
            <span class="material-symbols-outlined text-lg">qr_code_2</span> {{ $t('toolC.qrCode') }}
          </button>
          <div v-if="showQrModal" class="bg-surface-container-lowest dark:bg-surface-container-high absolute top-full right-0 z-50 mt-2 rounded-xl p-4 shadow-lg">
            <canvas ref="qrCanvasModal" class="h-32 w-32" />
            <button class="mt-2 w-full py-1.5 text-xs font-semibold text-primary hover:underline" @click="$emit('copyRoomLink')">{{ $t('common.copyLink') }}</button>
          </div>
          <div class="h-6 w-px bg-outline-variant/20" />
          <button class="hover:bg-surface-container flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors" @click="$emit('openSearch')">
            <span class="material-symbols-outlined text-lg">search</span>
          </button>
          <button class="hover:bg-surface-container flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors" @click="$emit('openSettings')">
            <span class="material-symbols-outlined text-lg">settings</span>
          </button>
          <button class="hover:bg-error-container/20 rounded-lg px-3 py-2 text-sm text-error transition-colors" @click="$emit('clearRoom')">{{ $t('common.clear') }}</button>
          <button class="hover:bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface-variant transition-colors" @click="$emit('leaveRoom')">{{ $t('common.leave') }}</button>
        </div>
      </div>

      <div ref="messagesContainer" class="bg-surface-container-low/50 flex-1 space-y-8 overflow-y-auto p-8">
        <div class="flex justify-center">
          <span class="bg-surface-container dark:bg-surface-container-highest/50 rounded-full px-6 py-2 text-xs font-medium text-on-surface-variant/80">
            {{ $t('toolC.welcomeMsg', { id: currentRoom }) }}
          </span>
        </div>
        <div class="flex justify-center">
          <div class="bg-secondary-container/25 max-w-2xl rounded-xl px-4 py-2 text-center">
            <p class="text-[11px] font-bold text-on-surface dark:text-surface">{{ $t('toolC.cloudNoticeTitle') }}</p>
            <p class="mt-1 text-[11px] leading-relaxed text-on-surface-variant">{{ $t('toolC.cloudNoticeDesc') }}</p>
          </div>
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="group flex"
          :class="msg.isSelf ? 'ml-auto max-w-[85%] flex-row-reverse items-start gap-4' : 'max-w-[85%] items-start gap-4'"
        >
          <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" :class="msg.isSelf ? 'primary-gradient' : 'bg-outline-variant/30'">
            <span class="material-symbols-outlined text-sm" :class="msg.isSelf ? 'text-on-primary' : 'text-on-surface-variant'">
              {{ msg.isSelf ? 'person' : 'laptop_mac' }}
            </span>
          </div>

          <div class="flex flex-col" :class="msg.isSelf ? 'items-end' : 'items-start'">
            <div
              class="max-w-full px-6 py-4 shadow-sm"
              :class="msg.isSelf
                ? 'primary-gradient rounded-2xl rounded-tr-none text-on-primary shadow-lg shadow-primary/10'
                : 'bg-surface-container-highest dark:bg-surface-container-high rounded-2xl rounded-tl-none text-on-surface dark:text-surface'"
            >
              <img v-if="msg.type === 'image'" :src="msg.content" alt="Shared image" class="max-w-xs rounded-lg">
              <p v-else class="whitespace-pre-wrap break-words text-sm leading-relaxed">{{ msg.content }}</p>
            </div>
            <div class="mt-1 flex items-center gap-4 px-1">
              <span class="text-[10px] font-bold uppercase text-on-surface-variant/40">{{ msg.time }}</span>
              <button class="opacity-0 transition-opacity group-hover:opacity-100" @click="$emit('copyToClipboard', msg.content)">
                <span class="material-symbols-outlined text-sm text-on-surface-variant/40 hover:text-primary">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="isTyping" class="flex items-center gap-3 px-12">
          <div class="flex gap-1">
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60" style="animation-delay: 0.1s" />
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60" style="animation-delay: 0.2s" />
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60" style="animation-delay: 0.3s" />
          </div>
          <span class="text-xs font-medium italic text-primary/60">{{ $t('toolC.typingIndicator') }}</span>
        </div>
      </div>

      <div class="bg-surface-container-lowest dark:bg-surface-container-high p-6">
        <div class="bg-surface-container-low dark:bg-surface-container focus-within:bg-surface-container flex items-end gap-4 rounded-2xl p-2 transition-colors">
          <button class="p-3 text-on-surface-variant transition-colors hover:text-primary" @click="triggerFileAttach">
            <span class="material-symbols-outlined">attach_file</span>
          </button>
          <input ref="fileAttachInput" accept="image/*" hidden type="file" @change="$emit('fileAttach', $event)">
          <textarea
            v-model="newMessage"
            class="min-h-[56px] max-h-48 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 dark:text-surface"
            :placeholder="$t('toolC.inputPlaceholder')"
            rows="1"
            @keydown.enter.exact.prevent="$emit('sendMessage')"
            @paste="$emit('paste', $event)"
            @input="$emit('input')"
          />
          <button class="primary-gradient flex h-12 w-12 items-center justify-center rounded-xl text-on-primary transition-transform hover:scale-105 active:scale-95 disabled:opacity-50" :disabled="!newMessage.trim()" @click="$emit('sendMessage')">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">send</span>
          </button>
        </div>

        <div class="mt-3 flex items-center justify-between px-2">
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-1 text-xs font-medium text-on-surface-variant/50 transition-colors hover:text-primary" @click="$emit('openSearch')">
              <span class="material-symbols-outlined text-sm">history</span> {{ $t('common.history') }}
            </button>
            <button class="flex items-center gap-1 text-xs font-medium text-on-surface-variant/50 transition-colors hover:text-primary">
              <span class="material-symbols-outlined text-sm">lock</span> {{ isE2ee ? $t('toolC.encryptedByForge') : $t('toolC.standardMode') }}
            </button>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">{{ $t('toolC.shiftEnter') }}</span>
        </div>
      </div>
    </div>

    <div class="hidden flex-col gap-6 lg:col-span-4 lg:flex">
      <div class="bg-surface-container-low dark:bg-surface-container space-y-4 rounded-3xl p-6">
        <div class="flex items-center gap-3">
          <div class="bg-primary-container rounded-xl p-3">
            <span class="material-symbols-outlined text-on-primary-container" style="font-variation-settings: 'FILL' 1">lock</span>
          </div>
          <div>
            <p class="font-headline text-sm font-bold text-on-surface dark:text-surface">{{ isE2ee ? $t('toolC.encryptedByForge') : $t('toolC.standardMode') }}</p>
            <p class="text-xs text-on-surface-variant">{{ $t('toolC.roomPrefix', { id: currentRoom }) }}</p>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-xs text-on-surface-variant">
            <span>{{ $t('toolC.selfDestruct') }}</span>
            <span class="font-mono font-bold text-on-surface dark:text-surface">{{ expiryTimer }}</span>
          </div>
          <div class="bg-surface-container-high h-1.5 overflow-hidden rounded-full">
            <div class="h-full rounded-full bg-primary" :style="{ width: `${expiryProgress}%` }" />
          </div>
        </div>
        <div class="bg-surface-container-lowest dark:bg-surface-container-high flex items-center justify-center rounded-2xl p-4">
          <canvas ref="qrCanvas" class="h-24 w-24 rounded-xl" />
        </div>
        <button class="bg-surface-container-highest dark:bg-surface-container flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-on-surface dark:text-surface" @click="$emit('copyRoomLink')">
          <span class="material-symbols-outlined text-lg">content_copy</span>{{ $t('common.copyLink') }}
        </button>
      </div>

      <div class="bg-surface-container-low dark:bg-surface-container rounded-3xl p-6">
        <h3 class="font-headline mb-4 text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolC.connectedDevices') }}</h3>
        <div class="space-y-3">
          <div
            v-for="device in connectedDevices"
            :key="device.id"
            class="flex items-center gap-3"
          >
            <div class="bg-primary-fixed-dim flex h-10 w-10 items-center justify-center rounded-full"><span class="material-symbols-outlined text-lg text-on-surface-variant">{{ device.icon }}</span></div>
            <div class="flex-1"><p class="text-sm font-medium text-on-surface dark:text-surface">{{ device.name }}</p><p class="text-xs text-on-surface-variant">{{ device.tag }}</p></div>
            <span class="h-2 w-2 rounded-full bg-primary" />
          </div>
          <div v-if="!connectedDevices.length" class="text-xs text-on-surface-variant">
            {{ $t('toolC.connecting') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RoomMessage {
  id: string
  content: string
  type: 'text' | 'image'
  isSelf: boolean
  time: string
}

interface ConnectedDevice {
  id: string
  icon: string
  name: string
  tag: string
}

const props = defineProps<{
  currentRoom: string
  connectedDevices: ConnectedDevice[]
  deviceCount: number
  expiryProgress: number
  expiryTimer: string
  isConnected: boolean
  isE2ee: boolean
  isTyping: boolean
  messages: RoomMessage[]
}>()

const newMessage = defineModel<string>('newMessage', { required: true })
const showQrModal = defineModel<boolean>('showQrModal', { required: true })

const emit = defineEmits<{
  attachRefs: [{ messagesContainer: HTMLElement | null, qrCanvas: HTMLCanvasElement | null, qrCanvasModal: HTMLCanvasElement | null }]
  clearRoom: []
  copyRoomLink: []
  copyToClipboard: [text: string]
  fileAttach: [event: Event]
  input: []
  leaveRoom: []
  openSearch: []
  openSettings: []
  paste: [event: ClipboardEvent]
  sendMessage: []
}>()

const messagesContainer = ref<HTMLElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrCanvasModal = ref<HTMLCanvasElement | null>(null)
const fileAttachInput = ref<HTMLInputElement | null>(null)

function triggerFileAttach() {
  fileAttachInput.value?.click()
}

function emitRefs() {
  emit('attachRefs', {
    messagesContainer: messagesContainer.value,
    qrCanvas: qrCanvas.value,
    qrCanvasModal: qrCanvasModal.value,
  })
}

onMounted(() => {
  emitRefs()
})

watch(() => props.currentRoom, () => {
  nextTick(() => emitRefs())
})

watch(showQrModal, async () => {
  await nextTick()
  emitRefs()
})
</script>
