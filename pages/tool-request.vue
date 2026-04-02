<template>
  <div class="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-24">
    <!-- Header -->
    <div class="text-center mb-12">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-xs font-bold uppercase tracking-widest mb-6">
        <span class="material-symbols-outlined text-sm">campaign</span>
        {{ $t('toolRequest.badge') }}
      </span>
      <h1 class="font-headline text-4xl md:text-5xl font-extrabold text-on-surface dark:text-surface tracking-tight mb-4">
        {{ $t('toolRequest.title') }}
      </h1>
      <p class="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
        {{ $t('toolRequest.desc') }}
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-12">
      <div v-for="stat in stats" :key="stat.icon" class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-5 text-center">
        <span class="material-symbols-outlined text-primary text-2xl mb-2 block">{{ stat.icon }}</span>
        <p class="text-2xl font-headline font-extrabold text-on-surface dark:text-surface">{{ stat.value }}</p>
        <p class="text-xs text-on-surface-variant mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Existing Tools -->
    <div class="mb-12">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-2">{{ $t('toolRequest.liveTitle') }}</h2>
      <p class="text-on-surface-variant text-sm mb-6">{{ $t('toolRequest.liveDesc') }}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          v-for="tool in liveTools"
          :key="tool.path"
          :to="localePath(tool.path)"
          class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-5 group hover:shadow-ambient hover:ring-1 hover:ring-primary/20 transition-all"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-xl">{{ tool.icon }}</span>
            </div>
            <span class="px-2 py-0.5 bg-primary-fixed/30 text-primary text-[10px] font-bold uppercase rounded-full">{{ $t('toolRequest.liveBadge') }}</span>
          </div>
          <h3 class="font-headline font-bold text-on-surface dark:text-surface text-sm mb-1">{{ tool.title }}</h3>
          <p class="text-xs text-on-surface-variant leading-relaxed mb-3">{{ tool.desc }}</p>
          <div class="flex flex-wrap gap-1 mb-3">
            <span v-for="tag in tool.tags" :key="tag" class="px-2 py-0.5 bg-surface-container-high dark:bg-surface-container-highest rounded text-[10px] text-on-surface-variant">{{ tag }}</span>
          </div>
          <span class="text-sm font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {{ $t('common.openTool') }}
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Vote Section -->
    <div class="mb-12">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-2">{{ $t('toolRequest.voteTitle') }}</h2>
      <p class="text-on-surface-variant text-sm mb-6">{{ $t('toolRequest.voteDesc') }}</p>

      <!-- Category Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="activeCategory === cat.key ? 'bg-primary text-on-primary' : 'bg-surface-container-high dark:bg-surface-container text-on-surface-variant hover:text-on-surface'"
          @click="activeCategory = cat.key"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          v-for="idea in filteredIdeas"
          :key="idea.key"
          class="p-5 rounded-2xl text-left transition-all flex items-start gap-4"
          :class="voted.has(idea.key)
            ? 'bg-primary-fixed/30 ring-2 ring-primary'
            : 'bg-surface-container-low dark:bg-surface-container hover:bg-primary-fixed/10 hover:ring-1 hover:ring-primary/30'"
          @click="toggleVote(idea.key)"
        >
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" :class="voted.has(idea.key) ? 'bg-primary text-on-primary' : 'bg-primary-fixed text-primary'">
            <span class="material-symbols-outlined text-xl">{{ idea.icon }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-bold text-on-surface dark:text-surface text-sm">{{ idea.title }}</h3>
              <span v-if="voted.has(idea.key)" class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">check_circle</span>
            </div>
            <p class="text-xs text-on-surface-variant leading-relaxed">{{ idea.desc }}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              <span v-for="tag in idea.tags" :key="tag" class="px-2 py-0.5 bg-surface-container-high dark:bg-surface-container-highest rounded text-[10px] text-on-surface-variant">{{ tag }}</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Custom Suggestion -->
    <div class="bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 mb-12">
      <h2 class="font-headline text-xl font-bold text-on-surface dark:text-surface mb-2">{{ $t('toolRequest.customTitle') }}</h2>
      <p class="text-on-surface-variant text-sm mb-6">{{ $t('toolRequest.customDesc') }}</p>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('toolRequest.toolNameLabel') }}</label>
          <input
            v-model="toolName"
            class="w-full bg-surface-container-lowest dark:bg-surface-container-high px-5 py-3.5 rounded-xl text-sm text-on-surface dark:text-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20"
            :placeholder="$t('toolRequest.toolNamePlaceholder')"
          >
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('toolRequest.detailLabel') }}</label>
          <textarea
            v-model="toolDetail"
            class="w-full bg-surface-container-lowest dark:bg-surface-container-high px-5 py-3.5 rounded-xl text-sm text-on-surface dark:text-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 resize-none"
            rows="4"
            :placeholder="$t('toolRequest.detailPlaceholder')"
          />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('toolRequest.emailLabelRequired') }} <span class="text-error">*</span></label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full bg-surface-container-lowest dark:bg-surface-container-high px-5 py-3.5 rounded-xl text-sm text-on-surface dark:text-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20"
            :class="emailTouched && !isEmailValid ? 'ring-2 ring-error/50' : ''"
            :placeholder="$t('toolRequest.emailPlaceholder')"
            @blur="emailTouched = true"
          >
          <p v-if="emailTouched && !isEmailValid" class="text-error text-xs mt-1">{{ $t('toolRequest.emailError') }}</p>
        </div>
      </div>
    </div>

    <!-- Submit -->
    <div class="text-center mb-16">
      <button
        class="px-12 py-4 primary-gradient text-on-primary rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
        :disabled="!canSubmit"
        @click="submit"
      >
        <span v-if="submitted" class="flex items-center gap-2">
          <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">check_circle</span>
          {{ $t('toolRequest.submitted') }}
        </span>
        <span v-else class="flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">send</span>
          {{ $t('toolRequest.submitBtn') }}
        </span>
      </button>
      <p v-if="submitted" class="text-primary text-sm font-medium mt-4">{{ $t('toolRequest.thanks') }}</p>
      <p v-else class="text-on-surface-variant text-xs mt-4">{{ $t('toolRequest.hint') }}</p>
    </div>

    <!-- FAQ for SEO -->
    <div>
      <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface text-center mb-8">{{ $t('toolRequest.faqTitle') }}</h2>
      <div class="max-w-3xl mx-auto space-y-4">
        <details v-for="faq in faqs" :key="faq.q" class="group bg-surface-container-low dark:bg-surface-container rounded-xl overflow-hidden">
          <summary class="list-none p-5 flex justify-between items-center cursor-pointer hover:bg-surface-container/50 transition-colors">
            <span class="font-medium text-on-surface dark:text-surface text-sm">{{ faq.q }}</span>
            <span class="material-symbols-outlined text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div class="px-5 pb-5 text-on-surface-variant text-sm leading-relaxed">{{ faq.a }}</div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useHead({
  title: t('toolRequest.seoTitle'),
  meta: [
    { name: 'description', content: t('toolRequest.seoDesc') },
    { name: 'keywords', content: t('toolRequest.seoKeywords') },
  ],
})

