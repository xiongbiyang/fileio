<template>
  <div class="min-h-screen">

    <!-- ============ MOBILE QR LAYOUT ============ -->
    <div class="md:hidden px-4 pt-4 pb-28">
      <!-- Mobile Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">qr_code_2</span>
          <span class="font-headline text-lg font-bold text-on-surface dark:text-surface">{{ $t('toolB.mobileTitle') }}</span>
        </div>
        <button class="p-2 text-on-surface-variant" @click="showMobileSettings = !showMobileSettings"><span class="material-symbols-outlined">settings</span></button>
      </div>

      <!-- Mobile Settings Panel -->
      <div v-if="showMobileSettings" class="mb-6 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 space-y-4 shadow-ambient">
        <h3 class="font-headline font-bold text-on-surface dark:text-surface text-sm uppercase tracking-wider">{{ $t('toolB.labelColorConfig') }}</h3>
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <input v-model="fgColor" type="color" class="w-10 h-10 rounded-full border-4 border-surface-container cursor-pointer">
            <span class="text-sm text-on-surface-variant">{{ $t('toolB.foreground') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="bgColor" type="color" class="w-10 h-10 rounded-full border-4 border-surface-container cursor-pointer">
            <span class="text-sm text-on-surface-variant">{{ $t('toolB.background') }}</span>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('toolB.labelErrorCorrection', { level: errorCorrection }) }}</label>
          <div class="flex bg-surface-container-low dark:bg-surface-container p-1 rounded-xl">
            <button
              v-for="level in ['L', 'M', 'Q', 'H']"
              :key="level"
              class="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
              :class="errorCorrection === level ? 'bg-white dark:bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant'"
              @click="errorCorrection = level"
            >
              {{ level }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Subtitle -->
      <div class="mb-6">
        <span class="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">STUDIO</span>
        <h1 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface tracking-tight">{{ $t('toolB.mobileHeadline') }}</h1>
        <p class="text-on-surface-variant text-sm mt-1">{{ $t('toolB.mobileSubline') }}</p>
      </div>

      <!-- Mobile Tabs -->
      <div class="flex gap-2 mb-6">
        <button class="flex-1 py-3 rounded-xl font-bold text-sm transition-colors" :class="activeTab === 'generate' ? 'primary-gradient text-on-primary' : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant'" @click="activeTab = 'generate'">{{ $t('toolB.tabGenerate') }}</button>
        <button class="flex-1 py-3 rounded-xl font-bold text-sm transition-colors" :class="activeTab === 'scan' ? 'primary-gradient text-on-primary' : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant'" @click="activeTab = 'scan'">{{ $t('toolB.tabScan') }}</button>
      </div>

      <!-- Mobile Generate -->
      <div v-if="activeTab === 'generate'" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">{{ $t('toolB.mobileDestLabel') }}</label>
          <div class="flex gap-2">
            <input v-model="inputText" class="flex-1 bg-surface-container-highest dark:bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface dark:text-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20" placeholder="https://your-website.com">
            <button class="p-3 bg-surface-container-high dark:bg-surface-container rounded-xl text-on-surface-variant" @click="pasteFromClipboard"><span class="material-symbols-outlined text-lg">link</span></button>
          </div>
          <div v-if="templateGuide" class="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <p class="text-xs font-bold text-on-surface dark:text-surface">{{ templateGuide.title }}</p>
            <p class="text-[11px] text-on-surface-variant mt-1">{{ templateGuide.summary }}</p>
            <ul class="mt-2 space-y-1">
              <li v-for="step in templateGuide.steps" :key="`m-guide-${step}`" class="text-[11px] text-on-surface-variant">{{ step }}</li>
            </ul>
          </div>
        </div>

        <!-- Mobile Popular Templates -->
        <div class="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-on-surface dark:text-surface">{{ $t('toolB.popularTemplates') }}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-on-primary">{{ $t('toolB.hotBadge') }}</span>
          </div>
          <div class="max-h-44 overflow-y-auto pr-1">
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="template in uiQrTemplates"
                :key="`m-${template.key}`"
                class="text-left rounded-lg border p-2.5 bg-surface-container-lowest dark:bg-surface-container-high"
                :class="activeTemplateKey === template.key ? 'border-primary/60 bg-primary/5' : 'border-outline-variant/20'"
                @click="applyQrTemplateByKey(template.key)"
              >
                <p class="text-sm font-bold text-on-surface dark:text-surface">{{ template.title }}</p>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Live Preview -->
        <div class="flex items-start gap-2 mb-2">
          <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolB.mobileLivePreview') }}</span>
          <span class="relative flex h-1.5 w-1.5 mt-0.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" /></span>
        </div>

        <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-6 flex items-center justify-center shadow-ambient">
          <div class="w-56 h-56 bg-surface-container dark:bg-surface-container rounded-xl flex items-center justify-center">
            <canvas v-show="!!inputText" ref="qrCanvasMobile" class="w-full h-auto max-w-[200px]" />
            <span v-if="!inputText" class="material-symbols-outlined text-5xl text-outline-variant/30">qr_code_2</span>
          </div>
        </div>

        <!-- Mobile Download Buttons -->
        <div class="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('toolB.exportLabel') }}</span>
            <span class="text-[10px] font-bold text-primary">{{ inputText ? $t('toolB.statusReady') : $t('toolB.statusWaiting') }}</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <select v-model="exportScale" class="col-span-2 bg-surface-container-high dark:bg-surface-container rounded-xl px-3 py-2 text-sm text-on-surface dark:text-surface">
              <option v-for="scale in exportScaleOptions" :key="`m-scale-${scale}`" :value="scale">{{ $t('toolB.exportScale', { scale, size: qrSize * scale }) }}</option>
            </select>
            <button class="py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm" :disabled="!inputText" @click="downloadPng">
              <span class="material-symbols-outlined text-lg">download</span>PNG
            </button>
            <button class="py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" :disabled="!inputText" @click="downloadSvg">
              <span class="material-symbols-outlined text-lg">download</span>SVG
            </button>
            <button class="col-span-2 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" :disabled="!inputText" @click="downloadWebp">
              <span class="material-symbols-outlined text-lg">download</span>{{ $t('toolB.downloadWebp') }}
            </button>
          </div>
        </div>

        <!-- Mobile Quick Settings -->
        <div class="flex gap-3">
          <div class="flex-1 bg-surface-container-low dark:bg-surface-container rounded-xl p-3 flex items-center gap-2">
            <span class="w-4 h-4 rounded-full border border-outline/20" :style="{ background: `linear-gradient(135deg, ${fgColor} 50%, ${bgColor} 50%)` }" />
            <span class="text-xs font-medium text-on-surface-variant">{{ fgColor }} / {{ bgColor }}</span>
          </div>
          <div class="flex-1 bg-surface-container-low dark:bg-surface-container rounded-xl p-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-on-surface-variant">add_photo_alternate</span>
            <span class="text-xs font-medium text-on-surface-variant">Logo: {{ logoFile ? logoFile.name : 'None' }}</span>
          </div>
        </div>

        <!-- Mobile Generation History -->
        <div class="rounded-xl border border-outline-variant/20 bg-surface-container-low dark:bg-surface-container p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-on-surface dark:text-surface">{{ tr('生成历史', 'Generation History') }}</span>
            <button class="text-[11px] px-2.5 py-1 rounded-md bg-primary text-on-primary font-bold" @click="addGenerationHistoryFromCurrent">
              {{ tr('保存当前', 'Save Current') }}
            </button>
          </div>
          <div v-if="generationHistory.length" class="max-h-40 overflow-y-auto space-y-2 pr-1">
            <div v-for="item in generationHistory" :key="`m-gen-${item.id}`" class="rounded-lg bg-surface-container-lowest dark:bg-surface-container-high p-2.5">
              <button class="w-full text-left" @click="restoreGenerationHistory(item)">
                <p class="text-xs font-semibold text-on-surface dark:text-surface truncate">{{ item.text }}</p>
                <p class="text-[11px] text-on-surface-variant mt-0.5">{{ formatHistoryTime(item.timestamp) }} · {{ item.size }}px · {{ item.errorCorrection }}</p>
              </button>
              <div class="mt-1.5 flex justify-end">
                <button class="text-[11px] text-on-surface-variant hover:text-error" @click="removeGenerationHistory(item.id)">
                  {{ tr('删除', 'Delete') }}
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-[11px] text-on-surface-variant">{{ tr('暂无生成记录', 'No generation history yet') }}</p>
        </div>
      </div>

      <!-- Mobile Scan -->
      <div v-else-if="activeTab === 'scan'" class="space-y-4">
        <div v-if="scanResult" class="space-y-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1">check_circle</span>
            <span class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolB.scanSuccessful') }}</span>
          </div>
          <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient">
            <p class="text-sm font-semibold text-on-surface dark:text-surface mb-2">{{ scanResultTitle }}</p>
            <p class="text-xs text-on-surface-variant break-all bg-surface-container-low dark:bg-surface-container p-3 rounded-lg">{{ scanResult }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <button v-if="scanResultType === 'url'" class="py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm active:scale-95 transition-transform" @click="openUrl(scanResult)">{{ $t('toolB.openUrl') }}</button>
            <button class="py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-bold text-sm active:scale-95 transition-transform" @click="copyResult">{{ $t('common.copyResult') }}</button>
          </div>
          <button class="w-full py-3 text-primary font-bold text-sm" @click="resetScan">{{ $t('common.scanAgain') }}</button>
        </div>
        <div v-else class="space-y-3">
          <div v-if="cameraActive" class="bg-surface-container-low dark:bg-surface-container rounded-2xl overflow-hidden">
            <div class="relative">
              <video ref="cameraVideoMobile" autoplay muted playsinline class="w-full aspect-video object-cover" />
              <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div class="w-[62%] max-w-[220px] aspect-square border border-white/70 rounded-2xl shadow-[0_0_0_999px_rgba(0,0,0,0.2)]" />
              </div>
            </div>
            <div class="px-4 py-2 flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-primary">{{ $t('toolB.cameraScanning') }}</span>
              <button class="text-xs font-semibold text-on-surface-variant hover:text-primary" @click="stopCameraScan">{{ $t('toolB.stopCamera') }}</button>
            </div>
            <p class="px-4 pb-3 text-xs text-on-surface-variant">{{ $t('toolB.cameraAlignHint') }}</p>
          </div>

          <button v-if="!cameraActive" class="w-full py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm" @click="startCameraScan">
            {{ $t('toolB.startCamera') }}
          </button>

          <div class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-8 flex flex-col items-center gap-4 active:bg-surface-container transition-colors" @click="triggerScanInput">
            <span class="material-symbols-outlined text-5xl text-outline-variant">add_photo_alternate</span>
            <p class="text-on-surface-variant text-sm">{{ $t('toolB.uploadScan') }}</p>
          </div>

          <p v-if="cameraErrorMessage" class="text-xs text-error">{{ cameraErrorMessage }}</p>
        </div>
        <input ref="scanInputMobile" type="file" accept="image/*" hidden @change="handleScanImage">
      </div>
    </div>

    <!-- ============ DESKTOP QR LAYOUT ============ -->
    <div class="hidden md:block pt-8 pb-12 px-8">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="font-headline text-4xl md:text-5xl font-extrabold text-on-surface dark:text-surface tracking-tight">
        {{ $t('toolB.title') }}
      </h1>
      <p class="text-on-surface-variant mt-2 max-w-2xl">
        {{ $t('toolB.subtitle') }}
      </p>
    </div>

    <!-- Tool Container -->
    <div class="bg-surface-container-low dark:bg-surface-container rounded-4xl p-1 shadow-sm">
      <!-- Tab Navigation -->
      <div class="flex gap-2 p-4 pb-0">
        <button
          class="px-8 py-3 font-bold rounded-t-2xl transition-all text-sm"
          :class="activeTab === 'generate'
            ? 'bg-surface-container-lowest dark:bg-surface-container-high text-primary shadow-sm border-b-2 border-primary'
            : 'text-on-surface-variant hover:bg-surface-container'"
          @click="activeTab = 'generate'"
        >
          {{ $t('toolB.tabGenerate') }}
        </button>
        <button
          class="px-8 py-3 font-medium rounded-t-2xl transition-all text-sm"
          :class="activeTab === 'scan'
            ? 'bg-surface-container-lowest dark:bg-surface-container-high text-primary shadow-sm border-b-2 border-primary'
            : 'text-on-surface-variant hover:bg-surface-container'"
          @click="activeTab = 'scan'"
        >
          {{ $t('toolB.tabScan') }}
        </button>
        <button
          class="px-8 py-3 font-medium rounded-t-2xl transition-all text-sm"
          :class="activeTab === 'batch'
            ? 'bg-surface-container-lowest dark:bg-surface-container-high text-primary shadow-sm border-b-2 border-primary'
            : 'text-on-surface-variant hover:bg-surface-container'"
          @click="activeTab = 'batch'"
        >
          {{ $t('toolB.tabBatch') }}
        </button>
      </div>

      <!-- Main Workspace -->
      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-[1.75rem] p-4 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <!-- Generate Tab -->
        <template v-if="activeTab === 'generate'">
          <!-- Left Column: Inputs -->
          <div class="lg:col-span-7 flex flex-col gap-5">
            <!-- Text Input -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                {{ $t('toolB.labelTextUrl') }}
              </label>
              <textarea
                v-model="inputText"
                class="w-full bg-surface-container-highest dark:bg-surface-container-high border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                rows="3"
                placeholder="https://toolport.io/share/8842..."
              />
              <div v-if="templateGuide" class="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p class="text-xs font-bold text-on-surface dark:text-surface">{{ templateGuide.title }}</p>
                <p class="text-xs text-on-surface-variant mt-1">{{ templateGuide.summary }}</p>
                <ul class="mt-2 space-y-1">
                  <li v-for="step in templateGuide.steps" :key="`d-guide-${step}`" class="text-xs text-on-surface-variant">{{ step }}</li>
                </ul>
              </div>
            </div>

            <!-- Popular Templates -->
            <div class="rounded-2xl border-2 border-primary/25 bg-primary/5 dark:bg-primary/10 p-4 md:p-5 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-headline text-lg font-extrabold text-on-surface dark:text-surface">{{ $t('toolB.popularTemplates') }}</h3>
                <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-on-primary">{{ $t('toolB.hotBadge') }}</span>
              </div>
              <div class="max-h-72 overflow-y-auto pr-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <button
                    v-for="template in uiQrTemplates"
                    :key="template.key"
                    class="text-left rounded-xl border bg-surface-container-lowest dark:bg-surface-container-high p-3 transition-colors"
                    :class="activeTemplateKey === template.key ? 'border-primary/60 bg-primary/5' : 'border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5'"
                    @click="applyQrTemplateByKey(template.key)"
                  >
                    <p class="text-sm font-bold text-on-surface dark:text-surface">{{ template.title }}</p>
                    <p class="text-xs text-on-surface-variant mt-1 line-clamp-2">{{ template.desc }}</p>
                  </button>
                </div>
              </div>
            </div>

            <!-- Info Card -->
            <div class="p-4 bg-primary-fixed-dim/10 rounded-xl flex items-center gap-3">
              <span class="material-symbols-outlined text-primary">info</span>
              <p class="text-sm text-on-surface-variant">
                {{ $t('toolB.infoSendPhone') }}
                <NuxtLink :to="localePath('/tools/text-transfer')" class="text-primary font-medium hover:underline">{{ $t('toolB.textTransferLink') }}</NuxtLink>.
              </p>
            </div>

          </div>

          <!-- Right Column: Live Preview -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <div class="w-full bg-surface-container-low dark:bg-surface-container rounded-3xl relative flex items-center justify-center overflow-hidden min-h-[240px] md:min-h-[320px]">
              <div class="absolute inset-0 opacity-10" style="background: radial-gradient(circle at 30% 30%, rgba(0,81,71,0.1) 0%, transparent 70%)" />
              <div class="relative z-10 p-8 bg-white rounded-2xl shadow-ambient">
                <canvas v-show="!!inputText" ref="qrCanvas" class="w-full h-auto" />
                <div v-if="!inputText" class="w-48 h-48 flex items-center justify-center">
                  <span class="material-symbols-outlined text-6xl text-outline-variant/30">qr_code_2</span>
                </div>
              </div>
            </div>

            <!-- Download Buttons -->
            <div class="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('toolB.exportLabel') }}</span>
                <span class="text-[10px] font-bold text-primary">{{ inputText ? $t('toolB.statusReady') : $t('toolB.statusWaiting') }}</span>
              </div>
              <select v-model="exportScale" class="w-full bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl px-3 py-2 text-sm">
                <option v-for="scale in exportScaleOptions" :key="scale" :value="scale">{{ $t('toolB.exportScale', { scale, size: qrSize * scale }) }}</option>
              </select>
              <div class="grid grid-cols-3 gap-3">
                <button
                  class="py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform shadow-sm"
                  :disabled="!inputText"
                  @click="downloadPng"
                >
                  <span class="material-symbols-outlined text-lg">download</span>
                  {{ $t('toolB.downloadPng') }}
                </button>
                <button
                  class="py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                  :disabled="!inputText"
                  @click="downloadSvg"
                >
                  <span class="material-symbols-outlined text-lg">download</span>
                  {{ $t('toolB.downloadSvg') }}
                </button>
                <button
                  class="py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                  :disabled="!inputText"
                  @click="downloadWebp"
                >
                  <span class="material-symbols-outlined text-lg">download</span>
                  {{ $t('toolB.downloadWebp') }}
                </button>
              </div>
            </div>

            <!-- Security Badge -->
            <div class="flex items-center gap-2 text-outline justify-center pt-1">
              <span class="material-symbols-outlined text-sm">verified_user</span>
              <span class="text-xs font-bold uppercase tracking-widest">{{ $t('toolB.localBadge') }}</span>
            </div>

            <!-- Generation History -->
            <div class="rounded-xl border border-outline-variant/20 bg-surface-container-low dark:bg-surface-container p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-bold text-on-surface dark:text-surface">{{ tr('生成历史', 'Generation History') }}</h4>
                <button class="text-xs px-3 py-1.5 rounded-md bg-primary text-on-primary font-bold" @click="addGenerationHistoryFromCurrent">
                  {{ tr('保存当前', 'Save Current') }}
                </button>
              </div>
              <div v-if="generationHistory.length" class="max-h-48 overflow-y-auto space-y-2 pr-1">
                <div v-for="item in generationHistory" :key="`d-gen-${item.id}`" class="rounded-lg bg-surface-container-lowest dark:bg-surface-container-high p-3 flex items-start gap-3">
                  <button class="flex-1 text-left min-w-0" @click="restoreGenerationHistory(item)">
                    <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">{{ item.text }}</p>
                    <p class="text-xs text-on-surface-variant mt-1">{{ formatHistoryTime(item.timestamp) }} · {{ item.size }}px · {{ item.errorCorrection }}</p>
                  </button>
                  <button class="text-xs text-on-surface-variant hover:text-error" @click="removeGenerationHistory(item.id)">
                    {{ tr('删除', 'Delete') }}
                  </button>
                </div>
              </div>
              <p v-else class="text-xs text-on-surface-variant">{{ tr('暂无生成记录', 'No generation history yet') }}</p>
            </div>
          </div>

          <!-- Compact Settings -->
          <div class="lg:col-span-12 rounded-2xl border border-outline-variant/20 bg-surface-container-low dark:bg-surface-container p-4 md:p-5 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  {{ $t('toolB.labelSize', { size: qrSize }) }}
                </label>
                <select
                  v-model="qrSize"
                  class="w-full bg-surface-container-high dark:bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm text-on-surface dark:text-surface"
                >
                  <option :value="128">128 x 128 px</option>
                  <option :value="256">256 x 256 px</option>
                  <option :value="512">512 x 512 px</option>
                  <option :value="1024">1024 x 1024 px</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  {{ $t('toolB.labelErrorCorrection', { level: errorCorrection }) }}
                </label>
                <div class="flex bg-surface-container-high dark:bg-surface-container-highest p-1 rounded-lg">
                  <button
                    v-for="level in ['L', 'M', 'Q', 'H']"
                    :key="level"
                    class="flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all"
                    :class="errorCorrection === level
                      ? 'bg-white dark:bg-surface-container shadow-sm text-primary'
                      : 'text-on-surface-variant hover:text-on-surface dark:hover:text-surface'"
                    @click="errorCorrection = level"
                  >
                    {{ level }}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                {{ $t('toolB.labelColorConfig') }}
              </label>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                  <input v-model="fgColor" type="color" class="w-9 h-9 rounded-full border-4 border-surface-container cursor-pointer">
                  <span class="text-sm text-on-surface-variant">{{ $t('toolB.foreground') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model="bgColor" :disabled="transparentBackground" type="color" class="w-9 h-9 rounded-full border-4 border-surface-container shadow-inner cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <span class="text-sm text-on-surface-variant">{{ $t('toolB.background') }}</span>
                </div>
              </div>
              <label class="mt-3 flex items-center gap-2.5 text-sm text-on-surface-variant">
                <input v-model="transparentBackground" type="checkbox" class="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/30">
                <span>{{ $t('toolB.transparentBackground') }}</span>
              </label>
              <p class="mt-1 pl-6 text-xs text-on-surface-variant/80">{{ $t('toolB.transparentBackgroundHint') }}</p>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                {{ $t('toolB.brandLogo') }}
              </label>
              <div class="p-3 bg-surface-container-high dark:bg-surface-container-highest rounded-lg flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="material-symbols-outlined text-lg text-on-surface-variant">add_photo_alternate</span>
                  <span class="text-xs text-on-surface-variant truncate">{{ logoFile ? logoFile.name : $t('toolB.logoUploadHint') }}</span>
                </div>
                <button class="px-2.5 py-1.5 rounded-md bg-primary text-on-primary text-xs font-bold inline-flex items-center justify-center" :title="$t('toolB.logoUploadHint')" @click="triggerLogoInput">
                  <span class="material-symbols-outlined text-sm">upload</span>
                </button>
              </div>
              <input ref="logoInput" type="file" accept="image/*" hidden @change="handleLogoUpload">
            </div>
          </div>
        </template>

        <!-- Scan Tab -->
        <template v-else>
          <!-- Upload Area -->
          <div class="lg:col-span-7 flex flex-col gap-6">
            <!-- Error State -->
            <div v-if="scanError" class="space-y-4">
              <div class="flex items-center gap-3 mb-2">
                <div class="flex items-center gap-2 px-4 py-2 bg-error-container/20 rounded-full">
                  <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-error" /></span>
                  <span class="text-error text-xs font-bold uppercase tracking-wider">{{ $t('toolB.errorCode') }}</span>
                </div>
              </div>
              <div class="bg-surface-container-low dark:bg-surface-container rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
                <span class="material-symbols-outlined text-8xl text-outline-variant/20">qr_code_2</span>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm text-primary">crop_free</span>
                    <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('toolB.adjustingSelection') }}</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-3">
                <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-2" @click="scanError = false; triggerScanInput()">
                  <span class="material-symbols-outlined text-lg">refresh</span>{{ $t('toolB.reUpload') }}
                </button>
                <button class="flex-1 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2" @click="scanError = false">
                  <span class="material-symbols-outlined text-lg">crop_square</span>{{ $t('toolB.cropRetry') }}
                </button>
              </div>
            </div>

            <!-- Normal Upload -->
            <div
              v-else-if="!scanResult"
              class="space-y-4"
            >
              <div v-if="cameraActive" class="bg-surface-container-low dark:bg-surface-container rounded-xl overflow-hidden">
                <div class="relative">
                  <video ref="cameraVideoDesktop" autoplay muted playsinline class="w-full aspect-video object-cover" />
                  <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div class="w-[54%] max-w-[300px] aspect-square border border-white/70 rounded-2xl shadow-[0_0_0_999px_rgba(0,0,0,0.2)]" />
                  </div>
                </div>
                <div class="px-4 py-2 flex items-center justify-between">
                  <span class="text-xs font-bold uppercase tracking-wider text-primary">{{ $t('toolB.cameraScanning') }}</span>
                  <button class="text-xs font-semibold text-on-surface-variant hover:text-primary" @click="stopCameraScan">{{ $t('toolB.stopCamera') }}</button>
                </div>
                <p class="px-4 pb-3 text-xs text-on-surface-variant">{{ $t('toolB.cameraAlignHint') }}</p>
              </div>

              <button
                v-if="!cameraActive"
                class="px-5 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm"
                @click="startCameraScan"
              >
                {{ $t('toolB.startCamera') }}
              </button>

              <div
                class="w-full aspect-video rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors border-2 border-dashed"
                :class="isDragging
                  ? 'bg-primary/5 border-primary'
                  : 'bg-surface-container-low dark:bg-surface-container border-transparent hover:bg-surface-container hover:border-outline-variant'"
                @click="triggerScanInput"
                @dragover.prevent="isDragging = true"
                @dragenter.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <span class="material-symbols-outlined text-5xl transition-colors" :class="isDragging ? 'text-primary' : 'text-outline-variant'">{{ isDragging ? 'file_download' : 'add_photo_alternate' }}</span>
                <p class="text-sm font-medium transition-colors" :class="isDragging ? 'text-primary font-bold' : 'text-on-surface-variant'">{{ isDragging ? $t('toolB.dropToScan') : $t('toolB.uploadScan') }}</p>
              </div>
              <p v-if="cameraErrorMessage" class="text-xs text-error">{{ cameraErrorMessage }}</p>
            </div>

            <!-- Scan Success: Result Display -->
            <div v-else class="space-y-6">
              <div class="flex items-center gap-3">
                <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
                <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolB.scanSuccessful') }}</span>
              </div>

              <h2 class="font-headline text-3xl md:text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight">{{ scanResultType === 'wifi' ? $t('toolB.wifiDetected') : scanResultType === 'url' ? $t('toolB.urlDetected') : $t('toolB.textDetected') }}</h2>

              <!-- Result Card -->
              <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-8 relative overflow-hidden">
                <span class="material-symbols-outlined absolute -top-2 -right-2 text-[120px] text-primary/5">{{ scanResultType === 'wifi' ? 'wifi' : scanResultType === 'url' ? 'link' : 'description' }}</span>
                <div class="relative z-10">
                  <div class="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-primary text-2xl">{{ scanResultType === 'wifi' ? 'wifi' : scanResultType === 'url' ? 'link' : 'description' }}</span>
                  </div>
                  <h3 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface mb-4">{{ scanResultTitle }}</h3>

                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div v-for="meta in scanMeta" :key="meta.label">
                      <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ meta.label }}</span>
                      <p class="text-sm font-medium text-on-surface dark:text-surface mt-1">{{ meta.value }}</p>
                    </div>
                  </div>

                  <div class="flex gap-3">
                    <button v-if="scanResultType === 'url'" class="px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform" @click="openUrl(scanResult)">
                      <span class="material-symbols-outlined text-lg">open_in_new</span>{{ $t('toolB.openUrl') }}
                    </button>
                    <button class="px-6 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-2" @click="copyResult">
                      <span class="material-symbols-outlined text-lg">content_copy</span>{{ $t('common.copyResult') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <input ref="scanInputDesktop" type="file" accept="image/*" hidden @change="handleScanImage">
          </div>

          <!-- Right Sidebar -->
          <div class="lg:col-span-5 flex flex-col gap-6">
            <!-- Raw Metadata (when result exists) -->
            <div v-if="scanResult" class="bg-surface-container-highest/30 dark:bg-surface-container rounded-xl p-8">
              <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 block">{{ $t('toolB.rawMetadata') }}</span>
              <code class="block text-xs font-mono text-on-surface-variant bg-surface-container-low dark:bg-surface-container p-4 rounded-lg break-all">{{ scanResult }}</code>
              <div class="mt-4 flex items-center justify-between text-xs text-on-surface-variant">
                <span>{{ $t('toolB.detected') }}: {{ new Date().toLocaleTimeString() }}</span>
                <span class="text-primary font-bold">{{ $t('toolB.quality100') }}</span>
              </div>
            </div>

            <!-- Optimization Tips (when error) -->
            <div v-if="scanError" class="space-y-6">
              <div class="bg-surface-container-low dark:bg-surface-container rounded-3xl p-8 space-y-6">
                <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolB.optimizationTips') }}</h3>
                <div v-for="tip in optimizationTips" :key="tip.icon" class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary-fixed/30 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-primary">{{ tip.icon }}</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-sm text-on-surface dark:text-surface">{{ tip.title }}</h4>
                    <p class="text-xs text-on-surface-variant">{{ tip.desc }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-error-container/10 rounded-3xl p-8">
                <span class="material-symbols-outlined text-error text-2xl mb-3 block">report</span>
                <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('toolB.technicalDetails') }}</span>
                <p class="text-sm text-on-surface-variant mt-2">{{ $t('toolB.errorExplanation') }}</p>
                <div class="flex gap-2 mt-3">
                  <span class="px-3 py-1 bg-error-container/20 text-error rounded-full text-xs font-bold">{{ $t('toolB.lowContrast') }}</span>
                  <span class="px-3 py-1 bg-error-container/20 text-error rounded-full text-xs font-bold">{{ $t('toolB.motionBlur') }}</span>
                </div>
              </div>
            </div>

            <!-- Scan History -->
            <div v-if="scanHistory.length" class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('toolB.scanHistory') }}</span>
                <button class="text-xs text-on-surface-variant hover:text-error transition-colors" @click="clearScanHistory">{{ $t('common.clear') }}</button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="item in scanHistory"
                  :key="item.id"
                  class="flex items-center gap-3 p-3 bg-surface-container-lowest dark:bg-surface-container-high rounded-lg group hover:bg-primary/5 cursor-pointer transition-colors"
                  @click="restoreFromHistory(item)"
                >
                  <span class="material-symbols-outlined text-lg text-primary flex-shrink-0">{{ item.type === 'url' ? 'link' : item.type === 'wifi' ? 'wifi' : 'description' }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">{{ item.title }}</p>
                    <p class="text-xs text-on-surface-variant truncate">{{ item.content }}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <span class="text-[10px] text-on-surface-variant whitespace-nowrap">{{ formatHistoryTime(item.timestamp) }}</span>
                    <button class="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error rounded transition-all" @click.stop="deleteScanHistoryItem(item.id)">
                      <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Scan Another (when result or default) -->
            <div v-if="scanResult || !scanError" class="bg-primary/5 rounded-xl p-8 flex flex-col items-center text-center gap-4">
              <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span class="material-symbols-outlined text-primary text-2xl">qr_code_scanner</span>
              </div>
              <p class="font-bold text-on-surface dark:text-surface text-sm">{{ $t('toolB.needScanMore') }}</p>
              <button class="px-6 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm hover:bg-surface-container transition-colors" @click="resetScan">
                {{ $t('common.scanAgain') }}
              </button>
            </div>
          </div>
        </template>

        <!-- Batch Tab -->
        <template v-if="activeTab === 'batch'">
          <div class="lg:col-span-12">
            <div class="flex items-center justify-between mb-8">
              <div>
                <span class="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold tracking-widest uppercase rounded-full">{{ $t('toolB.productionEngine') }}</span>
                <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface tracking-tight mt-2">{{ $t('toolB.batchStudioTitle') }}</h2>
                <p class="text-on-surface-variant text-sm mt-1">{{ $t('toolB.batchStudioDesc') }}</p>
              </div>
              <div class="flex gap-3">
                <button class="px-4 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-lg text-sm font-semibold flex items-center gap-2" @click="triggerBatchCsvInput">
                  <span class="material-symbols-outlined text-lg">upload_file</span>{{ $t('toolB.importCsv') }}
                </button>
                <button class="px-4 py-2 primary-gradient text-on-primary rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform" :disabled="!batchUrls.length" @click="downloadBatchAll">
                  <span class="material-symbols-outlined text-lg">download</span>{{ $t('toolB.downloadAllZip') }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <!-- Input Section -->
              <div class="lg:col-span-4 space-y-6">
                <!-- Data Source -->
                <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6 space-y-4">
                  <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolB.dataSource') }}</h3>
                  <div class="p-6 bg-surface-container-lowest dark:bg-surface-container-high rounded-xl flex flex-col items-center gap-3 cursor-pointer hover:bg-primary-fixed/10 transition-colors" @click="triggerBatchCsvInput">
                    <span class="material-symbols-outlined text-3xl text-primary">upload_file</span>
                    <p class="text-sm text-on-surface-variant">{{ $t('toolB.csvDropzone') }}</p>
                  </div>
                  <input ref="batchCsvInput" type="file" accept=".csv,.xlsx" hidden @change="handleBatchCsvImport">
                  <textarea v-model="batchUrlsText" class="w-full bg-surface-container-highest dark:bg-surface-container-high rounded-xl p-4 text-sm text-on-surface dark:text-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 resize-none" rows="6" :placeholder="$t('toolB.manualUrlPlaceholder')" @input="parseBatchUrls" />
                  <div class="flex items-center gap-2">
                    <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
                    <span class="text-xs font-medium text-primary">{{ $t('toolB.engineReady') }}</span>
                  </div>
                </div>

                <!-- Styling Presets -->
                <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
                  <h3 class="font-headline font-bold text-on-surface dark:text-surface mb-4">{{ $t('toolB.stylingPresets') }}</h3>
                  <div class="grid grid-cols-2 gap-3">
                    <button v-for="preset in batchPresets" :key="preset.key" class="p-3 rounded-xl text-sm font-medium text-center transition-all" :class="activeBatchPreset === preset.key ? 'bg-surface-container-lowest dark:bg-surface-container-high text-primary shadow-sm ring-2 ring-primary' : 'bg-surface-container-highest dark:bg-surface-container-high text-on-surface-variant hover:bg-surface-container'" @click="activeBatchPreset = preset.key">
                      {{ preset.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Output Preview -->
              <div class="lg:col-span-8">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolB.outputPreview') }}</h3>
                    <span class="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold rounded-full">{{ batchUrls.length }} {{ $t('toolB.items') }}</span>
                  </div>
                </div>

                <div v-if="batchUrls.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div v-for="(url, i) in batchUrls" :key="i" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl overflow-hidden group hover:shadow-ambient transition-all">
                    <div class="aspect-square bg-surface-container-low dark:bg-surface-container flex items-center justify-center p-6">
                      <img :src="batchQrDataUrls[i]" :alt="`QR code for ${url}`" class="w-full h-full object-contain rounded">
                    </div>
                    <div class="p-4">
                      <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">SKU_{{ String(i + 1).padStart(4, '0') }}</p>
                      <p class="text-xs text-on-surface-variant truncate mt-0.5">{{ url }}</p>
                      <div class="flex gap-2 mt-3">
                        <button class="flex-1 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface-variant rounded-lg text-xs font-semibold">Label</button>
                        <button class="flex-1 py-2 primary-gradient text-on-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1" @click="downloadBatchItemSvg(url, i)">
                          <span class="material-symbols-outlined text-sm">download</span>SVG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="bg-surface-container-low dark:bg-surface-container rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
                  <span class="material-symbols-outlined text-5xl text-outline-variant/30">dynamic_feed</span>
                  <p class="text-on-surface-variant text-sm">{{ $t('toolB.addDataToGenerate') }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Contextual Cards -->
    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="card in contextCards" :key="card.icon" class="p-6 bg-surface-container-low dark:bg-surface-container rounded-2xl hover:bg-primary/5 transition-colors cursor-pointer group">
        <span class="material-symbols-outlined text-2xl text-primary mb-4 block">{{ card.icon }}</span>
        <h3 class="font-headline font-bold text-on-surface dark:text-surface mb-1">{{ card.title }}</h3>
        <p class="text-on-surface-variant text-sm">{{ card.desc }}</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getQrTemplates, getTemplateGuide, TEMPLATE_PRIORITY } from '~/utils/qr-template-data'

const { t, locale } = useI18n()
const { downloadPngFromCanvas, downloadWebpFromCanvas, downloadSvgFromText } = useQrExport()
const { decodeQrFromImageData, parseQrScanRaw } = useQrScan()
const isZhLocale = computed(() => locale.value.startsWith('zh'))
const tr = (zh: string, en: string) => (isZhLocale.value ? zh : en)

// Page metadata and SEO
definePageMeta({ layout: 'tool' })
const seoTitle = computed(() => tr(
  '免费二维码生成器与扫描器 - 免登录 | ToolPort',
  'Free QR Code Generator & Scanner - No Signup | ToolPort',
))
const seoDescription = computed(() => tr(
  '免费在线二维码生成器与扫描器。支持自定义配色、Logo、批量CSV生成与摄像头扫码。100% 浏览器本地处理，不上传、不登录。',
  'Free online QR code generator and scanner. Custom colors, logo overlay, batch CSV generation, and camera scanning. 100% browser-based, no upload, no signup.',
))
const seoKeywords = 'QR code generator,QR code scanner,free QR code,custom QR code,batch QR code,QR code with logo,online QR code,no signup QR code'

useHead({
  title: seoTitle.value,
  meta: [
    { name: 'description', content: seoDescription.value },
    { name: 'keywords', content: seoKeywords },
  ],
})

useSeoMeta({
  ogTitle: computed(() => tr('免费二维码生成器与扫描器 | ToolPort', 'Free QR Code Generator & Scanner | ToolPort')),
  ogDescription: seoDescription.value,
  ogImage: 'https://toolport.dev/og-image.png',
})

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort QR Code Generator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  description: seoDescription.value,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://toolport.dev/tools/qr-code',
})

// Core state
const localePath = useLocalePath()
const activeTab = ref<'generate' | 'scan' | 'batch'>('generate')
const inputText = ref('')
function pasteFromClipboard() {
  if (!import.meta.client || !navigator.clipboard?.readText) return
  navigator.clipboard.readText()
    .then((text) => { if (text) inputText.value = text })
    .catch(() => {})
}
const qrSize = ref(256)
const errorCorrection = ref('M')
const fgColor = ref('#000000')
const bgColor = ref('#ffffff')
const transparentBackground = ref(false)
const exportScaleOptions = [1, 2, 3, 4]
const exportScale = ref(1)
const qrCanvas = ref<HTMLCanvasElement>()
const qrCanvasMobile = ref<HTMLCanvasElement>()
const scanInputMobile = ref<HTMLInputElement>()
const scanInputDesktop = ref<HTMLInputElement>()
const cameraVideoMobile = ref<HTMLVideoElement>()
const cameraVideoDesktop = ref<HTMLVideoElement>()
const {
  cameraActive,
  cameraErrorMessage,
  startCameraScan,
  stopCameraScan,
} = useCameraQrScanner({
  cameraVideoMobile,
  cameraVideoDesktop,
  decodeQrFromImageData,
  onDetected: applyScanResult,
  getMessages: () => ({
    notSupported: t('toolB.cameraNotSupported'),
    permissionDenied: t('toolB.cameraPermissionDenied'),
  }),
})

const qrTemplates = computed(() => getQrTemplates(t, tr))
const orderedQrTemplates = computed(() =>
  [...qrTemplates.value].sort((a, b) => {
    const pa = TEMPLATE_PRIORITY[a.key] ?? 999
    const pb = TEMPLATE_PRIORITY[b.key] ?? 999
    return pa - pb
  }),
)
const activeTemplateKey = ref<string | null>(null)

function applyQrTemplateByKey(key: string) {
  const template = qrTemplates.value.find(item => item.key === key)
  if (!template) return
  inputText.value = template.value
  activeTemplateKey.value = key
}

const uiQrTemplates = computed(() => orderedQrTemplates.value)
const templateGuide = computed(() => getTemplateGuide(activeTemplateKey.value, isZhLocale.value))
// Logo
const logoInput = ref<HTMLInputElement>()
const logoFile = ref<File | null>(null)
function triggerLogoInput() { logoInput.value?.click() }
function handleLogoUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) logoFile.value = input.files[0]
}

