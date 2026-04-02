<template>
  <article class="max-w-2xl mx-auto px-6 py-12">
    <!-- Back -->
    <NuxtLink :to="localePath('/tools')" class="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
      <span class="material-symbols-outlined text-base">arrow_back</span>
      {{ c.back }}
    </NuxtLink>

    <!-- Header -->
    <div class="mb-10">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
        <span class="material-symbols-outlined text-sm">swap_horiz</span>
        {{ c.tag }}
      </span>
      <h1 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface mb-3 leading-tight">{{ c.title }}</h1>
      <p class="text-on-surface-variant">{{ c.readTime }}</p>
    </div>

    <!-- Intro -->
    <p class="text-on-surface dark:text-surface leading-relaxed mb-10 text-base">{{ c.intro }}</p>

    <!-- Steps -->
    <section class="mb-10">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-6">{{ c.stepsTitle }}</h2>
      <div class="flex flex-col gap-6">
        <div v-for="(step, i) in c.steps" :key="i" class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">{{ i + 1 }}</div>
          <div class="pt-0.5">
            <p class="font-semibold text-on-surface dark:text-surface mb-1">{{ step.title }}</p>
            <p class="text-sm text-on-surface-variant leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Security note -->
    <div class="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">verified_user</span>
      <div>
        <p class="font-semibold text-on-surface dark:text-surface text-sm mb-1">{{ c.secTitle }}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.secDesc }}</p>
      </div>
    </div>

    <!-- Tip -->
    <div class="rounded-xl bg-surface-container-low dark:bg-surface-container p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-on-surface-variant mt-0.5 flex-shrink-0">lightbulb</span>
      <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.tip }}</p>
    </div>

    <section class="mb-10">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-4">Related searches</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="link in relatedLinks"
          :key="link.to"
          :to="localePath(link.to)"
          class="px-3 py-1.5 rounded-full bg-surface-container-low dark:bg-surface-container text-xs font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </section>

    <!-- CTA -->
    <NuxtLink
:to="localePath('/tools/text-transfer')"
      class="inline-flex items-center gap-2 px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform">
      {{ c.cta }}
      <span class="material-symbols-outlined text-lg">arrow_forward</span>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
definePageMeta({ layout: 'default' })

const c = computed(() => {
  const zh = locale.value !== 'en'
  return {
    back: zh ? '返回全部工具' : 'All Tools',
    tag: zh ? '使用指南' : 'Guide',
    readTime: zh ? '约 3 分钟阅读' : '3 min read',
    title: zh
      ? '如何在手机和电脑之间传输文件与文字'
      : 'How to Transfer Files & Text Between Phone and PC',
    intro: zh
      ? 'ToolPort 的文件与文字传输工具通过 WebRTC 在你的手机和电脑之间建立加密的点对点连接。无需账号，无需安装任何 App，文件直接从设备传送到设备，不经过任何服务器中转。'
      : "ToolPort's File & Text Transfer tool creates a direct, encrypted P2P connection between your phone and computer using WebRTC. No account required, no app to install — files and text go device-to-device without touching any server.",
    stepsTitle: zh ? '操作步骤' : 'Step-by-step',
    steps: zh ? [
      { title: '在电脑上打开工具', desc: '访问「文件与文字传输」工具，页面会自动生成一个二维码和房间 ID。' },
      { title: '用手机扫描二维码', desc: '打开手机相机对准二维码扫描，或手动输入房间 ID，即可建立加密连接。' },
      { title: '等待连接成功', desc: '连接建立后，电脑和手机界面都会显示「已连接」状态，整个过程通常不超过 3 秒。' },
      { title: '传输文字', desc: '在手机的文字输入框中粘贴或输入内容，点击发送，文字会立即出现在电脑界面上。' },
      { title: '传输文件', desc: '点击手机界面的文件按钮，选择要发送的文件（图片、文档等），文件会通过加密通道直接传输到电脑。' },
    ] : [
      { title: 'Open the tool on your computer', desc: 'Visit the File & Text Transfer tool — a QR code and Room ID are generated automatically.' },
      { title: 'Scan the QR code with your phone', desc: "Open your phone's camera and point it at the QR code, or enter the Room ID manually, to establish the encrypted connection." },
      { title: 'Wait for the connection', desc: 'Once connected, both screens show a "Connected" status. This typically takes under 3 seconds.' },
      { title: 'Send text', desc: 'Type or paste text into the mobile input box and tap Send — it appears on your PC instantly.' },
      { title: 'Send a file', desc: 'Tap the file button on your phone, pick any file (photo, document, etc.), and it transfers directly to your PC through the encrypted channel.' },
    ],
    secTitle: zh ? '端到端加密' : 'End-to-End Encrypted',
    secDesc: zh
      ? '所有数据在离开设备之前均使用 AES-256-GCM 加密。ToolPort 的服务器只负责协助建立初始连接，不会接触任何传输内容。'
      : 'All data is encrypted with AES-256-GCM before it leaves your device. ToolPort servers only assist in establishing the initial handshake and never see the content of your transfer.',
    tip: zh
      ? '提示：会话在 10 分钟无活动后自动过期。如需重新连接，点击「刷新二维码」即可开始新会话。'
      : 'Tip: Sessions expire after 10 minutes of inactivity. Click "Refresh QR Code" to start a new session at any time.',
    cta: zh ? '立即使用传输工具' : 'Open Transfer Tool',
  }
})

