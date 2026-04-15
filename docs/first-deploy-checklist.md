# First Deploy Checklist

Step-by-step walkthrough for deploying this project from scratch to Cloudflare
Pages + PartyKit for the first time. For ongoing deploy reference see
[deployment-flow.md](deployment-flow.md).

## 1. Accounts & prerequisites

- Cloudflare account (Pages + R2 + KV + Turnstile — all on free tier)
- PartyKit account (GitHub OAuth, free)
- A domain pointed at Cloudflare nameservers (e.g. `fileio.top`)
- Node.js 20+ and npm installed locally

## 2. Initialize Cloudflare resources (run once, locally)

```bash
# Auth wrangler with your Cloudflare account
npx wrangler login

# R2 bucket — stores Quick Share uploads (auto-wiped after 3 days)
npx wrangler r2 bucket create fileio-share
npx wrangler r2 bucket lifecycle add fileio-share --prefix "" --expire-days 3

# KV namespace — per-IP rate limit counters
npx wrangler kv:namespace create RATE_LIMIT_KV
# Copy the returned `id` — you'll paste it into wrangler.toml next
```

Edit [wrangler.toml](../wrangler.toml) and uncomment the two blocks, pasting the
KV id:

```toml
[[r2_buckets]]
binding = "SHARE_BUCKET"
bucket_name = "fileio-share"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "<paste-the-id-here>"
```

Commit and push.

## 3. Create Turnstile widget

Cloudflare Dashboard → Turnstile → **Add site**:

- Widget mode: **Managed**
- Hostname: your production domain

Save the **Site key** (public) and **Secret key** (server-only). You'll paste
them into Pages env vars in step 5.

## 4. Deploy PartyKit signaling server

```bash
npm run party:deploy
```

First run will prompt GitHub OAuth. Note the deployed host (looks like
`transfer.<your-partykit-username>.partykit.dev`) — you'll paste it into Pages
env vars in step 5.

Re-run this command whenever `party/signal.ts` changes.

## 5. Cloudflare Pages project

Dashboard → Pages → **Create a project** → **Connect to Git** → pick
`xiongbiyang/fileio`.

Build settings:

| Field | Value |
|-------|-------|
| Framework preset | Nuxt.js |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `20` |

Environment variables (Settings → Environment variables → **Production**):

| Variable | Value | Notes |
|----------|-------|-------|
| `NUXT_PUBLIC_SITE_URL` | `https://fileio.top` | Your canonical origin, no trailing slash |
| `NUXT_PUBLIC_PARTYKIT_HOST` | `transfer.<you>.partykit.dev` | From step 4 |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | `0x...` | Public, from step 3 |
| `NUXT_TURNSTILE_SECRET_KEY` | `0x...` | **Encrypt** in Pages UI |
| `NUXT_PUBLIC_ADS_ENABLED` | `false` | Keep off until AdSense is wired up |

Optional (TURN — only if you need cross-network reliability on symmetric NAT):

| Variable | Value |
|----------|-------|
| `NUXT_CLOUDFLARE_TURN_KEY_ID` | From Cloudflare Calls / TURN |
| `NUXT_CLOUDFLARE_TURN_API_TOKEN` | (encrypt) |

Trigger a deploy. Watch the build logs for a clean `✨ Build complete!`.

## 6. Custom domain

Pages project → **Custom domains** → Set up:

- `fileio.top`
- `www.fileio.top` (recommended, Pages will redirect to apex)

Cloudflare adds the CNAME records automatically if DNS is on Cloudflare.

## 7. Smoke test

Open the production URL and verify:

- [ ] `/` redirects to `/text-transfer`
- [ ] Scan the QR on `/text-transfer` from a phone → devices pair (PartyKit ✓)
- [ ] `/share` upload a small file → get link → download once → 2nd download 404 (R2 + KV + Turnstile ✓)
- [ ] `/robots.txt` and `/sitemap_index.xml` load
- [ ] `/zh-CN/text-transfer` and `/zh-TW/text-transfer` load
- [ ] `/blog`, `/about`, `/privacy`, `/terms` load

## 8. Ongoing maintenance

- **Main app** — `git push` to `master` → Pages builds and deploys automatically
- **PartyKit** — re-run `npm run party:deploy` after any change to `party/signal.ts`
- **R2 / KV** — no action; lifecycle rule handles cleanup
- **Turnstile** — no action; monitor challenge rate in Cloudflare dashboard

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| Devices can't pair | `NUXT_PUBLIC_PARTYKIT_HOST` missing or points to localhost |
| Share upload returns 503 | R2 / KV binding missing or Turnstile env vars unset |
| Share upload returns 403 | Turnstile site key / secret mismatched |
| Pairing works on same Wi-Fi but not across networks | Enable the two TURN env vars |
| Build fails on `nuxt typecheck` | Run `npm run build` locally to reproduce before pushing |
