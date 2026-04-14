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

Required if Quick Share is deployed:

```bash
# Generated in Cloudflare Dashboard → Turnstile → add site
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
NUXT_TURNSTILE_SECRET_KEY=
```

Optional (toggle ad slots on once AdSense is wired up — see section 3c):

```bash
NUXT_PUBLIC_ADS_ENABLED=false
```

## 3b. Quick Share infrastructure (R2 + KV + Turnstile)

The `/share` tool requires three Cloudflare resources. Run once:

```bash
# 1. R2 bucket for uploaded files
npx wrangler r2 bucket create fileio-share

# 2. Safety-net lifecycle: auto-delete anything older than 3 days
npx wrangler r2 bucket lifecycle add fileio-share --prefix "" --expire-days 3

# 3. KV namespace for per-IP rate limits
npx wrangler kv:namespace create RATE_LIMIT_KV
# Copy the printed id and paste into wrangler.toml under [[kv_namespaces]]

# 4. Turnstile site (browser):
#    https://dash.cloudflare.com/?to=/:account/turnstile
#    Create a Managed widget. Note Site Key (public) + Secret Key (server-only).
```

Then uncomment the `[[r2_buckets]]` and `[[kv_namespaces]]` blocks in
`wrangler.toml`, set both Turnstile env vars in Pages, and redeploy.

For local development you may use Cloudflare's always-pass Turnstile test keys:
- Site key:   `1x00000000000000000000AA`
- Secret key: `1x0000000000000000000000000000000AA`

## 3c. Ad system (optional — Google AdSense)

All ad placements share two reusable components and a single feature flag:
- `components/common/AdSlot.vue` — a single ad placeholder; takes a `slot`
  identifier (e.g. `share-result-bottom`) and a `min-height` for CLS reservation
- `components/common/AdRailWrapper.vue` — desktop-only sticky left+right rails
  (160px on `xl`, 300px on `2xl`); auto-hides on `<xl` viewports

Both render absolutely nothing unless `runtimeConfig.public.adsEnabled` is true,
controlled by:

```bash
NUXT_PUBLIC_ADS_ENABLED=false   # default: ads off, no placeholders shown
NUXT_PUBLIC_ADS_ENABLED=true    # ads on (or dev placeholders if AdSense not wired up yet)
```

Current placements (10 slots total):
- `/share` upload page: left + right + bottom
- `/share/result` upload-success page: left + right + bottom
- `/share/[id]` download page: left + right + bottom
- `TextTransferSuccess` component: bottom (only after a transfer completes)

When wiring up real AdSense:
1. Set `NUXT_PUBLIC_ADS_ENABLED=true` in Pages env vars
2. Add the AdSense loader to `nuxt.config.ts` `app.head.script`
3. Replace the placeholder `<div>` inside `AdSlot.vue` with the production
   `<ins class="adsbygoogle">` markup and add a `SLOT_MAP` for the ad-slot IDs

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
