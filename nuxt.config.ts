// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  buildDir: process.env.NUXT_BUILD_DIR || (process.env.NODE_ENV === 'production' ? '.nuxt-build' : '.nuxt'),

  runtimeConfig: {
    // Server-only (never exposed to client)
    cloudflareTurnKeyId: process.env.NUXT_CLOUDFLARE_TURN_KEY_ID || '',
    cloudflareTurnApiToken: process.env.NUXT_CLOUDFLARE_TURN_API_TOKEN || '',
    oauthGoogleClientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID || '',
    oauthGoogleClientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || '',
    oauthGithubClientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID || '',
    oauthGithubClientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET || '',
    public: {
      // Development: leave empty (defaults to localhost:1999)
      // Production: set NUXT_PUBLIC_PARTYKIT_HOST in Cloudflare Pages env vars
      //   e.g. toolport.your-username.partykit.dev
      partykitHost: process.env.NUXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999',
      // Keep cloud persistence disabled until login is officially launched.
      enableClipboardCloudPersistence: process.env.NUXT_PUBLIC_ENABLE_CLIPBOARD_CLOUD === 'true',
      oauthEnabled: process.env.NUXT_PUBLIC_OAUTH_ENABLED === 'true',
    },
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap',
  ],

  site: {
    url: 'https://toolport.dev',
  },

  sitemap: {
    xslColumns: [
      { label: 'URL', width: '65%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
    ],
    exclude: ['/dashboard', '/settings', '/auth/**', '/welcome', '/maintenance'],
    urls: [
      { loc: '/tools/qr-code', lastmod: '2026-04-02', changefreq: 'daily', priority: 1.0 },
      { loc: '/tools/text-transfer', lastmod: '2026-04-02', changefreq: 'weekly', priority: 0.9 },
      { loc: '/tools/clipboard', lastmod: '2026-04-02', changefreq: 'weekly', priority: 0.9 },
      { loc: '/guides/qr-code', lastmod: '2026-04-02', changefreq: 'weekly', priority: 0.8 },
      { loc: '/guides/file-transfer', lastmod: '2026-04-02', changefreq: 'weekly', priority: 0.8 },
      { loc: '/guides/clipboard', lastmod: '2026-04-02', changefreq: 'weekly', priority: 0.8 },
      { loc: '/blog/payment-paypal-crypto-qr-code-generator-guide', lastmod: '2026-04-02', changefreq: 'monthly', priority: 0.75 },
      { loc: '/blog/vcard-contact-business-card-qr-code-guide', lastmod: '2026-04-02', changefreq: 'monthly', priority: 0.75 },
      { loc: '/blog/menu-qr-code-generator-for-restaurants', lastmod: '2026-04-02', changefreq: 'monthly', priority: 0.75 },
      { loc: '/blog/google-review-qr-code-generator-guide', lastmod: '2026-04-02', changefreq: 'monthly', priority: 0.75 },
      { loc: '/blog/wifi-qr-code-generator-guide', lastmod: '2026-04-02', changefreq: 'monthly', priority: 0.75 },
      { loc: '/blog/best-airdrop-alternative-for-windows-2026', lastmod: '2026-04-01', changefreq: 'monthly', priority: 0.7 },
      { loc: '/blog/how-to-transfer-files-phone-to-pc', lastmod: '2025-03-15', changefreq: 'monthly', priority: 0.7 },
      { loc: '/blog/free-online-qr-code-generator', lastmod: '2026-04-02', changefreq: 'monthly', priority: 0.8 },
      { loc: '/blog/best-free-ai-tools-2025', lastmod: '2025-03-25', changefreq: 'monthly', priority: 0.65 },
    ],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  i18n: {
    baseUrl: 'https://toolport.dev',
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
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  app: {
    head: {
      title: 'ToolPort',
      titleTemplate: '%s | ToolPort',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'description', content: 'ToolPort offers free, privacy-first browser tools: wireless file transfer phone to PC, free QR code generator and scanner, and online clipboard sync. No install, no signup.' },
        { name: 'keywords', content: 'free online tools,wireless file transfer phone to pc,airdrop alternative for windows,free qr code generator,qr code scanner online,online clipboard,copy paste between phone and pc,privacy-first tools' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'theme-color', content: '#005147' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'ToolPort' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:title', content: 'ToolPort - Free Online Tools for File Transfer, QR Code, and Clipboard' },
        { property: 'og:description', content: 'Free privacy-first browser tools. Transfer files between phone and PC, generate QR codes, and sync clipboard instantly - no install, no signup.' },
        { property: 'og:image', content: 'https://toolport.dev/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'ToolPort - Free Online Tools for File Transfer, QR Code, and Clipboard' },
        { name: 'twitter:description', content: 'Wireless file transfer, free QR code generator, and online clipboard sync. Privacy-first, no install, no signup.' },
        { name: 'twitter:image', content: 'https://toolport.dev/og-image.png' },
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
    '/': { prerender: true },
    '/tools': { prerender: true },
    '/tools/text-transfer': { prerender: true },
    '/tools/clipboard': { prerender: true },
    '/tools/qr-code': { prerender: true },
    '/about': { prerender: true },
    '/privacy': { prerender: true },
    '/terms': { prerender: true },
    '/pricing': { prerender: true },
    '/tool-request': { prerender: true },
    '/pro-waitlist': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/guides/**': { prerender: true },
  },

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/blog', '/guides/qr-code', '/guides/file-transfer', '/guides/clipboard'],
    },
  },
})
