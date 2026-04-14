<template>
  <article class="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
    <template v-if="post && html">
      <!-- Back -->
      <NuxtLink :to="localePath('/blog')" class="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        {{ $t('blog.backToList') }}
      </NuxtLink>

      <!-- Header -->
      <header class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <time class="text-sm text-on-surface-variant">{{ formatDate(localizedPost!.date) }}</time>
          <span class="text-on-surface-variant/30">|</span>
          <span class="text-sm text-on-surface-variant">{{ localizedPost!.author }}</span>
        </div>
        <h1 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight leading-tight mb-4">
          {{ localizedPost!.title }}
        </h1>
        <p class="text-on-surface-variant text-lg leading-relaxed">{{ localizedPost!.description }}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span v-for="tag in localizedPost!.tags" :key="tag" class="px-3 py-1 bg-surface-container-high dark:bg-surface-container-highest rounded-full text-xs font-medium text-on-surface-variant">
            {{ tag }}
          </span>
        </div>
      </header>

      <!-- Content -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="prose" v-html="sanitizedHtml" />

      <!-- Ad — between article body and tools/CTA -->
      <AdSlot slot="blog-article-bottom" container-class="mt-12" :min-height="120" />

      <!-- Footer -->
      <footer class="mt-16 pt-8 border-t border-outline-variant/20">
        <div class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-6 mb-8">
          <h3 class="font-headline font-bold text-on-surface dark:text-surface mb-4">{{ $t('blog.tryTools') }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NuxtLink v-for="tool in tools" :key="tool.path" :to="localePath(tool.path)" class="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors group">
              <span class="material-symbols-outlined text-primary">{{ tool.icon }}</span>
              <span class="text-sm font-medium text-on-surface dark:text-surface group-hover:text-primary transition-colors">{{ tool.name }}</span>
            </NuxtLink>
          </div>
        </div>
        <div>
          <NuxtLink :to="localePath('/blog')" class="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            <span class="material-symbols-outlined text-lg">arrow_back</span>
            {{ $t('blog.backToList') }}
          </NuxtLink>
        </div>
      </footer>
    </template>

    <!-- Not Found -->
    <div v-else class="text-center py-20">
      <span class="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">search_off</span>
      <h1 class="font-headline text-2xl font-bold text-on-surface dark:text-surface mb-2">{{ $t('blog.notFound') }}</h1>
      <NuxtLink :to="localePath('/blog')" class="text-primary font-bold text-sm hover:underline">{{ $t('blog.backToList') }}</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { getLocalizedPost } from '~/composables/useBlogPosts'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const slug = computed(() => route.params.slug as string)
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://fileio.top')
const localizedBlogPath = computed(() => localePath(`/blog/${slug.value}`))
const localizedBlogListPath = computed(() => localePath('/blog'))
const localizedHomePath = computed(() => localePath('/'))
const blogUrl = computed(() => new URL(localizedBlogPath.value, siteBaseUrl.value).toString())

const { locale } = useI18n()
const posts = useBlogPosts()
const post = computed(() => posts.find(p => p.slug === slug.value))
const localizedPost = computed(() => {
  if (!post.value) return null
  const localized = getLocalizedPost(post.value, locale.value)
  return { ...post.value, ...localized }
})

// Load markdown at setup-time so SSR/prerender can render article content.
const markdownModulesEn = import.meta.glob('~/content/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const markdownModulesZhCN = import.meta.glob('~/content/blog/zh-CN/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const rawMarkdown = computed(() => {
  // Try locale-specific markdown first, fall back to English
  if (locale.value === 'zh-CN') {
    const zhKey = Object.keys(markdownModulesZhCN).find(k => k.endsWith(`/${slug.value}.md`))
    if (zhKey && markdownModulesZhCN[zhKey]) return markdownModulesZhCN[zhKey]
  }
  const key = Object.keys(markdownModulesEn).find(k => k.endsWith(`/${slug.value}.md`))
  return key ? markdownModulesEn[key] : ''
})

const markdownContent = computed(() => {
  if (!rawMarkdown.value) return ''
  // Strip frontmatter with LF/CRLF compatibility.
  return rawMarkdown.value.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
})

const frontmatter = computed(() => {
  const match = rawMarkdown.value.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return ''
  return match[1]
})

function readFrontmatterDate(frontmatterText: string, keys: string[]) {
  for (const key of keys) {
    const pattern = new RegExp(`^${key}:\\s*["']?([^"'\n]+)["']?\\s*$`, 'im')
    const match = frontmatterText.match(pattern)
    if (!match) continue
    const value = match[1].trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  }
  return null
}

const postPublishedDate = computed(() => post.value?.date || '')
const postModifiedDate = computed(() => {
  const modified = readFrontmatterDate(frontmatter.value, ['updated', 'updatedAt', 'lastmod', 'modified', 'dateModified'])
  return modified || postPublishedDate.value
})

const html = computed(() => {
  if (!markdownContent.value) return ''
  return marked.parse(markdownContent.value) as string
})
const sanitizedHtml = computed(() => sanitizeBlogHtml(html.value))

function isUnsafeUri(value: string): boolean {
  // eslint-disable-next-line no-control-regex
  const normalized = value.trim().toLowerCase().replace(/[\s\x00-\x1f]+/g, '')
  return normalized.startsWith('javascript:')
    || normalized.startsWith('vbscript:')
    || normalized.startsWith('data:')
}

function sanitizeBlogHtml(raw: string) {
  if (!raw) return ''
  let safe = raw
    // Strip dangerous tags (including self-closing and content-bearing).
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form|textarea|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form|textarea|svg|math)\b[^>]*\/?>/gi, '')
    // Remove inline event handlers (onclick, onerror, onload, etc.).
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    // Remove style attributes (can be used for CSS-based attacks).
    .replace(/\sstyle\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')

  // Sanitize href/src attributes (quoted)
  safe = safe.replace(/\s(href|src|action|formaction|xlink:href)\s*=\s*(['"])(.*?)\2/gi, (_m, attr: string, quote: string, value: string) => {
    if (isUnsafeUri(value)) return ` ${attr}=${quote}#${quote}`
    return ` ${attr}=${quote}${value}${quote}`
  })

  // Sanitize href/src attributes (unquoted)
  safe = safe.replace(/\s(href|src|action|formaction|xlink:href)\s*=\s*([^\s>"']+)/gi, (_m, attr: string, value: string) => {
    if (isUnsafeUri(value)) return ` ${attr}="#"`
    return ` ${attr}="${value}"`
  })

  return safe
}

function inferBlogType(p: NonNullable<typeof post.value>) {
  const title = p.title.toLowerCase()
  const tags = p.tags.map(tag => tag.toLowerCase())
  if (title.startsWith('how to') || tags.includes('guide')) return 'howto'
  if (tags.some(tag => tag.includes('airdrop') || tag.includes('file transfer') || tag.includes('phone to pc'))) return 'transfer'
  return 'general'
}

function buildFaqForPost(p: NonNullable<typeof post.value>) {
  const comparisonFaqBySlug: Record<string, Array<{ '@type': 'Question', name: string, acceptedAnswer: { '@type': 'Answer', text: string } }>> = {
    'fileio-vs-airdrop-comparison': [
      {
        '@type': 'Question',
        name: 'Does AirDrop work from iPhone to Windows?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. AirDrop is designed for Apple ecosystem sharing and does not natively send to Windows PCs.' },
      },
      {
        '@type': 'Question',
        name: 'What is a practical AirDrop alternative for Windows users?',
        acceptedAnswer: { '@type': 'Answer', text: 'A browser-based workflow like FileIO is practical for iPhone or Android to Windows transfer without app installation.' },
      },
      {
        '@type': 'Question',
        name: 'Do I need account signup for phone-to-PC transfer?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. FileIO supports account-free browser transfer workflows for common scenarios.' },
      },
    ],
    'fileio-vs-snapdrop-comparison': [
      {
        '@type': 'Question',
        name: 'Do both devices need to be on the same Wi-Fi for Snapdrop?',
        acceptedAnswer: { '@type': 'Answer', text: 'In most setups, yes. Snapdrop is commonly used in same-network discovery scenarios.' },
      },
      {
        '@type': 'Question',
        name: 'Which tool is better when office network discovery is unstable?',
        acceptedAnswer: { '@type': 'Answer', text: 'FileIO is often easier in restricted or unstable network environments thanks to its session-based browser flow.' },
      },
      {
        '@type': 'Question',
        name: 'Can I share both files and quick text snippets?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. FileIO supports practical file and text handoff workflows in browser.' },
      },
    ],
    'fileio-vs-wetransfer-comparison': [
      {
        '@type': 'Question',
        name: 'Is WeTransfer mainly an upload-and-share-link workflow?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. WeTransfer is commonly used for upload-based link delivery to recipients.' },
      },
      {
        '@type': 'Question',
        name: 'What is better for direct phone-to-PC transfer without extra upload steps?',
        acceptedAnswer: { '@type': 'Answer', text: 'FileIO is generally better for direct browser transfer between your own devices.' },
      },
      {
        '@type': 'Question',
        name: 'Do I need to install software for quick cross-device sending?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. FileIO works in browser with no installation for common transfer tasks.' },
      },
    ],
    'fileio-vs-localsend-comparison': [
      {
        '@type': 'Question',
        name: 'Does LocalSend require app installation on each device?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. LocalSend is an app-based workflow and typically requires installation on participating devices.' },
      },
      {
        '@type': 'Question',
        name: 'Which option is better for temporary devices or no-install policy?',
        acceptedAnswer: { '@type': 'Answer', text: 'FileIO is usually more convenient because it works directly in browser without setup overhead.' },
      },
      {
        '@type': 'Question',
        name: 'Can I use FileIO without creating an account?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. FileIO supports account-free transfer workflows for most everyday cases.' },
      },
    ],
  }
  const comparisonFaq = comparisonFaqBySlug[p.slug]
  if (comparisonFaq) return comparisonFaq

  const kind = inferBlogType(p)
  if (kind === 'transfer') {
    return [
      {
        '@type': 'Question',
        name: 'Do I need to install an app to transfer files?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. FileIO works directly in your browser without app installation.' },
      },
      {
        '@type': 'Question',
        name: 'Is transfer encrypted?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. FileIO file transfer is designed with privacy-first encrypted sessions.' },
      },
    ]
  }
  return [
    {
      '@type': 'Question',
      name: 'Are FileIO tools free to use?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Core FileIO tools are free and browser-based.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use FileIO without creating an account?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Most workflows work without signup.' },
    },
  ]
}

