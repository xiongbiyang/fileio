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
        <span class="material-symbols-outlined text-sm">content_paste</span>
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

    <!-- Use cases -->
    <section class="mb-10">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-4">{{ c.usecaseTitle }}</h2>
      <ul class="flex flex-col gap-3">
        <li v-for="(uc, i) in c.usecases" :key="i" class="flex items-start gap-3 text-sm text-on-surface-variant">
          <span class="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0">check_circle</span>
          {{ uc }}
        </li>
      </ul>
    </section>

    <!-- Note -->
    <div class="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">schedule</span>
      <div>
        <p class="font-semibold text-on-surface dark:text-surface text-sm mb-1">{{ c.expireTitle }}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.expireDesc }}</p>
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
:to="localePath('/tools/clipboard')"
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
    readTime: zh ? '约 2 分钟阅读' : '2 min read',
    title: zh
      ? '如何跨设备同步剪贴板内容'
      : 'How to Sync Your Clipboard Across Devices',
    intro: zh
      ? 'ToolPort 的在线剪贴板工具可以创建一个临时的共享房间，让你在手机、平板和电脑之间即时同步文字、链接和代码片段。所有设备加入同一个房间后，任何一端的内容变化都会实时同步给其他设备。'
      : "ToolPort's Online Clipboard creates a temporary shared room where you can instantly sync text, links, and code snippets between your phone, tablet, and computer. Any content change on one device is synced to all others in real time.",
    stepsTitle: zh ? '操作步骤' : 'How to use it',
    steps: zh ? [
      { title: '打开在线剪贴板工具', desc: '进入「在线剪贴板」页面。' },
      { title: '创建房间', desc: '点击「创建房间」，系统会生成一个唯一的房间 ID。你也可以手动输入一个自定义 ID，方便记忆。' },
      { title: '在其他设备上加入房间', desc: '在另一台设备上打开同一工具，输入相同的房间 ID 并点击「加入」，或直接扫描第一台设备上显示的二维码（如果有的话）。' },
      { title: '粘贴或输入内容', desc: '在任意设备上粘贴文字、链接或代码片段，内容会实时同步到所有连接的设备上。' },
      { title: '复制到剪贴板', desc: '在其他设备上点击收到的内容，一键复制到本地剪贴板，即可在任何应用中粘贴使用。' },
    ] : [
      { title: 'Open the Online Clipboard tool', desc: 'Go to the Online Clipboard page.' },
      { title: 'Create a room', desc: 'Click "Create Room" — a unique Room ID is generated. You can also type a custom ID that\'s easy to remember.' },
      { title: 'Join from your other device', desc: 'On another device, open the same tool, enter the same Room ID and click "Join".' },
      { title: 'Paste or type content', desc: 'Paste text, links, or code snippets on any device — the content syncs instantly to all connected devices.' },
      { title: 'Copy to clipboard', desc: 'On any device, tap the received content to copy it to your local clipboard and paste it anywhere.' },
    ],
    usecaseTitle: zh ? '适用场景' : 'Common use cases',
    usecases: zh ? [
      '把手机上的链接快速发送到电脑浏览器',
      '在不同电脑之间传递代码片段或命令',
      '把电脑上的长段文字快速发送到手机',
      '临时共享会议链接或验证码给多台设备',
      '无需 iCloud / Google 账号的跨平台文字传输',
    ] : [
      'Quickly send a link from your phone to your desktop browser',
      'Share code snippets or terminal commands between computers',
      'Send a long text from your PC to your phone for on-the-go reading',
      'Share a meeting link or OTP code to multiple devices instantly',
      'Cross-platform text sharing without needing iCloud or Google accounts',
    ],
    expireTitle: zh ? '自动过期' : 'Auto-Expiring Rooms',
    expireDesc: zh
      ? '每个房间在创建后 24 小时会自动清空并关闭，不会永久保存任何内容。请勿将房间用于存储敏感的长期数据。'
      : 'Every room auto-expires and is cleared 24 hours after creation. No content is stored permanently. Do not use rooms for long-term sensitive data storage.',
    tip: zh
      ? '提示：房间 ID 区分大小写，且在有效期内任何知道 ID 的人都可以加入。请避免使用过于简单的 ID（如 "123"）以防他人误入。'
      : 'Tip: Room IDs are case-sensitive and anyone who knows the ID can join during the session. Avoid very simple IDs like "123" to prevent accidental collisions.',
    cta: zh ? '立即使用在线剪贴板' : 'Open Online Clipboard',
  }
})

useHead(() => ({
  title: 'How to Sync Clipboard Between Phone and PC — Copy Paste Across Devices',
  meta: [
    { name: 'description', content: 'Step-by-step guide: sync clipboard between phone and PC instantly. Copy text or links on one device, paste on another — no app, no signup, end-to-end encrypted.' },
    { name: 'keywords', content: 'online clipboard sync guide,copy paste between phone and pc,cross-device clipboard tutorial,share text from phone to computer,send link from phone to pc,clipboard sync without app,real-time clipboard sharing,copy on phone paste on pc' },
  ],
  link: [{ rel: 'canonical', href: 'https://toolport.dev/guides/clipboard' }],
}))
useSeoMeta({
  ogTitle: 'How to Sync Clipboard Between Phone and PC Guide',
  ogDescription: 'Copy on your phone, paste on your PC instantly. Step-by-step guide to syncing clipboard across devices — no app, no signup, end-to-end encrypted.',
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: 'https://toolport.dev/guides/clipboard',
  twitterTitle: 'How to Sync Clipboard Between Phone and PC',
  twitterDescription: 'Copy text on one device and paste on another with real-time encrypted clipboard rooms.',
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I copy on phone and paste on PC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Create or join the same ToolPort clipboard room on both devices. Text added on one device appears instantly on the other device.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install an app to sync clipboard across devices?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. ToolPort clipboard sync runs in your browser and does not require app installation or account signup.',
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
    { '@type': 'ListItem', position: 3, name: 'Clipboard Guide', item: 'https://toolport.dev/guides/clipboard' },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Sync Clipboard Between Phone and PC',
  description: 'Use ToolPort Online Clipboard to sync text and links in real time.',
  totalTime: 'PT2M',
  step: [
    { '@type': 'HowToStep', name: 'Open clipboard tool', text: 'Open ToolPort Online Clipboard.', url: 'https://toolport.dev/tools/clipboard' },
    { '@type': 'HowToStep', name: 'Create or join room', text: 'Create a room on one device and join with same room ID on another.' },
    { '@type': 'HowToStep', name: 'Sync content', text: 'Paste text or links and see instant sync across connected devices.' },
    { '@type': 'HowToStep', name: 'Copy and use', text: 'Copy synced content and paste into any local app.' },
  ],
})

const relatedLinks = [
  { to: '/tools/clipboard', label: 'online clipboard sync' },
  { to: '/guides/file-transfer', label: 'transfer text from phone to computer' },
  { to: '/tools/text-transfer', label: 'send links from phone to PC' },
]
</script>
