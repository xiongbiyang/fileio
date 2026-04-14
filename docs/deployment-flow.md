# Deployment Flow (Cloudflare Pages + PartyKit)

Single source of truth for production deployment. Run in order.

## 1. Pre-deploy checks

```bash
npm ci
npm run lint
npm run lint:i18n
npm run test -- --run
npx nuxi typecheck
npm run build
```

A successful build outputs `dist/` and prints:
- `npx wrangler pages dev dist` — local preview
- `npx wrangler pages deploy dist` — deploy

## 2. Cloudflare Pages

`wrangler.toml` key config:
- `pages_build_output_dir = "dist"`
- `compatibility_flags = ["nodejs_compat_v2"]`

Recommended: connect the GitHub repo to Cloudflare Pages.
- Build command: `npm run build`
- Output directory: `dist`

Or deploy manually: `npx wrangler pages deploy dist`

## 3. Environment variables (Pages)

Required:

```bash
NUXT_PUBLIC_PARTYKIT_HOST=your-app.your-name.partykit.dev
```

Optional (TURN for cross-network reliability):

```bash
NUXT_CLOUDFLARE_TURN_KEY_ID=
NUXT_CLOUDFLARE_TURN_API_TOKEN=
```

## 4. PartyKit (WebRTC signaling)

The PartyKit server (`party/signal.ts`) relays WebRTC offer/answer/candidate between paired devices.

```bash
npm run party:deploy
```

Then paste the resulting domain into the Cloudflare Pages env var `NUXT_PUBLIC_PARTYKIT_HOST`.

## 5. Post-deploy verification

1. Site is reachable: `/` (redirects), `/text-transfer`, `/blog`, `/about`
2. zh-CN / zh-TW reachable: `/zh-CN/text-transfer`, `/zh-TW/text-transfer`
3. SEO files: `/robots.txt`, `/sitemap_index.xml`, `/__sitemap__/en-US.xml`
4. Cross-device pairing works (open text-transfer on PC, scan QR with phone)

## 6. Common issues

- **Devices cannot pair** — confirm `NUXT_PUBLIC_PARTYKIT_HOST` points to the deployed PartyKit host (not localhost).
- **TURN unreachable** — only matters for symmetric NAT (common on CN mobile ISPs). Set the two TURN env vars to enable Cloudflare TURN.
