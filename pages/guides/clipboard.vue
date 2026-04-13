<template>
  <article class="max-w-2xl mx-auto px-6 py-12">
    <NuxtLink :to="localePath('/tools')" class="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
      <span class="material-symbols-outlined text-base">arrow_back</span>
      {{ c.back }}
    </NuxtLink>

    <div class="mb-10">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
        <span class="material-symbols-outlined text-sm">content_paste</span>
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

    <section class="mb-10">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-4">{{ c.usecaseTitle }}</h2>
      <ul class="flex flex-col gap-3">
        <li v-for="(uc, i) in c.usecases" :key="i" class="flex items-start gap-3 text-sm text-on-surface-variant">
          <span class="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0">check_circle</span>
          {{ uc }}
        </li>
      </ul>
    </section>

    <div class="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">schedule</span>
      <div>
        <p class="font-semibold text-on-surface dark:text-surface text-sm mb-1">{{ c.expireTitle }}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.expireDesc }}</p>
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
      :to="localePath('/tools/clipboard')"
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
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://toolport.dev')
const canonicalUrl = computed(() =>
  new URL(localePath('/guides/clipboard'), siteBaseUrl.value).toString(),
)

definePageMeta({ layout: 'default' })

const c = computed(() => {
  const zh = locale.value !== 'en'
  return {
    back: zh ? '返回全部工具' : 'All Tools',
    tag: zh ? '使用指南' : 'Guide',
    readTime: zh ? '约 2 分钟阅读' : '2 min read',
    title: zh ? '如何跨设备同步剪贴板内容' : 'How to Sync Your Clipboard Across Devices',
    intro: zh
      ? 'ToolPort 在线剪贴板会创建一个临时房间，帮助你在手机和电脑之间实时同步文本内容。'
      : "ToolPort's Online Clipboard creates a temporary room where you can sync text and links between your devices in real time.",
    stepsTitle: zh ? '操作步骤' : 'How to use it',
    steps: zh ? [
      { title: '打开在线剪贴板', desc: '进入工具页面。' },
      { title: '创建房间', desc: '点击创建房间，系统会生成房间 ID。' },
      { title: '其他设备加入', desc: '在另一台设备输入同一房间 ID 加入。' },
      { title: '输入或粘贴文本', desc: '内容会在连接设备间实时同步。' },
      { title: '一键复制', desc: '在接收端点击复制即可粘贴到任意应用。' },
    ] : [
      { title: 'Open the Online Clipboard tool', desc: 'Go to the Online Clipboard page.' },
      { title: 'Create a room', desc: 'Click "Create Room" - a unique Room ID is generated. You can also type a custom ID.' },
      { title: 'Join from your other device', desc: 'On another device, open the same tool, enter the same Room ID and click "Join".' },
      { title: 'Paste or type content', desc: 'Paste text, links, or code snippets on any device - the content syncs instantly to connected devices.' },
      { title: 'Copy to clipboard', desc: 'On any device, tap the received content to copy it to your local clipboard.' },
    ],
    usecaseTitle: zh ? '常见场景' : 'Common use cases',
    usecases: zh ? [
      '把手机里的链接快速发到电脑',
      '跨设备传递代码片段或命令',
      '把电脑上的长文本同步到手机',
      '临时分享会议链接或验证码',
      '无需 iCloud 或 Google 账号的文本同步',
    ] : [
      'Quickly send a link from your phone to your desktop browser',
      'Share code snippets or terminal commands between computers',
      'Send a long text from your PC to your phone',
      'Share a meeting link or OTP code to multiple devices instantly',
      'Cross-platform text sharing without needing iCloud or Google accounts',
    ],
    expireTitle: zh ? '自动过期房间' : 'Auto-Expiring Rooms',
    expireDesc: zh
      ? '每个房间会在 24 小时后自动清空并关闭，不会永久保存内容。'
      : 'Every room auto-expires and is cleared 24 hours after creation. No content is stored permanently.',
    tip: zh
      ? '提示：房间 ID 区分大小写，且知道 ID 的人都可加入，请避免过于简单的 ID。'
      : 'Tip: Room IDs are case-sensitive and anyone who knows the ID can join during the session. Avoid very simple IDs.',
    cta: zh ? '立即使用在线剪贴板' : 'Open Online Clipboard',
  }
})

useHead(() => ({
  title: t('seo.guideClipboard.title'),
  meta: [
    { name: 'description', content: t('seo.guideClipboard.desc') },
    { name: 'keywords', content: t('seo.guideClipboard.keywords') },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))

useSeoMeta({
  ogTitle: () => t('seo.guideClipboard.ogTitle'),
  ogDescription: () => t('seo.guideClipboard.ogDesc'),
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: () => canonicalUrl.value,
  twitterTitle: () => t('seo.guideClipboard.ogTitle'),
  twitterDescription: () => t('seo.guideClipboard.ogDesc'),
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
    {
      '@type': 'Question',
      name: 'What is ephemeral text share?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ephemeral text share means temporary cross-device text syncing where room content auto-expires after a set period.',
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
    { '@type': 'ListItem', position: 3, name: 'Clipboard Guide', item: canonicalUrl.value },
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
  { to: '/tools/clipboard', label: 'ephemeral text share' },
  { to: '/tools/clipboard', label: 'browser-to-browser share' },
  { to: '/tools/text-transfer', label: 'accountless transfer between devices' },
]
</script>

