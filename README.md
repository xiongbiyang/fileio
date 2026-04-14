# FileIO

Privacy-first browser file transfer: P2P encrypted phone-to-PC sharing with QR-code pairing.

**Live:** [fileio.top](https://fileio.top)

## Features

- **File & Text Transfer** — P2P encrypted transfer between phone and PC via WebRTC with QR-code pairing

Runs entirely in the browser. No files are uploaded to any server.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (Vue 3 + Vite + Nitro) |
| Language | TypeScript |
| Styling | Tailwind CSS + Material Design 3 color tokens |
| i18n | @nuxtjs/i18n (en, zh-CN, zh-TW) |
| Signaling | PartyKit (WebSocket relay) |
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
NUXT_PUBLIC_PARTYKIT_HOST=fileio.your-username.partykit.dev

# WebRTC TURN credentials (optional)
NUXT_CLOUDFLARE_TURN_KEY_ID=
NUXT_CLOUDFLARE_TURN_API_TOKEN=
```

## Deployment

1. Deploy PartyKit: `npm run party:deploy`
2. Set `NUXT_PUBLIC_PARTYKIT_HOST` in Cloudflare Pages env vars
3. Build and deploy: `npm run build && npx wrangler pages deploy dist/`

## License

All rights reserved.