// Mobile settings
const showMobileSettings = ref(false)

// Batch state
const batchUrlsText = ref('')
const batchUrls = ref<string[]>([])
const batchQrDataUrls = ref<string[]>([])
const activeBatchPreset = ref('minimalist')
const batchCsvInput = ref<HTMLInputElement>()
const batchPresets = [
  { key: 'minimalist', label: 'Minimalist' },
  { key: 'tech', label: 'Tech-Dense' },
  { key: 'round', label: 'Round Edges' },
  { key: 'dot', label: 'Dot Matrix' },
]

function triggerBatchCsvInput() { batchCsvInput.value?.click() }
function parseBatchUrls() {
  batchUrls.value = batchUrlsText.value.split('\n').map(u => u.trim()).filter(Boolean)
}
const isDragging = ref(false)

// Scan history
interface ScanHistoryItem {
  id: string
  content: string
  type: 'url' | 'wifi' | 'text'
  title: string
  timestamp: number
}
interface GenerationHistoryItem {
  id: string
  text: string
  timestamp: number
  size: number
  errorCorrection: string
  fgColor: string
  bgColor: string
  transparentBackground: boolean
  templateKey: string | null
}
const {
  items: scanHistory,
  load: loadScanHistory,
  save: saveScanHistory,
  clearStorage: clearScanHistoryStorage,
} = useLocalStorageList<ScanHistoryItem>('tp_scan_history')
const {
  items: generationHistory,
  load: loadGenerationHistory,
  save: saveGenerationHistory,
} = useLocalStorageList<GenerationHistoryItem>('tp_generation_history')

