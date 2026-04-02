# OAuth Setup (Google + GitHub)

This project now supports real OAuth login through:

- `GET /api/auth/oauth-url`
- `GET /api/auth/callback/google`
- `GET /api/auth/callback/github`

## 1) Environment Variables

Set these in local `.env` and Cloudflare Pages environment variables:

```bash
NUXT_PUBLIC_OAUTH_ENABLED=true

NUXT_OAUTH_GOOGLE_CLIENT_ID=
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=

NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
```

If `NUXT_PUBLIC_OAUTH_ENABLED=false`, OAuth buttons stay disabled and show a notice.

## 2) OAuth App Callback URLs

Use exact callback URLs:

- Google: `https://YOUR_DOMAIN/api/auth/callback/google`
- GitHub: `https://YOUR_DOMAIN/api/auth/callback/github`

For local development:

- Google can use `http://localhost:3000/api/auth/callback/google`
- GitHub callback should match your app settings exactly; use a local tunnel if needed.

## 3) Cloudflare Pages Config

In Cloudflare Pages:

1. Project -> Settings -> Environment variables
2. Add all OAuth variables for both `Production` and `Preview` (if preview testing is needed)
3. Redeploy

## 4) Verification Checklist

1. Open `/auth/signin`
2. Click `Google` -> should redirect to Google consent page
3. After consent, browser returns to `/auth/signin?oauth=success...`
4. User is signed in and redirected to `/tools/clipboard` (or query `redirect`)
5. Repeat same flow for `GitHub`

## 5) Security Notes

- OAuth client secrets are server-side only (`runtimeConfig` private keys)
- Frontend never receives provider secret
- State token is validated using secure HttpOnly cookie (`tp_oauth_state`)
- Redirect path is normalized to internal relative paths only
