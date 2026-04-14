<template>
  <div class="w-full max-w-5xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolA.deviceHistoryTitle') }}</h2>
        <p class="mt-2 max-w-lg text-on-surface-variant">{{ $t('toolA.deviceHistoryDesc') }}</p>
      </div>
      <div class="flex gap-3">
        <button class="bg-surface-container-high dark:bg-surface-container rounded-lg px-4 py-2 text-sm font-semibold text-on-surface dark:text-surface" @click="$emit('goBack')">{{ $t('common.goBack') }}</button>
        <button class="primary-gradient flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-on-primary transition-transform hover:scale-[1.02] active:scale-[0.98]" @click="$emit('newConnection')">
          <span class="material-symbols-outlined text-lg">add_link</span>{{ $t('toolA.newConnection') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="space-y-4 lg:col-span-8">
        <div v-for="device in devices" :key="device.name" class="bg-surface-container-lowest dark:bg-surface-container-high group flex items-center gap-5 rounded-[1.5rem] p-6 transition-all hover:shadow-ambient">
          <div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-xl">
            <span class="material-symbols-outlined text-2xl text-primary">{{ device.icon }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ device.name }}</h3>
            <p class="mt-0.5 text-xs text-on-surface-variant">{{ $t('toolA.lastSeen') }}: {{ device.time }}</p>
          </div>
          <span class="rounded px-2.5 py-1 text-xs font-bold" :class="device.online ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'">
            {{ device.online ? $t('toolA.deviceConnected') : $t('toolA.deviceOffline') }}
          </span>
          <button class="bg-primary/5 hover:bg-primary/10 rounded-lg px-4 py-2 text-sm font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">{{ $t('toolA.quickConnect') }}</button>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-4">
        <div class="primary-gradient rounded-[1.5rem] p-6 text-on-primary">
          <div class="mb-4 flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">verified_user</span>
            <span class="font-headline font-bold">{{ $t('toolA.securityPulse') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed opacity-75" /><span class="relative inline-flex h-2 w-2 rounded-full bg-primary-fixed" /></span>
            <span class="text-sm text-on-primary/80">{{ $t('toolA.handshakeActive') }}</span>
          </div>
        </div>

        <div class="bg-surface-container-low dark:bg-surface-container space-y-4 rounded-[1.5rem] p-6">
          <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.connectivityInsights') }}</span>
          <div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary">sync</span><div><p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.autoSyncing') }}</p><p class="text-xs text-on-surface-variant">3 {{ $t('toolA.devicesLabel') }}</p></div></div>
          <div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary">network_check</span><div><p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.avgHandshake') }}</p><p class="text-xs text-on-surface-variant">42ms</p></div></div>
        </div>

        <div class="bg-surface-container-low hover:bg-surface-container dark:bg-surface-container flex cursor-pointer items-center gap-4 rounded-[1.5rem] p-6 transition-colors">
          <span class="material-symbols-outlined text-2xl text-primary">auto_delete</span>
          <div>
            <p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.autoForget') }}</p>
            <p class="text-xs text-on-surface-variant">{{ $t('toolA.autoForgetDesc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeviceHistoryItem } from '~/types/toolPages'

defineProps<{
  devices: DeviceHistoryItem[]
}>()

defineEmits<{
  goBack: []
  newConnection: []
}>()
</script>