function addToScanHistory(item: Omit<ScanHistoryItem, 'id'>) {
  // Avoid duplicate consecutive entries
  if (scanHistory.value[0]?.content === item.content) return
  scanHistory.value.unshift({ ...item, id: crypto.randomUUID() })
  if (scanHistory.value.length > 20) scanHistory.value = scanHistory.value.slice(0, 20)
  saveScanHistory()
}

function deleteScanHistoryItem(id: string) {
  scanHistory.value = scanHistory.value.filter(h => h.id !== id)
  saveScanHistory()
}

function clearScanHistory() {
  scanHistory.value = []
  clearScanHistoryStorage()
}

function addGenerationHistoryFromCurrent() {
  const text = inputText.value.trim()
  if (!text) return
  const sig = `${text}|${qrSize.value}|${errorCorrection.value}|${fgColor.value}|${bgColor.value}|${transparentBackground.value}|${activeTemplateKey.value ?? ''}`
  const existing = generationHistory.value.find(item =>
    `${item.text}|${item.size}|${item.errorCorrection}|${item.fgColor}|${item.bgColor}|${item.transparentBackground}|${item.templateKey ?? ''}` === sig,
  )

  const payload: GenerationHistoryItem = {
    id: existing?.id ?? crypto.randomUUID(),
    text,
    timestamp: Date.now(),
    size: qrSize.value,
    errorCorrection: errorCorrection.value,
    fgColor: fgColor.value,
    bgColor: bgColor.value,
    transparentBackground: transparentBackground.value,
    templateKey: activeTemplateKey.value,
  }

  generationHistory.value = [payload, ...generationHistory.value.filter(item => item.id !== payload.id)].slice(0, 20)
  saveGenerationHistory()
}

