<template>
  <div class="pointer-events-none fixed top-20 right-4 z-[120] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="pointer-events-auto overflow-hidden rounded-2xl border px-4 py-3 shadow-ambient backdrop-blur"
        :class="notification.tone === 'success'
          ? 'border-primary/15 bg-surface-container-lowest/95 text-on-surface dark:bg-surface-container-high/95 dark:text-surface'
          : 'border-error/20 bg-error-container/95 text-on-error-container'"
      >
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined mt-0.5 text-lg" :class="notification.tone === 'success' ? 'text-primary' : 'text-error'">
            {{ notification.tone === 'success' ? 'check_circle' : 'error' }}
          </span>
          <p class="flex-1 text-sm font-medium leading-5">{{ notification.message }}</p>
          <button class="rounded-lg p-1 text-on-surface-variant/70 transition-colors hover:bg-surface-container hover:text-on-surface dark:hover:bg-surface-container" @click="dismiss(notification.id)">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { notifications, dismiss } = useNotifier()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
