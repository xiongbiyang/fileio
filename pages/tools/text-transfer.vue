<template>
  <div class="p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">

    <TextTransferWaiting
      v-if="state === 'waiting'"
      v-model:mobile-text-input="mobileTextInput"
      v-model:desktop-text-input="desktopTextInput"
      :connected-device-name="connectedDeviceName"
      :doc-cards="docCards"
      :is-connected="isConnected"
      :mobile-recent-transfers="mobileRecentTransfers"
      :qr-expired="qrExpired"
      :received-messages="receivedMessages"
      :room-id="roomId"
      @copy-link="copyLink"
      @desktop-file-select="handleDesktopFileSelect"
      @desktop-send="desktopSend"
      @mobile-file-select="handleMobileFileSelect"
      @mobile-send="mobileSend"
      @qr-canvas-ready="attachQrCanvas"
      @refresh-qr="refreshQr"
    />

    <!-- ==================== STATE: PAIRING ==================== -->
    <TextTransferPairing
      v-else-if="state === 'pairing'"
      :verification-digits="verificationDigits"
      @confirm-pairing="confirmPairing"
      @deny-pairing="denyPairing"
    />

    <!-- ==================== STATE: TRANSFERRING ==================== -->
    <TextTransferTransferring
      v-else-if="state === 'transferring'"
      :current-file="currentFile"
      :time-remaining="timeRemaining"
      :transfer-progress="transferProgress"
      :transfer-speed="transferSpeed"
      :transferred-size="transferredSize"
      @cancel-transfer="cancelTransfer"
    />

    <!-- ==================== STATE: SUCCESS ==================== -->
    <TextTransferSuccess
      v-else-if="state === 'success'"
      :current-file="currentFile"
      @start-new-transfer="startNewTransfer"
    />

    <!-- ==================== STATE: RECONNECTING ==================== -->
    <TextTransferReconnecting
      v-else-if="state === 'reconnecting'"
      :is-receiver="isReceiver"
      :reconnect-attempt="reconnectAttempt"
      @refresh-qr="refreshQr"
    />

    <!-- ==================== STATE: FILE QUEUE ==================== -->
    <TextTransferFileQueue
      v-else-if="state === 'fileQueue'"
      :file-queue="queuedFiles"
      @add-files="addFilesToQueue"
      @clear-queue="clearFileQueue"
      @remove-file="removeQueuedFile"
      @start-transfer="startTransfer"
    />

    <!-- ==================== STATE: DEVICE HISTORY ==================== -->
    <TextTransferDeviceHistory
      v-else-if="state === 'deviceHistory'"
      :devices="devices"
      @go-back="goToWaitingState"
      @new-connection="refreshQr"
    />

    <!-- ==================== STATE: TRANSFER HISTORY ==================== -->
    <TextTransferHistory
      v-else-if="state === 'transferHistory'"
      :history-filter="historyFilter"
      :history-stats="historyStats"
      :transfer-history-items="transferHistoryItems"
      @go-back="goToWaitingState"
      @update-history-filter="historyFilter = $event"
    />

    <!-- ==================== STATE: E2EE AUDIT ==================== -->
    <TextTransferAudit
      v-else-if="state === 'e2eeAudit'"
      :key-fingerprint="keyFingerprint"
      :security-logs="securityLogs"
      @go-back="goToWaitingState"
    />

  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://toolport.dev')
const canonicalUrl = computed(() =>
  new URL(localePath('/tools/text-transfer'), siteBaseUrl.value).toString(),
)

definePageMeta({ layout: 'tool' })
useHead(() => ({
  title: t('seo.toolA.title'),
  meta: [
    { name: 'description', content: t('seo.toolA.desc') },
    { name: 'keywords', content: t('seo.toolA.keywords') },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))
useSeoMeta({
  ogTitle: () => t('seo.toolA.ogTitle'),
  ogDescription: () => t('seo.toolA.ogDesc'),
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: () => canonicalUrl.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.toolA.ogTitle'),
  twitterDescription: () => t('seo.toolA.ogDesc'),
  twitterImage: 'https://toolport.dev/og-image.png',
  twitterImageAlt: 'ToolPort file transfer interface preview',
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort File Transfer',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  description: 'Accountless no-cloud file transfer with browser-to-browser WebRTC P2P encryption. Private cross-platform AirDrop alternative for phone to PC.',
  featureList: [
    'No app install required',
    'No signup or account needed',
    'End-to-end encrypted with AES-256-GCM',
    'Works on iOS, Android, Windows, macOS',
    'QR code pairing in seconds',
    'No file size limit',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  isAccessibleForFree: true,
  url: canonicalUrl.value,
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How can I transfer files from phone to PC wirelessly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open ToolPort on both devices, scan the QR code, and send files directly over an encrypted peer-to-peer connection.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a free AirDrop alternative for Windows and Android?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ToolPort provides a browser-based AirDrop alternative that works across iPhone, Android, Windows, and macOS without installing an app.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I send files without USB cable and without signup?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. File transfer runs in the browser and does not require USB cables, accounts, or app installation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this an accountless P2P web transfer with zero-knowledge design?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. ToolPort uses direct browser-to-browser WebRTC transfer with end-to-end encryption, and the service is designed so transfer content is not visible to ToolPort servers.',
      },
    },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to transfer files from phone to PC without app install',
  description: 'Use ToolPort WebRTC pairing to send files directly between devices in the browser.',
  totalTime: 'PT1M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Open on both devices',
      text: 'Open the text transfer tool on phone and PC.',
    },
    {
      '@type': 'HowToStep',
      name: 'Pair devices',
      text: 'Scan the QR code and confirm pairing.',
    },
    {
      '@type': 'HowToStep',
      name: 'Send files',
      text: 'Select files and transfer through the encrypted peer-to-peer channel.',
    },
  ],
})

const {
  addFilesToQueue,
  attachQrCanvas,
  cancelTransfer,
  clearFileQueue,
  confirmPairing,
  connectedDeviceName,
  copyLink,
  currentFile,
  desktopSend,
  desktopTextInput,
  devices,
  denyPairing,
  docCards,
  goToWaitingState,
  handleDesktopFileSelect,
  handleMobileFileSelect,
  historyFilter,
  historyStats,
  isConnected,
  isReceiver,
  keyFingerprint,
  mobileRecentTransfers,
  mobileSend,
  mobileTextInput,
  qrExpired,
  queuedFiles,
  receivedMessages,
  reconnectAttempt,
  refreshQr,
  removeQueuedFile,
  roomId,
  securityLogs,
  startNewTransfer,
  startTransfer,
  state,
  timeRemaining,
  transferHistoryItems,
  transferProgress,
  transferSpeed,
  transferredSize,
  verificationDigits,
} = useTextTransferPage()
</script>