function restoreGenerationHistory(item: GenerationHistoryItem) {
  inputText.value = item.text
  qrSize.value = item.size
  errorCorrection.value = item.errorCorrection
  fgColor.value = item.fgColor
  bgColor.value = item.bgColor
  transparentBackground.value = item.transparentBackground
  activeTemplateKey.value = item.templateKey
}

function removeGenerationHistory(id: string) {
  generationHistory.value = generationHistory.value.filter(item => item.id !== id)
  saveGenerationHistory()
}

function restoreFromHistory(item: ScanHistoryItem) {
  scanResult.value = item.content
  const parsed = parseQrScanRaw(item.content, t('toolB.textDetected'))
  scanResultType.value = parsed.type
  scanResultTitle.value = item.title || parsed.title
  scanMeta.value = parsed.meta
  scanError.value = false
}

function formatHistoryTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60000) return t('toolB.justNow')
  if (diff < 3600000) return t('toolB.minutesAgo', { n: Math.floor(diff / 60000) })
  if (diff < 86400000) return t('toolB.hoursAgo', { n: Math.floor(diff / 3600000) })
  return new Date(timestamp).toLocaleDateString()
}

onMounted(() => {
  loadScanHistory()
  loadGenerationHistory()
})

const scanResult = ref('')
const scanResultType = ref<'url' | 'wifi' | 'text'>('text')
const scanResultTitle = ref('')
const scanMeta = ref<Array<{ label: string; value: string }>>([])
const scanError = ref(false)