function buildHowToForPost(p: NonNullable<typeof post.value>) {
  if (p.slug.startsWith('fileio-vs-')) {
    return null
  }
  const kind = inferBlogType(p)
  const baseUrl = siteBaseUrl.value
  if (kind === 'howto' || kind === 'transfer') {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: p.title,
      description: p.description,
      totalTime: 'PT3M',
      step: [
        { '@type': 'HowToStep', name: 'Open FileIO', text: 'Open FileIO in your browser.', url: `${baseUrl}/text-transfer` },
        { '@type': 'HowToStep', name: 'Open transfer tool', text: 'Go to the phone-to-PC transfer tool.', url: `${baseUrl}/text-transfer` },
        { '@type': 'HowToStep', name: 'Pair devices', text: 'Use QR pairing between phone and computer.' },
        { '@type': 'HowToStep', name: 'Send data', text: 'Transfer files or text securely in your browser.' },
      ],
    }
  }
  return null
}

function buildComparisonItemListForPost(p: NonNullable<typeof post.value>) {
  const comparisonItemsBySlug: Record<string, string[]> = {
    'fileio-vs-airdrop-comparison': [
      'AirDrop does not natively support iPhone to Windows transfer',
      'FileIO supports cross-platform phone-to-PC browser workflow',
      'AirDrop is strongest inside Apple-only ecosystem',
    ],
    'fileio-vs-snapdrop-comparison': [
      'Snapdrop is usually best in same-Wi-Fi discovery scenarios',
      'FileIO is designed for more stable session-based transfer flow',
      'FileIO supports practical file and text handoff in one workflow',
    ],
    'fileio-vs-wetransfer-comparison': [
      'WeTransfer commonly uses upload-and-share-link workflow',
      'FileIO focuses on direct browser transfer between your devices',
      'FileIO reduces extra upload steps for daily phone-to-PC sharing',
    ],
    'fileio-vs-localsend-comparison': [
      'LocalSend is app-based and typically needs installation on each device',
      'FileIO is browser-based and no-install for quick start',
      'FileIO is often better for temporary devices and mixed-system sessions',
    ],
  }

  const items = comparisonItemsBySlug[p.slug]
  if (!items) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${p.title} key differences`,
    itemListElement: items.map((text, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: text,
    })),
  }
}

function buildKeywordsForPost(p: NonNullable<typeof post.value>) {
  const baseKeywords = [
    ...p.tags,
    'wireless file transfer phone to pc',
    'qr code pairing',
    'privacy-first tools',
  ]

  const slugKeywords: Record<string, string[]> = {
    'fileio-vs-airdrop-comparison': [
      'airdrop for windows alternative',
      'iphone to windows file transfer without app',
      'airdrop does not work on windows',
      'fileio vs airdrop',
    ],
    'fileio-vs-snapdrop-comparison': [
      'snapdrop alternative for office wifi',
      'same wifi file transfer browser',
      'phone to pc transfer without lan dependency',
      'fileio vs snapdrop',
    ],
    'fileio-vs-wetransfer-comparison': [
      'wetransfer alternative for personal transfer',
      'send files without upload link delay',
      'direct browser phone to laptop transfer',
      'fileio vs wetransfer',
    ],
    'fileio-vs-localsend-comparison': [
      'localsend alternative no install',
      'browser file transfer without desktop app',
      'temporary device file sharing without signup',
      'fileio vs localsend',
    ],
  }

  const combined = [...baseKeywords, ...(slugKeywords[p.slug] || [])]
  return [...new Set(combined)].join(',')
}

if (post.value && localizedPost.value) {
  const lp = localizedPost.value
  const langCode = locale.value === 'zh-CN' ? 'zh-CN' : locale.value === 'zh-TW' ? 'zh-TW' : 'en'
  const breadcrumbHome = langCode === 'zh-CN' ? '首页' : langCode === 'zh-TW' ? '首頁' : 'Home'
  const breadcrumbBlog = langCode === 'zh-CN' ? '博客' : langCode === 'zh-TW' ? '部落格' : 'Blog'

  useHead({
    title: lp.title,
    meta: [
      { name: 'description', content: lp.description },
      { name: 'keywords', content: buildKeywordsForPost(post.value) },
    ],
    link: [{ rel: 'canonical', href: blogUrl.value }],
  })
  useSeoMeta({
    ogTitle: lp.title,
    ogDescription: lp.description,
    ogType: 'article',
    ogImage: 'https://fileio.top/og-image.png',
    ogUrl: blogUrl.value,
    twitterTitle: lp.title,
    twitterDescription: lp.description,
    robots: 'index, follow',
    articlePublishedTime: post.value.date,
    articleModifiedTime: postModifiedDate.value,
    articleAuthor: ['FileIO'],
  })
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: lp.title,
    description: lp.description,
    inLanguage: langCode,
    datePublished: postPublishedDate.value,
    dateModified: postModifiedDate.value,
    author: { '@type': 'Organization', name: 'FileIO', url: 'https://fileio.top' },
    publisher: { '@type': 'Organization', name: 'FileIO', url: 'https://fileio.top', logo: { '@type': 'ImageObject', url: 'https://fileio.top/og-image.png' } },
    image: 'https://fileio.top/og-image.png',
    mainEntityOfPage: { '@type': 'WebPage', '@id': blogUrl.value },
  })
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: breadcrumbHome, item: new URL(localizedHomePath.value, siteBaseUrl.value).toString() },
      { '@type': 'ListItem', position: 2, name: breadcrumbBlog, item: new URL(localizedBlogListPath.value, siteBaseUrl.value).toString() },
      { '@type': 'ListItem', position: 3, name: lp.title, item: blogUrl.value },
    ],
  })
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: buildFaqForPost(post.value),
  })
  const comparisonItemListSchema = buildComparisonItemListForPost(post.value)
  if (comparisonItemListSchema) useJsonLd(comparisonItemListSchema)
  const howToSchema = buildHowToForPost(post.value)
  if (howToSchema) useJsonLd(howToSchema)
}

const tools = [
  { path: '/text-transfer', icon: 'swap_horiz', name: t('blog.toolTransfer') },
  { path: '/share', icon: 'cloud_upload', name: t('blog.toolShare') },
]

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<style>
.prose h2 { @apply font-headline text-xl font-extrabold text-on-surface dark:text-surface mt-10 mb-4; }
.prose h3 { @apply font-headline text-lg font-bold text-on-surface dark:text-surface mt-8 mb-3; }
.prose p { @apply text-on-surface-variant leading-relaxed mb-4; }
.prose ul, .prose ol { @apply text-on-surface-variant mb-4 pl-6; }
.prose li { @apply mb-2; }
.prose a { @apply text-primary font-medium hover:underline; }
.prose strong { @apply text-on-surface dark:text-surface font-bold; }
.prose code { @apply bg-surface-container-high dark:bg-surface-container px-1.5 py-0.5 rounded text-sm; }
.prose pre { @apply bg-surface-container-highest dark:bg-surface-container rounded-xl p-4 overflow-x-auto mb-4; }
.prose pre code { @apply bg-transparent p-0; }
.prose blockquote { @apply border-l-4 border-primary/30 pl-4 italic text-on-surface-variant; }
.prose table { @apply w-full border-collapse mb-4; }
.prose th { @apply text-left p-3 bg-surface-container-high dark:bg-surface-container text-xs font-bold uppercase text-on-surface-variant; }
.prose td { @apply p-3 border-t border-outline-variant/10 text-sm text-on-surface-variant; }
.prose hr { @apply border-outline-variant/20 my-8; }
.prose img { @apply rounded-xl; }
</style>
