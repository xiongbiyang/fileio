<template>
  <div class="p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">

    <TextTransferWaiting
      v-if="state === 'waiting'"
      v-model:mobile-text-input="mobileTextInput"
      :doc-cards="docCards"
      :is-connected="isConnected"
      :mobile-recent-transfers="mobileRecentTransfers"
      :qr-expired="qrExpired"
      :received-messages="receivedMessages"
      :room-id="roomId"
      @copy-link="copyLink"
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
definePageMeta({ layout: 'tool' })
useHead({
  title: 'Wireless File Transfer Phone to PC - Free AirDrop Alternative',
  meta: [
    { name: 'description', content: 'Transfer files wirelessly between phone and computer - no app, no signup, no USB cable. Free AirDrop alternative for Android, iPhone & Windows. End-to-end encrypted, scan a QR code to start.' },
    { name: 'keywords', content: 'transfer files phone to pc,wireless file transfer,airdrop alternative,airdrop alternative for windows,send files from iphone to windows,transfer photos android to pc,file transfer without usb,file transfer no app,file transfer no signup,webrtc file transfer,p2p file transfer,encrypted file transfer,browser file transfer,cross-platform file sharing' },
  ],
})
useSeoMeta({
  ogTitle: 'Wireless File Transfer - Free AirDrop Alternative for Any Device',
  ogDescription: 'Send files between phone and PC instantly. No app, no signup, no USB cable. End-to-end encrypted P2P - just scan a QR code. Works on iOS, Android, Windows, Mac.',
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: 'https://toolport.dev/tools/text-transfer',
  twitterTitle: 'Wireless File Transfer Phone to PC - Free AirDrop Alternative',
  twitterDescription: 'Transfer files between phone and PC instantly with no app or signup.',
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort File Transfer',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  description: 'Free wireless file transfer between phone and PC. AirDrop alternative that works cross-platform - no app install, no signup, end-to-end encrypted via WebRTC P2P.',
  featureList: [
    'No app install required',
    'No signup or account needed',
    'End-to-end encrypted with AES-256-GCM',
    'Works on iOS, Android, Windows, macOS',
    'QR code pairing in seconds',
    'No file size limit',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://toolport.dev/tools/text-transfer',
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
  ],
})

const {
  addFilesToQueue,
  attachQrCanvas,
  cancelTransfer,
  clearFileQueue,
  confirmPairing,
  copyLink,
  currentFile,
  devices,
  denyPairing,
  docCards,
  goToWaitingState,
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


