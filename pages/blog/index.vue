<template>
  <div class="max-w-5xl mx-auto px-6 md:px-8 py-16 md:py-24">
    <!-- Header -->
    <div class="mb-12">
      <span class="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
        <span class="material-symbols-outlined text-sm">rss_feed</span>
        Blog
      </span>
      <h1 class="font-headline text-4xl md:text-5xl font-extrabold text-on-surface dark:text-surface tracking-tight mb-4">
        {{ $t('blog.title') }}
      </h1>
      <p class="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
        {{ $t('blog.desc') }}
      </p>
    </div>

    <!-- Articles -->
    <div class="space-y-6">
      <NuxtLink
        v-for="post in posts"
        :key="post.slug"
        :to="localePath(`/blog/${post.slug}`)"
        class="block bg-surface-container-low dark:bg-surface-container rounded-2xl p-6 md:p-8 hover:shadow-ambient hover:ring-1 hover:ring-primary/20 transition-all group"
      >
        <div class="flex flex-col md:flex-row md:items-start gap-6">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-3">
              <time class="text-xs text-on-surface-variant font-medium">{{ formatDate(post.date) }}</time>
              <span v-if="isNew(post.date)" class="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase rounded-full">NEW</span>
            </div>
            <h2 class="font-headline text-xl md:text-2xl font-extrabold text-on-surface dark:text-surface mb-2 group-hover:text-primary transition-colors">
              {{ post.title }}
            </h2>
            <p class="text-on-surface-variant text-sm leading-relaxed mb-4">{{ post.description }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in post.tags.slice(0, 4)"
                :key="tag"
                class="px-2.5 py-0.5 bg-surface-container-high dark:bg-surface-container-highest rounded-full text-[10px] font-medium text-on-surface-variant"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <span class="hidden md:flex items-center gap-1 text-primary font-bold text-sm whitespace-nowrap pt-2 group-hover:translate-x-1 transition-transform">
            {{ $t('blog.readMore') }}
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Ad — between post list and bottom CTA -->
    <AdSlot slot-key="blog-list-bottom" container-class="mt-12" :min-height="120" />

    <!-- CTA -->
    <div class="mt-12 primary-gradient rounded-3xl p-8 md:p-10 text-center">
      <h2 class="font-headline text-2xl font-extrabold text-on-primary mb-3">{{ $t('blog.ctaTitle') }}</h2>
      <p class="text-on-primary/80 mb-6 max-w-lg mx-auto">{{ $t('blog.ctaDesc') }}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink :to="localePath('/text-transfer')" class="inline-block px-6 py-3 bg-primary-fixed text-on-primary-fixed-variant rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
          {{ $t('blog.ctaTools') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/share')" class="inline-block px-6 py-3 bg-on-primary/10 text-on-primary rounded-xl font-bold text-sm hover:bg-on-primary/20 transition-colors">
          {{ $t('blog.ctaShare') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getLocalizedPost } from '~/composables/useBlogPosts'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const rawPosts = useBlogPosts()
const posts = computed(() => rawPosts.map(p => ({ ...p, ...getLocalizedPost(p, locale.value) })))
const runtimeConfig = useRuntimeConfig()
const siteBaseUrl = computed(() => runtimeConfig.public.siteUrl || 'https://fileio.top')
const canonicalUrl = computed(() =>
  new URL(localePath('/blog'), siteBaseUrl.value).toString(),
)

useHead({
  title: () => t('seo.blog.title'),
  meta: [
    { name: 'description', content: () => t('seo.blog.desc') },
    { name: 'keywords', content: () => t('seo.blog.keywords') },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
})
useSeoMeta({
  ogTitle: () => t('seo.blog.title'),
  ogDescription: () => t('seo.blog.ogDesc'),
  ogImage: `${siteBaseUrl.value}/og-image.png`,
  ogUrl: () => canonicalUrl.value,
  twitterTitle: () => t('seo.blog.title'),
  twitterDescription: () => t('seo.blog.ogDesc'),
  robots: 'index, follow',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'FileIO Blog',
  url: canonicalUrl.value,
  description: 'Tutorials for wireless phone-to-PC file transfer, QR pairing, and privacy-first browser workflows.',
  publisher: {
    '@type': 'Organization',
    name: 'FileIO',
    url: siteBaseUrl.value,
  },
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteBaseUrl.value}/` },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl.value },
  ],
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'FileIO Blog Articles',
  itemListOrder: 'https://schema.org/ItemListOrderDescending',
  numberOfItems: posts.value.length,
  itemListElement: posts.value.map((post: { slug: string; title: string }, index: number) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: new URL(localePath(`/blog/${post.slug}`), canonicalUrl.value).toString(),
    name: post.title,
  })),
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isNew(date: string) {
  return Date.now() - new Date(date).getTime() < 30 * 24 * 60 * 60 * 1000
}
</script>

