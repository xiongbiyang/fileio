# FileIO - Project Architecture

> Privacy-first browser file transfer: WebRTC P2P phone-to-PC sharing with QR pairing.
> Deployed on Cloudflare Pages + PartyKit.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (Vue 3 + Vite + Nitro) |
| Language | TypeScript |
| Styling | Tailwind CSS + Material Design 3 color tokens |
| i18n | @nuxtjs/i18n (en, zh-CN, zh-TW — `prefix_except_default`) |
| Signaling | PartyKit (WebSocket relay for WebRTC handshake) |
| P2P | WebRTC DataChannel + AES-256-GCM (Web Crypto API) |
| SEO | @nuxtjs/sitemap + JSON-LD (`useJsonLd` composable) |
| Markdown | `marked` (blog article rendering, raw imports — NOT @nuxt/content) |
| Deployment | Cloudflare Pages (`cloudflare-pages` preset) + PartyKit |

## Directory Structure

```
transfer/
├── pages/
│   ├── index.vue                    # Redirects to /text-transfer
│   ├── text-transfer.vue            # THE tool (SoftwareApplication JSON-LD)
│   ├── blog/
│   │   ├── index.vue                # Blog list (Blog JSON-LD)
│   │   └── [slug].vue               # Article (BlogPosting JSON-LD)
│   ├── guides/file-transfer.vue     # Transfer guide (prerendered)
│   ├── about.vue / contact.vue / privacy.vue / terms.vue
│   ├── settings.vue                 # Theme + language (noindex)
│   └── [...slug].vue                # 404 catch-all
├── content/blog/                    # Markdown blog articles (en + zh-CN)
├── components/
│   ├── layout/                      # AppHeader, AppFooter, AppNotifications,
│   │                                #   LanguageSwitcher, ThemeToggle, MobileNav
│   ├── common/                      # AdBlockNotice, CookieConsent, ConfirmDialog
│   └── tools/                       # TextTransfer* (Waiting, Pairing, Transferring,
│                                    #   Success, Reconnecting, FileQueue,
│                                    #   DeviceHistory, History, Audit)
├── composables/
│   ├── useWebRTC.ts                 # P2P connection + file transfer
│   ├── useSignaling.ts              # WebRTC signaling relay via PartyKit
│   ├── useTextTransferPage.ts       # Page-level orchestration
│   ├── useCrypto.ts                 # AES-256-GCM encrypt/decrypt
│   ├── useTheme.ts                  # Dark/light mode toggle
│   ├── useConfirmDialog.ts          # Confirm dialog state
│   ├── useNotifier.ts               # Toast notifications
│   ├── useJsonLd.ts                 # JSON-LD structured data injection
│   └── useBlogPosts.ts              # Blog post index (title, desc, tags, date)
├── layouts/
│   ├── default.vue                  # Standard pages (blog, about, legal)
│   └── tool.vue                     # Tool + settings (adds ConfirmDialog)
├── i18n/                            # en.json, zh-CN.json, zh-TW.json (keys in sync)
├── party/
│   └── signal.ts                    # PartyKit: WebRTC offer/answer/candidate relay
├── server/api/
│   ├── health.get.ts                # Liveness check
│   └── turn-credentials.get.ts      # Region-aware STUN/TURN (used by useWebRTC)
├── utils/                           # clipboard, qrcode, roomId, shareLink, transferFormat
├── types/toolPages.ts               # TransferState, *Item interfaces
├── constants/toolPageData.ts        # Mock transfer history / device items
├── scripts/
│   ├── check_i18n.py                # i18n sync validation (npm run lint:i18n)
│   └── gen-og-image.py              # Regenerate og-image.png
├── e2e/smoke.spec.ts                # Playwright smoke tests
├── public/                          # og-image.png, robots.txt, _headers, _redirects
├── nuxt.config.ts                   # Sitemap, routeRules, i18n, SEO meta
├── partykit.json                    # PartyKit entry = party/signal.ts
└── wrangler.toml                    # Cloudflare Pages config
```

## Routing

| Path | Notes |
|------|-------|
| `/` | 301 redirect to `/text-transfer` (via routeRules) |
| `/text-transfer` | The tool — NOT prerendered (needs `?r=` query) |
| `/blog`, `/blog/[slug]` | Prerendered |
| `/guides/file-transfer` | Prerendered |
| `/about`, `/privacy`, `/terms` | Prerendered |
| `/contact` | Form submission |
| `/settings` | noindex (theme + language) |
| `/zh-CN/*`, `/zh-TW/*` | Localized equivalents (prefix_except_default) |

## i18n Key Structure

Top-level keys: `common`, `nav`, `footer`, `contact`, `privacy`, `terms`, `error404`, `toolA`, `settings`, `blog`, `cookie`, `about`, `seo`.

`toolA.*` holds text for the transfer tool (QR pairing, pairing flow, transfer UI, E2EE audit, history, etc.). `seo.*` holds per-page meta tags used via `useHead({ title: t('seo.<page>.title'), ... })`.

Run `npm run lint:i18n` to verify en/zh-CN/zh-TW key parity.

## Key Invariants

- `/text-transfer` cannot be prerendered — it reads the `?r=` query param for pairing.
- `utils/qrcode.ts` dynamically imports the `qrcode` npm package; it renders a pairing QR on the PC side.
- `partykit` devDep is required for `npm run dev:party` and `npm run party:deploy`; `partysocket` is the runtime client used by `useSignaling.ts`.
- WebRTC traffic uses AES-256-GCM via Web Crypto API — no plaintext ever touches the signaling server.
- Blog posts are raw Markdown files under `content/blog/` (and `content/blog/zh-CN/`) rendered by `marked` — not @nuxt/content.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Nuxt dev (:3000) |
| `npm run dev:party` | PartyKit signaling (:1999) |
| `npm run dev:all` | Both concurrently |
| `npm run build` | Production build for Cloudflare Pages |
| `npm run lint` / `lint:i18n` | ESLint / i18n key parity |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright smoke |
| `npm run party:deploy` | Deploy PartyKit |