const optimizationTips = computed(() => [
  { icon: 'light_mode', title: t('toolB.tipLighting'), desc: t('toolB.tipLightingDesc') },
  { icon: 'blur_off', title: t('toolB.tipGlare'), desc: t('toolB.tipGlareDesc') },
  { icon: 'center_focus_weak', title: t('toolB.tipFocus'), desc: t('toolB.tipFocusDesc') },
])

const contextCards = computed(() => [
  { icon: 'history', title: t('toolB.recentTitle'), desc: t('toolB.recentDesc') },
  { icon: 'batch_prediction', title: t('toolB.bulkTitle'), desc: t('toolB.bulkDesc') },
  { icon: 'verified_user', title: t('toolB.apiTitle'), desc: t('toolB.apiDesc') },
])

async function overlayLogo(canvas: HTMLCanvasElement) {
  if (!logoFile.value) return
  return new Promise<void>((resolve) => {
    const img = new Image()
    const objUrl = URL.createObjectURL(logoFile.value!)
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(objUrl); resolve(); return }
      const logoSize = canvas.width * 0.22
      const x = (canvas.width - logoSize) / 2
      const y = (canvas.height - logoSize) / 2
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(x - 5, y - 5, logoSize + 10, logoSize + 10, 8)
      ctx.fill()
      ctx.drawImage(img, x, y, logoSize, logoSize)
      URL.revokeObjectURL(objUrl)
      resolve()
    }
    img.onerror = () => { URL.revokeObjectURL(objUrl); resolve() }
    img.src = objUrl
  })
}