useSeoMeta({
  ogTitle: t('toolRequest.seoTitle'),
  ogDescription: t('toolRequest.seoDesc'),
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: t('toolRequest.faq1Q'), acceptedAnswer: { '@type': 'Answer', text: t('toolRequest.faq1A') } },
    { '@type': 'Question', name: t('toolRequest.faq2Q'), acceptedAnswer: { '@type': 'Answer', text: t('toolRequest.faq2A') } },
    { '@type': 'Question', name: t('toolRequest.faq3Q'), acceptedAnswer: { '@type': 'Answer', text: t('toolRequest.faq3A') } },
    { '@type': 'Question', name: t('toolRequest.faq4Q'), acceptedAnswer: { '@type': 'Answer', text: t('toolRequest.faq4A') } },
    { '@type': 'Question', name: t('toolRequest.faq5Q'), acceptedAnswer: { '@type': 'Answer', text: t('toolRequest.faq5A') } },
  ],
})

const voted = ref(new Set<string>())
const toolName = ref('')
const toolDetail = ref('')
const email = ref('')
const submitted = ref(false)
const activeCategory = ref('all')
const { notify } = useNotifier()

const categories = computed(() => [
  { key: 'all', label: t('toolRequest.catAll') },
  { key: 'ai', label: t('toolRequest.catAi') },
  { key: 'dev', label: t('toolRequest.catDev') },
  { key: 'design', label: t('toolRequest.catDesign') },
  { key: 'text', label: t('toolRequest.catText') },
  { key: 'security', label: t('toolRequest.catSecurity') },
])

