<template>
  <div
    v-if="visible"
    class="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-primary/20 bg-surface-container-lowest p-4 shadow-lg dark:bg-surface-container-high"
    role="status"
    aria-live="polite"
  >
    <div class="flex items-start gap-3">
      <span class="material-symbols-outlined text-primary">volunteer_activism</span>
      <div class="flex-1">
        <p class="text-sm font-semibold text-on-surface dark:text-surface">
          {{ title }}
        </p>
        <p class="mt-1 text-xs leading-relaxed text-on-surface-variant">
          {{ message }}
        </p>
      </div>
      <button
        class="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container-highest dark:hover:bg-surface-container"
        :aria-label="closeLabel"
        @click="dismiss"
      >
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const STORAGE_KEY = 'tp_adblock_notice_dismissed_v1'
const visible = ref(false)
const { locale } = useI18n()
const isZh = computed(() => locale.value.startsWith('zh'))

const title = computed(() =>
  isZh.value ? '支持 FileIO 持续免费运行' : 'Help Keep FileIO Free',
)
const message = computed(() =>
  isZh.value
    ? '检测到你可能启用了广告拦截插件。我们是一个小团队，如果你愿意，请将本站加入白名单，或考虑小额捐助支持我们。'
    : 'We detected that you might be using an ad blocker. We are a small lab, please whitelist us or consider a small donation.',
)
const closeLabel = computed(() => (isZh.value ? '关闭提示' : 'Dismiss notice'))

function detectAdBlock(): boolean {
  const bait = document.createElement('div')
  bait.className = 'adsbox ad-banner ad-unit pub_300x250 text-ad ad-placement'
  bait.setAttribute('aria-hidden', 'true')
  bait.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;'
  document.body.appendChild(bait)

  const blocked = bait.offsetParent === null || bait.offsetHeight === 0 || getComputedStyle(bait).display === 'none'
  bait.remove()
  return blocked
}

function dismiss() {
  visible.value = false
  localStorage.setItem(STORAGE_KEY, '1')
}

onMounted(() => {
  const dismissed = localStorage.getItem(STORAGE_KEY) === '1'
  if (dismissed) return

  // Delay to avoid layout noise during first paint.
  window.setTimeout(() => {
    if (detectAdBlock()) {
      visible.value = true
    }
  }, 900)
})
</script>
