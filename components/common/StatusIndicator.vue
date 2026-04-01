<template>
  <div class="status-indicator" :class="`status-indicator--${status}`">
    <span class="status-dot" :class="`status-dot--${status}`" />
    <span class="body-sm">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  label: string
}>()
</script>

<style scoped>
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  background: var(--color-surface-container-low);
  font-size: var(--text-body-sm);
}

.status-indicator--connected {
  color: var(--color-primary);
}

.status-indicator--disconnected {
  color: var(--color-outline);
}

.status-indicator--connecting {
  color: var(--color-warning);
}

.status-indicator--error {
  color: var(--color-error);
}
</style>
