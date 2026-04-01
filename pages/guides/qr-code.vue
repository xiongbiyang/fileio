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

    <!-- CTA -->
    <NuxtLink :to="localePath('/tools/qr-code')"
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
      ? '如何生成二维码和用摄像头扫描二维码'
      : 'How to Generate QR Codes and Scan from Camera',
    intro: zh
      ? 'ToolPort 的二维码工具完全在你的浏览器本地运行。你可以为任意链接或文本生成高质量的二维码，也可以直接用摄像头或上传图片来扫描二维码，全程无需上传任何数据到服务器。'
      : "ToolPort's QR Code tool runs entirely in your browser. Generate high-quality QR codes for any URL or text, or scan codes directly from your camera or image files — no data is ever uploaded to a server.",
    generateTitle: zh ? '生成二维码' : 'Generate a QR Code',
    generateSteps: zh ? [
      { title: '打开二维码工具', desc: '进入「二维码工具」页面，默认显示「生成」标签。' },
      { title: '输入内容', desc: '在输入框中粘贴或输入任意网址、文字或其他内容，二维码会实时生成。' },
      { title: '调整参数（可选）', desc: '可以调整尺寸、纠错级别，以及前景色和背景色，满足不同使用场景。' },
      { title: '下载二维码', desc: '点击「下载 PNG」或「下载 SVG」保存二维码图片，PNG 适合普通使用，SVG 适合打印和高清场景。' },
    ] : [
      { title: 'Open the QR Code tool', desc: 'Go to the QR Code tool page — the Generate tab is shown by default.' },
      { title: 'Enter your content', desc: 'Paste or type any URL, text, or data into the input field. The QR code generates in real time as you type.' },
      { title: 'Adjust settings (optional)', desc: 'Tweak the size, error correction level, and foreground/background colors to suit your use case.' },
      { title: 'Download', desc: 'Click "Download PNG" or "Download SVG" to save your QR code. PNG for everyday use, SVG for print and high-resolution needs.' },
    ],
    scanTitle: zh ? '扫描二维码' : 'Scan a QR Code',
    scanSteps: zh ? [
      { title: '切换到「扫描」标签', desc: '点击页面顶部的「扫描二维码」标签。' },
      { title: '上传图片或使用摄像头', desc: '点击扫描区域，选择上传包含二维码的图片，或调用摄像头实时扫描。' },
      { title: '查看结果', desc: '识别结果会立即显示。如果是网址，可以直接点击跳转；如果是文字，可以一键复制。' },
    ] : [
      { title: 'Switch to the Scan tab', desc: 'Click the "Scan QR" tab at the top of the page.' },
      { title: 'Upload an image or use camera', desc: 'Click the scan area to upload an image containing a QR code, or activate your camera for live scanning.' },
      { title: 'View the result', desc: 'The decoded content appears instantly. If it\'s a URL you can click to open it; if it\'s text you can copy it with one click.' },
    ],
    tip: zh
      ? '提示：扫描时确保二维码图片清晰、光线充足，识别成功率会更高。如果扫描失败，可以尝试提高纠错级别后重新生成。'
      : 'Tip: For best scan results, make sure the QR code image is clear and well-lit. If scanning fails, try regenerating with a higher error correction level (Q or H).',
    privacyTitle: zh ? '100% 本地处理' : '100% Local Processing',
    privacyDesc: zh
      ? '二维码的生成和扫描全部在你的浏览器中完成，不会向任何服务器上传你的内容或图片。'
      : 'Both QR code generation and scanning happen entirely inside your browser. Your content and images are never sent to any server.',
    cta: zh ? '立即使用二维码工具' : 'Open QR Code Tool',
  }
})

useHead(() => ({
  title: c.value.title + ' - ToolPort Guide',
  meta: [
    { name: 'description', content: 'How to generate and scan QR codes with ToolPort. Create custom QR codes with logos, batch generate from CSV, and scan from camera or image files.' },
    { name: 'keywords', content: 'QR code guide,how to generate QR code,QR code scanner tutorial,custom QR code logo,batch QR code CSV,QR code colors' },
  ],
}))
useSeoMeta({
  ogTitle: 'QR Code Generator Guide - ToolPort',
  ogDescription: 'How to generate and scan QR codes with ToolPort. Create custom QR codes with logos, batch generate from CSV, and scan from camera or image files.',
  ogImage: 'https://toolport.dev/og-image.png',
})
</script>
