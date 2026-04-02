<template>
  <div class="pt-8 pb-12 px-8 min-h-screen flex flex-col items-center">
    <!-- Room Entry (not in room) -->
    <ClipboardEntry
      v-if="view === 'entry'"
      v-model:enable-e2ee="enableE2ee"
      v-model:join-room-id="joinRoomId"
      :how-it-works="howItWorks"
      @create-room="createRoom"
      @join-room="joinRoom"
      @open-history="openHistory"
    />

    <!-- Room History View -->
    <ClipboardHistory
      v-else-if="view === 'history'"
      :history-stats="historyStats"
      :past-rooms="pastRooms"
      @delete-room="deleteRoom"
      @go-back="goToEntry"
      @join-existing-room="joinExistingRoom"
    />

    <!-- Message Search View -->
    <ClipboardSearch
      v-else-if="view === 'search'"
      v-model:active-search-filter="activeSearchFilter"
      v-model:active-sort="activeSort"
      v-model:search-query="searchQuery"
      :current-room="currentRoom"
      :device-count="deviceCount"
      :filtered-messages="filteredMessages"
      :search-filters="searchFilters"
      :sort-options="sortOptions"
      :storage-usage-label="storageUsageLabel"
      :storage-usage-percent="storageUsagePercent"
      @copy-room-link="copyRoomLink"
      @copy-to-clipboard="copyToClipboard"
      @go-back="goToRoom"
    />

    <!-- Room Settings & Voting View -->
    <ClipboardSettings
      v-else-if="view === 'settings'"
      :pro-waitlist-path="localePath('/pro-waitlist')"
      :room-members="roomMembers"
      :vote-features="voteFeatures"
      @clear-room="clearRoom"
      @go-back="goToRoom"
    />

    <ClipboardRoom
      v-else
      v-model:new-message="newMessage"
      v-model:show-qr-modal="showQrModal"
      :current-room="currentRoom"
      :connected-devices="connectedDevices"
      :device-count="deviceCount"
      :expiry-progress="expiryProgress"
      :expiry-timer="expiryTimer"
      :is-connected="isConnected"
      :is-e2ee="isE2ee"
      :is-typing="isTyping"
      :messages="messages"
      @attach-refs="attachRoomRefs"
      @clear-room="clearRoom"
      @copy-room-link="copyRoomLink"
      @copy-to-clipboard="copyToClipboard"
      @file-attach="handleFileAttach"
      @input="onInput"
      @leave-room="leaveRoom"
      @open-search="openSearch"
      @open-settings="openSettings"
      @paste="handlePaste"
      @send-message="sendMessage"
    />
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

definePageMeta({ layout: 'tool' })
useHead({
  title: 'Online Clipboard Sync - Copy Paste Between Phone and PC',
  meta: [
    { name: 'description', content: 'Sync clipboard between phone, tablet, and PC instantly. Copy on one device, paste on another - no app, no signup. Encrypted rooms, real-time sharing, auto-deletes in 24 hours.' },
    { name: 'keywords', content: 'online clipboard sync,copy paste between phone and pc,sync clipboard across devices,cross-device clipboard,share text between devices,send link from phone to computer,copy from phone paste to computer,real-time clipboard sync,encrypted clipboard sharing,no signup clipboard,browser clipboard sync' },
  ],
})
useSeoMeta({
  ogTitle: 'Copy Paste Between Phone and PC - Free Online Clipboard',
  ogDescription: 'Sync clipboard between phone, tablet, and PC instantly. Copy on one device, paste on another - no app, no signup, end-to-end encrypted, auto-deletes in 24 hours.',
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: 'https://toolport.dev/tools/clipboard',
  twitterTitle: 'Online Clipboard Sync - Copy Paste Between Phone and PC',
  twitterDescription: 'Copy on one device and paste on another with encrypted real-time rooms.',
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort Online Clipboard',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  description: 'Free online clipboard sync - copy on phone, paste on PC instantly. Encrypted real-time rooms, no app install, no signup, auto-expires in 24 hours.',
  featureList: [
    'Real-time sync across all devices',
    'No app install required',
    'No signup or account needed',
    'End-to-end encrypted rooms',
    'Share text, links, and images',
    'Auto-expires in 24 hours',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://toolport.dev/tools/clipboard',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How can I copy on phone and paste on PC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Create or join a ToolPort clipboard room on both devices, then copy text on one device and paste it on the other in real time.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is online clipboard sync secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ToolPort uses encrypted rooms and temporary data retention, with room content auto-expiring in 24 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install an app for cross-device clipboard sync?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. ToolPort runs in your browser and does not require app installation or account registration.',
      },
    },
  ],
})
const {
  activeSearchFilter,
  activeSort,
  attachRoomRefs,
  clearRoom,
  copyRoomLink,
  copyToClipboard,
  createRoom,
  currentRoom,
  connectedDevices,
  deleteRoom,
  deviceCount,
  enableE2ee,
  expiryProgress,
  expiryTimer,
  filteredMessages,
  goToEntry,
  goToRoom,
  handleFileAttach,
  handlePaste,
  historyStats,
  howItWorks,
  isConnected,
  isE2ee,
  isTyping,
  joinExistingRoom,
  joinRoom,
  joinRoomId,
  leaveRoom,
  messages,
  newMessage,
  onInput,
  openHistory,
  openSearch,
  openSettings,
  pastRooms,
  roomMembers,
  searchFilters,
  searchQuery,
  sortOptions,
  storageUsageLabel,
  storageUsagePercent,
  sendMessage,
  showQrModal,
  view,
  voteFeatures,
} = useClipboardPage()
</script>

