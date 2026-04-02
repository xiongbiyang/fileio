<template>
  <div class="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
    <!-- Hero -->
    <div class="text-center mb-20">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-xs font-bold uppercase tracking-widest mb-6">
        <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
        {{ $t('waitlist.badge') }}
      </span>
      <h1 class="font-headline text-4xl md:text-6xl font-extrabold text-on-surface dark:text-surface tracking-tight leading-tight mb-6">
        {{ $t('waitlist.title') }}
      </h1>
      <p class="text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto mb-10">
        {{ $t('waitlist.desc') }}
      </p>
      <div class="flex flex-col items-center gap-2 mb-8">
        <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low dark:bg-surface-container text-xs font-bold tracking-wider uppercase text-primary">
          {{ $t('waitlist.planIntentLabel') }}: {{ selectedPlanLabel }}
        </span>
        <p class="text-sm text-on-surface-variant">{{ selectedPlanDesc }}</p>
      </div>

      <!-- Email Form -->
      <form class="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 p-2 bg-surface-container-low dark:bg-surface-container rounded-2xl shadow-ambient" @submit.prevent="joinWaitlist">
        <input v-model="email" type="email" class="flex-1 bg-transparent px-5 py-3.5 text-on-surface dark:text-surface placeholder:text-outline focus:outline-none rounded-xl" :placeholder="$t('waitlist.emailPlaceholder')" required >
        <button type="submit" class="px-8 py-3.5 primary-gradient text-on-primary rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform whitespace-nowrap" :disabled="joined">
          {{ joined ? $t('waitlist.joinedBtn') : $t('waitlist.joinBtn') }}
        </button>
      </form>
      <p v-if="joined" class="text-primary text-sm font-medium mt-4 flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">check_circle</span>
        {{ $t('waitlist.successMsgWithPlan', { plan: selectedPlanLabel }) }}
      </p>
      <p v-else class="text-on-surface-variant text-sm mt-4">{{ $t('waitlist.socialProof') }}</p>
    </div>

    <!-- Comparison: Free vs Pro -->
    <div class="mb-20">
      <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface text-center mb-4">{{ $t('waitlist.comparisonTitle') }}</h2>
      <p class="text-on-surface-variant text-center mb-10 max-w-xl mx-auto">{{ $t('waitlist.comparisonDesc') }}</p>

      <div class="overflow-x-auto">
        <table class="w-full max-w-3xl mx-auto">
          <thead>
            <tr>
              <th class="text-left py-4 px-6 text-sm font-bold text-on-surface-variant">{{ $t('waitlist.feature') }}</th>
              <th class="py-4 px-6 text-center text-sm font-bold text-on-surface-variant">{{ $t('waitlist.freePlan') }}</th>
              <th class="py-4 px-6 text-center">
                <span class="px-3 py-1 primary-gradient text-on-primary text-sm font-bold rounded-full">Pro</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in comparisonRows" :key="row.feature" class="border-t border-outline-variant/10">
              <td class="py-4 px-6 text-sm text-on-surface dark:text-surface font-medium">{{ row.feature }}</td>
              <td class="py-4 px-6 text-center text-sm text-on-surface-variant">{{ row.free }}</td>
              <td class="py-4 px-6 text-center text-sm font-bold text-primary">{{ row.pro }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pro Features Bento -->
    <div class="mb-20">
      <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface text-center mb-4">{{ $t('waitlist.capabilitiesTitle') }}</h2>
      <p class="text-on-surface-variant text-center mb-10 max-w-xl mx-auto">{{ $t('waitlist.capabilitiesDesc') }}</p>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Large: History -->
        <div class="md:col-span-7 bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 md:p-10 group hover:shadow-ambient transition-shadow">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-2xl">history</span>
            </div>
            <span class="px-2 py-0.5 bg-primary-fixed/30 text-primary text-[10px] font-bold uppercase rounded-full tracking-wider">{{ $t('waitlist.popular') }}</span>
          </div>
          <h3 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-2">{{ $t('waitlist.feat1Title') }}</h3>
          <p class="text-on-surface-variant leading-relaxed">{{ $t('waitlist.feat1Desc') }}</p>
        </div>

        <!-- Accent: File size -->
        <div class="md:col-span-5 primary-gradient rounded-3xl p-8 md:p-10 text-on-primary shadow-xl relative overflow-hidden">
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-primary-fixed/10 rounded-full blur-2xl" />
          <span class="material-symbols-outlined text-3xl mb-4 block">upload_file</span>
          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold uppercase rounded-full">1GB</span>
            <span class="text-on-primary/60 text-xs">{{ $t('waitlist.perTransfer') }}</span>
          </div>
          <h3 class="font-headline text-2xl font-extrabold mb-2">{{ $t('waitlist.feat2Title') }}</h3>
          <p class="text-on-primary/80 text-sm leading-relaxed">{{ $t('waitlist.feat2Desc') }}</p>
        </div>

        <!-- Custom rooms -->
        <div class="md:col-span-4 bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 md:p-10">
          <div class="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">link</span>
          </div>
          <h3 class="font-headline text-xl font-extrabold text-on-surface dark:text-surface mb-2">{{ $t('waitlist.feat3Title') }}</h3>
          <p class="text-on-surface-variant text-sm leading-relaxed">{{ $t('waitlist.feat3Desc') }}</p>
          <div class="mt-4 px-4 py-2 bg-surface-container-highest dark:bg-surface-container-high rounded-lg">
            <span class="text-xs font-mono text-primary font-bold">toolport.dev/r/my-team</span>
          </div>
        </div>

        <!-- Enhanced E2EE -->
        <div class="md:col-span-4 bg-surface-container-highest dark:bg-surface-container-high rounded-3xl p-8 md:p-10">
          <div class="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">lock</span>
          </div>
          <h3 class="font-headline text-xl font-extrabold text-on-surface dark:text-surface mb-2">{{ $t('waitlist.feat4Title') }}</h3>
          <p class="text-on-surface-variant text-sm leading-relaxed">{{ $t('waitlist.feat4Desc') }}</p>
          <div class="mt-4 flex items-center gap-2 px-3 py-1.5 bg-primary-fixed/20 text-primary rounded-full text-xs font-bold w-fit">
            <span class="w-1.5 h-1.5 rounded-full bg-primary" />
            {{ $t('waitlist.activeProtection') }}
          </div>
        </div>

        <!-- Batch QR -->
        <div class="md:col-span-4 bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 md:p-10">
          <div class="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">qr_code_2</span>
          </div>
          <h3 class="font-headline text-xl font-extrabold text-on-surface dark:text-surface mb-2">{{ $t('waitlist.feat5Title') }}</h3>
          <p class="text-on-surface-variant text-sm leading-relaxed">{{ $t('waitlist.feat5Desc') }}</p>
        </div>

        <!-- No Ads + Priority -->
        <div class="md:col-span-12 bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div class="flex items-center gap-6 flex-1">
            <div class="flex gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center">
                <span class="material-symbols-outlined text-primary text-2xl">block</span>
              </div>
              <div>
                <h3 class="font-headline text-lg font-extrabold text-on-surface dark:text-surface">{{ $t('waitlist.feat6Title') }}</h3>
                <p class="text-on-surface-variant text-sm">{{ $t('waitlist.feat6Desc') }}</p>
              </div>
            </div>
            <div class="h-10 w-px bg-outline-variant/20 hidden md:block" />
            <div class="flex gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center">
                <span class="material-symbols-outlined text-primary text-2xl">support_agent</span>
              </div>
              <div>
                <h3 class="font-headline text-lg font-extrabold text-on-surface dark:text-surface">{{ $t('waitlist.feat7Title') }}</h3>
                <p class="text-on-surface-variant text-sm">{{ $t('waitlist.feat7Desc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vote Section -->
    <div class="mb-20">
      <div class="bg-surface-container-highest dark:bg-surface-container-high rounded-4xl p-8 md:p-12">
        <div class="text-center mb-8">
          <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface mb-3">{{ $t('waitlist.voteTitle') }}</h2>
          <p class="text-on-surface-variant max-w-xl mx-auto">{{ $t('waitlist.voteDesc') }}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <button
            v-for="(option, i) in voteOptions"
            :key="option.icon"
            class="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-2xl text-left transition-all"
            :class="votedIndex === i ? 'ring-2 ring-primary shadow-ambient' : 'hover:ring-2 hover:ring-primary/40'"
            @click="votedIndex = i"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">{{ option.icon }}</span>
              </div>
              <span v-if="votedIndex === i" class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1">check_circle</span>
              <span v-else class="px-2 py-0.5 bg-primary-fixed/30 text-primary text-xs font-bold rounded-full">{{ option.vote }}</span>
            </div>
            <h4 class="font-headline font-bold text-on-surface dark:text-surface mb-1">{{ option.title }}</h4>
            <p class="text-on-surface-variant text-sm leading-relaxed">{{ option.desc }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="text-center">
      <div class="primary-gradient rounded-4xl p-10 md:p-16 max-w-4xl mx-auto relative overflow-hidden">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-primary-fixed/10 rounded-full blur-3xl" />
        <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-fixed/10 rounded-full blur-3xl" />
        <h2 class="font-headline text-3xl md:text-4xl font-extrabold text-on-primary mb-4 relative z-10">{{ $t('waitlist.ctaTitle') }}</h2>
        <p class="text-on-primary/80 text-lg mb-8 max-w-lg mx-auto relative z-10">{{ $t('waitlist.ctaDesc') }}</p>
        <form class="max-w-md mx-auto flex flex-col sm:flex-row gap-3 relative z-10" @submit.prevent="joinWaitlist">
          <input v-model="email" type="email" class="flex-1 bg-primary-fixed/20 backdrop-blur-sm px-5 py-3.5 text-on-primary placeholder:text-on-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-fixed" :placeholder="$t('waitlist.emailPlaceholder')" required >
          <button type="submit" class="px-8 py-3.5 bg-primary-fixed text-on-primary-fixed-variant rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform whitespace-nowrap" :disabled="joined">
            {{ joined ? $t('waitlist.joinedBtn') : $t('waitlist.joinBtn') }}
          </button>
        </form>
        <p v-if="joined" class="text-primary-fixed text-sm font-medium mt-4 relative z-10">{{ $t('waitlist.successMsgWithPlan', { plan: selectedPlanLabel }) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
useHead({
  title: 'Pro Waitlist - Unlock 1GB Transfers & More',
  meta: [
    { name: 'description', content: 'Join the ToolPort Pro waitlist. Get 1GB file transfers, 30-day history, permanent clipboard rooms, custom room IDs, batch QR generation, and zero ads.' },
    { name: 'keywords', content: 'ToolPort Pro,pro waitlist,1GB file transfer,permanent clipboard,custom room ID,batch QR code' },
  ],
})
useSeoMeta({
  ogTitle: 'Pro Waitlist - Unlock 1GB Transfers & More',
  ogDescription: 'Join the ToolPort Pro waitlist. Get 1GB file transfers, 30-day history, permanent rooms, custom room IDs, and zero ads.',
  ogImage: 'https://toolport.dev/og-image.png',
})

const email = ref('')
const joined = ref(false)
const votedIndex = ref<number | null>(null)

type WaitlistPlan = 'monthly' | 'yearly' | 'lifetime'

function normalizePlan(raw: unknown): WaitlistPlan {
  const value = String(raw || '').trim().toLowerCase()
  if (value === 'monthly' || value === 'yearly' || value === 'lifetime') return value
  return 'lifetime'
}

const selectedPlan = computed<WaitlistPlan>(() => normalizePlan(route.query.plan))
const selectedPlanLabel = computed(() => {
  if (selectedPlan.value === 'monthly') return t('waitlist.planMonthly')
  if (selectedPlan.value === 'yearly') return t('waitlist.planYearly')
  return t('waitlist.planLifetime')
})
const selectedPlanDesc = computed(() => {
  if (selectedPlan.value === 'monthly') return t('waitlist.planMonthlyDesc')
  if (selectedPlan.value === 'yearly') return t('waitlist.planYearlyDesc')
  return t('waitlist.planLifetimeDesc')
})

async function joinWaitlist() {
  if (!email.value.trim()) return
  try {
    await $fetch('/api/waitlist', {
      method: 'POST',
      body: {
        email: email.value.trim().toLowerCase(),
        plan: selectedPlan.value,
        locale: String(locale.value || 'en'),
        source: 'pro-waitlist',
      },
    })
  }
  catch (error) {
    console.error(error)
  }
  joined.value = true
  email.value = ''
}

const comparisonRows = computed(() => [
  { feature: t('waitlist.compFileSize'), free: '100 MB', pro: '1 GB' },
  { feature: t('waitlist.compHistory'), free: t('waitlist.compNoHistory'), pro: t('waitlist.comp30Days') },
  { feature: t('waitlist.compRoomId'), free: t('waitlist.compRandom'), pro: t('waitlist.compCustom') },
  { feature: t('waitlist.compRoomExpiry'), free: '24h', pro: t('waitlist.compPermanent') },
  { feature: t('waitlist.compBatchQr'), free: '—', pro: t('waitlist.compUnlimited') },
  { feature: t('waitlist.compAds'), free: t('waitlist.compYes'), pro: t('waitlist.compNo') },
  { feature: t('waitlist.compSupport'), free: t('waitlist.compCommunity'), pro: t('waitlist.compPriority') },
])

const voteOptions = computed(() => [
  { icon: 'code', title: t('waitlist.vote1Title'), vote: '42%', desc: t('waitlist.vote1Desc') },
  { icon: 'terminal', title: t('waitlist.vote2Title'), vote: '28%', desc: t('waitlist.vote2Desc') },
  { icon: 'auto_awesome', title: t('waitlist.vote3Title'), vote: '19%', desc: t('waitlist.vote3Desc') },
  { icon: 'add_circle', title: t('waitlist.vote4Title'), vote: t('waitlist.vote4Vote'), desc: t('waitlist.vote4Desc') },
])
</script>