useHead(() => ({
  title: 'How to Transfer Files from Phone to PC Wirelessly — No App, No USB',
  meta: [
    { name: 'description', content: 'Step-by-step guide: transfer files wirelessly from Android or iPhone to PC without a USB cable or app. Free AirDrop alternative — just scan a QR code, end-to-end encrypted.' },
    { name: 'keywords', content: 'how to transfer files from phone to pc,wireless file transfer tutorial,airdrop alternative for windows guide,transfer photos android to pc without cable,send files iphone to windows no app,file transfer without usb,secure p2p file transfer,qr code file transfer' },
  ],
  link: [{ rel: 'canonical', href: 'https://toolport.dev/guides/file-transfer' }],
}))
useSeoMeta({
  ogTitle: 'How to Transfer Files from Phone to PC Without a Cable or App',
  ogDescription: 'Step-by-step guide: wirelessly transfer files from Android or iPhone to PC. Free AirDrop alternative — scan a QR code, no app install, end-to-end encrypted.',
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: 'https://toolport.dev/guides/file-transfer',
  twitterTitle: 'How to Transfer Files from Phone to PC Wirelessly',
  twitterDescription: 'No app and no USB. Learn a secure phone-to-PC transfer workflow in minutes.',
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I transfer files from phone to PC without USB?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open ToolPort on both devices, scan the QR code, and transfer files over an encrypted browser connection.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a free AirDrop alternative for Windows?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. ToolPort works as a free AirDrop alternative for Windows, Android, iPhone, and macOS with no app installation.',
      },
    },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolport.dev/' },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://toolport.dev/tools' },
    { '@type': 'ListItem', position: 3, name: 'File Transfer Guide', item: 'https://toolport.dev/guides/file-transfer' },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Transfer Files from Phone to PC',
  description: 'Use ToolPort to transfer files/text wirelessly between devices.',
  totalTime: 'PT3M',
  step: [
    { '@type': 'HowToStep', name: 'Open transfer tool', text: 'Open ToolPort File & Text Transfer on your PC.', url: 'https://toolport.dev/tools/text-transfer' },
    { '@type': 'HowToStep', name: 'Pair devices', text: 'Scan QR code or enter Room ID on your phone.' },
    { '@type': 'HowToStep', name: 'Send file or text', text: 'Choose a file or input text and send through encrypted P2P session.' },
    { '@type': 'HowToStep', name: 'Receive on target device', text: 'Open or save received content on the paired device.' },
  ],
})

const relatedLinks = [
  { to: '/tools/text-transfer', label: 'AirDrop alternative for Windows' },
  { to: '/guides/clipboard', label: 'copy paste between phone and PC' },
  { to: '/tools/qr-code', label: 'QR code file transfer workflow' },
]
</script>