watch([inputText, qrSize, errorCorrection, fgColor, bgColor, transparentBackground, logoFile], async () => {
  const text = inputText.value.trim()
  if (!text) return
  const lightColor = transparentBackground.value ? '#0000' : bgColor.value
  const opts = {
    errorCorrectionLevel: errorCorrection.value as 'L' | 'M' | 'Q' | 'H',
    color: { dark: fgColor.value, light: lightColor },
    margin: 2,
  }
  try {
    const QRCode = await import('qrcode')
    if (qrCanvas.value) {
      await QRCode.toCanvas(qrCanvas.value, text, { ...opts, width: qrSize.value })
      if (logoFile.value) await overlayLogo(qrCanvas.value)
    }
    if (qrCanvasMobile.value) {
      await QRCode.toCanvas(qrCanvasMobile.value, text, { ...opts, width: 200 })
      if (logoFile.value) await overlayLogo(qrCanvasMobile.value)
    }
  }
  catch {
    // QR rendering errors are surfaced by missing preview
  }
})

function getExportWidth() {
  return qrSize.value * exportScale.value
}

watch(batchUrls, async () => {
  if (!batchUrls.value.length) {
    batchQrDataUrls.value = []
    return
  }
  try {
    const QRCode = await import('qrcode')
    batchQrDataUrls.value = await Promise.all(
      batchUrls.value.map(url =>
        QRCode.toDataURL(url, { width: 200, margin: 1, errorCorrectionLevel: 'M' }),
      ),
    )
  }
  catch {
    // ignore batch preview generation failures
  }
})

