# ToolPort

Free, privacy-first browser tools: file transfer, QR code, and online clipboard.

**Live:** [toolport.dev](https://toolport.dev)

## Features

- **File & Text Transfer** — P2P encrypted transfer between phone and PC via WebRTC
- **QR Code Generator/Scanner** — Generate, scan, and batch-create QR codes
- **Online Clipboard** — Real-time message sync across devices via WebSocket rooms

All tools run entirely in the browser. No files are uploaded to any server.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (Vue 3 + Vite + Nitro) |
| Language | TypeScript |
| Styling | Tailwind CSS + Material Design 3 color tokens |
| i18n | @nuxtjs/i18n (en, zh-CN, zh-TW) |
| Real-time | PartyKit (WebSocket rooms) |
| P2P | WebRTC DataChannel + AES-256-GCM |
| Deployment | Cloudflare Pages + PartyKit |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (Nuxt only)
npm run dev

# Start both Nuxt + PartyKit dev servers
npm run dev:all

# Build for production
npm run build
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Nuxt dev server (:3000) |
| `npm run dev:party` | PartyKit dev server (:1999) |
| `npm run dev:all` | Both servers concurrently |
| `npm run build` | Build for Cloudflare Pages |
| `npm run lint` | ESLint |
| `npm run lint:i18n` | Validate i18n key sync |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run party:deploy` | Deploy PartyKit to production |

## Environment Variables

```bash
# PartyKit host (dev defaults to localhost:1999)
NUXT_PUBLIC_PARTYKIT_HOST=toolport.your-username.partykit.dev

# WebRTC TURN credentials (optional)
NUXT_CLOUDFLARE_TURN_KEY_ID=
NUXT_CLOUDFLARE_TURN_API_TOKEN=

# OAuth (optional, disabled by default)
NUXT_PUBLIC_OAUTH_ENABLED=false
NUXT_OAUTH_GOOGLE_CLIENT_ID=
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
```

## Deployment

1. Deploy PartyKit: `npm run party:deploy`
2. Set `NUXT_PUBLIC_PARTYKIT_HOST` in Cloudflare Pages env vars
3. Build and deploy: `npm run build && npx wrangler pages deploy dist/`

## License

All rights reserved.
