<template>
  <div ref="switcherRef" class="relative">
    <button
      class="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
      @click="isOpen = !isOpen"
    >
      <span class="material-symbols-outlined text-xl">language</span>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition ease-in duration-100"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="isOpen" class="absolute top-full right-0 mt-2 min-w-[140px] p-1 rounded-xl glass-panel shadow-lg z-50">
        <button
          v-for="loc in locales"
          :key="loc.code"
          class="w-full px-4 py-2 text-left text-sm rounded-lg transition-colors"
          :class="loc.code === locale
            ? 'text-primary font-medium'
            : 'text-on-surface-variant hover:bg-surface-container-low'"
          @click="switchLocale(loc.code)"
        >
          {{ loc.name }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const isOpen = ref(false)
const switcherRef = ref<HTMLElement>()

onClickOutside(switcherRef, () => { isOpen.value = false })

function switchLocale(code: string) {
  setLocale(code as 'en' | 'zh-CN' | 'zh-TW')
  navigateTo(switchLocalePath(code as 'en' | 'zh-CN' | 'zh-TW'))
  isOpen.value = false
}
</script>
