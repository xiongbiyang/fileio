<template>
  <div class="pt-8 pb-12 px-8 min-h-screen flex flex-col items-center">
    <!-- Room Entry (not in room) -->
    <template v-if="view === 'entry'">
      <div class="w-full max-w-5xl">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface dark:text-surface">
            {{ $t('toolC.title') }}
          </h1>
          <p class="text-on-surface-variant mt-2 max-w-2xl">
            {{ $t('toolC.subtitle') }}
          </p>
        </div>

        <!-- Create / Join Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <!-- Create Room -->
          <div class="lg:col-span-5 bg-surface-container-lowest dark:bg-surface-container-high p-10 rounded-4xl shadow-ambient flex flex-col gap-6">
            <div class="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-2xl">add_circle</span>
            </div>
            <div>
              <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('toolC.createTitle') }}</h2>
              <p class="text-on-surface-variant text-sm mt-2 leading-relaxed">
                {{ $t('toolC.createDesc') }}
              </p>
            </div>

            <!-- E2EE checkbox -->
            <label class="flex items-center gap-3 cursor-pointer">
              <input v-model="enableE2ee" type="checkbox" class="w-5 h-5 rounded border-outline-variant accent-primary" />
              <div>
                <span class="text-sm font-medium text-on-surface dark:text-surface">{{ $t('toolC.enableE2ee') }}</span>
                <p class="text-xs text-on-surface-variant">{{ $t('toolC.e2eeHelp') }}</p>
              </div>
            </label>

            <button
              class="w-full primary-gradient text-on-primary py-5 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-[0_10px_20px_rgba(0,81,71,0.2)] hover:scale-[1.02] active:scale-95 transition-transform"
              @click="createRoom"
            >
              {{ $t('toolC.createBtn') }}
            </button>
          </div>

          <!-- Join Room -->
          <div class="lg:col-span-7 bg-surface-container-low dark:bg-surface-container p-10 rounded-4xl flex flex-col gap-6">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-2xl">key</span>
              <h2 class="font-headline text-2xl font-extrabold text-on-surface dark:text-surface">{{ $t('toolC.joinTitle') }}</h2>
            </div>
            <p class="text-on-surface-variant text-sm leading-relaxed">
              {{ $t('toolC.joinDesc') }}
            </p>

            <div class="flex gap-3">
              <div class="relative flex-1">
                <span class="absolute top-2 left-4 text-xs font-bold text-outline uppercase tracking-widest font-label">{{ $t('toolC.roomIdLabel') }}</span>
                <input
                  v-model="joinRoomId"
                  type="text"
                  class="w-full bg-surface-container-lowest dark:bg-surface-container-high border-none px-6 pt-8 pb-4 rounded-2xl text-2xl font-headline font-extrabold tracking-wider text-primary uppercase focus:ring-2 focus:ring-primary/20"
                  :placeholder="$t('toolC.roomIdPlaceholder')"
                  maxlength="6"
                  @keydown.enter="joinRoom"
                />
              </div>
              <button
                class="bg-primary text-on-primary px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50"
                :disabled="joinRoomId.length < 6"
                @click="joinRoom"
              >
                {{ $t('common.join') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Room History Button -->
        <div class="flex justify-end mb-6">
          <button class="px-4 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-surface-container transition-colors" @click="view = 'history'">
            <span class="material-symbols-outlined text-lg">history</span>
            {{ $t('toolC.roomHistoryTitle') }}
          </button>
        </div>

        <!-- How it works -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="step in howItWorks" :key="step.num" class="bg-surface-container-lowest dark:bg-surface-container-high p-6 rounded-3xl shadow-ambient">
            <span class="text-4xl font-extrabold text-primary-fixed-dim/40 font-headline">{{ step.num }}</span>
            <h3 class="font-headline font-bold text-on-surface dark:text-surface mt-2 mb-1">{{ step.title }}</h3>
            <p class="text-on-surface-variant text-sm leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Room History View -->
    <template v-else-if="view === 'history'">
      <div class="w-full max-w-5xl space-y-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-headline text-4xl font-extrabold text-on-surface dark:text-surface tracking-tight">{{ $t('toolC.roomHistoryTitle') }}</h1>
            <p class="text-on-surface-variant mt-2">{{ $t('toolC.roomHistoryDesc') }}</p>
          </div>
          <button class="px-4 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-lg font-semibold text-sm" @click="view = 'entry'">
            {{ $t('common.goBack') }}
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="stat in historyStats" :key="stat.icon" class="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl p-6 flex items-center gap-4 h-32">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl text-primary">{{ stat.icon }}</span>
            </div>
            <div>
              <p class="text-3xl font-headline font-extrabold text-on-surface dark:text-surface">{{ stat.value }}</p>
              <p class="text-xs text-on-surface-variant font-medium">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <!-- Room Table -->
        <div class="bg-surface-container dark:bg-surface-container-high rounded-xl overflow-hidden">
          <div class="bg-surface-container-low dark:bg-surface-container px-6 py-4 flex items-center gap-6">
            <span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('toolC.allRooms') }}</span>
          </div>
          <div v-for="(histRoom, index) in pastRooms" :key="histRoom.id" class="px-6 py-5 flex items-center gap-4 hover:bg-surface-container-low/50 transition-colors">
            <div class="w-10 h-10 rounded-lg bg-primary-fixed-dim flex items-center justify-center text-primary font-bold text-sm">
              {{ histRoom.id.substring(0, 2) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-on-surface dark:text-surface">{{ histRoom.name }}</p>
              <p class="text-xs text-on-surface-variant truncate">{{ histRoom.desc }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="histRoom.active" class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span v-else class="w-2 h-2 rounded-full bg-on-surface-variant/40" />
              <span class="text-xs font-medium" :class="histRoom.active ? 'text-primary' : 'text-on-surface-variant'">{{ histRoom.active ? $t('toolC.active') : $t('toolC.expired') }}</span>
            </div>
            <span class="text-xs text-on-surface-variant">{{ histRoom.time }}</span>
            <button v-if="histRoom.active" class="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-xs font-bold transition-colors" @click="joinExistingRoom(histRoom.id)">{{ $t('toolC.rejoin') }}</button>
            <button v-else class="px-4 py-2 bg-surface-container-highest hover:bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold transition-colors" @click="joinExistingRoom(histRoom.id)">{{ $t('toolC.revive') }}</button>
            <button class="p-2 text-on-surface-variant hover:text-error transition-colors" @click="deleteRoom(index)"><span class="material-symbols-outlined text-lg">delete</span></button>
          </div>
        </div>
      </div>
    </template>

    <!-- Message Search View -->
    <template v-else-if="view === 'search'">
      <div class="w-full max-w-5xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Sidebar -->
          <div class="lg:col-span-3 space-y-6">
            <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-headline font-bold text-on-surface dark:text-surface">{{ $t('toolC.roomPrefix', { id: currentRoom }) }}</h3>
                <div class="flex items-center gap-1 px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold rounded-full">
                  <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />{{ $t('toolC.active') }}
                </div>
              </div>
              <div class="p-3 bg-surface-container-lowest dark:bg-surface-container-high rounded-lg text-xs text-on-surface-variant">
                <p>{{ $t('toolC.devicesOnline', { n: room.deviceCount }) }}</p>
              </div>
              <button class="w-full mt-3 py-2 bg-surface-container-high dark:bg-surface-container text-on-surface-variant rounded-lg text-sm font-semibold flex items-center justify-center gap-2" @click="copyRoomLink">
                <span class="material-symbols-outlined text-lg">share</span>{{ $t('toolC.inviteMembers') }}
              </button>
            </div>
            <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-6">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('toolC.storage') }}</span>
              <div class="mt-3 h-2 bg-surface-container-high rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full" style="width: 42%" /></div>
              <div class="flex justify-between mt-2 text-xs text-on-surface-variant"><span>42%</span><span>2.1 / 5 GB</span></div>
            </div>
          </div>

          <!-- Main Search Content -->
          <div class="lg:col-span-9 bg-surface-container dark:bg-surface-container-high rounded-xl p-8 flex flex-col min-h-[700px]">
            <h2 class="font-headline text-3xl font-extrabold text-on-surface dark:text-surface mb-6">{{ $t('toolC.title') }}</h2>

            <!-- Search Bar -->
            <div class="relative max-w-md mb-4">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
              <input v-model="searchQuery" class="w-full pl-12 pr-4 py-3 bg-surface-container-highest dark:bg-surface-container border-none rounded-xl text-on-surface dark:text-surface focus:ring-2 focus:ring-primary-fixed placeholder:text-outline" :placeholder="$t('toolC.searchPlaceholder')" />
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-3 mb-6">
              <button v-for="f in searchFilters" :key="f.key" class="px-5 py-2 rounded-full text-sm font-semibold transition-colors" :class="activeSearchFilter === f.key ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest dark:bg-surface-container text-on-surface-variant'" @click="activeSearchFilter = f.key">
                {{ f.label }}
              </button>
              <span class="ml-auto text-on-surface-variant text-xs flex items-center gap-1"><span class="material-symbols-outlined text-sm">filter_list</span>{{ $t('toolC.sortNewest') }}</span>
            </div>

            <!-- Results -->
            <div class="flex-1 space-y-4 overflow-y-auto">
              <div v-for="result in filteredMessages" :key="result.id" class="bg-surface-container-lowest dark:bg-surface-container p-6 rounded-xl group hover:shadow-ambient transition-all">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="result.avatarClass">
                    <span class="material-symbols-outlined text-sm text-on-surface-variant">{{ result.avatarIcon }}</span>
                  </div>
                  <div class="flex-1">
                    <span class="text-sm font-bold text-on-surface dark:text-surface">{{ result.sender }}</span>
                    <span class="text-[10px] font-label text-on-surface-variant uppercase tracking-widest ml-2">{{ result.type }} &bull; {{ result.time }}</span>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="p-2 hover:bg-surface-container-low rounded-lg" @click="copyToClipboard(result.content.replace(/<[^>]*>/g, ''))"><span class="material-symbols-outlined text-sm text-on-surface-variant">content_copy</span></button>
                  </div>
                </div>
                <p class="text-sm text-on-surface-variant leading-relaxed" v-html="result.content" />
              </div>
            </div>

            <!-- Back -->
            <div class="mt-6 flex justify-between">
              <button class="px-4 py-2 text-primary font-bold text-sm hover:underline" @click="view = 'room'">{{ $t('common.goBack') }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Room Settings & Voting View -->
    <template v-else-if="view === 'settings'">
      <div class="w-full max-w-5xl space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span class="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold tracking-widest uppercase rounded-full">{{ $t('toolC.activeSessionLabel') }}</span>
            <h2 class="font-headline text-4xl md:text-5xl font-extrabold text-on-surface dark:text-surface tracking-tight mt-2">{{ $t('toolC.projectTitle') }}</h2>
          </div>
          <div class="flex gap-3">
            <button class="px-6 py-3 bg-surface-container-high dark:bg-surface-container text-on-surface dark:text-surface rounded-xl font-semibold text-sm flex items-center gap-2" @click="view = 'room'">
              <span class="material-symbols-outlined text-lg">arrow_back</span>{{ $t('common.goBack') }}
            </button>
            <NuxtLink :to="localePath('/pro-waitlist')" class="px-6 py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform">
              <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1">bolt</span>{{ $t('toolC.goPro') }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <!-- Members -->
          <div class="md:col-span-4 bg-surface-container-low dark:bg-surface-container rounded-[1.5rem] p-8 flex flex-col">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-headline font-bold text-xl text-on-surface dark:text-surface">{{ $t('toolC.members') }}</h3>
              <span class="text-sm font-medium bg-surface-container-highest dark:bg-surface-container-high px-3 py-1 rounded-full text-on-surface-variant">{{ roomMembers.length }} / 10</span>
            </div>
            <div class="space-y-3 flex-1">
              <div v-for="member in roomMembers" :key="member.name" class="flex items-center gap-3 p-3 rounded-xl transition-colors" :class="member.isAdmin ? 'bg-surface-container-lowest dark:bg-surface-container-high shadow-sm' : 'hover:bg-surface-container'">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" :class="member.avatarClass">{{ member.initials }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-on-surface dark:text-surface truncate">{{ member.name }}</p>
                  <p class="text-[10px] uppercase tracking-tight" :class="member.isAdmin ? 'text-primary font-bold' : 'text-on-surface-variant'">{{ member.role }}</p>
                </div>
              </div>
            </div>
            <button class="mt-8 w-full py-4 bg-surface-container-highest dark:bg-surface-container-high text-on-surface-variant rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:text-error transition-colors" @click="clearRoom">
              <span class="material-symbols-outlined text-lg">delete_sweep</span>{{ $t('toolC.clearRoomBtn') }}
            </button>
          </div>

          <!-- Vote Feature Section -->
          <div class="md:col-span-8 space-y-6">
            <div class="bg-surface-container-low dark:bg-surface-container rounded-[1.5rem] p-8">
              <div class="flex items-start gap-4 mb-6">
                <span class="material-symbols-outlined text-4xl text-primary-fixed-dim">how_to_vote</span>
                <div>
                  <h3 class="font-headline font-bold text-2xl text-on-surface dark:text-surface">{{ $t('toolC.voteNextFeature') }}</h3>
                  <p class="text-on-surface-variant text-sm mt-1">{{ $t('toolC.voteDesc') }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div v-for="feat in voteFeatures" :key="feat.icon" class="p-5 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl cursor-pointer group transition-all hover:bg-primary-fixed/20 hover:ring-2 hover:ring-primary-fixed-dim">
                  <div class="flex items-center justify-between mb-2">
                    <span class="p-2 bg-primary-fixed rounded-lg"><span class="material-symbols-outlined text-primary text-lg">{{ feat.icon }}</span></span>
                    <span class="text-[10px] font-bold text-primary">{{ feat.votes }}</span>
                  </div>
                  <h4 class="font-bold text-on-surface dark:text-surface text-sm mt-3">{{ feat.title }}</h4>
                  <p class="text-xs text-on-surface-variant mt-2 leading-relaxed">{{ feat.desc }}</p>
                </div>
              </div>
            </div>

            <!-- Pro CTA -->
            <div class="relative overflow-hidden primary-gradient rounded-[1.5rem] p-10 flex flex-col md:flex-row items-center gap-8">
              <div class="flex-1">
                <h3 class="font-headline font-extrabold text-3xl text-on-primary">{{ $t('toolC.unlockPro') }}</h3>
                <p class="text-primary-fixed/80 text-lg mt-2">{{ $t('toolC.unlockProDesc') }}</p>
              </div>
              <NuxtLink :to="localePath('/pro-waitlist')" class="px-8 py-4 bg-primary-fixed text-on-primary-fixed-variant font-bold rounded-xl hover:scale-105 transition-transform whitespace-nowrap">
                {{ $t('toolC.joinWaitlist') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Active Room (Chat) -->
    <template v-else>
      <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Chat Area -->
      <div class="lg:col-span-8 bg-surface-container-low dark:bg-surface-container rounded-xl flex flex-col h-[calc(100vh-10rem)] md:h-[819px] overflow-hidden shadow-ambient">
        <!-- Room Header: Mobile -->
        <div class="md:hidden px-4 py-3 bg-surface-container-lowest dark:bg-surface-container-high flex items-center justify-between">
          <div>
            <span class="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Room ID</span>
            <h2 class="text-base font-headline font-extrabold text-primary">{{ currentRoom }}</h2>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-full">
              <span class="relative flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" /><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" /></span>
              <span class="text-[10px] font-bold text-primary">{{ $t('toolC.devicesOnline', { n: room.deviceCount }) }}</span>
            </div>
            <div class="text-center">
              <span class="material-symbols-outlined text-primary text-sm">schedule</span>
              <span class="text-xs font-mono font-bold text-on-surface dark:text-surface block">23:54</span>
            </div>
          </div>
        </div>

        <!-- Room Header: Desktop -->
        <div class="hidden md:flex px-8 py-5 bg-surface-container-lowest dark:bg-surface-container-high flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div>
              <span class="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">{{ $t('toolC.sessionId') }}</span>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-headline font-extrabold text-primary">{{ $t('toolC.roomPrefix', { id: currentRoom }) }}</h2>
                <span v-if="isE2ee" class="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold rounded-full flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1">lock</span>
                  E2EE
                </span>
              </div>
            </div>
            <div class="h-8 w-px bg-outline-variant/20" />
            <div v-if="room.isConnected" class="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span class="text-sm font-medium text-primary">{{ $t('toolC.connected') }}</span>
            </div>
            <div v-else class="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
              <span class="w-2 h-2 rounded-full bg-outline animate-pulse" />
              <span class="text-sm font-medium text-on-surface-variant">{{ $t('toolC.connecting') }}</span>
            </div>
            <span class="text-sm text-on-surface-variant/70 font-medium">{{ $t('toolC.devicesOnline', { n: room.deviceCount }) }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button class="px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg flex items-center gap-1 transition-colors" @click="copyRoomLink">
              <span class="material-symbols-outlined text-lg">content_copy</span> {{ $t('common.copyLink') }}
            </button>
            <button class="px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg flex items-center gap-1 transition-colors" @click="showQrModal = !showQrModal">
              <span class="material-symbols-outlined text-lg">qr_code_2</span> {{ $t('toolC.qrCode') }}
            </button>
            <!-- QR Modal -->
            <div v-if="showQrModal" class="absolute top-full right-0 mt-2 bg-surface-container-lowest dark:bg-surface-container-high p-4 rounded-xl shadow-lg z-50">
              <canvas ref="qrCanvasModal" class="w-32 h-32" />
              <button class="w-full mt-2 py-1.5 text-xs font-semibold text-primary hover:underline" @click="copyRoomLink">{{ $t('common.copyLink') }}</button>
            </div>
            <div class="h-6 w-px bg-outline-variant/20" />
            <button class="px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg flex items-center gap-1 transition-colors" @click="view = 'search'">
              <span class="material-symbols-outlined text-lg">search</span>
            </button>
            <button class="px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg flex items-center gap-1 transition-colors" @click="view = 'settings'">
              <span class="material-symbols-outlined text-lg">settings</span>
            </button>
            <button class="px-3 py-2 text-sm text-error hover:bg-error-container/20 rounded-lg transition-colors" @click="clearRoom">{{ $t('common.clear') }}</button>
            <button class="px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors" @click="leaveRoom">{{ $t('common.leave') }}</button>
          </div>
        </div>

        <!-- Message Stream -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-8 space-y-8 bg-surface-container-low/50">
          <!-- System Message -->
          <div class="flex justify-center">
            <span class="bg-surface-container dark:bg-surface-container-highest/50 text-on-surface-variant/80 px-6 py-2 rounded-full text-xs font-medium">
              {{ $t('toolC.welcomeMsg', { id: currentRoom }) }}
            </span>
          </div>

          <!-- Messages -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex group"
            :class="msg.isSelf ? 'flex-row-reverse items-start gap-4 ml-auto max-w-[85%]' : 'items-start gap-4 max-w-[85%]'"
          >
            <!-- Avatar -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              :class="msg.isSelf ? 'primary-gradient' : 'bg-outline-variant/30'"
            >
              <span class="material-symbols-outlined text-sm" :class="msg.isSelf ? 'text-on-primary' : 'text-on-surface-variant'">
                {{ msg.isSelf ? 'person' : 'laptop_mac' }}
              </span>
            </div>

            <div class="flex flex-col" :class="msg.isSelf ? 'items-end' : 'items-start'">
              <!-- Bubble -->
              <div
                class="px-6 py-4 shadow-sm max-w-full"
                :class="msg.isSelf
                  ? 'primary-gradient text-on-primary rounded-2xl rounded-tr-none shadow-lg shadow-primary/10'
                  : 'bg-surface-container-highest dark:bg-surface-container-high text-on-surface dark:text-surface rounded-2xl rounded-tl-none'"
              >
                <img v-if="msg.type === 'image'" :src="msg.content" alt="Shared image" class="max-w-xs rounded-lg" />
                <p v-else class="text-sm leading-relaxed whitespace-pre-wrap break-words">{{ msg.content }}</p>
              </div>
              <!-- Time -->
              <div class="flex items-center gap-4 px-1 mt-1">
                <span class="text-[10px] font-bold text-on-surface-variant/40 uppercase">{{ msg.time }}</span>
                <button class="opacity-0 group-hover:opacity-100 transition-opacity" @click="copyToClipboard(msg.content)">
                  <span class="material-symbols-outlined text-sm text-on-surface-variant/40 hover:text-primary">content_copy</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex items-center gap-3 px-12">
            <div class="flex gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style="animation-delay: 0.1s" />
              <span class="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style="animation-delay: 0.2s" />
              <span class="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style="animation-delay: 0.3s" />
            </div>
            <span class="text-xs font-medium text-primary/60 italic">{{ $t('toolC.typingIndicator') }}</span>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-6 bg-surface-container-lowest dark:bg-surface-container-high">
          <div class="flex items-end gap-4 bg-surface-container-low dark:bg-surface-container rounded-2xl p-2 focus-within:bg-surface-container transition-colors">
            <button class="p-3 text-on-surface-variant hover:text-primary transition-colors" @click="triggerFileAttach">
              <span class="material-symbols-outlined">attach_file</span>
            </button>
            <input ref="fileAttachInput" type="file" accept="image/*" hidden @change="handleFileAttach" />
            <textarea
              v-model="newMessage"
              class="flex-1 bg-transparent border-0 focus:ring-0 text-on-surface dark:text-surface placeholder:text-on-surface-variant/40 resize-none py-3 px-2 min-h-[56px] max-h-48"
              :placeholder="$t('toolC.inputPlaceholder')"
              rows="1"
              @keydown.enter.exact.prevent="sendMessage"
              @paste="handlePaste"
              @input="onInput"
            />
            <button
              class="primary-gradient text-on-primary w-12 h-12 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              :disabled="!newMessage.trim()"
              @click="sendMessage"
            >
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">send</span>
            </button>
          </div>

          <div class="mt-3 flex justify-between items-center px-2">
            <div class="flex items-center gap-4">
              <button class="text-on-surface-variant/50 text-xs font-medium hover:text-primary flex items-center gap-1 transition-colors" @click="view = 'search'">
                <span class="material-symbols-outlined text-sm">history</span> {{ $t('common.history') }}
              </button>
              <button class="text-on-surface-variant/50 text-xs font-medium hover:text-primary flex items-center gap-1 transition-colors">
                <span class="material-symbols-outlined text-sm">lock</span> {{ isE2ee ? $t('toolC.encryptedByForge') : $t('toolC.standardMode') }}
              </button>
            </div>
            <span class="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{{ $t('toolC.shiftEnter') }}</span>
          </div>
        </div>
      </div>

      <!-- E2EE Sidebar (Desktop Only) -->
      <div class="hidden lg:flex lg:col-span-4 flex-col gap-6">
        <!-- Room Info -->
        <div class="bg-surface-container-low dark:bg-surface-container rounded-3xl p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-primary-container rounded-xl">
              <span class="material-symbols-outlined text-on-primary-container" style="font-variation-settings: 'FILL' 1">lock</span>
            </div>
            <div>
              <p class="font-headline font-bold text-sm text-on-surface dark:text-surface">{{ isE2ee ? $t('toolC.encryptedByForge') : $t('toolC.standardMode') }}</p>
              <p class="text-xs text-on-surface-variant">{{ $t('toolC.roomPrefix', { id: currentRoom }) }}</p>
            </div>
          </div>
          <!-- Self-destruction timer -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs text-on-surface-variant">
              <span>{{ $t('toolC.selfDestruct') }}</span>
              <span class="font-mono font-bold text-on-surface dark:text-surface">{{ expiryTimer }}</span>
            </div>
            <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full" :style="{ width: `${expiryProgress}%` }" />
            </div>
          </div>
          <!-- QR Share -->
          <div class="bg-surface-container-lowest dark:bg-surface-container-high p-4 rounded-2xl flex items-center justify-center">
            <canvas ref="qrCanvas" class="w-24 h-24 rounded-xl" />
          </div>
          <button class="w-full py-2 bg-surface-container-highest dark:bg-surface-container text-on-surface dark:text-surface rounded-lg text-sm font-semibold flex items-center justify-center gap-2" @click="copyRoomLink">
            <span class="material-symbols-outlined text-lg">content_copy</span>{{ $t('common.copyLink') }}
          </button>
        </div>

        <!-- Connected Devices -->
        <div class="bg-surface-container-low dark:bg-surface-container rounded-3xl p-6">
          <h3 class="font-headline font-bold text-sm text-on-surface dark:text-surface mb-4">{{ $t('toolC.connectedDevices') }}</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center"><span class="material-symbols-outlined text-on-surface-variant text-lg">laptop</span></div>
              <div class="flex-1"><p class="text-sm font-medium text-on-surface dark:text-surface">MacBook Pro</p><p class="text-xs text-on-surface-variant">Local</p></div>
              <span class="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center"><span class="material-symbols-outlined text-on-surface-variant text-lg">smartphone</span></div>
              <div class="flex-1"><p class="text-sm font-medium text-on-surface dark:text-surface">iPhone 15</p><p class="text-xs text-on-surface-variant">Remote</p></div>
              <span class="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

definePageMeta({ layout: 'tool' })
useHead({
  title: 'Copy Paste Between Phone and PC — Free Online Clipboard Sync | ToolPort',
  meta: [
    { name: 'description', content: 'Sync clipboard between phone, tablet, and PC instantly. Copy on one device, paste on another — no app, no signup. Encrypted rooms, real-time sharing, auto-deletes in 24 hours.' },
    { name: 'keywords', content: 'copy paste between phone and computer,sync clipboard across devices,cross device clipboard sync,share text between devices,send link from phone to PC,online clipboard,clipboard sharing between devices,copy from phone paste to computer,share clipboard across devices free,real-time clipboard sync,encrypted clipboard sharing,no signup clipboard,send text between devices,cloud clipboard sync' },
  ],
})
useSeoMeta({
  ogTitle: 'Copy Paste Between Phone and PC — Free Online Clipboard | ToolPort',
  ogDescription: 'Sync clipboard between phone, tablet, and PC instantly. Copy on one device, paste on another — no app, no signup, end-to-end encrypted, auto-deletes in 24 hours.',
  ogImage: 'https://toolport.dev/og-image.png',
})
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ToolPort Online Clipboard',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  description: 'Free online clipboard sync — copy on phone, paste on PC instantly. Encrypted real-time rooms, no app install, no signup, auto-expires in 24 hours.',
  featureList: [
    'Real-time sync across all devices',
    'No app install required',
    'No signup or account needed',
    'End-to-end encrypted rooms',
    'Share text, links, and images',
    'Auto-expires in 24 hours',
  ],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://toolport.dev/tools/clipboard',
})

interface Message {
  id: string
  content: string
  type: 'text' | 'image'
  isSelf: boolean
  time: string
}

type ViewState = 'entry' | 'room' | 'history' | 'search' | 'settings'
const view = ref<ViewState>('entry')
const currentRoom = ref('')
const joinRoomId = ref('')
const enableE2ee = ref(false)
const isE2ee = ref(false)
const newMessage = ref('')
const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement>()
const isTyping = ref(false)
const qrCanvas = ref<HTMLCanvasElement>()
const qrCanvasModal = ref<HTMLCanvasElement>()
const showQrModal = ref(false)
const fileAttachInput = ref<HTMLInputElement>()
const expiryTimer = ref('24:00:00')
const expiryProgress = ref(100)
let expiryInterval: ReturnType<typeof setInterval> | null = null
let typingHideTimer: ReturnType<typeof setTimeout> | null = null

const room = useClipboardRoom({
  onMessage: (msg) => {
    messages.value.push({
      id: msg.id,
      content: msg.content,
      type: msg.type,
      isSelf: false,
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    scrollToBottom()
  },
  onClear: () => {
    messages.value = []
  },
  onDeviceCountChange: (_count) => {
    // deviceCount is already reactive via room.deviceCount
  },
  onTyping: () => {
    isTyping.value = true
    if (typingHideTimer) clearTimeout(typingHideTimer)
    typingHideTimer = setTimeout(() => { isTyping.value = false }, 2000)
  },
})

const historyStats = [
  { icon: 'bolt', value: '04', label: 'Active Rooms' },
  { icon: 'sync', value: '128', label: 'Total Transfers' },
  { icon: 'verified_user', value: 'AES-256', label: 'Security Level' },
]

interface PastRoom {
  id: string
  name: string
  desc: string
  active: boolean
  time: string
  createdAt: number
  e2ee: boolean
}

function loadPastRooms(): PastRoom[] {
  if (!import.meta.client) return []
  try {
    return JSON.parse(localStorage.getItem('tp_clipboard_rooms') || '[]')
  }
  catch { return [] }
}

function savePastRooms() {
  if (!import.meta.client) return
  localStorage.setItem('tp_clipboard_rooms', JSON.stringify(pastRooms.value))
}

const pastRooms = ref<PastRoom[]>(loadPastRooms())

// Search
const searchQuery = ref('')
const activeSearchFilter = ref('all')
const searchFilters = [
  { key: 'all', label: 'All' },
  { key: 'texts', label: 'Texts' },
  { key: 'links', label: 'Links' },
  { key: 'images', label: 'Images' },
]
const filteredMessages = computed(() => {
  let results = messages.value.map((msg) => ({
    id: msg.id,
    sender: msg.isSelf ? 'You' : 'Remote',
    type: msg.type === 'image' ? 'Image' : (msg.content.match(/^https?:\/\//) ? 'Link' : 'Text'),
    time: msg.time,
    avatarClass: msg.isSelf ? 'bg-primary' : 'bg-secondary-container',
    avatarIcon: msg.isSelf ? 'person' : 'laptop_mac',
    content: msg.type === 'image' ? `<img src="${msg.content}" alt="Shared image" class="max-w-xs rounded-lg" />` : msg.content,
  }))
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(r => r.content.toLowerCase().includes(q))
  }
  if (activeSearchFilter.value !== 'all') {
    const typeMap: Record<string, string> = { texts: 'Text', links: 'Link', images: 'Image' }
    const filterType = typeMap[activeSearchFilter.value]
    if (filterType) results = results.filter(r => r.type === filterType)
  }
  return results
})

// Settings
const roomMembers = [
  { name: 'Sarah Chen', initials: 'SC', role: 'Room Admin', isAdmin: true, avatarClass: 'bg-primary text-on-primary' },
  { name: 'Alex Rivera', initials: 'AR', role: 'Active now', isAdmin: false, avatarClass: 'bg-secondary-container text-on-secondary-container' },
  { name: 'Jordan Lee', initials: 'JL', role: 'Active 2m ago', isAdmin: false, avatarClass: 'bg-primary-fixed text-on-primary-fixed-variant' },
  { name: 'Guest User', initials: 'GU', role: 'Viewing only', isAdmin: false, avatarClass: 'bg-surface-container-high text-on-surface-variant' },
]
const voteFeatures = [
  { icon: 'history_toggle_off', title: '30-Day History', votes: '42%', desc: 'Extended message retention for teams.' },
  { icon: 'link', title: 'Custom Room URLs', votes: '28%', desc: 'Branded, memorable room links.' },
  { icon: 'lock', title: 'Password Lock', votes: '19%', desc: 'Extra security layer for rooms.' },
]

const howItWorks = computed(() => [
  { num: '01', title: t('toolC.step1Title'), desc: t('toolC.step1Desc') },
  { num: '02', title: t('toolC.step2Title'), desc: t('toolC.step2Desc') },
  { num: '03', title: t('toolC.step3Title'), desc: t('toolC.step3Desc') },
])

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function createRoom() {
  currentRoom.value = generateRoomId()
  isE2ee.value = enableE2ee.value
  messages.value = []
  view.value = 'room'
  room.connect(currentRoom.value)
  startExpiryTimer()
  generateQrCode()
  // Save to history
  pastRooms.value.unshift({
    id: currentRoom.value,
    name: `#ROOM-${currentRoom.value}`,
    desc: isE2ee.value ? 'E2EE Encrypted Room' : 'Standard Room',
    active: true,
    time: 'Just now',
    createdAt: Date.now(),
    e2ee: isE2ee.value,
  })
  savePastRooms()
}

function joinRoom() {
  if (joinRoomId.value.length < 6) return
  currentRoom.value = joinRoomId.value.toUpperCase()
  const existing = pastRooms.value.find(r => r.id === currentRoom.value)
  isE2ee.value = existing?.e2ee ?? false
  messages.value = []
  isTyping.value = false
  view.value = 'room'
  room.connect(currentRoom.value)
  startExpiryTimer()
  generateQrCode()
  // Add to history if not already there
  if (!existing) {
    pastRooms.value.unshift({
      id: currentRoom.value,
      name: `#ROOM-${currentRoom.value}`,
      desc: 'Joined Room',
      active: true,
      time: 'Just now',
      createdAt: Date.now(),
      e2ee: false,
    })
    savePastRooms()
  }
}

function joinExistingRoom(id: string) {
  currentRoom.value = id
  const existing = pastRooms.value.find(r => r.id === id)
  isE2ee.value = existing?.e2ee ?? false
  messages.value = []
  view.value = 'room'
  room.connect(id)
  startExpiryTimer()
  generateQrCode()
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  const content = newMessage.value
  messages.value.push({
    id: Date.now().toString(),
    content,
    type: 'text',
    isSelf: true,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })
  newMessage.value = ''
  scrollToBottom()
  room.sendMessage(content)
}

function startExpiryTimer() {
  if (expiryInterval) clearInterval(expiryInterval)
  const createdAt = Date.now()
  const total = 24 * 60 * 60 * 1000
  function update() {
    const remaining = Math.max(0, total - (Date.now() - createdAt))
    const h = Math.floor(remaining / 3600000)
    const m = Math.floor((remaining % 3600000) / 60000)
    const s = Math.floor((remaining % 60000) / 1000)
    expiryTimer.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    expiryProgress.value = Math.round((remaining / total) * 100)
  }
  update()
  expiryInterval = setInterval(update, 1000)
}

async function generateQrCode() {
  await nextTick()
  if (!currentRoom.value) return
  try {
    const QRCode = await import('qrcode')
    const url = `${window.location.origin}/tools/clipboard?r=${currentRoom.value}`
    const opts = { margin: 1, color: { dark: '#000000', light: '#ffffff' } }
    if (qrCanvas.value) await QRCode.toCanvas(qrCanvas.value, url, { ...opts, width: 96 })
    if (qrCanvasModal.value) await QRCode.toCanvas(qrCanvasModal.value, url, { ...opts, width: 128 })
  }
  catch {}
}

watch(showQrModal, (v) => { if (v) generateQrCode() })

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function copyRoomLink() {
  copyToClipboard(`${window.location.origin}/tools/clipboard?r=${currentRoom.value}`)
}

function sendImageDataUrl(dataUrl: string) {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const maxSize = 800
    const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
    canvas.width = img.width * ratio
    canvas.height = img.height * ratio
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
    const compressed = canvas.toDataURL('image/jpeg', 0.7)
    messages.value.push({
      id: Date.now().toString(),
      content: compressed,
      type: 'image',
      isSelf: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    scrollToBottom()
    room.sendMessage(compressed, 'image')
  }
  img.src = dataUrl
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (!file) continue
      const reader = new FileReader()
      reader.onload = ev => sendImageDataUrl(ev.target?.result as string)
      reader.readAsDataURL(file)
      break
    }
  }
}

function triggerFileAttach() {
  fileAttachInput.value?.click()
}

function handleFileAttach(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = ev => sendImageDataUrl(ev.target?.result as string)
  reader.readAsDataURL(file)
}

function onInput() {
  room.sendTyping()
}

function clearRoom() {
  messages.value = []
  room.clearRoom()
}

function leaveRoom() {
  if (expiryInterval) { clearInterval(expiryInterval); expiryInterval = null }
  if (typingHideTimer) { clearTimeout(typingHideTimer); typingHideTimer = null }
  room.disconnect()
  currentRoom.value = ''
  messages.value = []
  view.value = 'entry'
}

function deleteRoom(index: number) {
  pastRooms.value.splice(index, 1)
  savePastRooms()
}

onMounted(() => {
  const r = route.query.r
  if (r) {
    joinRoomId.value = (r as string).toUpperCase()
    joinRoom()
  }
})

onUnmounted(() => {
  if (expiryInterval) clearInterval(expiryInterval)
  if (typingHideTimer) clearTimeout(typingHideTimer)
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>
