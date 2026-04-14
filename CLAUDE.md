# FileIO - Project Architecture

> Two privacy-first browser file-transfer tools:
>   - **Text & File Transfer** — WebRTC P2P between phone and PC, QR-code pairing
>   - **Quick Share** — temporary R2-backed upload with self-destructing download links
> Deployed on Cloudflare Pages + PartyKit + R2 + KV.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (Vue 3 + Vite + Nitro) |
| Language | TypeScript |
| Styling | Tailwind CSS + Material Design 3 color tokens |
| i18n | @nuxtjs/i18n (en, zh-CN, zh-TW — `prefix_except_default`) |
| Signaling | PartyKit (WebSocket relay for WebRTC handshake) |
| P2P | WebRTC DataChannel (DTLS transport encryption) |
| Storage | Cloudflare R2 (temporary file blobs for Quick Share) |
| Rate limit | Cloudflare Workers KV |
| Human verification | Cloudflare Turnstile (upload flow only) |
| SEO | @nuxtjs/sitemap + JSON-LD (`useJsonLd` composable) |
| Markdown | `marked` (blog article rendering, raw imports — NOT @nuxt/content) |
| Deployment | Cloudflare Pages (`cloudflare-pages` preset) + PartyKit |

## Directory Structure

```
transfer/
├── pages/
│   ├── index.vue                    # Redirects to /text-transfer
│   ├── text-transfer.vue            # Tool A — WebRTC P2P (SoftwareApplication JSON-LD)
│   ├── share/
│   │   ├── index.vue                # Tool B — Quick Share upload page
│   │   ├── result.vue               # Tool B — post-upload result (link + QR, noindex)
│   │   └── [id].vue                 # Tool B — download page (noindex)
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
│   ├── common/                      # AdBlockNotice, CookieConsent, ConfirmDialog,
│   │                                #   AdSlot (single ad), AdRailWrapper (left/right
│   │                                #   sticky rails for desktop)
│   └── tools/                       # TextTransfer* (Waiting, Pairing, Transferring,
│                                    #   Success, Reconnecting, FileQueue,
│                                    #   DeviceHistory, History, Audit)
├── composables/
│   ├── useWebRTC.ts                 # P2P connection + file transfer
│   ├── useSignaling.ts              # WebRTC signaling relay via PartyKit
│   ├── useTextTransferPage.ts       # Page-level orchestration (tool A)
│   ├── useCrypto.ts                 # AES-256-GCM helpers (currently unused)
│   ├── useTheme.ts / useConfirmDialog.ts / useNotifier.ts / useJsonLd.ts
│   └── useBlogPosts.ts              # Blog post index
├── layouts/
│   ├── default.vue                  # Standard pages (blog, about, legal, share)
│   └── tool.vue                     # Text-transfer + settings (adds ConfirmDialog)
├── i18n/                            # en.json, zh-CN.json, zh-TW.json (keys in sync)
├── party/
│   └── signal.ts                    # PartyKit: WebRTC offer/answer/candidate relay
├── server/
│   ├── api/
│   │   ├── health.get.ts            # Liveness check
│   │   ├── turn-credentials.get.ts  # Region-aware STUN/TURN (used by useWebRTC)
│   │   └── share/
│   │       ├── upload.post.ts       # Tool B: multipart upload to R2 + Turnstile
│   │       ├── [id]/meta.get.ts     # Tool B: read metadata (no consume)
│   │       └── [id]/download.get.ts # Tool B: stream + single-use delete
│   └── utils/
│       ├── r2.ts                    # SHARE_BUCKET resolver
│       ├── rateLimit.ts             # KV-backed per-IP rate limiter
│       └── turnstile.ts             # Server-side Turnstile verifier
├── utils/                           # clipboard, qrcode, roomId, shareId, shareLink, transferFormat
├── types/toolPages.ts               # TransferState, *Item interfaces
├── constants/toolPageData.ts        # Mock transfer history / device items
├── scripts/
│   ├── check_i18n.py                # i18n sync validation (npm run lint:i18n)
│   └── gen-og-image.py              # Regenerate og-image.png
├── e2e/smoke.spec.ts                # Playwright smoke tests
├── public/                          # og-image.png, robots.txt, _headers, _redirects
├── nuxt.config.ts                   # Sitemap, routeRules, i18n, SEO meta
├── partykit.json                    # PartyKit entry = party/signal.ts
└── wrangler.toml                    # Cloudflare Pages + R2 + KV bindings
```

