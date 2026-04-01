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
          <time class="text-sm text-on-surface-variant">{{ formatDate(post.date) }}</time>
          <span class="text-on-surface-variant/30">|</span>
          <span class="text-sm text-on-surface-variant">{{ post.author }}</span>
        </div>
        <h1 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight leading-tight mb-4">
          {{ post.title }}
        </h1>
        <p class="text-on-surface-variant text-lg leading-relaxed">{{ post.description }}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span v-for="tag in post.tags" :key="tag" class="px-3 py-1 bg-surface-container-high dark:bg-surface-container-highest rounded-full text-xs font-medium text-on-surface-variant">
            {{ tag }}
          </span>
        </div>
      </header>

      <!-- Content -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="prose" v-html="html" />

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
        <div class="flex justify-between items-center">
          <NuxtLink :to="localePath('/blog')" class="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            <span class="material-symbols-outlined text-lg">arrow_back</span>
            {{ $t('blog.backToList') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/tool-request')" class="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            {{ $t('blog.suggestTool') }}
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
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

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const slug = computed(() => route.params.slug as string)

const posts = useBlogPosts()
const post = computed(() => posts.find(p => p.slug === slug.value))

// Load markdown content dynamically
const markdownModules = import.meta.glob('~/content/blog/*.md', { query: '?raw', import: 'default' })

const html = ref('')

onMounted(async () => {
  const key = Object.keys(markdownModules).find(k => k.includes(slug.value))
  if (key) {
    const raw = await markdownModules[key]() as string
    // Strip frontmatter
    const content = raw.replace(/^---[\s\S]*?---\n/, '')
    html.value = await marked(content)
  }
})

if (post.value) {
  useHead({
    title: `${post.value.title} | ToolPort Blog`,
    meta: [
      { name: 'description', content: post.value.description },
    ],
  })
  useSeoMeta({
    ogTitle: post.value.title,
    ogDescription: post.value.description,
    ogType: 'article',
    ogImage: 'https://toolport.dev/og-image.png',
    articlePublishedTime: post.value.date,
    articleAuthor: ['ToolPort'],
  })
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.value.title,
    description: post.value.description,
    datePublished: post.value.date,
    dateModified: post.value.date,
    author: { '@type': 'Organization', name: 'ToolPort', url: 'https://toolport.dev' },
    publisher: { '@type': 'Organization', name: 'ToolPort', url: 'https://toolport.dev', logo: { '@type': 'ImageObject', url: 'https://toolport.dev/og-image.png' } },
    image: 'https://toolport.dev/og-image.png',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://toolport.dev/blog/${post.value.slug}` },
  })
}

const tools = [
  { path: '/tools/text-transfer', icon: 'swap_horiz', name: t('blog.toolTransfer') },
  { path: '/tools/qr-code', icon: 'qr_code_2', name: t('blog.toolQr') },
  { path: '/tools/clipboard', icon: 'content_paste', name: t('blog.toolClipboard') },
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
