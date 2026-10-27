/**
 * VNTEX SUITE CORE ENGINE (Argon4)
 * - No Guest Profiles: Unauthenticated users are "not logged in" and see a clean Login button/prompt.
 * - Capture-Phase Account Button Handler: Guarantees identical Profile / Login modal across Converter, Radar, and Bloodstream.
 * - Toolbox Landing Menu on base URL (index.html) + Direct Tool Bookmarking (index.html#converter, radar.html, bloodstream.html).
 * - Protected Admin Route (#admin): Prompts login first -> Grants access if isAdmin, otherwise redirects to Toolbox Hub.
 * - Dedicated Owner Route (#owner & owner.html) protected by Master Passcode.
 */

const VNTEX_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAN5Om2FeKB8wraQMNKcPho42Yvq60nH8A",
  authDomain: "vntex-e24a5.firebaseapp.com",
  projectId: "vntex-e24a5",
  storageBucket: "vntex-e24a5.firebasestorage.app",
  messagingSenderId: "977209087831",
  appId: "1:977209087831:web:ab22e81f799442164b5012"
};

const VNTEX_AVATARS = [
  { id: 'av_1', name: 'Blue Pulse', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%2306101e"/><circle cx="40" cy="40" r="24" fill="none" stroke="%2300f2fe" stroke-width="4"/><circle cx="40" cy="40" r="8" fill="%2300f2fe"/></svg>` },
  { id: 'av_2', name: 'Crimson Drop', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23140003"/><path d="M40 16 C40 16 60 38 60 52 C60 63 51 68 40 68 C29 68 20 63 20 52 C20 38 40 16 40 16 Z" fill="%23FF000D"/></svg>` },
  { id: 'av_3', name: 'Neon Radar', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23021206"/><polygon points="40,14 47,32 66,32 51,44 57,63 40,51 23,63 29,44 14,32 33,32" fill="%2300ff41"/></svg>` },
  { id: 'av_4', name: 'Amber Gold', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23140e02"/><circle cx="40" cy="40" r="26" fill="%231f2937" stroke="%23f59e0b" stroke-width="3"/><circle cx="40" cy="40" r="10" fill="%23f59e0b"/><circle cx="40" cy="40" r="3" fill="%23000"/></svg>` },
  { id: 'av_5', name: 'Violet Wave', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%230b0414"/><path d="M14 42 Q26 20 40 42 T66 42" fill="none" stroke="%23a855f7" stroke-width="6" stroke-linecap="round"/></svg>` }
];

const VNTEX_KEYS = {
  AUTH_USER: 'vntex_core_authenticated_user_v3',
  USERS_DB: 'vntex_core_users_database_v3',
  PENDING_APPROVALS: 'vntex_core_pending_approvals_v3',
  OWNER_UNLOCKED: 'vntex_core_owner_session_unlocked',
  SUITE_SONGS_PREFIX: 'vntex_suite_songs_',
  UNAUTH_ACTIVITY: 'vntex_core_unauth_sessions_count'
};

const TOOL_DEFAULT_PALETTES = {
  converter: {
    name: 'Converter Blue (Default)',
    void: '#020204', panel: '#0a0a10', well: '#040407', border: '#181824',
    accent1: '#00f2fe', glow: 'rgba(0, 242, 254, 0.25)'
  },
  radar: {
    name: 'Radar Neon Green Void (Default)',
    void: '#000000', panel: '#040804', well: '#020402', border: '#0d2612',
    accent1: '#00ff41', glow: 'rgba(0, 255, 65, 0.28)'
  },
  bloodstream: {
    name: 'Bloodstream Red (Default)',
    void: '#000000', panel: '#050505', well: '#000000', border: '#330000',
    accent1: '#FF000D', glow: 'rgba(255, 0, 13, 0.28)'
  }
};

const CUSTOM_PALETTES = {
  default:  { name: 'Tool Default UI', isToolDefault: true },
  obsidian: { name: 'Studio Blue',     void: '#020204', panel: '#0a0a10', well: '#040407', border: '#181824', accent1: '#00f2fe', glow: 'rgba(0, 242, 254, 0.25)' },
  neon:     { name: 'Neon Green Void', void: '#000000', panel: '#040804', well: '#020402', border: '#0d2612', accent1: '#00ff41', glow: 'rgba(0, 255, 65, 0.28)' },
  blood:    { name: 'Blood Red OLED',  void: '#000000', panel: '#050505', well: '#000000', border: '#330000', accent1: '#FF000D', glow: 'rgba(255, 0, 13, 0.28)' }
};

window.VNTEXCore = {
  currentUser: null, // null when "not logged in"
  activeTool: 'converter',
  pendingAdminRedirect: false,
  ownerUnlocked: sessionStorage.getItem(VNTEX_KEYS.OWNER_UNLOCKED) === 'true',
  firebaseAuth: null,

  async boot(activeToolName) {
    this.activeTool = activeToolName || 'converter';
    this.initFirebaseIfAvailable();
    this.seedNeutralAdminIfEmpty();
    this.loadSession();
    this.applyActiveToolTheme();
    this.mountUniversalModals();
    this.installCapturePhaseAccountListener();
    this.wireDynamicBpmRangeFix();
    this.syncHeaderProfileUI();
    this.evaluateRoutingAndLandingMenu();
  },

  initFirebaseIfAvailable() {
    try {
      if (window.firebase) {
        if (!firebase.apps.length) firebase.initializeApp(VNTEX_FIREBASE_CONFIG);
        if (firebase.auth) this.firebaseAuth = firebase.auth();
      }
    } catch {}
  },

  seedNeutralAdminIfEmpty() {
    // Clean up any old guest session keys
    sessionStorage.removeItem('vntex_core_guest_session');
    sessionStorage.removeItem('vntex_core_guest_session_v2');

    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    if (!db.length) {
      db.push({
        uid: 'usr_vntex_admin',
        email: 'admin@vntex.io',
        password: 'admin',
        fullName: 'Platform Administrator',
        username: '@vntex_admin',
        avatarId: 'av_1',
        verifiedBadge: true,
        palette: 'default',
        permissions: { tier: 'enterprise', rig: true, automation: true, palettes: true, isAdmin: true }
      });
      localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
    }
  },

  loadSession() {
    const savedAuth = localStorage.getItem(VNTEX_KEYS.AUTH_USER);
    if (savedAuth) {
      try {
        const u = JSON.parse(savedAuth);
        if (u && u.uid && u.email) {
          this.currentUser = u;
          return;
        }
      } catch {}
    }
    // Generic "not logged in" state (no guest accounts)
    this.currentUser = null;
  },

  isLoggedIn() {
    return Boolean(this.currentUser && this.currentUser.uid && this.currentUser.email);
  },

  applyActiveToolTheme() {
    const u = this.currentUser;
    const userChoice = !this.isLoggedIn() ? 'default' : (u.palette || 'default');
    const spec = (userChoice === 'default' || !CUSTOM_PALETTES[userChoice] || CUSTOM_PALETTES[userChoice].isToolDefault)
      ? (TOOL_DEFAULT_PALETTES[this.activeTool] || TOOL_DEFAULT_PALETTES.converter)
      : CUSTOM_PALETTES[userChoice];

    const r = document.documentElement;
    r.style.setProperty('--bg-void', spec.void);
    r.style.setProperty('--bg-panel', spec.panel);
    if (spec.well) r.style.setProperty('--bg-well', spec.well);
    if (spec.border) r.style.setProperty('--border-hairline', spec.border);
    r.style.setProperty('--accent-primary', spec.accent1);
    if (spec.glow) r.style.setProperty('--accent-glow', spec.glow);
  },

  setUserPalette(palKey) {
    if (!this.isLoggedIn()) return;
    this.currentUser.palette = palKey;
    this.persistAuthenticatedUser();
    this.applyActiveToolTheme();
  },

  getAvatarSvg(avatarId) {
    return (VNTEX_AVATARS.find((a) => a.id === avatarId) || VNTEX_AVATARS[0]).svg;
  },

  getIsolatedUserKey() {
    if (!this.isLoggedIn()) return null;
    return `auth_${this.currentUser.uid}`;
  },

  recordSuiteSong(songObj) {
    const uKey = this.getIsolatedUserKey();
    if (!uKey) return;
    const storageKey = `${VNTEX_KEYS.SUITE_SONGS_PREFIX}${uKey}`;
    const list = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const cleanTitle = String(songObj.title || 'Untitled Track').trim();
    const cleanArtist = String(songObj.artist || 'Artist').trim();
    const exists = list.some((x) => x.title.toLowerCase() === cleanTitle.toLowerCase() && x.artist.toLowerCase() === cleanArtist.toLowerCase());
    if (!exists) {
      list.unshift({
        id: 'suite_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        title: cleanTitle,
        artist: cleanArtist,
        bpm: Number(songObj.bpm) || (120 + (cleanTitle.length % 12)),
        camelot: songObj.camelot || '8A',
        standard: songObj.standard || 'Am',
        energy: Number(songObj.energy) || 7,
        genre: songObj.genre || songObj.crate || 'Electronic',
        sourceTool: songObj.sourceTool || this.activeTool,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(storageKey, JSON.stringify(list));
    }
  },

  getUnimportedSuiteSongs(currentRadarTracks = []) {
    const uKey = this.getIsolatedUserKey();
    if (!uKey) return [];
    const storageKey = `${VNTEX_KEYS.SUITE_SONGS_PREFIX}${uKey}`;
    const suiteList = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const existingSet = new Set(currentRadarTracks.map((t) => `${String(t.title).toLowerCase()}::${String(t.artist).toLowerCase()}`));
    return suiteList.filter((s) => !existingSet.has(`${s.title.toLowerCase()}::${s.artist.toLowerCase()}`));
  },

  persistAuthenticatedUser() {
    if (!this.isLoggedIn()) return;
    localStorage.setItem(VNTEX_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    const idx = db.findIndex((u) => u.uid === this.currentUser.uid || (u.email && u.email.toLowerCase() === this.currentUser.email.toLowerCase()));
    if (idx >= 0) db[idx] = { ...db[idx], ...this.currentUser };
    else db.push(this.currentUser);
    localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
  },

  signInWithCredentials(email, password, isSignUp, fullName, customHandle) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) return { ok: false, msg: 'Email is required.' };

    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    let existing = db.find((u) => u.email.toLowerCase() === cleanEmail);

    if (isSignUp) {
      if (existing) return { ok: false, msg: 'Account already exists. Switch to Sign In.' };
      let handle = String(customHandle || `@${cleanEmail.split('@')[0]}`).trim();
      if (!handle.startsWith('@')) handle = `@${handle.replace(/\s+/g, '_')}`;
      existing = {
        uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        email: cleanEmail,
        password: password || 'vntex',
        fullName: fullName || cleanEmail.split('@')[0],
        username: handle,
        avatarId: 'av_1',
        verifiedBadge: true,
        palette: 'default',
        permissions: {
          tier: 'pro',
          rig: true,
          automation: true,
          palettes: true,
          isAdmin: cleanEmail === 'admin@vntex.io'
        }
      };
      db.push(existing);
      localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
    } else {
      if (!existing) return { ok: false, msg: 'Account not found. Check "Create a New Account" below.' };
      if (existing.password && password && existing.password !== password) {
        return { ok: false, msg: 'Incorrect password.' };
      }
    }

    this.completeLoginTransition(existing);
    return { ok: true };
  },

  async signInWithGoogle() {
    if (this.firebaseAuth && window.firebase?.auth?.GoogleAuthProvider) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await this.firebaseAuth.signInWithPopup(provider);
        if (result && result.user) {
          const fbUser = result.user;
          const email = (fbUser.email || 'google_user@vntex.io').toLowerCase();
          const handle = `@${(fbUser.displayName || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
          let account = db.find((u) => u.email.toLowerCase() === email);
          if (!account) {
            account = {
              uid: fbUser.uid || ('usr_ggl_' + Date.now()),
              email,
              fullName: fbUser.displayName || 'Google User',
              username: handle,
              avatarId: 'av_1',
              verifiedBadge: true,
              palette: 'default',
              permissions: { tier: 'pro', rig: true, automation: true, palettes: true, isAdmin: email === 'admin@vntex.io' }
            };
            db.push(account);
            localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
          }
          this.completeLoginTransition(account);
          return;
        }
      } catch {}
    }

    const gEmail = prompt('Enter Google Account Email (e.g. yourname@gmail.com):');
    if (!gEmail || !gEmail.includes('@')) return;
    const clean = gEmail.trim().toLowerCase();
    const handle = `@${clean.split('@')[0].replace(/[^a-z0-9]/g, '_')}`;
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    let account = db.find((u) => u.email.toLowerCase() === clean);
    if (!account) {
      account = {
        uid: 'usr_ggl_' + Date.now(),
        email: clean,
        fullName: clean.split('@')[0],
        username: handle,
        avatarId: 'av_1',
        verifiedBadge: true,
        palette: 'default',
        permissions: { tier: 'pro', rig: true, automation: true, palettes: true, isAdmin: clean === 'admin@vntex.io' }
      };
      db.push(account);
      localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
    }
    this.completeLoginTransition(account);
  },

  completeLoginTransition(account) {
    this.currentUser = account;
    localStorage.setItem(VNTEX_KEYS.AUTH_USER, JSON.stringify(account));
    this.applyActiveToolTheme();
    this.syncHeaderProfileUI();
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: account } }));

    // If user was trying to access #admin directly, validate admin permissions now!
    if (this.pendingAdminRedirect || window.location.hash === '#admin') {
      this.pendingAdminRedirect = false;
      document.getElementById('vntexUniversalAccountModal')?.classList.add('hidden');
      if (account.permissions && account.permissions.isAdmin === true) {
        this.openAdminPortalModal();
      } else {
        alert('Access Denied: Your account does not have Admin permissions. Redirecting to the VNTEX Toolbox.');
        window.location.hash = '';
        this.showToolboxLandingMenu();
      }
      return;
    }

    this.renderUniversalAccountModal();
  },

  signOut() {
    try { if (this.firebaseAuth) this.firebaseAuth.signOut(); } catch {}
    localStorage.removeItem(VNTEX_KEYS.AUTH_USER);
    sessionStorage.removeItem(VNTEX_KEYS.OWNER_UNLOCKED);
    this.ownerUnlocked = false;
    this.currentUser = null;
    this.applyActiveToolTheme();
    this.syncHeaderProfileUI();
    document.getElementById('vntexAdminPortalModal')?.classList.add('hidden');
    if (window.location.hash === '#admin' || window.location.hash === '#owner') {
      history.replaceState(null, '', window.location.pathname);
    }
    this.renderUniversalAccountModal();
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: null } }));
  },

  // Capture-Phase Click Listener: Fixes Converter Profile button not opening by intercepting before any legacy script
  installCapturePhaseAccountListener() {
    document.addEventListener('click', (e) => {
      const LegacyModal = document.getElementById('accountModal');
      if (LegacyModal) LegacyModal.remove();

      const btn = e.target.closest('#openAccountBtn, #openAccountHubBtn, [data-vntex-login-trigger]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        this.openAccountOrLoginModal();
      }
    }, true);
  },

  openAccountOrLoginModal(adminGateNotice = '') {
    this.renderUniversalAccountModal(adminGateNotice);
    document.getElementById('vntexUniversalAccountModal').classList.remove('hidden');
  },

  // Syncs the header button: Shows "Log In" when not logged in; shows Avatar + @username when signed in
  syncHeaderProfileUI() {
    // Also ensure Converter nav links point to index.html#converter so clicking Converter opens Converter directly
    document.querySelectorAll('a[href="index.html"]').forEach((a) => {
      if (a.textContent.toLowerCase().includes('converter')) {
        a.setAttribute('href', 'index.html#converter');
      }
    });

    const btn = document.getElementById('openAccountHubBtn') || document.getElementById('openAccountBtn');
    if (!btn) return;

    if (!this.isLoggedIn()) {
      btn.innerHTML = `
        <i class="fa-solid fa-right-to-bracket text-[var(--accent-primary)] text-[11px]"></i>
        <span class="font-mono-tech font-bold">Log In</span>
      `;
    } else {
      const u = this.currentUser;
      btn.innerHTML = `
        <img src="${this.getAvatarSvg(u.avatarId)}" alt="" class="w-4 h-4 rounded-full object-cover border border-[var(--accent-primary)]" />
        <span class="font-mono-tech font-bold">${u.username}</span>
        ${u.verifiedBadge ? `<i class="fa-solid fa-certificate text-[#00f2fe] text-[10px]"></i>` : ''}
      `;
    }
  },

  // Fix #2: Dynamic BPM Range Display in Converter (updates any 75-160 range badge dynamically when min/max BPM inputs change)
  wireDynamicBpmRangeFix() {
    const syncBpmBounds = () => {
      const minEl = document.getElementById('bpmMinInput') || document.getElementById('minBpmInput') || document.querySelector('input[placeholder*="Min" i], input[data-bpm-min]');
      const maxEl = document.getElementById('bpmMaxInput') || document.getElementById('maxBpmInput') || document.querySelector('input[placeholder*="Max" i], input[data-bpm-max]');

      // Also scan pairs of number/range inputs inside any BPM container
      let minVal = minEl ? minEl.value : null;
      let maxVal = maxEl ? maxEl.value : null;

      if (!minVal || !maxVal) {
        const bpmInputs = Array.from(document.querySelectorAll('input[type="number"], input[type="range"]')).filter((inp) => {
          const v = Number(inp.value);
          const parentTxt = (inp.closest('div')?.textContent || '').toUpperCase();
          return parentTxt.includes('BPM') && v >= 40 && v <= 250;
        });
        if (bpmInputs.length >= 2) {
          minVal = bpmInputs[0].value;
          maxVal = bpmInputs[1].value;
        }
      }

      if (minVal && maxVal) {
        const formatted = `${minVal}-${maxVal}`;
        const formattedEnDash = `${minVal}–${maxVal}`;
        // Update dedicated badge IDs if present
        ['bpmRangeDisplay', 'bpmRangeLabel', 'bpmBoundsLabel', 'bpmRangeValue'].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.textContent = `${formatted} BPM`;
        });
        // Also find any span/div near the BPM controls that was stuck at "75-160" or similar range pattern
        document.querySelectorAll('span, div, label, strong').forEach((el) => {
          if (el.children.length === 0 && /^\s*\d{2,3}\s*[-–]\s*\d{2,3}(\s*BPM)?\s*$/i.test(el.textContent)) {
            const hasBpmSuffix = /BPM/i.test(el.textContent);
            const usesEnDash = el.textContent.includes('–');
            el.textContent = (usesEnDash ? formattedEnDash : formatted) + (hasBpmSuffix ? ' BPM' : '');
          }
        });
      }
    };

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) syncBpmBounds();
    });
    document.addEventListener('change', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) syncBpmBounds();
    });
    setTimeout(syncBpmBounds, 300);
  },

  mountUniversalModals() {
    if (document.getElementById('vntexUniversalAccountModal')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <!-- 1. TOOLBOX LANDING MENU HUB (SHOWN WHEN ACCESSING ROOT LINK WITHOUT A TOOL SPECIFIED) -->
      <div id="vntexToolboxLandingHub" class="fixed inset-0 z-40 hidden bg-[#020205] flex flex-col justify-between p-6 sm:p-10 overflow-y-auto">
        <div class="max-w-5xl w-full mx-auto flex items-center justify-between border-b border-[#181824] pb-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center font-mono-tech font-extrabold text-sm border border-[#00f2fe]/60 bg-[#06101e] text-[#00f2fe]">VX</div>
            <div>
              <div class="font-extrabold tracking-tight text-base text-white">VNTEX SUITE</div>
              <div class="font-mono-tech text-[10px] text-gray-400">UNIFIED AUDIO DSP &amp; HARMONIC TOOLBOX</div>
            </div>
          </div>
          <button type="button" data-vntex-login-trigger="true" id="landingHubLoginBtn" class="hud-well px-4 py-2 rounded-xl font-mono-tech text-xs font-bold text-white border border-[#00f2fe]/50 hover:border-[#00f2fe] flex items-center gap-2">
            <i class="fa-solid fa-right-to-bracket text-[#00f2fe]"></i>
            <span id="landingHubLoginLabel">Log In</span>
          </button>
        </div>

        <div class="max-w-5xl w-full mx-auto my-auto py-8 space-y-8">
          <div class="text-center space-y-2">
            <div class="font-mono-tech text-xs uppercase tracking-widest text-[#00f2fe]">Select a Studio Module</div>
            <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">VNTEX Production Toolbox</h1>
            <p class="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">Bookmark any individual tool link below to launch directly into that workspace, or use your single VNTEX account across all three engines.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- Tool 1: Converter -->
            <a href="index.html#converter" id="launchConverterCardBtn" class="hud-glass p-6 rounded-2xl border border-[#181824] hover:border-[#00f2fe] transition group flex flex-col justify-between space-y-5 text-left no-underline">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-[#00f2fe]/15 border border-[#00f2fe]/50 flex items-center justify-center text-[#00f2fe] text-xl">
                  <i class="fa-solid fa-bolt"></i>
                </div>
                <h2 class="text-lg font-extrabold text-white">Converter Studio</h2>
                <p class="text-xs text-gray-400 leading-relaxed">Fast Web &amp; CDJ hardware audio transcoding, dynamic BPM range bounds, and batch metadata prep.</p>
              </div>
              <div class="font-mono-tech text-[11px] font-bold text-[#00f2fe] flex items-center justify-between pt-3 border-t border-[#181824]">
                <span>index.html#converter</span>
                <span>Launch →</span>
              </div>
            </a>

            <!-- Tool 2: Harmonic Radar -->
            <a href="radar.html" class="hud-glass p-6 rounded-2xl border border-[#0d2612] hover:border-[#00ff41] transition group flex flex-col justify-between space-y-5 text-left no-underline">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-[#00ff41]/15 border border-[#00ff41]/50 flex items-center justify-center text-[#00ff41] text-xl">
                  <i class="fa-solid fa-compass"></i>
                </div>
                <h2 class="text-lg font-extrabold text-white">Harmonic Radar</h2>
                <p class="text-xs text-gray-400 leading-relaxed">Pitch-black neon green constellation void, Brain % affinity scoring, and persistent multi-branch setlist trees.</p>
              </div>
              <div class="font-mono-tech text-[11px] font-bold text-[#00ff41] flex items-center justify-between pt-3 border-t border-[#181824]">
                <span>radar.html</span>
                <span>Launch →</span>
              </div>
            </a>

            <!-- Tool 3: Bloodstream -->
            <a href="bloodstream.html" class="hud-glass p-6 rounded-2xl border border-[#330000] hover:border-[#FF000D] transition group flex flex-col justify-between space-y-5 text-left no-underline">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-[#FF000D]/15 border border-[#FF000D]/50 flex items-center justify-center text-[#FF000D] text-xl">
                  <i class="fa-solid fa-droplet"></i>
                </div>
                <h2 class="text-lg font-extrabold text-white">Bloodstream Engine</h2>
                <p class="text-xs text-gray-400 leading-relaxed">100% client-side stream compiler, single-song mix isolation, and binary ID3v2.3 APIC cover art embedding.</p>
              </div>
              <div class="font-mono-tech text-[11px] font-bold text-[#FF000D] flex items-center justify-between pt-3 border-t border-[#181824]">
                <span>bloodstream.html</span>
                <span>Launch →</span>
              </div>
            </a>
          </div>
        </div>

        <div class="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#181824] pt-4 font-mono-tech text-[11px] text-gray-500">
          <span>VNTEX Suite // Argon4 Architecture</span>
          <div class="flex items-center gap-4">
            <a href="index.html#admin" class="hover:text-amber-400 transition">Admin Portal (#admin)</a>
            <a href="owner.html" class="hover:text-rose-400 transition">Owner Passcode Link (owner.html)</a>
          </div>
        </div>
      </div>

      <!-- 2. UNIVERSAL LOGIN PROMPT / 5-TAB ACCOUNT HUB MODAL -->
      <div id="vntexUniversalAccountModal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="hud-glass w-full max-w-2xl rounded-2xl overflow-hidden border border-[#2a2b3d] bg-[#08080e] text-white flex flex-col max-h-[88vh]">
          <div class="px-5 py-3.5 border-b border-[#181824] flex items-center justify-between bg-[#050509]">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-id-badge text-[var(--accent-primary)]"></i>
              <h3 id="univModalTitleText" class="text-sm font-bold text-white">Sign In to VNTEX Toolbox</h3>
              <span id="univAcctModePill" class="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">NOT LOGGED IN</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="univSignOutTopBtn" type="button" class="hidden px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white font-mono-tech font-bold text-[11px] transition">
                <i class="fa-solid fa-right-from-bracket mr-1"></i><span>Sign Out</span>
              </button>
              <button id="closeUnivAccountModalBtn" type="button" class="hud-well w-8 h-8 rounded-lg flex items-center justify-center text-xs"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>

          <!-- 5-Tab Bar (Hidden when Not Logged In so user sees a clean Login Prompt instead of a fake profile) -->
          <div id="univAccountTabsBar" class="hidden px-5 pt-3 border-b border-[#181824] bg-[#06060b] flex flex-wrap items-center gap-1.5 pb-2.5 font-mono-tech text-[11px]">
            <button type="button" data-uacct-tab="profile" class="uacct-tab-btn suite-nav-pill active"><i class="fa-regular fa-user"></i><span>Profile</span></button>
            <button type="button" data-uacct-tab="converter" class="uacct-tab-btn suite-nav-pill"><i class="fa-solid fa-bolt"></i><span>Converter</span></button>
            <button type="button" data-uacct-tab="radar" class="uacct-tab-btn suite-nav-pill"><i class="fa-solid fa-compass"></i><span>Radar</span></button>
            <button type="button" data-uacct-tab="bloodstream" class="uacct-tab-btn suite-nav-pill"><i class="fa-solid fa-droplet text-rose-500"></i><span>Bloodstream</span></button>
            <button type="button" data-uacct-tab="permissions" class="uacct-tab-btn suite-nav-pill"><i class="fa-solid fa-shield-halved text-amber-400"></i><span>Permissions</span></button>
          </div>

          <div class="p-5 overflow-y-auto flex-1 text-xs space-y-4">
            <div id="uacctPane-profile" class="uacct-pane space-y-4"></div>
            <div id="uacctPane-converter" class="uacct-pane hidden space-y-3 font-mono-tech"></div>
            <div id="uacctPane-radar" class="uacct-pane hidden space-y-3 font-mono-tech"></div>
            <div id="uacctPane-bloodstream" class="uacct-pane hidden space-y-3 font-mono-tech"></div>
            <div id="uacctPane-permissions" class="uacct-pane hidden space-y-3 font-mono-tech"></div>
          </div>
        </div>
      </div>

      <!-- 3. ADMIN PORTAL MODAL (#admin) -->
      <div id="vntexAdminPortalModal" class="fixed inset-0 z-50 hidden bg-[#020205]/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div class="max-w-6xl w-full mx-auto space-y-4">
          <div class="hud-glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-amber-400/40 bg-[#08080e]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/50 flex items-center justify-center text-amber-400"><i class="fa-solid fa-shield-halved"></i></div>
              <div>
                <h2 class="text-sm font-extrabold text-white uppercase tracking-wider font-mono-tech">VNTEX Admin Portal — Daily Operations &amp; Conversion Monitor</h2>
                <p class="text-[11px] text-gray-400 font-mono-tech">Unauthenticated sessions display as "not logged in" • Sensitive changes are queued for approval</p>
              </div>
            </div>
            <button id="closeAdminPortalModalBtn" type="button" class="hud-well px-3.5 py-1.5 rounded-xl font-mono-tech text-xs text-white">← Back to Toolbox</button>
          </div>
          <div id="adminPortalBodyContent" class="space-y-4"></div>
        </div>
      </div>

      <!-- 4. DEDICATED OWNER PORTAL MODAL (#owner) -->
      <div id="vntexOwnerPortalModal" class="fixed inset-0 z-50 hidden bg-black/95 backdrop-blur-2xl flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div class="max-w-6xl w-full mx-auto space-y-4">
          <div class="hud-glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-rose-500/60 bg-[#0b0205]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400"><i class="fa-solid fa-crown"></i></div>
              <div>
                <h2 class="text-sm font-extrabold text-white uppercase tracking-wider font-mono-tech">VNTEX Owner Command Portal</h2>
                <p class="text-[11px] text-rose-300 font-mono-tech">Direct Passcode Route (owner.html / #owner) • Root Approval Queue</p>
              </div>
            </div>
            <button id="closeOwnerPortalModalBtn" type="button" class="hud-well px-3.5 py-1.5 rounded-xl font-mono-tech text-xs text-white">Exit Owner Portal</button>
          </div>
          <div id="ownerPortalBodyContent" class="space-y-4"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    document.getElementById('closeUnivAccountModalBtn').onclick = () => {
      document.getElementById('vntexUniversalAccountModal').classList.add('hidden');
      if (this.pendingAdminRedirect && !this.isLoggedIn()) {
        this.pendingAdminRedirect = false;
        window.location.hash = '';
        this.showToolboxLandingMenu();
      }
    };
    document.getElementById('univSignOutTopBtn').onclick = () => this.signOut();

    document.getElementById('launchConverterCardBtn')?.addEventListener('click', () => {
      window.location.hash = '#converter';
      document.getElementById('vntexToolboxLandingHub').classList.add('hidden');
    });

    document.querySelectorAll('.uacct-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.uacct-tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.uacct-pane').forEach((p) => p.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(`uacctPane-${btn.getAttribute('data-uacct-tab')}`).classList.remove('hidden');
      };
    });

    document.getElementById('closeAdminPortalModalBtn').onclick = () => {
      document.getElementById('vntexAdminPortalModal').classList.add('hidden');
      if (window.location.hash === '#admin') history.replaceState(null, '', window.location.pathname + '#converter');
    };
    document.getElementById('closeOwnerPortalModalBtn').onclick = () => {
      document.getElementById('vntexOwnerPortalModal').classList.add('hidden');
      if (window.location.hash === '#owner') history.replaceState(null, '', window.location.pathname + '#converter');
    };
  },

  renderUniversalAccountModal(adminGateNotice = '') {
    const loggedIn = this.isLoggedIn();
    const u = this.currentUser;
    const tabsBar = document.getElementById('univAccountTabsBar');
    const signOutBtn = document.getElementById('univSignOutTopBtn');
    const modePill = document.getElementById('univAcctModePill');
    const titleText = document.getElementById('univModalTitleText');

    // Reset to first pane
    document.querySelectorAll('.uacct-pane').forEach((p) => p.classList.add('hidden'));
    document.getElementById('uacctPane-profile').classList.remove('hidden');

    const profilePane = document.getElementById('uacctPane-profile');

    if (!loggedIn) {
      // NOT LOGGED IN: Show clean Login / Create Account Prompt (NO guest profile)
      tabsBar.classList.add('hidden');
      signOutBtn.classList.add('hidden');
      titleText.textContent = 'Sign In or Create VNTEX Account';
      modePill.textContent = 'NOT LOGGED IN';
      modePill.className = 'font-mono-tech text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30';

      profilePane.innerHTML = `
        ${adminGateNotice ? `
          <div class="p-3 rounded-xl bg-amber-400/15 border border-amber-400/50 font-mono-tech text-xs text-amber-300 flex items-center gap-2">
            <i class="fa-solid fa-lock"></i>
            <span>${adminGateNotice}</span>
          </div>
        ` : ''}

        <div class="hud-well p-5 rounded-xl space-y-4 border border-[#2a2b3d]">
          <div class="flex items-center justify-between">
            <span class="font-mono-tech text-xs uppercase font-bold text-[var(--accent-primary)]">Unified VNTEX Toolbox Authentication</span>
            <span class="font-mono-tech text-[10px] text-gray-400">Admin Demo: admin@vntex.io / admin</span>
          </div>

          <button id="univGoogleSignInBtn" type="button" class="w-full py-2.5 px-4 rounded-xl bg-white text-black font-mono-tech font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-95 transition">
            <i class="fa-brands fa-google text-red-500"></i>
            <span>Continue with Google</span>
          </button>

          <div class="text-center font-mono-tech text-[10px] text-gray-500 uppercase">— OR SIGN IN WITH EMAIL —</div>

          <form id="univAuthForm" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthEmail" type="email" required placeholder="Email address..." class="hud-well px-3 py-2.5 rounded-lg text-xs font-mono-tech w-full" />
              <input id="univAuthPass" type="password" required placeholder="Password..." class="hud-well px-3 py-2.5 rounded-lg text-xs font-mono-tech w-full" />
            </div>
            <div id="univSignUpExtraFields" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthFullName" type="text" placeholder="Full Name (Admin Backend Only)" class="hud-well px-3 py-2 rounded-lg text-xs w-full" />
              <input id="univAuthHandle" type="text" placeholder="Public @username" class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full" />
            </div>
            <div id="univAuthErrorMsg" class="hidden font-mono-tech text-[11px] text-rose-400"></div>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label class="flex items-center gap-2 font-mono-tech text-[11px] text-gray-300 cursor-pointer">
                <input id="univAuthIsSignUp" type="checkbox" class="accent-cyan-400" />
                <span>Create a New Account</span>
              </label>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-mono-tech font-extrabold text-xs uppercase">
                Sign In
              </button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('univGoogleSignInBtn').onclick = () => this.signInWithGoogle();
      const chk = document.getElementById('univAuthIsSignUp');
      chk.onchange = () => document.getElementById('univSignUpExtraFields').classList.toggle('hidden', !chk.checked);
      document.getElementById('univAuthForm').onsubmit = (e) => {
        e.preventDefault();
        const res = this.signInWithCredentials(
          document.getElementById('univAuthEmail').value,
          document.getElementById('univAuthPass').value,
          chk.checked,
          document.getElementById('univAuthFullName').value,
          document.getElementById('univAuthHandle').value
        );
        if (!res.ok) {
          const err = document.getElementById('univAuthErrorMsg');
          err.textContent = res.msg;
          err.classList.remove('hidden');
        }
      };
      return;
    }

    // LOGGED IN: Show full 5-Tab Account Hub
    tabsBar.classList.remove('hidden');
    signOutBtn.classList.remove('hidden');
    titleText.textContent = 'VNTEX Toolbox Account Hub';
    modePill.textContent = `${(u.permissions?.tier || 'pro').toUpperCase()} ACCOUNT`;
    modePill.className = 'font-mono-tech text-[10px] px-2 py-0.5 rounded bg-emerald-400/15 text-emerald-300 border border-emerald-400/30';

    const isAdm = Boolean(u.permissions && u.permissions.isAdmin === true);
    profilePane.innerHTML = `
      <div class="hud-well p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <img src="${this.getAvatarSvg(u.avatarId)}" class="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--accent-primary)]" />
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono-tech font-extrabold text-base text-white">${u.username}</span>
              <i class="fa-solid fa-certificate text-[#00f2fe] ${u.verifiedBadge ? '' : 'hidden'}"></i>
            </div>
            <div class="font-mono-tech text-[11px] text-gray-400 mt-0.5">Public Handle • Email &amp; Legal Name Hidden from Public UI</div>
          </div>
        </div>
        <button id="univProfileSignOutBtn" type="button" class="px-3.5 py-2 rounded-xl bg-rose-500 text-white font-mono-tech font-extrabold text-xs uppercase">
          Sign Out
        </button>
      </div>

      ${isAdm ? `
        <button id="openAdminPortalFromProfileBtn" type="button" class="w-full py-2.5 px-4 rounded-xl bg-amber-400 text-black font-mono-tech font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Open Admin Dashboard</span>
        </button>
      ` : ''}

      <form id="univProfileCustForm" class="hud-well p-4 rounded-xl space-y-3.5">
        <div class="font-mono-tech text-[10px] uppercase text-[var(--accent-primary)] font-bold">Customize Profile Identity &amp; Studio Avatar</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="font-mono-tech text-[10px] text-gray-400">Full Name (Admin Backend Only)</label>
            <input id="univCustFullName" type="text" value="${u.fullName || ''}" class="hud-well w-full px-3 py-2 rounded-lg text-xs" />
          </div>
          <div class="space-y-1">
            <label class="font-mono-tech text-[10px] text-gray-400">@username (Public Display)</label>
            <input id="univCustHandle" type="text" value="${u.username || ''}" class="hud-well w-full px-3 py-2 rounded-lg font-mono-tech text-xs" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="font-mono-tech text-[10px] text-gray-400">Choose Profile Picture (5 Default Options)</label>
          <div class="flex items-center gap-3 pt-1">
            ${VNTEX_AVATARS.map((av) => `
              <button type="button" data-univ-avatar="${av.id}" class="avatar-option rounded-xl p-0.5 ${u.avatarId === av.id ? 'selected' : ''}" title="${av.name}">
                <img src="${av.svg}" class="w-11 h-11 rounded-lg block" />
              </button>
            `).join('')}
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-[#181824]">
          <label class="font-mono-tech text-[10px] uppercase text-[var(--accent-primary)] font-bold">UI Theme Preference</label>
          <div class="grid grid-cols-4 gap-2">
            ${Object.entries(CUSTOM_PALETTES).map(([k, p]) => `
              <button type="button" data-univ-pal="${k}" class="hud-well p-2 rounded-xl text-left hover:border-white">
                <div class="font-bold text-[11px] text-white">${p.name}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <span id="univProfileSaveNotice" class="font-mono-tech text-[11px] text-emerald-400"></span>
          <button type="submit" class="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-black font-mono-tech font-extrabold text-xs uppercase">Save Profile</button>
        </div>
      </form>
    `;

    document.getElementById('univProfileSignOutBtn').onclick = () => this.signOut();
    document.getElementById('openAdminPortalFromProfileBtn')?.addEventListener('click', () => {
      document.getElementById('vntexUniversalAccountModal').classList.add('hidden');
      this.openAdminPortalModal();
    });

    profilePane.querySelectorAll('[data-univ-avatar]').forEach((b) => {
      b.onclick = () => {
        this.currentUser.avatarId = b.getAttribute('data-univ-avatar');
        this.persistAuthenticatedUser();
        this.syncHeaderProfileUI();
        this.renderUniversalAccountModal();
      };
    });
    profilePane.querySelectorAll('[data-univ-pal]').forEach((b) => {
      b.onclick = () => this.setUserPalette(b.getAttribute('data-univ-pal'));
    });

    document.getElementById('univProfileCustForm').onsubmit = (e) => {
      e.preventDefault();
      this.currentUser.fullName = document.getElementById('univCustFullName').value.trim();
      let h = document.getElementById('univCustHandle').value.trim() || '@producer';
      if (!h.startsWith('@')) h = `@${h.replace(/\s+/g, '_')}`;
      this.currentUser.username = h;
      this.persistAuthenticatedUser();
      this.syncHeaderProfileUI();
      document.getElementById('univProfileSaveNotice').textContent = '✓ Saved across all tools!';
    };

    document.getElementById('uacctPane-converter').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT PRESET</div><div class="text-xs font-bold text-[#00f2fe] mt-1">FAST WEB</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-white mt-1">Dark + Blue</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">RADAR SYNC</div><div class="text-xs font-bold text-emerald-400 mt-1">Active</div></div>
      </div>
      <a href="index.html#converter" class="block text-center py-2.5 rounded-xl bg-[#00f2fe] text-black font-extrabold text-xs uppercase">Open Converter →</a>
    `;

    document.getElementById('uacctPane-radar').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT LIBRARY</div><div class="text-xs font-bold text-[#00ff41] mt-1">Blank Void</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-[#00ff41] mt-1">Black + Neon Green</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">SUITE SONG IMPORT</div><div class="text-xs font-bold text-white mt-1">Active Near Tree</div></div>
      </div>
      <a href="radar.html" class="block text-center py-2.5 rounded-xl bg-[#00ff41] text-black font-extrabold text-xs uppercase">Open Harmonic Radar →</a>
    `;

    document.getElementById('uacctPane-bloodstream').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DSP ENGINE</div><div class="text-xs font-bold text-[#FF000D] mt-1">100% Web Native</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-[#FF000D] mt-1">Blood Red OLED</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">COVER ART</div><div class="text-xs font-bold text-emerald-400 mt-1">ID3v2.3 APIC ✓</div></div>
      </div>
      <a href="bloodstream.html" class="block text-center py-2.5 rounded-xl bg-[#FF000D] text-black font-extrabold text-xs uppercase">Open Bloodstream →</a>
    `;

    const perms = u.permissions || {};
    document.getElementById('uacctPane-permissions').innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">ACCOUNT TIER</div><div class="font-bold mt-1 text-emerald-400">${(perms.tier || 'PRO').toUpperCase()}</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">CLOUD CRATE SYNC</div><div class="font-bold mt-1 text-emerald-400">ENABLED</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">ROLE</div><div class="font-bold mt-1 ${perms.isAdmin ? 'text-amber-400' : 'text-gray-300'}">${perms.isAdmin ? 'ADMIN' : 'STANDARD'}</div></div>
      </div>
    `;
  },

  // Protected Admin Portal Handler (#admin)
  handleProtectedAdminRoute() {
    if (!this.isLoggedIn()) {
      this.pendingAdminRedirect = true;
      this.openAccountOrLoginModal('Admin Dashboard requires authentication. Please sign in with an Admin account.');
      return;
    }
    if (this.currentUser.permissions && this.currentUser.permissions.isAdmin === true) {
      this.openAdminPortalModal();
    } else {
      alert('Access Denied: You do not have Admin permissions. Redirecting to the VNTEX Toolbox.');
      window.location.hash = '';
      this.showToolboxLandingMenu();
    }
  },

  openAdminPortalModal() {
    this.renderAdminPortalModal();
    document.getElementById('vntexAdminPortalModal').classList.remove('hidden');
  },

  renderAdminPortalModal() {
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    const pending = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]').filter((r) => r.status === 'pending');
    const container = document.getElementById('adminPortalBodyContent');

    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-tech">
        <div class="hud-glass p-4 rounded-xl border border-[#181824]">
          <div class="text-[10px] text-gray-400">REGISTERED ACCOUNTS</div>
          <div class="text-xl font-extrabold text-white mt-1">${db.length} Signed-In Users</div>
        </div>
        <div class="hud-glass p-4 rounded-xl border border-[#181824]">
          <div class="text-[10px] text-gray-400">UNAUTHENTICATED VISITORS</div>
          <div class="text-xl font-extrabold text-rose-400 mt-1">Status: "not logged in"</div>
        </div>
        <div class="hud-glass p-4 rounded-xl border border-[#181824]">
          <div class="text-[10px] text-gray-400">PENDING APPROVALS</div>
          <div class="text-xl font-extrabold text-amber-400 mt-1">${pending.length} Queued</div>
        </div>
      </div>

      <div class="hud-glass p-4 rounded-2xl border border-[#181824] space-y-3">
        <div class="flex items-center justify-between font-mono-tech">
          <span class="text-xs font-bold uppercase text-amber-400">Active Sessions &amp; User Directory</span>
          <span class="text-[11px] text-gray-400">Unauthenticated users appear as "not logged in"</span>
        </div>
        <div id="adminApprovalFeedbackBanner" class="hidden p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/40 font-mono-tech text-xs text-amber-300"></div>

        <!-- Generic Unauthenticated Visitor Row -->
        <div class="hud-well p-3 rounded-xl flex items-center justify-between font-mono-tech text-xs border border-rose-500/30">
          <div>
            <div class="font-bold text-rose-300">not logged in <span class="text-gray-500 font-normal">(Default Unauthenticated State)</span></div>
            <div class="text-[11px] text-gray-400">No profile assigned • Ephemeral local tool access only</div>
          </div>
          <span class="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 text-[10px]">NOT LOGGED IN</span>
        </div>

        <div class="space-y-2">
          ${db.map((u) => `
            <div class="hud-well p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono-tech text-xs">
              <div>
                <div class="font-bold text-white">${u.username} <span class="text-gray-400 font-normal">(${u.fullName})</span></div>
                <div class="text-[11px] text-cyan-400">${u.email} • Tier: <strong class="uppercase text-emerald-400">${u.permissions?.tier || 'pro'}</strong></div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" data-req-tier="${u.email}" data-next-tier="${u.permissions?.tier === 'pro' ? 'free' : 'pro'}" class="hud-well px-3 py-1.5 rounded-lg text-[11px] text-amber-300 border border-amber-400/40">
                  Submit Tier Change → ${u.permissions?.tier === 'pro' ? 'FREE' : 'PRO'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-req-tier]').forEach((btn) => {
      btn.onclick = () => {
        const email = btn.getAttribute('data-req-tier');
        const nextTier = btn.getAttribute('data-next-tier');
        this.submitAdminActionForOwnerApproval('TIER_CHANGE', email, `Set ${email} tier to ${nextTier.toUpperCase()}`, { tier: nextTier });
        const b = document.getElementById('adminApprovalFeedbackBanner');
        b.textContent = `✓ Submitted for approval: Change ${email} tier to ${nextTier.toUpperCase()}.`;
        b.classList.remove('hidden');
      };
    });
  },

  openOwnerPortalModal() {
    document.getElementById('vntexOwnerPortalModal').classList.remove('hidden');
    this.renderOwnerPortalModal();
  },

  renderOwnerPortalModal() {
    const container = document.getElementById('ownerPortalBodyContent');
    if (!this.ownerUnlocked) {
      container.innerHTML = `
        <form id="ownerMasterAuthForm" class="hud-glass max-w-md mx-auto p-6 rounded-2xl border border-rose-500/50 space-y-4 text-center mt-12">
          <i class="fa-solid fa-key text-3xl text-rose-500"></i>
          <h3 class="font-mono-tech font-extrabold text-sm uppercase text-white">Enter Master Owner Passcode</h3>
          <input id="ownerMasterPassInput" type="password" required placeholder="Master Passcode..." class="hud-well w-full px-4 py-2.5 rounded-xl font-mono-tech text-xs text-center text-white" />
          <div id="ownerAuthErr" class="hidden font-mono-tech text-xs text-rose-400">Invalid Master Passcode.</div>
          <button type="submit" class="w-full py-2.5 rounded-xl bg-rose-500 text-white font-mono-tech font-extrabold text-xs uppercase">Unlock Owner Portal</button>
        </form>
      `;
      document.getElementById('ownerMasterAuthForm').onsubmit = (e) => {
        e.preventDefault();
        if (document.getElementById('ownerMasterPassInput').value.trim() === 'Ownr$88!Vntx#Plains92Z') {
          this.ownerUnlocked = true;
          sessionStorage.setItem(VNTEX_KEYS.OWNER_UNLOCKED, 'true');
          this.renderOwnerPortalModal();
        } else {
          document.getElementById('ownerAuthErr').classList.remove('hidden');
        }
      };
      return;
    }

    const approvals = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]').filter((a) => a.status === 'pending');
    container.innerHTML = `
      <div class="hud-glass p-5 rounded-2xl border border-rose-500/40 space-y-3">
        <div class="font-mono-tech text-xs font-extrabold uppercase text-rose-400">Pending Admin Requests (${approvals.length})</div>
        <div class="space-y-2">
          ${approvals.map((req) => `
            <div class="hud-well p-3.5 rounded-xl flex items-center justify-between gap-3 font-mono-tech text-xs">
              <div><div class="font-bold text-white">${req.summaryText}</div><div class="text-[11px] text-gray-400">By ${req.adminActor} • ${req.createdAt}</div></div>
              <div class="flex gap-2">
                <button type="button" data-own-approve="${req.id}" class="px-3 py-1 rounded bg-emerald-400 text-black font-bold">Approve</button>
                <button type="button" data-own-deny="${req.id}" class="px-3 py-1 rounded bg-rose-500 text-white font-bold">Deny</button>
              </div>
            </div>
          `).join('') || `<div class="hud-well p-4 rounded-xl text-center font-mono-tech text-xs text-gray-500">No pending requests awaiting approval.</div>`}
        </div>
      </div>
    `;
    container.querySelectorAll('[data-own-approve]').forEach((b) => { b.onclick = () => this.executeOwnerApprovalDecision(b.getAttribute('data-own-approve'), true); });
    container.querySelectorAll('[data-own-deny]').forEach((b) => { b.onclick = () => this.executeOwnerApprovalDecision(b.getAttribute('data-own-deny'), false); });
  },

  showToolboxLandingMenu() {
    const hub = document.getElementById('vntexToolboxLandingHub');
    if (!hub) return;
    const lbl = document.getElementById('landingHubLoginLabel');
    if (lbl) lbl.textContent = this.isLoggedIn() ? this.currentUser.username : 'Log In';
    hub.classList.remove('hidden');
  },

  evaluateRoutingAndLandingMenu() {
    const applyRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const toolParam = (params.get('tool') || '').toLowerCase();
      const portalParam = (params.get('portal') || '').toLowerCase();
      const passParam = params.get('passcode') || params.get('key') || '';

      if (passParam === 'Ownr$88!Vntx#Plains92Z') {
        this.ownerUnlocked = true;
        sessionStorage.setItem(VNTEX_KEYS.OWNER_UNLOCKED, 'true');
      }

      // 1. Direct Owner Portal Link (#owner or ?portal=owner)
      if (hash === '#owner' || portalParam === 'owner') {
        document.getElementById('vntexToolboxLandingHub')?.classList.add('hidden');
        this.openOwnerPortalModal();
        return;
      }

      // 2. Direct Protected Admin Link (#admin or ?portal=admin)
      if (hash === '#admin' || portalParam === 'admin') {
        document.getElementById('vntexToolboxLandingHub')?.classList.add('hidden');
        this.handleProtectedAdminRoute();
        return;
      }

      // 3. On index.html (Converter host page): Only open Converter if #converter or ?tool=converter is in the link!
      if (this.activeTool === 'converter') {
        if (hash === '#converter' || toolParam === 'converter') {
          document.getElementById('vntexToolboxLandingHub')?.classList.add('hidden');
        } else {
          this.showToolboxLandingMenu();
        }
      }
    };

    window.addEventListener('hashchange', applyRoute);
    applyRoute();
  }
};