async function downloadPng() {
  if (!qrCanvas.value) return
  addGenerationHistoryFromCurrent()
  downloadPngFromCanvas(qrCanvas.value, getExportWidth())
}

async function downloadSvg() {
  if (!inputText.value.trim()) return
  addGenerationHistoryFromCurrent()
  try {
    await downloadSvgFromText({
      text: inputText.value,
      width: getExportWidth(),
      errorCorrection: errorCorrection.value as 'L' | 'M' | 'Q' | 'H',
      darkColor: fgColor.value,
      lightColor: transparentBackground.value ? '#0000' : bgColor.value,
    })
  } catch {
    // ignore svg export failures
  }
}

async function downloadWebp() {
  if (!qrCanvas.value) return
  addGenerationHistoryFromCurrent()
  downloadWebpFromCanvas(qrCanvas.value, getExportWidth())
}

function getActiveScanInput() {
  if (!import.meta.client) return scanInputDesktop.value ?? scanInputMobile.value
  const isDesktop = window.matchMedia('(min-width: 768px)').matches
  return isDesktop ? (scanInputDesktop.value ?? scanInputMobile.value) : (scanInputMobile.value ?? scanInputDesktop.value)
}

function triggerScanInput() {
  getActiveScanInput()?.click()
}

function applyScanResult(raw: string) {
  scanResult.value = raw
  const parsed = parseQrScanRaw(raw, t('toolB.textDetected'))
  scanResultType.value = parsed.type
  scanResultTitle.value = parsed.title
  scanMeta.value = parsed.meta
  scanError.value = false
  addToScanHistory({
    content: raw,
    type: parsed.type,
    title: parsed.title,
    timestamp: Date.now(),
  })
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  // Reuse handleScanImage by creating a synthetic event-like object
  const dt = new DataTransfer()
  dt.items.add(file)
  const activeInput = getActiveScanInput()
  if (activeInput) {
    activeInput.files = dt.files
    activeInput.dispatchEvent(new Event('change'))
  }
}