## Routing

| Path | Notes |
|------|-------|
| `/` | 301 redirect to `/text-transfer` (via routeRules) |
| `/text-transfer` | Tool A — NOT prerendered (needs `?r=` query) |
| `/share` | Tool B upload page — NOT prerendered (runtime R2 + Turnstile) |
| `/share/[id]` | Tool B download page — noindex, NOT prerendered |
| `/blog`, `/blog/[slug]` | Prerendered |
| `/guides/file-transfer` | Prerendered |
| `/about`, `/privacy`, `/terms` | Prerendered |
| `/contact` | Form submission (currently mocked) |
| `/settings` | noindex (theme + language) |
| `/zh-CN/*`, `/zh-TW/*` | Localized equivalents (prefix_except_default) |

## i18n Key Structure

Top-level keys: `common`, `nav`, `footer`, `contact`, `privacy`, `terms`, `error404`, `toolA`, `share`, `settings`, `blog`, `cookie`, `about`, `seo`.

- `toolA.*` — Tool A UI strings (pairing, transfer, audit, history, etc.)
- `share.*` — Tool B UI strings (upload, options, result) + `share.download.*` for the download page
- `seo.*` — per-page meta tags used via `useHead({ title: t('seo.<page>.title'), ... })`

Run `npm run lint:i18n` to verify en/zh-CN/zh-TW key parity.

## Key Invariants

- `/text-transfer`, `/share`, `/share/:id` all `prerender: false` (reason differs per page — see routeRules comments).
- `useWebRTC` sends plaintext through the DataChannel; encryption is DTLS at the transport layer (browser-provided), not the `useCrypto` helper (which exists but is currently unreferenced).
- Tool B uploads are hashed with SHA-256 into R2 custom metadata for future abuse-blocklist lookups.
- Single-use share (`max_downloads=1`) deletes the R2 object via `waitUntil()` after the response body is handed to the client; an R2 bucket lifecycle rule wipes anything older than 3 days as a safety net.
- All ad placements use `<AdSlot>` / `<AdRailWrapper>` and only render when `runtimeConfig.public.adsEnabled` is true (env var `NUXT_PUBLIC_ADS_ENABLED=true`). Default off — the placeholder divs do not appear in production until AdSense is wired up.
- `partykit` devDep is required for `npm run dev:party` and `npm run party:deploy`; `partysocket` is the runtime client used by `useSignaling.ts`.
- Blog posts are raw Markdown files under `content/blog/` (and `content/blog/zh-CN/`) rendered by `marked` — not @nuxt/content.

## Cloudflare bindings (wrangler.toml)

Required for Quick Share to work in production:
- `[[r2_buckets]]` with `binding = "SHARE_BUCKET"`, `bucket_name = "fileio-share"`
- `[[kv_namespaces]]` with `binding = "RATE_LIMIT_KV"`, plus an `id` from `wrangler kv:namespace create RATE_LIMIT_KV`

Environment variables (server-only and public):
- `NUXT_TURNSTILE_SECRET_KEY` — Turnstile secret
- `NUXT_PUBLIC_TURNSTILE_SITE_KEY` — Turnstile site key

If any of these are unset, the corresponding server util degrades gracefully (no-op in local dev, 503 in production). See `docs/deployment-flow.md`.

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