const surveyIdeas = computed(() => [
  { key: 'json', icon: 'data_object', cat: 'dev', title: t('toolRequest.idea1'), desc: t('toolRequest.idea1Desc'), tags: ['JSON', 'API', 'Debug'] },
  { key: 'image', icon: 'image', cat: 'design', title: t('toolRequest.idea2'), desc: t('toolRequest.idea2Desc'), tags: ['PNG', 'JPEG', 'WebP'] },
  { key: 'markdown', icon: 'edit_note', cat: 'text', title: t('toolRequest.idea3'), desc: t('toolRequest.idea3Desc'), tags: ['Markdown', 'HTML', 'PDF'] },
  { key: 'password', icon: 'password', cat: 'security', title: t('toolRequest.idea4'), desc: t('toolRequest.idea4Desc'), tags: ['AES', 'SHA', 'Random'] },
  { key: 'pdf', icon: 'picture_as_pdf', cat: 'text', title: t('toolRequest.idea5'), desc: t('toolRequest.idea5Desc'), tags: ['PDF', 'Merge', 'Split'] },
  { key: 'color', icon: 'palette', cat: 'design', title: t('toolRequest.idea6'), desc: t('toolRequest.idea6Desc'), tags: ['HEX', 'RGB', 'HSL'] },
  { key: 'base64', icon: 'code', cat: 'dev', title: t('toolRequest.idea7'), desc: t('toolRequest.idea7Desc'), tags: ['Base64', 'URL', 'HTML'] },
  { key: 'diff', icon: 'compare', cat: 'dev', title: t('toolRequest.idea8'), desc: t('toolRequest.idea8Desc'), tags: ['Diff', 'Git', 'Code'] },
  { key: 'hash', icon: 'fingerprint', cat: 'security', title: t('toolRequest.idea9'), desc: t('toolRequest.idea9Desc'), tags: ['MD5', 'SHA-256', 'HMAC'] },
  { key: 'svg', icon: 'draw', cat: 'design', title: t('toolRequest.idea10'), desc: t('toolRequest.idea10Desc'), tags: ['SVG', 'PNG', 'Favicon'] },
  { key: 'ai-img-gen', icon: 'brush', cat: 'ai', title: t('toolRequest.idea11'), desc: t('toolRequest.idea11Desc'), tags: ['AI Art', 'Text-to-Image', 'Stable Diffusion'] },
  { key: 'ai-bg-remove', icon: 'content_cut', cat: 'ai', title: t('toolRequest.idea12'), desc: t('toolRequest.idea12Desc'), tags: ['AI Cutout', 'Background', 'PNG'] },
  { key: 'ai-write', icon: 'auto_awesome', cat: 'ai', title: t('toolRequest.idea13'), desc: t('toolRequest.idea13Desc'), tags: ['AI Writer', 'Essay', 'GPT'] },
  { key: 'ai-tts', icon: 'record_voice_over', cat: 'ai', title: t('toolRequest.idea14'), desc: t('toolRequest.idea14Desc'), tags: ['TTS', 'AI Voice', 'Narration'] },
  { key: 'ai-upscale', icon: 'auto_fix_high', cat: 'ai', title: t('toolRequest.idea15'), desc: t('toolRequest.idea15Desc'), tags: ['Upscale', 'Enhance', 'HD'] },
  { key: 'ai-translate', icon: 'translate', cat: 'ai', title: t('toolRequest.idea16'), desc: t('toolRequest.idea16Desc'), tags: ['AI Translate', 'Multilingual'] },
  { key: 'ai-summary', icon: 'summarize', cat: 'ai', title: t('toolRequest.idea17'), desc: t('toolRequest.idea17Desc'), tags: ['Summarize', 'PDF', 'TL;DR'] },
  { key: 'ai-rewrite', icon: 'edit_note', cat: 'ai', title: t('toolRequest.idea18'), desc: t('toolRequest.idea18Desc'), tags: ['Paraphrase', 'Rewrite', 'Polish'] },
  { key: 'ai-logo', icon: 'diamond', cat: 'ai', title: t('toolRequest.idea19'), desc: t('toolRequest.idea19Desc'), tags: ['Logo', 'Branding', 'SVG'] },
  { key: 'ai-headshot', icon: 'face_retouching_natural', cat: 'ai', title: t('toolRequest.idea20'), desc: t('toolRequest.idea20Desc'), tags: ['Portrait', 'ID Photo', 'Avatar'] },
  { key: 'ai-code', icon: 'terminal', cat: 'ai', title: t('toolRequest.idea21'), desc: t('toolRequest.idea21Desc'), tags: ['Code', 'Regex', 'SQL'] },
  { key: 'ai-ocr', icon: 'document_scanner', cat: 'ai', title: t('toolRequest.idea22'), desc: t('toolRequest.idea22Desc'), tags: ['OCR', 'Handwriting', 'Table'] },
  { key: 'ai-watermark', icon: 'healing', cat: 'ai', title: t('toolRequest.idea23'), desc: t('toolRequest.idea23Desc'), tags: ['Watermark', 'Inpaint', 'Remove'] },
  { key: 'ai-ppt', icon: 'slideshow', cat: 'ai', title: t('toolRequest.idea24'), desc: t('toolRequest.idea24Desc'), tags: ['PPT', 'Slides', 'Presentation'] },
])

