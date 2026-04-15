<template>
  <article class="max-w-2xl mx-auto px-6 py-12">
    <NuxtLink :to="localePath('/text-transfer')" class="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
      <span class="material-symbols-outlined text-base">arrow_back</span>
      {{ c.back }}
    </NuxtLink>

    <div class="mb-10">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
        <span class="material-symbols-outlined text-sm">swap_horiz</span>
        {{ c.tag }}
      </span>
      <h1 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface mb-3 leading-tight">{{ c.title }}</h1>
      <p class="text-on-surface-variant">{{ c.readTime }}</p>
    </div>

    <p class="text-on-surface dark:text-surface leading-relaxed mb-10 text-base">{{ c.intro }}</p>

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

    <div class="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">verified_user</span>
      <div>
        <p class="font-semibold text-on-surface dark:text-surface text-sm mb-1">{{ c.secTitle }}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.secDesc }}</p>
      </div>
    </div>

    <div class="rounded-xl bg-surface-container-low dark:bg-surface-container p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-on-surface-variant mt-0.5 flex-shrink-0">lightbulb</span>
      <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.tip }}</p>
    </div>

    <section class="mb-10">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-4">Related searches</h2>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="link in relatedLinks"
          :key="link.label"
          :to="localePath(link.to)"
          class="px-3 py-1.5 rounded-full bg-surface-container-low dark:bg-surface-container text-xs font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </section>

    <NuxtLink
      :to="localePath('/text-transfer')"
      class="inline-flex items-center gap-2 px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
    >
      {{ c.cta }}
      <span class="material-symbols-outlined text-lg">arrow_forward</span>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://fileio.top')
const canonicalUrl = computed(() =>
  new URL(localePath('/guides/file-transfer'), siteBaseUrl.value).toString(),
)

definePageMeta({ layout: 'default' })

const c = computed(() => {
  const zh = locale.value !== 'en'
  return {
    back: zh ? '返回全部工具' : 'All Tools',
    tag: zh ? '使用指南' : 'Guide',
    readTime: zh ? '约 3 分钟阅读' : '3 min read',
    title: zh ? '如何在手机和电脑之间传输文件与文本' : 'How to Transfer Files & Text Between Phone and PC',
    intro: zh
      ? 'FileIO 通过 WebRTC 在手机和电脑间建立加密直连。无需账号、无需安装 App，文件与文本可在设备间直接传输。'
      : "FileIO's File & Text Transfer tool creates a direct encrypted WebRTC connection between your phone and computer, with no account and no app installation required.",
    stepsTitle: zh ? '操作步骤' : 'Step-by-step',
    steps: zh ? [
      { title: '在电脑端打开工具', desc: '进入工具后会自动生成二维码与房间 ID。' },
      { title: '手机扫码连接', desc: '使用手机扫码，或手动输入房间 ID 完成配对。' },
      { title: '等待连接成功', desc: '通常几秒内即可建立连接。' },
      { title: '发送文本', desc: '在手机输入文本后发送，电脑会实时收到。' },
      { title: '发送文件', desc: '选择文件后可通过加密通道直接传输到电脑。' },
    ] : [
      { title: 'Open the tool on your computer', desc: 'Visit the File & Text Transfer tool - a QR code and Room ID are generated automatically.' },
      { title: 'Scan the QR code with your phone', desc: "Open your phone's camera and point it at the QR code, or enter the Room ID manually to establish the encrypted connection." },
      { title: 'Wait for the connection', desc: 'Once connected, both screens show a "Connected" status. This typically takes under 3 seconds.' },
      { title: 'Send text', desc: 'Type or paste text into the mobile input box and tap Send - it appears on your PC instantly.' },
      { title: 'Send a file', desc: 'Tap the file button on your phone, pick any file (photo, document, etc.), and it transfers directly to your PC through the encrypted channel.' },
    ],
    secTitle: zh ? '端到端加密' : 'End-to-End Encrypted',
    secDesc: zh
      ? '所有传输内容通过 WebRTC DTLS 加密；服务端仅协助建立配对握手，不经过文件和文本。'
      : 'All traffic is encrypted in transit via WebRTC DTLS. FileIO servers only assist in the pairing handshake and never see the content of your transfer.',
    tip: zh
      ? '提示：如果房间未能配对成功，可随时点击"刷新二维码"重新开始会话。'
      : 'Tip: If pairing stalls, click "Refresh QR Code" anytime to start a new session.',
    cta: zh ? '立即使用传输工具' : 'Open Transfer Tool',
  }
})

useHead(() => ({
  title: t('seo.guideTransfer.title'),
  meta: [
    { name: 'description', content: t('seo.guideTransfer.desc') },
    { name: 'keywords', content: t('seo.guideTransfer.keywords') },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta({
  ogTitle: () => t('seo.guideTransfer.ogTitle'),
  ogDescription: () => t('seo.guideTransfer.ogDesc'),
  ogImage: `${siteBaseUrl.value}/og-image.png`,
  ogUrl: () => canonicalUrl.value,
  twitterTitle: () => t('seo.guideTransfer.ogTitle'),
  twitterDescription: () => t('seo.guideTransfer.ogDesc'),
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
        text: 'Open FileIO on both devices, scan the QR code, and transfer files over an encrypted browser connection.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a free AirDrop alternative for Windows?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. FileIO works as a free AirDrop alternative for Windows, Android, iPhone, and macOS with no app installation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does accountless P2P web transfer mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It means you can transfer directly in the browser via WebRTC peer-to-peer without creating an account, and without routing your file through cloud storage.',
      },
    },
  ],
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteBaseUrl.value}/` },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteBaseUrl.value}/tools` },
    { '@type': 'ListItem', position: 3, name: 'File Transfer Guide', item: canonicalUrl.value },
  ],
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Transfer Files from Phone to PC',
  description: 'Use FileIO to transfer files/text wirelessly between devices.',
  totalTime: 'PT3M',
  step: [
    { '@type': 'HowToStep', name: 'Open transfer tool', text: 'Open FileIO File & Text Transfer on your PC.', url: `${siteBaseUrl.value}/text-transfer` },
    { '@type': 'HowToStep', name: 'Pair devices', text: 'Scan QR code or enter Room ID on your phone.' },
    { '@type': 'HowToStep', name: 'Send file or text', text: 'Choose a file or input text and send through encrypted P2P session.' },
    { '@type': 'HowToStep', name: 'Receive on target device', text: 'Open or save received content on the paired device.' },
  ],
})

const relatedLinks = [
  { to: '/text-transfer', label: 'accountless file transfer' },
  { to: '/text-transfer', label: 'p2p web transfer' },
  { to: '/text-transfer', label: 'zero-knowledge file drop' },
]
</script>

