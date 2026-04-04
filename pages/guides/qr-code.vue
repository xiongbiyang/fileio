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
        <span class="material-symbols-outlined text-sm">qr_code_2</span>
        {{ c.tag }}
      </span>
      <h1 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface mb-3 leading-tight">{{ c.title }}</h1>
      <p class="text-on-surface-variant">{{ c.readTime }}</p>
    </div>

    <!-- Intro -->
    <p class="text-on-surface dark:text-surface leading-relaxed mb-10 text-base">{{ c.intro }}</p>

    <!-- Generate section -->
    <section class="mb-10">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-6">{{ c.generateTitle }}</h2>
      <div class="flex flex-col gap-6">
        <div v-for="(step, i) in c.generateSteps" :key="i" class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">{{ i + 1 }}</div>
          <div class="pt-0.5">
            <p class="font-semibold text-on-surface dark:text-surface mb-1">{{ step.title }}</p>
            <p class="text-sm text-on-surface-variant leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Scan section -->
    <section class="mb-10">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-6">{{ c.scanTitle }}</h2>
      <div class="flex flex-col gap-6">
        <div v-for="(step, i) in c.scanSteps" :key="i" class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-sm font-bold">{{ i + 1 }}</div>
          <div class="pt-0.5">
            <p class="font-semibold text-on-surface dark:text-surface mb-1">{{ step.title }}</p>
            <p class="text-sm text-on-surface-variant leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tip -->
    <div class="rounded-xl bg-surface-container-low dark:bg-surface-container p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-on-surface-variant mt-0.5 flex-shrink-0">lightbulb</span>
      <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.tip }}</p>
    </div>

    <!-- Privacy note -->
    <div class="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-10 flex gap-3">
      <span class="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">lock</span>
      <div>
        <p class="font-semibold text-on-surface dark:text-surface text-sm mb-1">{{ c.privacyTitle }}</p>
        <p class="text-sm text-on-surface-variant leading-relaxed">{{ c.privacyDesc }}</p>
      </div>
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
:to="localePath('/tools/qr-code')"
      class="inline-flex items-center gap-2 px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform">
      {{ c.cta }}
      <span class="material-symbols-outlined text-lg">arrow_forward</span>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://toolport.dev')
const canonicalUrl = computed(() =>
  new URL(localePath('/guides/qr-code'), siteBaseUrl.value).toString(),
)
definePageMeta({ layout: 'default' })

const c = computed(() => {
  const zh = locale.value !== 'en'
  return {
    back: zh ? '返回全部工具' : 'All Tools',
    tag: zh ? '使用指南' : 'Guide',
    readTime: zh ? '约 2 分钟阅读' : '2 min read',
    title: zh ? '如何生成二维码并进行扫码识别' : 'How to Generate QR Codes and Scan from Camera',
    intro: zh
      ? 'ToolPort 二维码工具在浏览器本地运行。你可以为链接或文本生成二维码，也可以用摄像头或图片进行扫码识别，全程无需上传内容。'
      : "ToolPort's QR code tool runs fully in your browser. Generate QR codes for URLs or text, and scan from camera or image files without uploading your content.",
    generateTitle: zh ? '生成二维码' : 'Generate a QR Code',
    generateSteps: zh ? [
      { title: '打开二维码工具', desc: '进入二维码页面，默认会展示“生成”模式。' },
      { title: '输入内容', desc: '输入链接或文本，二维码会实时生成。' },
      { title: '调整参数（可选）', desc: '可调整尺寸、纠错等级和前景/背景色。' },
      { title: '下载二维码', desc: '支持下载 PNG 或 SVG，便于线上与打印场景。' },
    ] : [
      { title: 'Open the QR Code tool', desc: 'Go to the QR Code tool page, with Generate mode selected by default.' },
      { title: 'Enter your content', desc: 'Paste or type any URL, text, or data into the input field. The QR code generates in real time as you type.' },
      { title: 'Adjust settings (optional)', desc: 'Tweak the size, error correction level, and foreground/background colors to suit your use case.' },
      { title: 'Download', desc: 'Click "Download PNG" or "Download SVG" to save your QR code. PNG for everyday use, SVG for print and high-resolution needs.' },
    ],
    scanTitle: zh ? '扫码识别' : 'Scan a QR Code',
    scanSteps: zh ? [
      { title: '切换到扫描模式', desc: '点击页面中的“扫描”标签。' },
      { title: '上传图片或启用摄像头', desc: '可上传含二维码图片，或直接使用摄像头实时扫描。' },
      { title: '查看结果', desc: '识别成功后可直接打开链接或复制内容。' },
    ] : [
      { title: 'Switch to the Scan tab', desc: 'Click the "Scan QR" tab at the top of the page.' },
      { title: 'Upload an image or use camera', desc: 'Click the scan area to upload an image containing a QR code, or activate your camera for live scanning.' },
      { title: 'View the result', desc: 'The decoded content appears instantly. If it\'s a URL you can click to open it; if it\'s text you can copy it with one click.' },
    ],
    tip: zh
      ? '提示：请确保二维码清晰并光线充足；若识别失败，可提高纠错等级后重新生成。'
      : 'Tip: For best scan results, make sure the QR code image is clear and well-lit. If scanning fails, try regenerating with a higher error correction level (Q or H).',
    privacyTitle: zh ? '100% 本地处理' : '100% Local Processing',
    privacyDesc: zh
      ? '二维码生成与扫描都在浏览器本地完成，不会上传你的内容或图片。'
      : 'Both QR code generation and scanning happen entirely inside your browser. Your content and images are never sent to any server.',
    cta: zh ? '立即使用二维码工具' : 'Open QR Code Tool',
  }
})

