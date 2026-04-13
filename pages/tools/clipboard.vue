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
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://toolport.dev')
const canonicalUrl = computed(() =>
  new URL(localePath('/tools/clipboard'), siteBaseUrl.value).toString(),
)

definePageMeta({ layout: 'tool' })
useHead(() => ({
  title: t('seo.toolC.title'),
  meta: [
    { name: 'description', content: t('seo.toolC.desc') },
    { name: 'keywords', content: t('seo.toolC.keywords') },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))
useSeoMeta({
  ogTitle: () => t('seo.toolC.ogTitle'),
  ogDescription: () => t('seo.toolC.ogDesc'),
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: () => canonicalUrl.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.toolC.ogTitle'),
  twitterDescription: () => t('seo.toolC.ogDesc'),
  twitterImage: 'https://toolport.dev/og-image.png',
  twitterImageAlt: 'ToolPort online clipboard interface preview',
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort Online Clipboard',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  description: 'Ephemeral text share with accountless browser-to-browser clipboard sync. Encrypted real-time rooms that auto-expire in 24 hours.',
  featureList: [
    'Real-time sync across all devices',
    'No app install required',
    'No signup or account needed',
    'End-to-end encrypted rooms',
    'Share text, links, and images',
    'Auto-expires in 24 hours',
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
    {
      '@type': 'Question',
      name: 'Does ToolPort support ephemeral text share for sensitive snippets?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Clipboard rooms are temporary and auto-expire after 24 hours, which is useful for short-lived text sharing across devices.',
      },
    },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to share ephemeral text between phone and PC',
  description: 'Create a temporary room and sync text across devices without signup.',
  totalTime: 'PT1M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Create or join a room',
      text: 'Create a room or enter a room ID on both devices.',
    },
    {
      '@type': 'HowToStep',
      name: 'Paste text',
      text: 'Send text, links, or snippets to the room in real time.',
    },
    {
      '@type': 'HowToStep',
      name: 'Use and leave',
      text: 'Copy on the target device and leave the temporary room when done.',
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


