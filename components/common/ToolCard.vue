<template>
  <NuxtLink :to="localePath(to)" class="tool-card-link">
    <div class="tool-card">
      <div class="tool-card-icon" :style="{ background: iconBg }">
        <slot name="icon">
          <span>{{ icon }}</span>
        </slot>
      </div>
      <div class="tool-card-content">
        <span v-if="badge" class="label-md tool-badge">{{ badge }}</span>
        <h3 class="title-lg">{{ name }}</h3>
        <p class="body-md tool-card-desc">{{ description }}</p>
      </div>
      <div class="tool-card-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  description: string
  to: string
  icon?: string
  iconBg?: string
  badge?: string
}>()

const localePath = useLocalePath()
</script>

<style scoped>
.tool-card-link {
  text-decoration: none;
  display: block;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  padding: var(--spacing-5) var(--spacing-7);
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-ambient);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.tool-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.tool-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tool-card-content {
  flex: 1;
  min-width: 0;
}

.tool-badge {
  color: var(--color-primary);
  margin-bottom: var(--spacing-1);
  display: inline-block;
}

.tool-card-desc {
  color: var(--color-on-surface-variant);
  margin-top: var(--spacing-1);
}

.tool-card-arrow {
  color: var(--color-outline);
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.tool-card:hover .tool-card-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

@media (max-width: 767px) {
  .tool-card {
    padding: var(--spacing-4) var(--spacing-5);
    gap: var(--spacing-3);
  }

  .tool-card-icon {
    width: 44px;
    height: 44px;
    font-size: 1.25rem;
  }
}
</style>
