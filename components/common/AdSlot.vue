<template>
  <div v-if="adsEnabled" :class="containerClass">
    <!--
      Development placeholder. When wiring up Google AdSense:
      1. Set NUXT_PUBLIC_ADS_ENABLED=true
      2. Add the AdSense loader script to nuxt.config.ts (`app.head.script`)
      3. Replace the inner <div> below with the production markup, e.g.:

        <ins
          class="adsbygoogle"
          :style="{ display: 'block', minHeight: minHeight + 'px' }"
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          :data-ad-slot="slotIdForKey(slotKey)"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

      Then push to AdSense once mounted (and again on client-side route change):
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    -->
    <div
      class="rounded-2xl border border-dashed border-outline/20 bg-surface-container-low/40 dark:bg-surface-container/40 flex items-center justify-center"
      :style="{ minHeight: minHeight + 'px' }"
      role="complementary"
      :aria-label="$t('share.result.adSlot')"
    >
      <span class="text-xs text-on-surface-variant/50 uppercase tracking-widest font-mono">
        AD · {{ slotKey }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /**
   * Stable identifier for this placement (e.g. `share-result-bottom`).
   * Used as the lookup key when mapping to AdSense ad-slot IDs in production
   * and as the visible label in dev so designers can locate placements.
   * Named `slotKey` (not `slot`) because `slot` is a reserved Vue attribute.
   */
  slotKey: string
  /** Wrapper class for outer spacing — caller decides margins. */
  containerClass?: string
  /**
   * Reserved height to avoid layout shift (CLS) before the ad loads.
   * 250 = standard rectangle. Use 100 for tall horizontal slots.
   */
  minHeight?: number
}>(), {
  containerClass: '',
  minHeight: 96,
})

const runtimeConfig = useRuntimeConfig()
const adsEnabled = computed(() => Boolean(runtimeConfig.public.adsEnabled))
</script>
