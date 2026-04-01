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
            <input v-model="fgColor" type="color" class="w-10 h-10 rounded-full border-4 border-surface-container cursor-pointer" />
            <span class="text-sm text-on-surface-variant">{{ $t('toolB.foreground') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="bgColor" type="color" class="w-10 h-10 rounded-full border-4 border-surface-container cursor-pointer" />
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
            <input v-model="inputText" class="flex-1 bg-surface-container-highest dark:bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface dark:text-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20" placeholder="https://your-website.com" />
            <button class="p-3 bg-surface-container-high dark:bg-surface-container rounded-xl text-on-surface-variant" @click="pasteFromClipboard"><span class="material-symbols-outlined text-lg">link</span></button>
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
        <div class="grid grid-cols-2 gap-3">
          <button class="py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" :disabled="!inputText" @click="downloadPng">
            <span class="material-symbols-outlined text-lg">download</span>PNG
          </button>
          <button class="py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" :disabled="!inputText" @click="downloadSvg">
            <span class="material-symbols-outlined text-lg">download</span>SVG
          </button>
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
        <div v-else class="bg-surface-container-low dark:bg-surface-container rounded-2xl p-10 flex flex-col items-center gap-4 active:bg-surface-container transition-colors" @click="triggerScanInput">
          <span class="material-symbols-outlined text-5xl text-outline-variant">add_photo_alternate</span>
          <p class="text-on-surface-variant text-sm">{{ $t('toolB.uploadScan') }}</p>
        </div>
        <input ref="scanInput" type="file" accept="image/*" hidden @change="handleScanImage" />
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
      <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-[1.75rem] p-4 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
        <!-- Generate Tab -->
        <template v-if="activeTab === 'generate'">
          <!-- Left Column: Inputs -->
          <div class="lg:col-span-7 flex flex-col gap-8">
            <!-- Text Input -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                {{ $t('toolB.labelTextUrl') }}
              </label>
              <textarea
                v-model="inputText"
                class="w-full bg-surface-container-highest dark:bg-surface-container-high border-none rounded-xl p-4 text-on-surface dark:text-surface placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                rows="4"
                placeholder="https://toolport.io/share/8842..."
              />
            </div>

            <!-- Size + Error Correction -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                  {{ $t('toolB.labelSize', { size: qrSize }) }}
                </label>
                <select
                  v-model="qrSize"
                  class="w-full bg-surface-container-low dark:bg-surface-container border-none rounded-xl p-3 text-on-surface dark:text-surface"
                >
                  <option :value="128">128 × 128 px</option>
                  <option :value="256">256 × 256 px</option>
                  <option :value="512">512 × 512 px</option>
                  <option :value="1024">1024 × 1024 px</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                  {{ $t('toolB.labelErrorCorrection', { level: errorCorrection }) }}
                </label>
                <div class="flex bg-surface-container-low dark:bg-surface-container p-1 rounded-xl">
                  <button
                    v-for="level in ['L', 'M', 'Q', 'H']"
                    :key="level"
                    class="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
                    :class="errorCorrection === level
                      ? 'bg-white dark:bg-surface-container-lowest shadow-sm text-primary'
                      : 'text-on-surface-variant hover:text-on-surface dark:hover:text-surface'"
                    @click="errorCorrection = level"
                  >
                    {{ level }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Color Configuration -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                {{ $t('toolB.labelColorConfig') }}
              </label>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                  <input v-model="fgColor" type="color" class="w-10 h-10 rounded-full border-4 border-surface-container cursor-pointer" />
                  <span class="text-sm text-on-surface-variant">{{ $t('toolB.foreground') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <input v-model="bgColor" type="color" class="w-10 h-10 rounded-full border-4 border-surface-container shadow-inner cursor-pointer" />
                  <span class="text-sm text-on-surface-variant">{{ $t('toolB.background') }}</span>
                </div>
              </div>
            </div>

            <!-- Logo Upload -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                {{ $t('toolB.brandLogo') }}
              </label>
              <div class="p-6 bg-surface-container-low dark:bg-surface-container rounded-xl flex flex-col items-center gap-3 cursor-pointer hover:bg-primary-fixed/10 transition-colors" @click="triggerLogoInput">
                <span class="material-symbols-outlined text-3xl text-outline-variant hover:text-primary transition-colors">add_photo_alternate</span>
                <p class="text-xs text-on-surface-variant">{{ $t('toolB.logoUploadHint') }}</p>
              </div>
              <input ref="logoInput" type="file" accept="image/*" hidden @change="handleLogoUpload" />
              <div v-if="logoFile" class="mt-2 flex items-center gap-2 px-3 py-2 bg-primary-fixed/10 rounded-lg">
                <span class="material-symbols-outlined text-sm text-primary">check_circle</span>
                <span class="text-xs text-on-surface-variant flex-1 truncate">{{ logoFile.name }}</span>
                <button class="text-on-surface-variant hover:text-error" @click="logoFile = null"><span class="material-symbols-outlined text-sm">close</span></button>
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
          <div class="lg:col-span-5 flex flex-col gap-6">
            <div class="w-full aspect-square bg-surface-container-low dark:bg-surface-container rounded-4xl relative flex items-center justify-center overflow-hidden">
              <div class="absolute inset-0 opacity-10" style="background: radial-gradient(circle at 30% 30%, rgba(0,81,71,0.1) 0%, transparent 70%)" />
              <div class="relative z-10 p-8 bg-white rounded-2xl shadow-ambient">
                <canvas v-show="!!inputText" ref="qrCanvas" class="w-full h-auto" />
                <div v-if="!inputText" class="w-48 h-48 flex items-center justify-center">
                  <span class="material-symbols-outlined text-6xl text-outline-variant/30">qr_code_2</span>
                </div>
              </div>
            </div>

            <!-- Download Buttons -->
            <div class="grid grid-cols-2 gap-4">
              <button
                class="py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform"
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
            </div>

            <!-- Security Badge -->
            <div class="flex items-center gap-2 text-outline justify-center">
              <span class="material-symbols-outlined text-sm">verified_user</span>
              <span class="text-xs font-bold uppercase tracking-widest">{{ $t('toolB.localBadge') }}</span>
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

            <input ref="scanInput" type="file" accept="image/*" hidden @change="handleScanImage" />
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
                  <input ref="batchCsvInput" type="file" accept=".csv,.xlsx" hidden @change="handleBatchCsvImport" />
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
                      <img :src="batchQrDataUrls[i]" :alt="`QR code for ${url}`" class="w-full h-full object-contain rounded" />
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
const { t } = useI18n()

definePageMeta({ layout: 'tool' })
useHead({
  title: 'Free QR Code Generator & Scanner - No Signup | ToolPort',
  meta: [
    { name: 'description', content: 'Free online QR code generator and scanner. Custom colors, logo overlay, batch CSV generation, camera scanning. 100% browser-based — no upload, no signup.' },
    { name: 'keywords', content: 'QR code generator,QR code scanner,free QR code,custom QR code,batch QR code,QR code with logo,online QR code,no signup QR code' },
  ],
})
useSeoMeta({
  ogTitle: 'Free QR Code Generator & Scanner — Custom Colors, Logo, Batch | ToolPort',
  ogDescription: 'Generate and scan QR codes for free. Custom colors, logo overlay, batch CSV import, camera & image scanning. All in your browser — no upload, no signup.',
  ogImage: 'https://toolport.dev/og-image.png',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort QR Code Generator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  description: 'Free browser-based QR code generator and scanner. Custom colors, logo overlay, batch generation, camera scanning.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://toolport.dev/tools/qr-code',
})

const localePath = useLocalePath()
const activeTab = ref<'generate' | 'scan' | 'batch'>('generate')
const inputText = ref('')
function pasteFromClipboard() {
  navigator.clipboard.readText().then((text) => { if (text) inputText.value = text })
}
const qrSize = ref(256)
const errorCorrection = ref('M')
const fgColor = ref('#000000')
const bgColor = ref('#ffffff')
const qrCanvas = ref<HTMLCanvasElement>()
const qrCanvasMobile = ref<HTMLCanvasElement>()
const scanInput = ref<HTMLInputElement>()

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
const scanHistory = ref<ScanHistoryItem[]>([])

function loadScanHistory() {
  if (!import.meta.client) return
  try {
    const stored = localStorage.getItem('tp_scan_history')
    if (stored) scanHistory.value = JSON.parse(stored)
  }
  catch {}
}

function saveScanHistory() {
  localStorage.setItem('tp_scan_history', JSON.stringify(scanHistory.value))
}

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
  localStorage.removeItem('tp_scan_history')
}

function restoreFromHistory(item: ScanHistoryItem) {
  scanResult.value = item.content
  scanResultType.value = item.type
  scanResultTitle.value = item.title
  scanError.value = false
  if (item.type === 'url') {
    try {
      const u = new URL(item.content)
      scanMeta.value = [
        { label: 'Protocol', value: u.protocol.replace(':', '').toUpperCase() },
        { label: 'Domain', value: u.hostname },
      ]
    }
    catch {
      scanMeta.value = [{ label: 'Type', value: 'URL' }]
    }
  }
  else if (item.type === 'wifi') {
    const ssidMatch = item.content.match(/S:([^;]*)/)
    const secMatch = item.content.match(/T:([^;]*)/)
    scanMeta.value = [
      { label: 'Security', value: secMatch?.[1] || 'Unknown' },
      { label: 'Hidden', value: item.content.includes('H:true') ? 'Yes' : 'No' },
    ]
  }
  else {
    scanMeta.value = [
      { label: 'Length', value: `${item.content.length} chars` },
      { label: 'Encoding', value: 'UTF-8' },
    ]
  }
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
  { icon: 'api', title: t('toolB.apiTitle'), desc: t('toolB.apiDesc') },
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

watch([inputText, qrSize, errorCorrection, fgColor, bgColor, logoFile], async () => {
  const text = inputText.value.trim()
  if (!text) return
  const opts = {
    errorCorrectionLevel: errorCorrection.value as 'L' | 'M' | 'Q' | 'H',
    color: { dark: fgColor.value, light: bgColor.value },
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
  catch {}
})

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
  catch {}
})

async function downloadPng() {
  if (!qrCanvas.value) return
  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrCanvas.value.toDataURL('image/png')
  link.click()
}

async function downloadSvg() {
  if (!inputText.value.trim()) return
  try {
    const QRCode = await import('qrcode')
    const svg = await QRCode.toString(inputText.value, {
      type: 'svg', width: qrSize.value,
      errorCorrectionLevel: errorCorrection.value as 'L' | 'M' | 'Q' | 'H',
      color: { dark: fgColor.value, light: bgColor.value },
    })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'qrcode.svg'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  } catch {}
}

function triggerScanInput() { scanInput.value?.click() }

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  // Reuse handleScanImage by creating a synthetic event-like object
  const dt = new DataTransfer()
  dt.items.add(file)
  if (scanInput.value) {
    scanInput.value.files = dt.files
    scanInput.value.dispatchEvent(new Event('change'))
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
      const jsQR = (await import('jsqr')).default
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code) {
        const raw = code.data
        scanResult.value = raw

        // Detect content type
        if (raw.startsWith('WIFI:')) {
          scanResultType.value = 'wifi'
          const ssidMatch = raw.match(/S:([^;]*)/)
          const secMatch = raw.match(/T:([^;]*)/)
          scanResultTitle.value = ssidMatch?.[1] || 'WiFi Network'
          scanMeta.value = [
            { label: 'Security', value: secMatch?.[1] || 'Unknown' },
            { label: 'Hidden', value: raw.includes('H:true') ? 'Yes' : 'No' },
          ]
        } else if (/^https?:\/\//i.test(raw)) {
          scanResultType.value = 'url'
          try {
            const u = new URL(raw)
            scanResultTitle.value = u.hostname
            scanMeta.value = [
              { label: 'Protocol', value: u.protocol.replace(':', '').toUpperCase() },
              { label: 'Domain', value: u.hostname },
            ]
          } catch {
            scanResultTitle.value = raw.substring(0, 40)
            scanMeta.value = [{ label: 'Type', value: 'URL' }]
          }
        } else {
          scanResultType.value = 'text'
          scanResultTitle.value = t('toolB.textDetected')
          scanMeta.value = [
            { label: 'Length', value: `${raw.length} chars` },
            { label: 'Encoding', value: 'UTF-8' },
          ]
        }
        scanError.value = false
        addToScanHistory({
          content: raw,
          type: scanResultType.value,
          title: scanResultTitle.value,
          timestamp: Date.now(),
        })
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
  scanResult.value = ''
  scanResultType.value = 'text'
  scanResultTitle.value = ''
  scanMeta.value = []
  scanError.value = false
  if (scanInput.value) scanInput.value.value = ''
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
  catch {}
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
  catch {}
}
</script>
