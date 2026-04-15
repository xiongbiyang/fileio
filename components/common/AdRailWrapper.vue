<template>
  <div class="mx-auto w-full max-w-[1400px] px-6 lg:px-8 py-10 md:py-16">
    <div class="xl:grid xl:grid-cols-[160px_minmax(0,1fr)_160px] xl:gap-8 2xl:grid-cols-[300px_minmax(0,1fr)_300px]">
      <!-- Left rail — shown on xl (≥ 1280px) and up. -->
      <aside class="hidden xl:block">
        <div class="sticky top-20">
          <AdSlot :slot-key="`${pageKey}-left`" :min-height="600" />
        </div>
      </aside>

      <!-- Main content column; stays responsive on narrow screens. -->
      <div :class="innerClass">
        <slot />
      </div>

      <!-- Right rail -->
      <aside class="hidden xl:block">
        <div class="sticky top-20">
          <AdSlot :slot-key="`${pageKey}-right`" :min-height="600" />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Base key for rail ad slots (produces `${pageKey}-left` / `-right`). */
  pageKey: string
  /**
   * Class applied to the centre column. Use this to cap width (e.g.
   * `max-w-3xl mx-auto`) so the main card looks the same on narrow
   * screens where the rails are hidden.
   */
  innerClass?: string
}>(), {
  innerClass: 'max-w-3xl mx-auto',
})
</script>