const filteredIdeas = computed(() => {
  if (activeCategory.value === 'all') return surveyIdeas.value
  return surveyIdeas.value.filter(i => i.cat === activeCategory.value)
})

const stats = computed(() => [
  { icon: 'build', value: '3', label: t('toolRequest.statTools') },
  { icon: 'group', value: '2,400+', label: t('toolRequest.statUsers') },
  { icon: 'how_to_vote', value: String(voted.value.size || '0'), label: t('toolRequest.statVotes') },
])

const liveTools = computed(() => [
  {
    path: '/tools/text-transfer',
    icon: 'swap_horiz',
    title: t('toolRequest.toolATitle'),
    desc: t('toolRequest.toolADesc'),
    tags: [t('toolRequest.tagTransfer'), t('toolRequest.tagE2EE'), t('toolRequest.tagWebRTC'), t('toolRequest.tagNoInstall')],
  },
  {
    path: '/tools/qr-code',
    icon: 'qr_code_2',
    title: t('toolRequest.toolBTitle'),
    desc: t('toolRequest.toolBDesc'),
    tags: [t('toolRequest.tagQR'), t('toolRequest.tagScan'), t('toolRequest.tagBatch'), t('toolRequest.tagLocal')],
  },
  {
    path: '/tools/clipboard',
    icon: 'content_paste',
    title: t('toolRequest.toolCTitle'),
    desc: t('toolRequest.toolCDesc'),
    tags: [t('toolRequest.tagClipboard'), t('toolRequest.tagRealtime'), t('toolRequest.tagE2EE'), t('toolRequest.tagAutoExpire')],
  },
])

const faqs = computed(() => [
  { q: t('toolRequest.faq1Q'), a: t('toolRequest.faq1A') },
  { q: t('toolRequest.faq2Q'), a: t('toolRequest.faq2A') },
  { q: t('toolRequest.faq3Q'), a: t('toolRequest.faq3A') },
  { q: t('toolRequest.faq4Q'), a: t('toolRequest.faq4A') },
  { q: t('toolRequest.faq5Q'), a: t('toolRequest.faq5A') },
])

const emailTouched = ref(false)
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const canSubmit = computed(() => (voted.value.size > 0 || toolName.value.trim()) && isEmailValid.value)

function toggleVote(key: string) {
  const next = new Set(voted.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  voted.value = next
  submitted.value = false
}

function submit() {
  if (!canSubmit.value) return
  const existing = JSON.parse(localStorage.getItem('tp_tool_requests') || '[]')
  existing.push({
    votes: Array.from(voted.value),
    toolName: toolName.value.trim(),
    detail: toolDetail.value.trim(),
    email: email.value.trim(),
    time: Date.now(),
  })
  localStorage.setItem('tp_tool_requests', JSON.stringify(existing))
  submitted.value = true
  notify(t('toolRequest.thanks'))
}
</script>