useHead(() => ({
  title: 'Client-side QR Code Creator Guide - No-Tracking & Static QR',
  meta: [
    { name: 'description', content: 'Learn how to use a client-side QR code creator: no-tracking QR code, offline-friendly generation, and static QR without expiration.' },
    { name: 'keywords', content: 'client-side qr code creator,no-tracking qr code,offline qr code generator,static qr without expiration,never expire qr code,scan qr code from image' },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
}))
useSeoMeta({
  ogTitle: 'Client-side QR Code Creator Guide - ToolPort',
  ogDescription: 'No-tracking QR code workflow with local generation, offline-friendly usage, and static QR without expiration.',
  ogImage: 'https://toolport.dev/og-image.png',
  ogUrl: () => canonicalUrl.value,
  twitterTitle: 'No-Tracking QR Code Guide',
  twitterDescription: 'Client-side and static QR workflow, including offline-friendly generation tips.',
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How can I create a QR code for free online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open ToolPort QR Code tool, enter your text or URL, customize options, and download the generated PNG or SVG file.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I scan a QR code from an image file?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can upload a screenshot or photo that contains a QR code and ToolPort will decode it in your browser.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are ToolPort QR codes static without expiration?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. ToolPort generates static QR codes and does not force expiration timers for generated codes.',
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
    { '@type': 'ListItem', position: 3, name: 'QR Code Guide', item: canonicalUrl.value },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate and Scan QR Codes',
  description: 'Generate QR codes and scan from camera/image in ToolPort.',
  totalTime: 'PT2M',
  step: [
    { '@type': 'HowToStep', name: 'Open QR Code tool', text: 'Open ToolPort QR Code tool.', url: 'https://toolport.dev/tools/qr-code' },
    { '@type': 'HowToStep', name: 'Generate QR', text: 'Enter text or URL and adjust style options.' },
    { '@type': 'HowToStep', name: 'Scan QR', text: 'Switch to Scan and use camera or upload image.' },
    { '@type': 'HowToStep', name: 'Export', text: 'Download QR in PNG, SVG, or WebP.' },
  ],
})

const relatedLinks = [
  { to: '/tools/qr-code', label: 'client-side qr code creator' },
  { to: '/tools/qr-code', label: 'no-tracking qr code' },
  { to: '/tools/qr-code', label: 'offline qr code generator' },
  { to: '/tools/qr-code', label: 'static qr without expiration' },
]
</script>

