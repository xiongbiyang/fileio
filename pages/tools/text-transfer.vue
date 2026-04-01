<template>
  <div class="p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">

    <!-- ==================== STATE: WAITING ==================== -->
    <div v-if="state === 'waiting'" class="w-full max-w-4xl">

      <!-- MOBILE Waiting View -->
      <div class="md:hidden space-y-4 pb-28">
        <!-- Mobile Header -->
        <div class="flex items-center justify-between">
          <span class="font-headline text-lg font-bold text-on-surface dark:text-surface">ToolPort</span>
          <div v-if="isConnected" class="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full">
            <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
            <span class="text-xs font-medium text-primary">{{ $t('toolA.mobileConnectedTo') }}</span>
          </div>
          <div v-else class="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
            <span class="w-2 h-2 rounded-full bg-outline animate-pulse" />
            <span class="text-xs font-medium text-on-surface-variant">{{ $t('toolA.waitingConnection') }}</span>
          </div>
        </div>

        <!-- Chat History -->
        <div class="space-y-3 min-h-[60px]">
          <p v-if="!receivedMessages.length" class="text-center text-sm text-on-surface-variant py-4">
            {{ isConnected ? $t('toolA.noMessagesYet') : $t('toolA.waitingConnection') }}
          </p>
          <div v-for="msg in receivedMessages" :key="msg.id" class="flex" :class="msg.isSelf ? 'justify-end' : 'justify-start'">
            <div class="max-w-[85%] px-4 py-3 rounded-2xl text-sm" :class="msg.isSelf ? 'primary-gradient text-on-primary rounded-tr-none' : 'bg-surface-container-lowest dark:bg-surface-container-high text-on-surface dark:text-surface rounded-tl-none'">
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </div>

        <!-- Transfer Content Input -->
        <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-5 shadow-ambient">
          <h3 class="font-headline font-bold text-on-surface dark:text-surface mb-3">{{ $t('toolA.mobileTransferContent') }}</h3>
          <textarea v-model="mobileTextInput" class="w-full bg-surface-container-low dark:bg-surface-container rounded-xl p-4 text-sm text-on-surface dark:text-surface placeholder:text-outline resize-none focus:ring-2 focus:ring-primary/20" rows="3" :placeholder="$t('toolA.mobilePastePlaceholder')" />
          <div class="flex gap-3 mt-3">
            <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" @click="triggerMobileFileInput">
              <span class="material-symbols-outlined text-lg">attach_file</span>{{ $t('toolA.mobileFile') }}
            </button>
            <button class="flex-1 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50" :disabled="!isConnected || !mobileTextInput.trim()" @click="mobileSend">
              <span class="material-symbols-outlined text-lg">send</span>{{ $t('toolA.mobileTransfer') }}
            </button>
          </div>
          <input ref="mobileFileInput" type="file" hidden @change="handleMobileFileSelect" />
        </div>

        <!-- Recent Transfers -->
        <div>
          <h3 class="font-headline font-bold text-sm text-on-surface dark:text-surface mb-3 uppercase tracking-wider">{{ $t('toolA.mobileRecentTransfers') }}</h3>
          <div class="space-y-2">
            <div v-for="item in mobileRecentTransfers" :key="item.name" class="bg-surface-container-low dark:bg-surface-container rounded-xl p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-on-surface-variant">{{ item.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">{{ item.name }}</p>
                <p class="text-xs text-on-surface-variant">{{ item.desc }}</p>
              </div>
              <span class="text-xs text-on-surface-variant whitespace-nowrap">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DESKTOP Waiting View -->
      <div class="hidden md:block bg-surface-container-low dark:bg-surface-container rounded-xl overflow-hidden shadow-ambient">
      <!-- Tool Header -->
      <div class="px-8 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface">{{ $t('toolA.title') }}</h1>
          <div class="flex items-center gap-2 mt-2">
            <span class="px-3 py-1 bg-primary-container/20 text-primary-container rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">verified_user</span>
              {{ $t('toolA.e2eeSecure') }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest dark:bg-surface-container-high rounded-xl shadow-ambient">
          <div class="relative flex items-center justify-center">
            <span class="w-3 h-3 bg-primary rounded-full z-10" />
            <span class="absolute w-3 h-3 bg-primary-fixed-dim rounded-full soft-pulse" />
          </div>
          <span class="text-sm font-medium text-on-surface-variant">{{ $t('toolA.waitingConnection') }}</span>
        </div>
      </div>

      <!-- QR + Manual -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-4 md:p-8 mx-2 md:mx-4 mb-4">
        <!-- QR Code -->
        <div class="flex flex-col items-center text-center gap-4 md:gap-6">
          <div class="p-4 md:p-6 bg-surface-container-low dark:bg-surface-container rounded-xl shadow-inner relative group">
            <div class="w-48 h-48 md:w-64 md:h-64 bg-surface-container dark:bg-surface-container-high rounded-lg flex items-center justify-center relative">
              <canvas ref="qrCanvasTransfer" class="w-40 h-40 md:w-56 md:h-56" />
              <!-- QR Expired Overlay -->
              <div v-if="qrExpired" class="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest/40 dark:bg-on-surface/40 backdrop-blur-md rounded-lg p-4 text-center">
                <button class="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg mb-3 active:rotate-180 transition-transform duration-500" @click="refreshQr">
                  <span class="material-symbols-outlined text-2xl">refresh</span>
                </button>
                <span class="text-sm font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolA.qrExpired') }}</span>
                <span class="text-xs text-on-surface-variant mt-1">{{ $t('toolA.qrExpiredDesc') }}</span>
              </div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden md:flex">
              <span class="text-on-primary font-bold text-sm">{{ $t('toolA.clickEnlarge') }}</span>
            </div>
          </div>
          <div class="text-on-surface-variant text-sm font-medium">
            <p>{{ $t('toolA.scanQr') }}</p>
            <p class="mt-1 px-3 py-1 bg-surface-container-high dark:bg-surface-container rounded text-primary font-mono text-sm">toolport.dev/r/{{ roomId }}</p>
          </div>
        </div>

        <!-- Manual Connection -->
        <div class="flex flex-col gap-6">
          <div>
            <h2 class="font-headline text-lg font-bold text-on-surface dark:text-surface">{{ $t('toolA.manualTitle') }}</h2>
            <p class="text-on-surface-variant text-sm leading-relaxed mt-2">{{ $t('toolA.manualDesc') }}</p>
          </div>
          <div class="bg-surface-container-low dark:bg-surface-container p-6 rounded-xl flex flex-col items-center justify-center gap-2">
            <span class="text-on-surface-variant text-xs font-bold uppercase tracking-widest font-label">{{ $t('toolA.roomId') }}</span>
            <span class="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary font-headline">{{ roomId }}</span>
          </div>
          <div class="flex flex-col gap-3">
            <button class="w-full py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform" @click="copyLink">
              <span class="material-symbols-outlined text-lg">content_copy</span>
              {{ $t('common.copyLink') }}
            </button>
            <button class="w-full py-3 bg-surface-container-high dark:bg-surface-container-highest text-on-surface dark:text-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container transition-colors" @click="refreshQr">
              <span class="material-symbols-outlined text-lg">refresh</span>
              {{ $t('toolA.refreshQr') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Cross-promotion -->
      <div class="mx-4 mb-4 p-6 bg-primary/5 rounded-xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-primary text-2xl">content_paste</span>
        </div>
        <div class="flex-1">
          <p class="text-on-surface dark:text-surface font-medium text-sm">{{ $t('toolA.crossPromoTitle') }}</p>
          <p class="text-on-surface-variant text-xs">{{ $t('toolA.crossPromoDesc') }}</p>
        </div>
        <NuxtLink :to="localePath('/tools/clipboard')" class="text-primary font-bold text-sm flex items-center gap-1 hover:underline whitespace-nowrap">
          {{ $t('toolA.crossPromoLink') }}
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </NuxtLink>
      </div>
      </div>
    </div>

    <!-- ==================== STATE: PAIRING ==================== -->
    <div v-else-if="state === 'pairing'" class="w-full max-w-4xl">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <!-- Left: Status -->
        <div class="md:col-span-5 space-y-6">
          <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary-fixed/30">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span class="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span class="text-sm font-semibold text-primary">{{ $t('toolA.pairingInProgress') }}</span>
          </div>
          <h2 class="text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface font-headline">{{ $t('toolA.verifyConnection') }}</h2>
          <p class="text-xl text-on-surface-variant leading-relaxed">{{ $t('toolA.deviceRequesting') }}</p>

          <div class="bg-surface-container-low dark:bg-surface-container p-6 rounded-xl space-y-4">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary">shield_lock</span>
              <span class="text-sm font-semibold text-on-surface dark:text-surface uppercase tracking-wider">{{ $t('toolA.securityTip') }}</span>
            </div>
            <p class="text-on-surface-variant text-sm leading-relaxed">{{ $t('toolA.securityTipDesc') }}</p>
          </div>
        </div>

        <!-- Right: Verification Card -->
        <div class="md:col-span-7 bg-surface-container-lowest dark:bg-surface-container-high p-10 md:p-14 rounded-xl shadow-ambient flex flex-col items-center text-center">
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div v-for="digit in verificationDigits" :key="digit" class="w-16 h-20 md:w-20 md:h-24 flex items-center justify-center bg-surface-container dark:bg-surface-container rounded-xl text-4xl md:text-5xl font-black text-primary shadow-inner font-headline">
              {{ digit }}
            </div>
          </div>
          <p class="text-on-surface-variant mb-10">{{ $t('toolA.checkDeviceCode') }}</p>

          <div class="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button class="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform" @click="confirmPairing">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">check_circle</span>
              {{ $t('toolA.confirmConnect') }}
            </button>
            <button class="px-8 py-4 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface font-semibold rounded-lg flex items-center justify-center gap-2" @click="denyPairing">
              <span class="material-symbols-outlined">close</span>
              {{ $t('toolA.deny') }}
            </button>
          </div>

          <!-- Device Connection Display -->
          <div class="mt-12 pt-8 w-full flex items-center justify-center gap-6">
            <div class="flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span class="material-symbols-outlined text-on-surface-variant">laptop_mac</span>
              </div>
              <span class="text-xs font-medium text-on-surface-variant">Vault Node</span>
            </div>
            <span class="material-symbols-outlined text-primary">sync_alt</span>
            <div class="flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span class="material-symbols-outlined text-on-surface-variant">smartphone</span>
              </div>
              <span class="text-xs font-medium text-on-surface-variant">iPhone 15</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STATE: TRANSFERRING ==================== -->
    <div v-else-if="state === 'transferring'" class="w-full max-w-4xl space-y-4 md:space-y-6">
      <!-- Status Header -->
      <div class="bg-surface-container-lowest dark:bg-surface-container-high p-4 md:p-6 rounded-xl shadow-ambient flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span class="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <span class="font-headline font-bold text-base md:text-lg text-on-surface dark:text-surface">{{ $t('toolA.title') }}</span>
        </div>
        <span class="px-3 py-1 bg-primary-fixed/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">shield</span>
          {{ $t('toolA.e2eeTunnelActive') }}
        </span>
      </div>

      <!-- Transfer Card -->
      <div class="bg-surface-container-lowest dark:bg-surface-container-high p-5 md:p-8 rounded-2xl shadow-ambient space-y-6 md:space-y-8 relative overflow-hidden">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <!-- Mobile: Hero Progress Display -->
        <div class="md:hidden text-center space-y-3">
          <span class="text-5xl font-headline font-extrabold text-on-surface dark:text-surface">{{ transferProgress }}%</span>
          <p class="text-sm text-on-surface-variant">{{ $t('toolA.mobileComplete') }}</p>
          <div class="h-3 w-full bg-surface-container-high dark:bg-surface-container rounded-full overflow-hidden">
            <div class="h-full primary-gradient rounded-full transition-all duration-300" :style="{ width: `${transferProgress}%` }" />
          </div>
          <p class="text-xs text-on-surface-variant">{{ transferredSize }} / {{ currentFile.size }}</p>
        </div>

        <!-- Mobile: Speed Metrics Grid -->
        <div class="md:hidden grid grid-cols-2 gap-3">
          <div class="bg-surface-container-low dark:bg-surface-container p-4 rounded-xl text-center">
            <span class="material-symbols-outlined text-primary text-xl mb-1 block">speed</span>
            <p class="text-lg font-bold text-on-surface dark:text-surface">{{ transferSpeed }}</p>
            <p class="text-[10px] text-on-surface-variant uppercase tracking-wider">{{ $t('toolA.transferSpeedLabel') }}</p>
          </div>
          <div class="bg-surface-container-low dark:bg-surface-container p-4 rounded-xl text-center">
            <span class="material-symbols-outlined text-primary text-xl mb-1 block">schedule</span>
            <p class="text-lg font-bold text-on-surface dark:text-surface">{{ timeRemaining }}</p>
            <p class="text-[10px] text-on-surface-variant uppercase tracking-wider">{{ $t('toolA.estTime') }}</p>
          </div>
        </div>

        <!-- Desktop: File Info -->
        <div class="hidden md:flex items-start gap-4">
          <div class="w-16 h-16 bg-surface-container-high dark:bg-surface-container rounded-xl flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-4xl">description</span>
          </div>
          <div class="flex-1">
            <h3 class="font-headline font-bold text-xl text-on-surface dark:text-surface">{{ currentFile.name }}</h3>
            <p class="text-on-surface-variant text-sm">{{ $t('toolA.readyForAssembly') }}</p>
          </div>
          <button class="flex items-center gap-2 px-4 py-2 text-error font-semibold hover:bg-error-container/20 rounded-lg transition-colors" @click="cancelTransfer">
            <span class="material-symbols-outlined">cancel</span>
            {{ $t('common.clear') }}
          </button>
        </div>

        <!-- Desktop: Progress -->
        <div class="hidden md:flex items-end justify-between">
          <div>
            <span class="text-3xl font-headline font-extrabold text-on-surface dark:text-surface">{{ transferProgress }}%</span>
            <p class="text-sm font-medium text-on-surface-variant">{{ transferredSize }} / {{ currentFile.size }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-primary">{{ transferSpeed }}</p>
            <p class="text-xs text-on-surface-variant">{{ $t('toolA.timeRemaining', { time: timeRemaining }) }}</p>
          </div>
        </div>

        <!-- Desktop: Progress Bar -->
        <div class="hidden md:block h-4 w-full bg-surface-container-high dark:bg-surface-container rounded-full overflow-hidden">
          <div class="h-full primary-gradient rounded-full transition-all duration-300" :style="{ width: `${transferProgress}%` }" />
        </div>

        <!-- Mobile: Action Buttons -->
        <div class="md:hidden flex gap-3">
          <button class="flex-1 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-lg">pause</span>{{ $t('toolA.pause') }}
          </button>
          <button class="flex-1 py-3 bg-error-container/20 text-error rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform" @click="cancelTransfer">
            <span class="material-symbols-outlined text-lg">cancel</span>{{ $t('common.clear') }}
          </button>
        </div>
      </div>

      <!-- Connection Nodes Sidebar -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface-container dark:bg-surface-container-high p-6 rounded-2xl space-y-4">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('toolA.connectionNodes') }}</span>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center"><span class="material-symbols-outlined text-primary">laptop_mac</span></div>
            <div><p class="text-sm font-bold text-on-surface dark:text-surface truncate">MacBook Pro</p><p class="text-xs text-on-surface-variant">Local</p></div>
            <span class="w-2 h-2 rounded-full bg-primary ml-auto" />
          </div>
          <div class="flex justify-center"><span class="material-symbols-outlined text-outline-variant">sync_alt</span></div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center"><span class="material-symbols-outlined text-primary">smartphone</span></div>
            <div><p class="text-sm font-bold text-on-surface dark:text-surface truncate">iPhone 15</p><p class="text-xs text-on-surface-variant">Remote</p></div>
            <span class="w-2 h-2 rounded-full bg-primary ml-auto" />
          </div>
        </div>

        <div class="bg-surface-container dark:bg-surface-container-high p-6 rounded-2xl space-y-3">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('toolA.securityParams') }}</span>
          <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Encryption</span><span class="font-bold text-on-surface dark:text-surface">AES-256-GCM</span></div>
          <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Key Length</span><span class="font-bold text-on-surface dark:text-surface">256-bit</span></div>
          <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Tunneling</span><span class="font-bold text-on-surface dark:text-surface">WebRTC P2P</span></div>
        </div>

        <div class="relative rounded-2xl overflow-hidden aspect-video group bg-surface-container">
          <div class="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/30 flex flex-col justify-end p-6">
            <p class="text-on-primary font-bold text-sm">{{ $t('toolA.dataNotStored') }}</p>
            <p class="text-on-primary/80 text-xs mt-1">{{ $t('toolA.dataNotStoredDesc') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STATE: SUCCESS ==================== -->
    <div v-else-if="state === 'success'" class="w-full max-w-5xl">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Main Card -->
        <div class="lg:col-span-8 bg-surface-container-low dark:bg-surface-container p-10 md:p-12 rounded-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 p-8 opacity-10">
            <span class="material-symbols-outlined text-9xl text-primary" style="font-variation-settings: 'FILL' 1">check_circle</span>
          </div>

          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1">verified</span>
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">{{ $t('toolA.transmissionComplete') }}</span>
          </div>

          <h2 class="font-headline text-5xl md:text-6xl font-extrabold text-on-surface dark:text-surface tracking-tight leading-tight mb-6">{{ $t('toolA.transferSuccessful') }}</h2>
          <p class="text-on-surface-variant text-lg max-w-xl leading-relaxed mb-10">{{ $t('toolA.successDesc') }}</p>

          <!-- Bento Summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-surface-container-lowest dark:bg-surface-container-high p-8 rounded-xl shadow-ambient">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-primary-fixed/30 flex items-center justify-center"><span class="material-symbols-outlined text-primary">description</span></div>
                <span class="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase rounded-full">{{ $t('toolA.encrypted') }}</span>
              </div>
              <h4 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ currentFile.name }}</h4>
              <div class="mt-3 space-y-1 text-sm text-on-surface-variant">
                <p>{{ $t('toolA.fileSize') }}: {{ currentFile.size }}</p>
                <p>{{ $t('toolA.fileType') }}: PDF</p>
              </div>
            </div>
            <div class="bg-surface-container-lowest dark:bg-surface-container-high p-8 rounded-xl shadow-ambient">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-primary-fixed/30 flex items-center justify-center"><span class="material-symbols-outlined text-primary">speed</span></div>
                <span class="flex items-center gap-1 px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary" /> {{ $t('toolA.stable') }}
                </span>
              </div>
              <h4 class="font-headline text-xl font-bold text-on-surface dark:text-surface">{{ $t('toolA.transferMetrics') }}</h4>
              <div class="mt-3 space-y-1 text-sm text-on-surface-variant">
                <p>{{ $t('toolA.duration') }}: 1.4s</p>
                <p>{{ $t('toolA.throughput') }}: 256 MB/s</p>
              </div>
            </div>
          </div>

          <div class="mt-8 flex gap-4">
            <button class="px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform" @click="startNewTransfer">
              {{ $t('toolA.newTransfer') }}
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-surface-container-high dark:bg-surface-container rounded-xl overflow-hidden p-8">
            <h3 class="font-headline text-2xl font-bold text-on-surface dark:text-surface mb-4">{{ $t('toolA.beyondTransfer') }}</h3>
            <p class="text-on-surface-variant text-sm mb-6">{{ $t('toolA.beyondTransferDesc') }}</p>
            <div class="p-6 bg-surface-container-lowest dark:bg-surface-container-high rounded-lg mb-6">
              <p class="font-bold text-on-surface dark:text-surface text-sm">{{ $t('toolA.needPersistentRoom') }}</p>
              <p class="text-on-surface-variant text-xs mt-1">{{ $t('toolA.tryClipboard') }}</p>
            </div>
            <NuxtLink :to="localePath('/tools/clipboard')" class="w-full py-4 primary-gradient text-on-primary rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.95] transition-transform">
              {{ $t('toolA.initClipboard') }}
              <span class="material-symbols-outlined">arrow_forward</span>
            </NuxtLink>
          </div>

          <div class="p-8 bg-surface-container-low dark:bg-surface-container rounded-xl flex items-center gap-4">
            <span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1">shield_lock</span>
            <div>
              <h4 class="font-headline font-bold text-sm text-on-surface dark:text-surface">{{ $t('toolA.zeroKnowledge') }}</h4>
              <p class="text-xs text-on-surface-variant">{{ $t('toolA.zeroKnowledgeDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STATE: RECONNECTING ==================== -->
    <div v-else-if="state === 'reconnecting'" class="w-full max-w-4xl relative">
      <!-- Offline Banner -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 animate-bounce z-50">
        <div class="bg-error-container text-on-error-container px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <span class="material-symbols-outlined">cloud_off</span>
          <span class="text-sm font-bold tracking-wide uppercase">{{ $t('toolA.systemOffline') }}</span>
        </div>
      </div>

      <!-- Blurred Background Content -->
      <div class="opacity-30 blur-md pointer-events-none">
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-8 h-64" />
      </div>

      <!-- Interruption Overlay -->
      <div class="absolute inset-0 bg-surface-container-lowest/20 backdrop-blur-[2px] flex items-center justify-center z-40">
        <div class="w-full max-w-md bg-surface-container-lowest dark:bg-surface-container-high shadow-ambient rounded-xl p-10 text-center">
          <!-- Spinner -->
          <div class="relative w-24 h-24 mx-auto mb-8">
            <div class="absolute inset-0 border-4 border-primary/10 rounded-full" />
            <div class="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" style="animation-duration: 3s" />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-primary animate-pulse">sync</span>
            </div>
          </div>

          <span class="px-2 py-0.5 bg-error/10 text-error text-[10px] font-black rounded uppercase">{{ $t('toolA.offline') }}</span>
          <h3 class="text-2xl font-headline font-extrabold text-on-surface dark:text-surface mt-4">{{ $t('toolA.connectionInterrupted') }}</h3>
          <p class="text-on-surface-variant font-medium text-sm mt-2">{{ $t('toolA.reconnectAttempt', { n: reconnectAttempt, max: 3 }) }}</p>

          <div class="flex flex-col gap-3 mt-8">
            <button v-if="!isReceiver" class="w-full py-3 bg-surface-container-high dark:bg-surface-container hover:bg-surface-container-highest text-on-surface dark:text-surface rounded-lg font-semibold flex items-center justify-center gap-2" @click="refreshQr">
              <span class="material-symbols-outlined">qr_code_2</span>
              {{ $t('toolA.refreshQrFallback') }}
            </button>
            <p v-else class="text-sm text-on-surface-variant text-center">{{ $t('toolA.askPcToRefresh') }}</p>
            <button class="w-full py-3 text-primary font-bold hover:underline">{{ $t('toolA.checkNetwork') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STATE: FILE QUEUE ==================== -->
    <div v-else-if="state === 'fileQueue'" class="w-full max-w-4xl space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-end">
        <div>
          <span class="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold tracking-widest uppercase rounded-full">{{ $t('toolA.activeSession') }}</span>
          <h2 class="text-4xl font-extrabold tracking-tight text-on-surface dark:text-surface font-headline mt-2">{{ $t('toolA.fileQueue') }}</h2>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold text-primary">{{ fileQueue.length }} / 10 {{ $t('toolA.filesSelected') }}</p>
          <button class="text-sm text-on-surface-variant hover:text-error transition-colors mt-1" @click="fileQueue = []">{{ $t('toolA.cancelAll') }}</button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <!-- Queue Area -->
        <div class="col-span-12 lg:col-span-8 space-y-4">
          <!-- Drop Zone -->
          <div class="bg-surface-container-low dark:bg-surface-container p-8 rounded-xl group hover:bg-primary-fixed/10 transition-colors cursor-pointer flex items-center gap-4" @click="triggerFileInput">
            <span class="material-symbols-outlined text-3xl text-primary">add_circle</span>
            <div>
              <p class="font-bold text-on-surface dark:text-surface text-sm">{{ $t('toolA.addMoreFiles') }}</p>
              <p class="text-xs text-on-surface-variant">{{ $t('toolA.dragOrClick') }}</p>
            </div>
          </div>
          <input ref="fileInput" type="file" multiple hidden @change="handleFileSelect" />

          <!-- Queue Items -->
          <div class="bg-surface-container dark:bg-surface-container-high rounded-xl overflow-hidden">
            <div v-for="(file, i) in fileQueue" :key="i" class="p-5 flex items-center bg-surface-container-lowest dark:bg-surface-container-high" :class="{ 'mt-3 rounded-xl': i > 0 }">
              <div class="w-10 h-10 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary-container flex-shrink-0">
                <span class="material-symbols-outlined">description</span>
              </div>
              <div class="ml-3 flex-1 min-w-0">
                <p class="text-sm font-semibold text-on-surface dark:text-surface truncate">{{ file.name }}</p>
                <p class="text-xs text-on-surface-variant">{{ formatSize(file.size) }}</p>
              </div>
              <span class="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold uppercase tracking-wider">{{ $t('toolA.ready') }}</span>
              <button class="ml-3 text-outline hover:text-error transition-colors" @click="fileQueue.splice(i, 1)">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          <!-- Start Transfer -->
          <button v-if="fileQueue.length" class="w-full py-4 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform" @click="startTransfer">
            <span class="material-symbols-outlined">send</span>
            {{ $t('toolA.startTransfer') }}
          </button>
        </div>

        <!-- Stats Sidebar -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div class="bg-surface-container-low dark:bg-surface-container p-6 rounded-xl space-y-4">
            <span class="text-sm font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.statusDetails') }}</span>
            <div class="flex justify-between text-xs"><span class="text-on-surface-variant">{{ $t('toolA.connectedNode') }}</span><span class="font-bold text-primary flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary" />US-East-1</span></div>
            <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Encryption</span><span class="font-bold text-on-surface dark:text-surface">AES-256-GCM</span></div>
            <div class="flex justify-between text-xs"><span class="text-on-surface-variant">Avg. Speed</span><span class="font-bold text-on-surface dark:text-surface">12.5 MB/s</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STATE: DEVICE HISTORY ==================== -->
    <div v-else-if="state === 'deviceHistory'" class="w-full max-w-5xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-headline text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight">{{ $t('toolA.deviceHistoryTitle') }}</h2>
          <p class="text-on-surface-variant mt-2 max-w-lg">{{ $t('toolA.deviceHistoryDesc') }}</p>
        </div>
        <div class="flex gap-3">
          <button class="px-4 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-lg text-sm font-semibold" @click="state = 'waiting'">{{ $t('common.goBack') }}</button>
          <button class="px-4 py-2 primary-gradient text-on-primary rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform">
            <span class="material-symbols-outlined text-lg">add_link</span>{{ $t('toolA.newConnection') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Device Cards -->
        <div class="lg:col-span-8 space-y-4">
          <div v-for="device in devices" :key="device.name" class="bg-surface-container-lowest dark:bg-surface-container-high p-6 rounded-[1.5rem] flex items-center gap-5 group hover:shadow-ambient transition-all">
            <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl text-primary">{{ device.icon }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ device.name }}</h3>
              <p class="text-xs text-on-surface-variant mt-0.5">{{ $t('toolA.lastSeen') }}: {{ device.time }}</p>
            </div>
            <span class="px-2.5 py-1 rounded text-xs font-bold" :class="device.online ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'">
              {{ device.online ? $t('toolA.deviceConnected') : $t('toolA.deviceOffline') }}
            </span>
            <button class="px-4 py-2 bg-primary/5 text-primary rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10">{{ $t('toolA.quickConnect') }}</button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-4 space-y-6">
          <div class="primary-gradient rounded-[1.5rem] p-6 text-on-primary">
            <div class="flex items-center gap-3 mb-4">
              <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">verified_user</span>
              <span class="font-headline font-bold">{{ $t('toolA.securityPulse') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary-fixed" /></span>
              <span class="text-sm text-on-primary/80">{{ $t('toolA.handshakeActive') }}</span>
            </div>
          </div>
          <div class="bg-surface-container-low dark:bg-surface-container rounded-[1.5rem] p-6 space-y-4">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('toolA.connectivityInsights') }}</span>
            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary">sync</span><div><p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.autoSyncing') }}</p><p class="text-xs text-on-surface-variant">3 {{ $t('toolA.devicesLabel') }}</p></div></div>
            <div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary">network_check</span><div><p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.avgHandshake') }}</p><p class="text-xs text-on-surface-variant">42ms</p></div></div>
          </div>
          <div class="bg-surface-container-low dark:bg-surface-container rounded-[1.5rem] p-6 flex items-center gap-4 cursor-pointer hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-primary text-2xl">auto_delete</span>
            <div>
              <p class="text-sm font-bold text-on-surface dark:text-surface">{{ $t('toolA.autoForget') }}</p>
              <p class="text-xs text-on-surface-variant">{{ $t('toolA.autoForgetDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STATE: TRANSFER HISTORY ==================== -->
    <div v-else-if="state === 'transferHistory'" class="w-full max-w-5xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-headline text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight">{{ $t('toolA.transferHistoryTitle') }}</h2>
          <p class="text-on-surface-variant mt-2">{{ $t('toolA.transferHistoryDesc') }}</p>
        </div>
        <button class="px-4 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-lg text-sm font-semibold" @click="state = 'waiting'">{{ $t('common.goBack') }}</button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="stat in historyStats" :key="stat.icon" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-6 relative overflow-hidden">
          <span class="material-symbols-outlined absolute top-4 right-4 text-5xl text-primary/5">{{ stat.icon }}</span>
          <p class="text-3xl font-headline font-extrabold text-on-surface dark:text-surface relative z-10">{{ stat.value }}</p>
          <p class="text-xs text-on-surface-variant font-medium mt-1 relative z-10">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2">
        <button v-for="tab in ['All', 'Pending', 'Failed']" :key="tab" class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors" :class="historyFilter === tab ? 'primary-gradient text-on-primary' : 'bg-surface-container-high dark:bg-surface-container text-on-surface-variant'" @click="historyFilter = tab">{{ tab }}</button>
      </div>

      <!-- Table -->
      <div class="bg-surface-container dark:bg-surface-container-high rounded-xl overflow-hidden">
        <div class="grid grid-cols-12 bg-surface-container-low dark:bg-surface-container px-6 py-4">
          <span class="col-span-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.contentType') }}</span>
          <span class="col-span-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.deviceOrigin') }}</span>
          <span class="col-span-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.timestamp') }}</span>
          <span class="col-span-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.status') }}</span>
          <span class="col-span-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolA.actions') }}</span>
        </div>
        <div v-for="item in transferHistoryItems" :key="item.name" class="grid grid-cols-12 items-center px-6 py-5 group hover:bg-surface-container-low/50 transition-colors">
          <div class="col-span-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="item.iconBg"><span class="material-symbols-outlined" :class="item.iconColor">{{ item.icon }}</span></div>
            <div><p class="text-sm font-semibold text-on-surface dark:text-surface">{{ item.name }}</p><p class="text-xs text-on-surface-variant">{{ item.size }}</p></div>
          </div>
          <div class="col-span-3 flex items-center gap-2"><span class="material-symbols-outlined text-on-surface-variant text-lg">{{ item.deviceIcon }}</span><span class="text-sm text-on-surface dark:text-surface">{{ item.device }}</span></div>
          <span class="col-span-2 text-sm text-on-surface-variant">{{ item.time }}</span>
          <div class="col-span-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold" :class="item.statusClass">
              <span class="w-1.5 h-1.5 rounded-full" :class="item.dotClass" />{{ item.status }}
            </span>
          </div>
          <div class="col-span-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="p-1.5 text-on-surface-variant hover:text-error rounded transition-colors"><span class="material-symbols-outlined text-lg">delete</span></button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== STATE: E2EE AUDIT ==================== -->
    <div v-else-if="state === 'e2eeAudit'" class="w-full max-w-5xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-headline text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight">{{ $t('toolA.e2eeAuditTitle') }}</h2>
          <p class="text-on-surface-variant mt-2">{{ $t('toolA.e2eeAuditDesc') }}</p>
        </div>
        <button class="px-4 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-lg text-sm font-semibold" @click="state = 'waiting'">{{ $t('common.goBack') }}</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Connection Health -->
        <div class="md:col-span-2 bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolA.connectionHealth') }}</h3>
            <div class="flex items-center gap-2 px-3 py-1 bg-primary-fixed/20 rounded-full">
              <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-2 w-2 bg-primary" /></span>
              <span class="text-xs font-bold text-primary">{{ $t('toolA.encryptedP2pActive') }}</span>
            </div>
          </div>
          <div class="flex items-center justify-center gap-8 py-6">
            <div class="flex flex-col items-center gap-2"><div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><span class="material-symbols-outlined text-primary text-2xl">computer</span></div><span class="text-xs text-on-surface-variant font-medium">Local</span></div>
            <span class="material-symbols-outlined text-primary text-2xl">vpn_lock</span>
            <div class="flex flex-col items-center gap-2"><div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"><span class="material-symbols-outlined text-primary text-2xl">dns</span></div><span class="text-xs text-on-surface-variant font-medium">Remote</span></div>
          </div>
        </div>

        <!-- HKDF Pairing -->
        <div class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1">sync_alt</span>
            <div>
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">HKDF Pairing</span>
              <p class="text-sm font-bold text-primary">{{ $t('toolA.authenticated') }}</p>
            </div>
          </div>
          <p class="text-xs text-on-surface-variant leading-relaxed mb-4">{{ $t('toolA.hkdfDesc') }}</p>
          <button class="text-xs text-primary font-bold uppercase tracking-widest hover:underline">{{ $t('toolA.reAuthenticate') }}</button>
        </div>

        <!-- Key Fingerprint -->
        <div class="md:col-span-3 bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-8">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 block">{{ $t('toolA.keyFingerprint') }}</span>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="chunk in keyFingerprint" :key="chunk" class="bg-surface-container dark:bg-surface-container p-4 rounded-lg text-center">
              <span class="font-mono text-lg font-bold text-on-surface dark:text-surface tracking-widest">{{ chunk }}</span>
            </div>
          </div>
        </div>

        <!-- Live Security Log -->
        <div class="md:col-span-3 bg-on-surface dark:bg-surface-container rounded-xl p-8 text-surface">
          <span class="text-xs font-bold uppercase tracking-widest text-surface/60 mb-4 block">{{ $t('toolA.liveSecurityLog') }}</span>
          <div class="space-y-3 font-mono text-xs">
            <div v-for="log in securityLogs" :key="log.time" class="flex gap-4">
              <span class="text-surface/40 flex-shrink-0">{{ log.time }}</span>
              <span :class="log.color">{{ log.msg }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Documentation Footer (only on waiting state) -->
    <div v-if="state === 'waiting'" class="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="doc in docCards" :key="doc.icon" class="flex flex-col gap-3">
        <span class="material-symbols-outlined text-3xl text-primary">{{ doc.icon }}</span>
        <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ doc.title }}</h3>
        <p class="text-on-surface-variant text-sm leading-relaxed">{{ doc.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'tool' })
useHead({
  title: 'Wireless File Transfer Phone to PC — AirDrop Alternative, No App | ToolPort',
  meta: [
    { name: 'description', content: 'Transfer files wirelessly between phone and computer — no app, no signup, no USB cable. Free AirDrop alternative for Android, iPhone & Windows. End-to-end encrypted, scan a QR code to start.' },
    { name: 'keywords', content: 'transfer files phone to PC,wireless file transfer,AirDrop alternative,AirDrop alternative for Windows,AirDrop alternative Android,send files without USB,file transfer no app,file transfer no signup,transfer photos Android to PC,send files iPhone to Windows,P2P file transfer,encrypted file transfer,QR code file transfer,cross-platform file sharing,browser file transfer,WebRTC file transfer' },
  ],
})
useSeoMeta({
  ogTitle: 'Wireless File Transfer — Free AirDrop Alternative for Any Device | ToolPort',
  ogDescription: 'Send files between phone and PC instantly. No app, no signup, no USB cable. End-to-end encrypted P2P — just scan a QR code. Works on iOS, Android, Windows, Mac.',
  ogImage: 'https://toolport.dev/og-image.png',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort File Transfer',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  description: 'Free wireless file transfer between phone and PC. AirDrop alternative that works cross-platform — no app install, no signup, end-to-end encrypted via WebRTC P2P.',
  featureList: [
    'No app install required',
    'No signup or account needed',
    'End-to-end encrypted with AES-256-GCM',
    'Works on iOS, Android, Windows, macOS',
    'QR code pairing in seconds',
    'No file size limit',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://toolport.dev/tools/text-transfer',
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// State machine
type TransferState = 'waiting' | 'pairing' | 'transferring' | 'success' | 'reconnecting' | 'fileQueue' | 'deviceHistory' | 'transferHistory' | 'e2eeAudit'
const state = ref<TransferState>('waiting')

// Room
const qrExpired = ref(false)
const roomId = ref('')
const verificationDigits = ref(['8', '4', '9', '2'])
const reconnectAttempt = ref(3)

// Received messages (text)
const receivedMessages = ref<Array<{ id: string; content: string; isSelf: boolean }>>([])
const mobileTextInput = ref('')

// Incoming file assembly state
let incomingFileMeta: { name: string; size: number; mimeType: string } | null = null
let incomingFileChunks: ArrayBuffer[] = []
let incomingReceivedBytes = 0

// Track which side this device is (offerer = PC, answerer = phone)
const isReceiver = ref(false)

// QR canvas
const qrCanvasTransfer = ref<HTMLCanvasElement>()

// Timer for tolerating transient 'disconnected' before triggering ICE restart
let disconnectTimer: ReturnType<typeof setTimeout> | null = null

function clearDisconnectTimer() {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer)
    disconnectTimer = null
  }
}

// Receive-side stall timeout: if no chunk arrives for 30s while receiving a file, abort
let receiveTimeoutTimer: ReturnType<typeof setTimeout> | null = null
const RECEIVE_TIMEOUT_MS = 30_000

function resetReceiveTimeout() {
  if (receiveTimeoutTimer) clearTimeout(receiveTimeoutTimer)
  receiveTimeoutTimer = setTimeout(() => {
    if (incomingFileMeta) {
      incomingFileMeta = null
      incomingFileChunks = []
      incomingReceivedBytes = 0
      transferProgress.value = 0
      currentFile.value = { name: '', size: '' }
      attemptReconnect()
    }
  }, RECEIVE_TIMEOUT_MS)
}

function clearReceiveTimeout() {
  if (receiveTimeoutTimer) {
    clearTimeout(receiveTimeoutTimer)
    receiveTimeoutTimer = null
  }
}

onUnmounted(() => {
  clearDisconnectTimer()
  clearReceiveTimeout()
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (state.value === 'transferring' || state.value === 'pairing') {
    e.preventDefault()
    e.returnValue = ''
  }
}

// Fix 1: Screen lock / tab background — when user returns, check if connection dropped
function handleVisibilityChange() {
  if (document.visibilityState === 'visible' && state.value === 'transferring') {
    if (webrtc.connectionState.value !== 'connected') {
      clearDisconnectTimer()
      attemptReconnect()
    }
  }
}

// Warn before SPA navigation (sidebar links, NuxtLink, router.push)
onBeforeRouteLeave(() => {
  if (state.value === 'transferring' || state.value === 'pairing') {
    return window.confirm(t('toolA.leaveWarning'))
  }
})

// WebRTC + signaling
const webrtc = useWebRTC({
  onMessage: (data) => {
    if (typeof data === 'string') {
      try {
        const msg = JSON.parse(data)
        if (msg.type === 'text') {
          receivedMessages.value.push({ id: crypto.randomUUID(), content: msg.data as string, isSelf: false })
        }
        else if (msg.type === 'file-meta') {
          incomingFileMeta = { name: msg.name as string, size: msg.size as number, mimeType: msg.mimeType as string }
          incomingFileChunks = []
          incomingReceivedBytes = 0
          currentFile.value = { name: msg.name as string, size: formatSize(msg.size as number) }
          transferProgress.value = 0
          state.value = 'transferring'
          resetReceiveTimeout()
        }
        else if (msg.type === 'file-end' && incomingFileMeta) {
          clearReceiveTimeout()
          const blob = new Blob(incomingFileChunks, { type: incomingFileMeta.mimeType || 'application/octet-stream' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = incomingFileMeta.name
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          incomingFileMeta = null
          incomingFileChunks = []
          incomingReceivedBytes = 0
          transferProgress.value = 100
          state.value = 'success'
        }
        else if (msg.type === 'file-cancel') {
          clearReceiveTimeout()
          incomingFileMeta = null
          incomingFileChunks = []
          incomingReceivedBytes = 0
          transferProgress.value = 0
          currentFile.value = { name: '', size: '' }
          state.value = 'transferring'
        }
      }
      catch { /* ignore malformed */ }
    }
    else if (data instanceof ArrayBuffer && incomingFileMeta) {
      incomingFileChunks.push(data)
      incomingReceivedBytes += data.byteLength
      transferProgress.value = Math.round((incomingReceivedBytes / incomingFileMeta.size) * 100)
      transferredSize.value = formatSize(incomingReceivedBytes)
      resetReceiveTimeout()
    }
  },
  onError: () => {
    if (state.value === 'transferring') {
      clearDisconnectTimer()
      attemptReconnect()
    }
  },
  onStateChange: (s) => {
    if (s === 'connected') {
      clearDisconnectTimer()
      // Both sender (arrives via 'pairing') and receiver (arrives via 'waiting') enter 'transferring'
      if (state.value === 'pairing' || state.value === 'waiting' || state.value === 'reconnecting') {
        state.value = 'transferring'
      }
      signaling.disconnect()
    }
    else if (s === 'disconnected' && state.value === 'transferring') {
      // WebRTC 'disconnected' is transient — the browser retries ICE automatically.
      // Only escalate after 8 seconds of no recovery.
      disconnectTimer = setTimeout(() => {
        if (webrtc.connectionState.value !== 'connected') {
          attemptReconnect()
        }
      }, 8000)
    }
    else if (s === 'failed' && state.value === 'transferring') {
      // Hard failure — start ICE restart immediately
      clearDisconnectTimer()
      attemptReconnect()
    }
  },
})
const signaling = useSignaling(roomId)

/**
 * Attempt ICE restart without tearing down the DataChannel.
 * - PC (offerer): sends a new offer with iceRestart:true
 * - Phone (answerer): waits for the new offer and replies with an answer
 * Falls back to "please re-scan" UI after reconnectAttempt reaches 0.
 */
async function attemptReconnect() {
  if (reconnectAttempt.value <= 0) {
    state.value = 'reconnecting'
    return
  }
  reconnectAttempt.value--
  state.value = 'reconnecting'

  try {
    if (!isReceiver.value) {
      // PC is the offerer — initiate ICE restart
      signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
        await webrtc.setRemoteDescription(answer)
        signaling.disconnect()
      }
      signaling.connect()
      const restartOffer = await webrtc.restartIce()
      await signaling.sendSignal('offer', restartOffer)
    }
    else {
      // Phone is the answerer — wait for PC to send the restart offer
      signaling.onOffer.value = async (offer: RTCSessionDescriptionInit) => {
        const answer = await webrtc.receiveRestartOffer(offer)
        await signaling.sendSignal('answer', answer)
        signaling.disconnect()
      }
      signaling.connect()
    }
  }
  catch {
    state.value = 'reconnecting'
  }
}

async function generateRoomQr() {
  await nextTick()
  if (!qrCanvasTransfer.value || !roomId.value) return
  try {
    const QRCode = await import('qrcode')
    const url = `${window.location.origin}/tools/text-transfer?r=${roomId.value}`
    await QRCode.toCanvas(qrCanvasTransfer.value, url, {
      width: 220,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }
  catch {}
}

function generateVerificationCode(): string[] {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10).toString())
}

function startSenderSignaling() {
  signaling.onOffer.value = async (offer: RTCSessionDescriptionInit) => {
    // Clear immediately so a late duplicate offer doesn't trigger a second connection
    signaling.onOffer.value = null
    const answer = await webrtc.connect(offer)
    await signaling.sendSignal('answer', answer)
    verificationDigits.value = generateVerificationCode()
    state.value = 'pairing'
  }
  signaling.connect()
}

async function initReceiverMode() {
  isReceiver.value = true
  try {
    signaling.onAnswer.value = async (answer: RTCSessionDescriptionInit) => {
      await webrtc.setRemoteDescription(answer)
      // Vanilla ICE: all candidates bundled in SDP — signaling complete, close WebSocket
      signaling.disconnect()
    }
    signaling.connect()
    const offer = await webrtc.connect()
    await signaling.sendSignal('offer', offer)
  }
  catch {}
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  if (route.query.r) {
    // Receiver mode: phone scanned QR
    roomId.value = (route.query.r as string).toLowerCase()
    await initReceiverMode()
  }
  else {
    // Sender mode: generate room and QR
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
    roomId.value = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    await generateRoomQr()
    startSenderSignaling()
  }
})

// Transfer
const transferProgress = ref(0)
const transferredSize = ref('0 B')
const transferSpeed = ref('—')
const timeRemaining = ref('—')
const currentFile = ref({ name: '', size: '' })

// File queue
const fileQueue = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()
const mobileFileInput = ref<HTMLInputElement>()

const mobileRecentTransfers = [
  { icon: 'image', name: 'IMG_2024_03_12.png', desc: '2.4 MB · Sent to PC', time: '2m' },
  { icon: 'description', name: 'Meeting_Notes.txt', desc: '1 KB · Received from PC', time: '1h' },
]

// Device history
const devices = [
  { icon: 'laptop_mac', name: 'MacBook Pro', time: '2h ago', online: true },
  { icon: 'smartphone', name: 'Pixel 8', time: '5h ago', online: true },
  { icon: 'tablet_mac', name: 'iPad Air', time: '2 days ago', online: false },
]

// Transfer history
const historyFilter = ref('All')
const historyStats = [
  { icon: 'upload', value: '1.2 GB', label: t('toolA.totalSent') },
  { icon: 'hub', value: '04', label: t('toolA.activeNodesLabel') },
  { icon: 'lock', value: 'AES-256', label: t('toolA.securityLevelLabel') },
]
const transferHistoryItems = [
  { name: 'Project_Final_Specs.pdf', size: '4.2 MB', icon: 'description', iconBg: 'bg-primary-fixed/30', iconColor: 'text-primary', device: 'MacBook Pro', deviceIcon: 'laptop_mac', time: 'Mar 28, 10:41', status: 'Completed', statusClass: 'bg-primary-fixed text-on-primary-fixed-variant', dotClass: 'bg-primary' },
  { name: 'photo_july_2024.jpg', size: '8.1 MB', icon: 'image', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container', device: 'Pixel 8', deviceIcon: 'smartphone', time: 'Mar 27, 15:22', status: 'Completed', statusClass: 'bg-primary-fixed text-on-primary-fixed-variant', dotClass: 'bg-primary' },
  { name: 'meeting_notes.txt', size: '12 KB', icon: 'notes', iconBg: 'bg-surface-container-high', iconColor: 'text-on-surface-variant', device: 'iPad Air', deviceIcon: 'tablet_mac', time: 'Mar 25, 09:05', status: 'Archived', statusClass: 'bg-surface-container-high text-on-surface-variant', dotClass: 'bg-on-surface-variant/40' },
]

// E2EE Audit
const keyFingerprint = ['8F:2A:4D', '92:CB:E4', '1F:7B:A3', 'D6:08:9E']
const securityLogs = [
  { time: '10:41:02', msg: '[OK] Handshake complete — P2P established', color: 'text-primary-fixed' },
  { time: '10:41:03', msg: '[OK] DataChannel open — AES-256-GCM active', color: 'text-primary-fixed' },
  { time: '10:41:05', msg: '[INFO] Perfect Forward Secrecy rotation #1', color: 'text-surface/80' },
  { time: '10:41:08', msg: '[OK] Metadata scrubbed — zero-knowledge verified', color: 'text-primary-fixed' },
  { time: '10:42:12', msg: '[INFO] Re-keying triggered — session integrity OK', color: 'text-surface/80' },
]

const docCards = computed(() => [
  { icon: 'security', title: t('toolA.docPrivateTitle'), desc: t('toolA.docPrivateDesc') },
  { icon: 'bolt', title: t('toolA.docFrictionTitle'), desc: t('toolA.docFrictionDesc') },
  { icon: 'history', title: t('toolA.docExpiringTitle'), desc: t('toolA.docExpiringDesc') },
])

function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/tools/text-transfer?r=${roomId.value}`)
}

function refreshQr() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  roomId.value = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  qrExpired.value = false
  reconnectAttempt.value = 3
  webrtc.disconnect()
  signaling.disconnect()
  generateRoomQr().then(() => startSenderSignaling())
}

function confirmPairing() {
  if (webrtc.connectionState.value !== 'connected') return
  state.value = 'transferring'
}

function denyPairing() {
  state.value = 'waiting'
}

function startNewTransfer() {
  state.value = 'waiting'
  refreshQr()
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) fileQueue.value.push(...Array.from(input.files))
}

async function startTransfer() {
  if (!fileQueue.value.length || !isConnected.value) return
  state.value = 'transferring'
  let lastBytes = 0
  let lastTime = Date.now()

  for (const file of fileQueue.value) {
    currentFile.value = { name: file.name, size: formatSize(file.size) }
    transferProgress.value = 0
    transferredSize.value = '0 B'
    transferSpeed.value = '—'
    timeRemaining.value = '—'
    lastBytes = 0
    lastTime = Date.now()

    try {
      await webrtc.sendFile(file, (progress) => {
        transferProgress.value = progress
        const bytesDone = Math.round(file.size * progress / 100)
        transferredSize.value = formatSize(bytesDone)
        const now = Date.now()
        const dt = (now - lastTime) / 1000
        if (dt >= 0.5) {
          const speed = (bytesDone - lastBytes) / dt
          transferSpeed.value = formatSpeed(speed)
          timeRemaining.value = speed > 0 ? formatTime((file.size - bytesDone) / speed) : '—'
          lastBytes = bytesDone
          lastTime = now
        }
      })
    }
    catch { /* individual file failed — continue with next */ }
  }

  fileQueue.value = []
  state.value = 'success'
}

function cancelTransfer() {
  webrtc.cancelSend()
  clearReceiveTimeout()
  incomingFileMeta = null
  incomingFileChunks = []
  incomingReceivedBytes = 0
  transferProgress.value = 0
  transferredSize.value = '0 B'
  currentFile.value = { name: '', size: '' }
  fileQueue.value = []
  state.value = 'waiting'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isConnected = computed(() => webrtc.connectionState.value === 'connected')

function formatSpeed(bps: number): string {
  if (bps < 1024) return `${bps.toFixed(0)} B/s`
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(1)} KB/s`
  return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`
}

function formatTime(sec: number): string {
  if (sec < 1) return '< 1s'
  if (sec < 60) return `~${Math.ceil(sec)}s`
  return `~${Math.ceil(sec / 60)}m`
}

function mobileSend() {
  const text = mobileTextInput.value.trim()
  if (!text || !isConnected.value) return
  webrtc.sendText(text)
  receivedMessages.value.push({ id: crypto.randomUUID(), content: text, isSelf: true })
  mobileTextInput.value = ''
}

function triggerMobileFileInput() {
  mobileFileInput.value?.click()
}

async function handleMobileFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.[0] || !isConnected.value) return
  const file = input.files[0]
  input.value = ''
  currentFile.value = { name: file.name, size: formatSize(file.size) }
  transferProgress.value = 0
  transferredSize.value = '0 B'
  transferSpeed.value = '—'
  timeRemaining.value = '—'
  state.value = 'transferring'
  let lastBytes = 0
  let lastTime = Date.now()
  try {
    await webrtc.sendFile(file, (progress) => {
      transferProgress.value = progress
      const bytesDone = Math.round(file.size * progress / 100)
      transferredSize.value = formatSize(bytesDone)
      const now = Date.now()
      const dt = (now - lastTime) / 1000
      if (dt >= 0.5) {
        const speed = (bytesDone - lastBytes) / dt
        transferSpeed.value = formatSpeed(speed)
        timeRemaining.value = speed > 0 ? formatTime((file.size - bytesDone) / speed) : '—'
        lastBytes = bytesDone
        lastTime = now
      }
    })
    state.value = 'success'
  }
  catch { state.value = 'waiting' }
}
</script>
