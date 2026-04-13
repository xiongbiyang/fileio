<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="state.visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="handleCancel">
        <div class="absolute inset-0 bg-on-surface/40 dark:bg-on-surface/60 backdrop-blur-sm" />
        <div class="relative w-full max-w-sm bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl shadow-2xl overflow-hidden">
          <div class="p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-error text-xl">warning</span>
              </div>
              <h3 class="font-headline font-bold text-lg text-on-surface dark:text-surface">{{ state.title }}</h3>
            </div>
            <p class="text-sm text-on-surface-variant leading-relaxed pl-[52px]">{{ state.message }}</p>
          </div>
          <div class="flex gap-3 px-6 pb-6">
            <button
              class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm hover:bg-surface-container transition-colors"
              @click="handleCancel"
            >
              {{ state.cancelText }}
            </button>
            <button
              class="flex-1 py-3 bg-error text-on-error rounded-xl font-bold text-sm hover:bg-error/90 transition-colors"
              @click="handleConfirm"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { state, handleConfirm, handleCancel } = useConfirmDialog()
</script>

<style scoped>
.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}
</style>
