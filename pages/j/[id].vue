<script setup lang="ts">
// Path-based join shortcut for QR scanning. Puts the room id in the URL
// path so it survives every upstream mutation:
//   - in-app browsers (WeChat/Alipay) that strip query strings
//   - i18n middleware that 301-redirects an unprefixed path to /zh-CN/...,
//     losing the ?r= query and #r= hash in the process
// Once here we're safely past any redirect chain; hop to the real tool
// page via an in-app SPA navigation, which preserves query unconditionally.
definePageMeta({ layout: false })

const route = useRoute()
const localePath = useLocalePath()

const rawId = String(route.params.id || '').trim().toLowerCase()
const validId = /^[a-z0-9]{4,20}$/.test(rawId) ? rawId : ''

await navigateTo(
  validId
    ? { path: localePath('/transfer'), query: { r: validId } }
    : localePath('/transfer'),
  { redirectCode: 302, replace: true },
)
</script>

<template>
  <div />
</template>
