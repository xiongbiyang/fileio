import { useBlogPosts } from './composables/useBlogPosts'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function getBlogPostLastmod(slug: string, fallbackDate: string) {
  try {
    const filePath = resolve(process.cwd(), 'content', 'blog', `${slug}.md`)
    const raw = readFileSync(filePath, 'utf8')
    const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!frontmatterMatch) return fallbackDate
    const frontmatter = frontmatterMatch[1]
    const match = frontmatter.match(/^(updated|updatedAt|lastmod|modified|dateModified):\s*["']?([^"'\n]+)["']?\s*$/im)
    if (!match) return fallbackDate
    const value = match[2].trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return fallbackDate
    return parsed.toISOString().slice(0, 10)
  } catch {
    return fallbackDate
  }
}

const blogPosts = useBlogPosts()
const blogSitemapUrls = [
  // English blog URLs
  ...blogPosts.map(post => ({
    loc: `/blog/${post.slug}`,
    lastmod: getBlogPostLastmod(post.slug, post.date),
    changefreq: 'monthly' as const,
    priority: (post.slug.startsWith('fileio-vs-') ? 0.8 : 0.7) as 0.8 | 0.7,
  })),
  // zh-CN blog URLs
  ...blogPosts.filter(post => post.zhCN).map(post => ({
    loc: `/zh-CN/blog/${post.slug}`,
    lastmod: getBlogPostLastmod(post.slug, post.date),
    changefreq: 'monthly' as const,
    priority: (post.slug.startsWith('fileio-vs-') ? 0.8 : 0.7) as 0.8 | 0.7,
  })),
]

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  debug: false,
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  buildDir: '.nuxt-build',

  runtimeConfig: {
    // Server-only (never exposed to client)
    cloudflareTurnKeyId: process.env.NUXT_CLOUDFLARE_TURN_KEY_ID || '',
    cloudflareTurnApiToken: process.env.NUXT_CLOUDFLARE_TURN_API_TOKEN || '',
    turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '',
    // R2 S3-compatible API credentials. Required for Quick Share's direct-
    // to-R2 presigned uploads (bypasses the Worker 100 MB request body limit).
    // Create via Cloudflare Dashboard → R2 → Manage R2 API Tokens.
    r2AccountId: process.env.NUXT_R2_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.NUXT_R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.NUXT_R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.NUXT_R2_BUCKET_NAME || 'fileio-share',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://fileio.top',
      // Development: leave empty (defaults to localhost:1999)
      // Production: set NUXT_PUBLIC_PARTYKIT_HOST in Cloudflare Pages env vars
      //   e.g. fileio.your-username.partykit.dev
      partykitHost: process.env.NUXT_PUBLIC_PARTYKIT_HOST || '',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      // Ad slots: set to 'true' when Google AdSense (or similar) is wired up.
      // While false the placeholder divs render as nothing.
      adsEnabled: process.env.NUXT_PUBLIC_ADS_ENABLED === 'true',
    },
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap',
  ],

  site: {
    url: 'https://fileio.top',
  },

  sitemap: {
    zeroRuntime: true,
    xsl: false,
    exclude: ['/settings', '/share/**'],
    urls: [
      // English core pages
      { loc: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { loc: '/transfer', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { loc: '/share', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.9 },
      { loc: '/blog', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.8 },
      { loc: '/guides/file-transfer', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.8 },
      { loc: '/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.7 },
      { loc: '/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.6 },
      { loc: '/privacy', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: 0.5 },
      { loc: '/terms', lastmod: new Date().toISOString().split('T')[0], changefreq: 'yearly', priority: 0.5 },
      // zh-CN core pages
      { loc: '/zh-CN', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { loc: '/zh-CN/transfer', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { loc: '/zh-CN/share', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.9 },
      { loc: '/zh-CN/blog', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.8 },
      { loc: '/zh-CN/guides/file-transfer', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.8 },
      { loc: '/zh-CN/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.7 },
      { loc: '/zh-CN/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.6 },
      // zh-TW core pages
      { loc: '/zh-TW', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { loc: '/zh-TW/transfer', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { loc: '/zh-TW/share', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.9 },
      { loc: '/zh-TW/blog', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.8 },
      { loc: '/zh-TW/guides/file-transfer', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.8 },
      { loc: '/zh-TW/about', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.7 },
      { loc: '/zh-TW/contact', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.6 },
      // Blog URLs (en + zh-CN)
      ...blogSitemapUrls,
    ],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  i18n: {
    baseUrl: 'https://fileio.top',
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'zh-CN', language: 'zh-CN', file: 'zh-CN.json', name: '简体中文' },
      { code: 'zh-TW', language: 'zh-TW', file: 'zh-TW.json', name: '繁體中文' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: '../i18n',
    bundle: {
      optimizeTranslationDirective: false,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tp_lang',
      // Only auto-redirect on the landing path. Doing it on 'no prefix'
      // strips query/hash from deep-links like /transfer?r=xxx when a
      // foreign-locale browser hits them — which broke QR pairing for
      // zh-CN devices scanning an EN-locale sender's QR.
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  app: {
    head: {
      title: 'FileIO',
      titleTemplate: '%s | FileIO',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'description', content: 'FileIO — two privacy-first browser tools: WebRTC peer-to-peer text & file transfer with QR-code pairing, plus Quick Share, a temporary file drop with auto-expiring download links. No app install, no signup, up to 1 GB per file via Quick Share.' },
        { name: 'keywords', content: 'cross-device file transfer,temporary file sharing,quick file share,online clipboard,phone to pc transfer,qr code pairing,one-time download link,self-destruct file link,airdrop alternative for windows,no app file transfer,browser file transfer,p2p file sharing' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'theme-color', content: '#005147' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'FileIO' },
        { property: 'og:title', content: 'FileIO — Browser File Transfer & Temporary File Sharing' },
        { property: 'og:description', content: 'Two privacy-first browser tools: WebRTC P2P transfer between phone and PC, plus Quick Share temporary download links. No app, no signup.' },
        { property: 'og:image', content: 'https://fileio.top/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'FileIO — Browser file transfer and temporary file sharing' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'FileIO — Browser File Transfer & Temporary File Sharing' },
        { name: 'twitter:description', content: 'WebRTC P2P transfer plus temporary download links. Free, no app, no signup.' },
        { name: 'twitter:image', content: 'https://fileio.top/og-image.png' },
        { name: 'twitter:image:alt', content: 'FileIO — Browser file transfer and temporary file sharing' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' },
      ],
    },
  },

  css: [
    '~/assets/css/global.css',
  ],

  routeRules: {
    // Landing pages do a runtime redirect to /transfer via pages/index.vue
    // so @nuxtjs/i18n can detect Accept-Language first (a static redirect
    // at the edge would bypass the middleware and lock every visitor to EN).
    '/': { prerender: false },
    '/zh-CN': { prerender: false },
    '/zh-TW': { prerender: false },
    // transfer depends on ?r= query param for room joining — must NOT prerender.
    // Localized paths need explicit rules: i18n doesn't propagate routeRules
    // across locales, so without these, /zh-CN/transfer gets prerendered and
    // Cloudflare Pages 308-redirects `/zh-CN/transfer` → `/zh-CN/transfer/`
    // which drops the URL hash (#r=...) that scanners like to preserve.
    '/transfer': { prerender: false },
    '/zh-CN/transfer': { prerender: false },
    '/zh-TW/transfer': { prerender: false },
    // /j/[id] is the QR-scan landing route; resolves the room id from the
    // path and hops to /transfer?r=<id>. Must be runtime so route params
    // are parsed per request.
    '/j/**': { prerender: false },
    '/zh-CN/j/**': { prerender: false },
    '/zh-TW/j/**': { prerender: false },
    // Quick Share pages depend on runtime R2 + Turnstile — must NOT prerender
    '/share': { prerender: false },
    '/share/**': { prerender: false },
    '/zh-CN/share': { prerender: false },
    '/zh-CN/share/**': { prerender: false },
    '/zh-TW/share': { prerender: false },
    '/zh-TW/share/**': { prerender: false },
    '/about': { prerender: true },
    '/privacy': { prerender: true },
    '/terms': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/guides/**': { prerender: true },
  },

  nitro: {
    preset: 'cloudflare-pages',
    cloudflare: {
      nodeCompat: false,
    },
    unenv: {
      alias: {
        // Use native Node.js process from Workers nodejs_compat_v2
        // instead of unenv's polyfill (which has private field conflicts)
        'process': 'node:process',
        'node:process': 'node:process',
      },
    },
    rollupConfig: {
      external: ['node:process'],
    },
    storage: {
      // Keep prerender cache in-memory to avoid Windows file:// cache-driver resolution warnings.
      'internal:nuxt:prerender': { driver: 'memory' },
    },
    prerender: {
      crawlLinks: true,
      routes: [
        '/sitemap.xml',
        '/__sitemap__/en-US.xml',
        '/__sitemap__/zh-CN.xml',
        '/__sitemap__/zh-TW.xml',
        '/blog',
        '/guides/file-transfer',
      ],
    },
  },
})

