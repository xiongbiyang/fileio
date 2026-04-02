<template>
  <div class="w-full max-w-5xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-headline text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolA.e2eeAuditTitle') }}</h2>
        <p class="mt-2 text-on-surface-variant">{{ $t('toolA.e2eeAuditDesc') }}</p>
      </div>
      <button class="bg-surface-container-high dark:bg-surface-container rounded-lg px-4 py-2 text-sm font-semibold text-on-surface dark:text-surface" @click="$emit('goBack')">{{ $t('common.goBack') }}</button>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8 md:col-span-2">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolA.connectionHealth') }}</h3>
          <div class="bg-primary-fixed/20 flex items-center gap-2 rounded-full px-3 py-1">
            <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
            <span class="text-xs font-bold text-primary">{{ $t('toolA.encryptedP2pActive') }}</span>
          </div>
        </div>
        <div class="flex items-center justify-center gap-8 py-6">
          <div class="flex flex-col items-center gap-2"><div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full"><span class="material-symbols-outlined text-2xl text-primary">computer</span></div><span class="text-xs font-medium text-on-surface-variant">Local</span></div>
          <span class="material-symbols-outlined text-2xl text-primary">vpn_lock</span>
          <div class="flex flex-col items-center gap-2"><div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full"><span class="material-symbols-outlined text-2xl text-primary">dns</span></div><span class="text-xs font-medium text-on-surface-variant">Remote</span></div>
        </div>
      </div>

      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8">
        <div class="mb-4 flex items-center gap-3">
          <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1">sync_alt</span>
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">HKDF Pairing</span>
            <p class="text-sm font-bold text-primary">{{ $t('toolA.authenticated') }}</p>
          </div>
        </div>
        <p class="mb-4 text-xs leading-relaxed text-on-surface-variant">{{ $t('toolA.hkdfDesc') }}</p>
        <button class="text-xs font-bold uppercase tracking-widest text-primary hover:underline">{{ $t('toolA.reAuthenticate') }}</button>
      </div>

      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8 md:col-span-3">
        <span class="mb-4 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.keyFingerprint') }}</span>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div v-for="chunk in keyFingerprint" :key="chunk" class="bg-surface-container dark:bg-surface-container rounded-lg p-4 text-center">
            <span class="font-mono text-lg font-bold tracking-widest text-on-surface dark:text-surface">{{ chunk }}</span>
          </div>
        </div>
      </div>

      <div class="bg-on-surface dark:bg-surface-container rounded-xl p-8 text-surface md:col-span-3">
        <span class="mb-4 block text-xs font-bold uppercase tracking-widest text-surface/60">{{ $t('toolA.liveSecurityLog') }}</span>
        <div class="space-y-3 font-mono text-xs">
          <div v-for="log in securityLogs" :key="log.time" class="flex gap-4">
            <span class="text-surface/40">{{ log.time }}</span>
            <span :class="log.color">{{ log.msg }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SecurityLogItem {
  time: string
  msg: string
  color: string
}

defineProps<{
  keyFingerprint: string[]
  securityLogs: SecurityLogItem[]
}>()

defineEmits<{
  goBack: []
}>()
</script>