async function handleScanImage(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.[0]) return

  const file = input.files[0]
  const img = new Image()
  const url = URL.createObjectURL(file)

  img.onload = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)

    try {
      const code = await decodeQrFromImageData(imageData)

      if (code) {
        applyScanResult(code.data)
      } else {
        scanError.value = true
        scanResult.value = ''
      }
    } catch {
      scanError.value = true
      scanResult.value = ''
    }
  }
  img.src = url
}

function openUrl(url: string) { window.open(url, '_blank', 'noopener') }
function copyResult() { navigator.clipboard.writeText(scanResult.value) }

function resetScan() {
  stopCameraScan()
  cameraErrorMessage.value = ''
  scanResult.value = ''
  scanResultType.value = 'text'
  scanResultTitle.value = ''
  scanMeta.value = []
  scanError.value = false
  if (scanInputMobile.value) scanInputMobile.value.value = ''
  if (scanInputDesktop.value) scanInputDesktop.value.value = ''
}

async function handleBatchCsvImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  const text = await file.text()
  const lines = text
    .split('\n')
    .map(l => l.split(',')[0].trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
  const startIdx = lines[0] && /^(url|link|text|content|data)$/i.test(lines[0]) ? 1 : 0
  batchUrlsText.value = lines.slice(startIdx).join('\n')
  parseBatchUrls()
}

async function downloadBatchItemSvg(url: string, index: number) {
  try {
    const QRCode = await import('qrcode')
    const svg = await QRCode.toString(url, {
      type: 'svg',
      width: 256,
      errorCorrectionLevel: 'M',
    })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const objUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `qrcode_${String(index + 1).padStart(4, '0')}.svg`
    link.href = objUrl
    link.click()
    URL.revokeObjectURL(objUrl)
  }
  catch {
    // ignore single-item svg export failures
  }
}

async function downloadBatchAll() {
  if (!batchUrls.value.length) return
  try {
    const QRCode = await import('qrcode')
    for (let i = 0; i < batchUrls.value.length; i++) {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, batchUrls.value[i], { width: 256, margin: 1 })
      const link = document.createElement('a')
      link.download = `qrcode_${String(i + 1).padStart(4, '0')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      await new Promise(r => setTimeout(r, 150))
    }
  }
  catch {
    // ignore bulk export failures
  }
}
</script>


