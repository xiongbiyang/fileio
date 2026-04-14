# Contributing Guide

## Keep Local and CI Checks Aligned

Before pushing code, run the same checks as CI:

```bash
npm ci
npm run lint
npm run lint:i18n
npm run test -- --run
npm exec nuxi typecheck
npm run build
```

## CI Compatibility Notes

- CI sets `NUXT_BUILD_DIR=.nuxt`.
- Do not change build-dir related behavior without verifying both local and CI pass.
- Prefer calling npm scripts in workflow steps to avoid command drift.

## i18n Regression Guard

- Always run `npm run lint:i18n` before pushing.
- For high-traffic entry pages, verify localized copy renders as expected:
  - `/` (redirects to `/text-transfer`)
  - `/text-transfer`
  - `/blog`
  - `/about`
