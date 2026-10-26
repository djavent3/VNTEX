/**
 * VNTEX SUITE CORE ENGINE (Argon4)
 * - Single Unified Profile across Converter, Radar, and Bloodstream
 * - Google Login + Email/Password Account Creation & Sign Out
 * - Tool-Specific Default UIs for Non-Logged-In Users:
 *     * Radar: Pitch-black void (#000000) + Neon Green (#00ff41)
 *     * Bloodstream: Blood-red theme (#000000 / #050505 / #FF000D)
 *     * Converter: Original dark theme (#020204 / #0a0a10) + Blue/Cyan (#00f2fe)
 * - Cross-Tool Song Queue for Radar's "Load Suite Songs" button
 */

const VNTEX_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAN5Om2FeKB8wraQMNKcPho42Yvq60nH8A",
  authDomain: "vntex-e24a5.firebaseapp.com",
  projectId: "vntex-e24a5",
  storageBucket: "vntex-e24a5.firebasestorage.app",
  messagingSenderId: "977209087831",
  appId: "1:977209087831:web:ab22e81f799442164b5012"
};

const VNTEX_GUEST_POOL_25 = [
  '@guest_vortex', '@guest_nova', '@guest_pulse', '@guest_cipher', '@guest_drift',
  '@guest_zenith', '@guest_flux', '@guest_onyx', '@guest_prism', '@guest_quark',
  '@guest_vector', '@guest_solaris', '@guest_mirage', '@guest_cobalt', '@guest_argon',
  '@guest_helix', '@guest_kronos', '@guest_nexus', '@guest_stratos', '@guest_vela',
  '@guest_lyra', '@guest_orion', '@guest_hyperion', '@guest_kilo', '@guest_echo'
];

const VNTEX_AVATARS = [
  { id: 'av_guest', name: 'Guest Default', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%2312131c"/><circle cx="40" cy="30" r="12" fill="%23505266"/><path d="M20 66 C20 50 60 50 60 66" fill="%23505266"/></svg>` },
  { id: 'av_1', name: 'Blue Pulse', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%2306101e"/><circle cx="40" cy="40" r="24" fill="none" stroke="%2300f2fe" stroke-width="4"/><circle cx="40" cy="40" r="8" fill="%2300f2fe"/></svg>` },
  { id: 'av_2', name: 'Crimson Drop', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23140003"/><path d="M40 16 C40 16 60 38 60 52 C60 63 51 68 40 68 C29 68 20 63 20 52 C20 38 40 16 40 16 Z" fill="%23FF000D"/></svg>` },
  { id: 'av_3', name: 'Neon Radar', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23021206"/><polygon points="40,14 47,32 66,32 51,44 57,63 40,51 23,63 29,44 14,32 33,32" fill="%2300ff41"/></svg>` },
  { id: 'av_4', name: 'Amber Gold', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23140e02"/><circle cx="40" cy="40" r="26" fill="%231f2937" stroke="%23f59e0b" stroke-width="3"/><circle cx="40" cy="40" r="10" fill="%23f59e0b"/><circle cx="40" cy="40" r="3" fill="%23000"/></svg>` },
  { id: 'av_5', name: 'Violet Wave', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%230b0414"/><path d="M14 42 Q26 20 40 42 T66 42" fill="none" stroke="%23a855f7" stroke-width="6" stroke-linecap="round"/></svg>` }
];

const VNTEX_KEYS = {
  AUTH_USER: 'vntex_core_authenticated_user_v2',
  GUEST_SESSION: 'vntex_core_guest_session_v2',
  USERS_DB: 'vntex_core_users_database_v2',
  PENDING_APPROVALS: 'vntex_core_pending_approvals_v2',
  OWNER_UNLOCKED: 'vntex_core_owner_session_unlocked',
  SUITE_SONGS_PREFIX: 'vntex_suite_songs_',
  RADAR_WIPE_FLAG: 'vntex_radar_legacy_wiped_v2'
};

// Tool-Specific Default Palettes (Used automatically for non-logged-in users or "default" theme setting)
const TOOL_DEFAULT_PALETTES = {
  converter: {
    name: 'Converter Blue (Default)',
    void: '#020204',
    panel: '#0a0a10',
    well: '#040407',
    border: '#181824',
    accent1: '#00f2fe',
    accent2: '#4facfe',
    glow: 'rgba(0, 242, 254, 0.25)'
  },
  radar: {
    name: 'Radar Neon Green Void (Default)',
    void: '#000000',
    panel: '#040804',
    well: '#020402',
    border: '#0d2612',
    accent1: '#00ff41',
    accent2: '#10b981',
    glow: 'rgba(0, 255, 65, 0.28)'
  },
  bloodstream: {
    name: 'Bloodstream Red (Default)',
    void: '#000000',
    panel: '#050505',
    well: '#000000',
    border: '#330000',
    accent1: '#FF000D',
    accent2: '#ff333d',
    glow: 'rgba(255, 0, 13, 0.28)'
  }
};

const CUSTOM_PALETTES = {
  default:  { name: 'Tool Default UI', isToolDefault: true },
  obsidian: { name: 'Studio Blue',     void: '#020204', panel: '#0a0a10', well: '#040407', border: '#181824', accent1: '#00f2fe', glow: 'rgba(0, 242, 254, 0.25)' },
  neon:     { name: 'Neon Green Void', void: '#000000', panel: '#040804', well: '#020402', border: '#0d2612', accent1: '#00ff41', glow: 'rgba(0, 255, 65, 0.28)' },
  blood:    { name: 'Blood Red OLED',  void: '#000000', panel: '#050505', well: '#000000', border: '#330000', accent1: '#FF000D', glow: 'rgba(255, 0, 13, 0.28)' }
};

window.VNTEXCore = {
  currentUser: null,
  activeTool: 'converter',
  ownerUnlocked: sessionStorage.getItem(VNTEX_KEYS.OWNER_UNLOCKED) === 'true',
  firebaseAuth: null,

  async boot(activeToolName) {
    this.activeTool = activeToolName || 'converter';
    this.initFirebaseIfAvailable();
    await this.purgeLegacyPersonalAndLeakedData();
    this.seedNeutralAdminIfEmpty();
    this.loadOrAssignSession();
    this.applyActiveToolTheme();
    this.mountUniversalModals();
    this.hijackAccountButtons();
    this.syncHeaderProfileUI();
    this.bindGlobalShortcutsAndRoutes();
  },

  initFirebaseIfAvailable() {
    try {
      if (window.firebase) {
        if (!firebase.apps.length) firebase.initializeApp(VNTEX_FIREBASE_CONFIG);
        if (firebase.auth) this.firebaseAuth = firebase.auth();
      }
    } catch {}
  },

  // Scrubs any old localStorage keys containing personal names or unauthenticated XML caches
  async purgeLegacyPersonalAndLeakedData() {
    if (localStorage.getItem(VNTEX_KEYS.RADAR_WIPE_FLAG) === 'true') return;

    const legacyKeysToRemove = [
      'vntex_core_session_user',
      'vntex_core_authenticated_user',
      'vntex_core_users_database',
      'vntex_core_users_registry',
      'vntex_core_active_palette'
    ];
    legacyKeysToRemove.forEach((k) => localStorage.removeItem(k));

    await new Promise((res) => {
      try {
        const req = indexedDB.open('VNTEX_CloudCache_IDB', 1);
        req.onupgradeneeded = (e) => {
          if (!e.target.result.objectStoreNames.contains('kv')) e.target.result.createObjectStore('kv');
        };
        req.onsuccess = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('kv')) return res(true);
          const tx = db.transaction('kv', 'readwrite');
          tx.objectStore('kv').clear(); // Wipes any cached personal XML libraries from default/guest state
          tx.oncomplete = () => res(true);
          tx.onerror = () => res(false);
        };
        req.onerror = () => res(false);
      } catch {
        res(false);
      }
    });

    localStorage.setItem(VNTEX_KEYS.RADAR_WIPE_FLAG, 'true');
  },

  seedNeutralAdminIfEmpty() {
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

  loadOrAssignSession() {
    const savedAuth = localStorage.getItem(VNTEX_KEYS.AUTH_USER);
    if (savedAuth) {
      try {
        const u = JSON.parse(savedAuth);
        if (u && u.uid && !u.isGuest) {
          this.currentUser = u;
          return;
        }
      } catch {}
    }

    let guestSession = sessionStorage.getItem(VNTEX_KEYS.GUEST_SESSION);
    if (guestSession) {
      try {
        this.currentUser = JSON.parse(guestSession);
        return;
      } catch {}
    }

    const randomHandle = VNTEX_GUEST_POOL_25[Math.floor(Math.random() * VNTEX_GUEST_POOL_25.length)];
    this.currentUser = {
      uid: 'guest_' + Math.random().toString(36).slice(2, 8),
      isGuest: true,
      fullName: 'Guest User',
      email: '',
      username: randomHandle,
      avatarId: 'av_guest',
      verifiedBadge: false,
      palette: 'default',
      permissions: { tier: 'free', rig: false, automation: false, palettes: false, isAdmin: false }
    };
    sessionStorage.setItem(VNTEX_KEYS.GUEST_SESSION, JSON.stringify(this.currentUser));
  },

  // Applies the tool's signature default UI for non-logged-in users (or when palette is 'default')
  applyActiveToolTheme() {
    const u = this.currentUser;
    const userChoice = (!u || u.isGuest) ? 'default' : (u.palette || 'default');
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
    if (!this.currentUser || this.currentUser.isGuest) return;
    this.currentUser.palette = palKey;
    this.persistAuthenticatedUser();
    this.applyActiveToolTheme();
  },

  getAvatarSvg(avatarId) {
    if (!this.currentUser || this.currentUser.isGuest) return VNTEX_AVATARS[0].svg;
    return (VNTEX_AVATARS.find((a) => a.id === avatarId) || VNTEX_AVATARS[1]).svg;
  },

  getIsolatedUserKey() {
    if (!this.currentUser || this.currentUser.isGuest || !this.currentUser.uid) return null;
    return `auth_${this.currentUser.uid}`;
  },

  // Stores songs processed in Converter or Bloodstream under the logged-in user's account so Radar can import them
  recordSuiteSong(songObj) {
    const uKey = this.getIsolatedUserKey();
    if (!uKey) return; // Guests do not persist cross-tool library data
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
    if (!this.currentUser || this.currentUser.isGuest) return;
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
      if (existing) return { ok: false, msg: 'Account already exists. Uncheck "Create New Account" to Sign In.' };
      let handle = String(customHandle || `@${cleanEmail.split('@')[0]}`).trim();
      if (!handle.startsWith('@')) handle = `@${handle.replace(/\s+/g, '_')}`;
      existing = {
        uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        isGuest: false,
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
      if (!existing) return { ok: false, msg: 'Account not found. Check "Create a New Account" below to register.' };
      if (existing.password && password && existing.password !== password) {
        return { ok: false, msg: 'Incorrect password.' };
      }
    }

    existing.isGuest = false;
    this.currentUser = existing;
    localStorage.setItem(VNTEX_KEYS.AUTH_USER, JSON.stringify(existing));
    this.applyActiveToolTheme();
    this.syncHeaderProfileUI();
    this.renderUniversalAccountModal();
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: existing } }));
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
              isGuest: false,
              email,
              fullName: fbUser.displayName || 'Google Producer',
              username: handle,
              avatarId: 'av_1',
              verifiedBadge: true,
              palette: 'default',
              permissions: { tier: 'pro', rig: true, automation: true, palettes: true, isAdmin: email === 'admin@vntex.io' }
            };
            db.push(account);
            localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
          }
          account.isGuest = false;
          this.currentUser = account;
          localStorage.setItem(VNTEX_KEYS.AUTH_USER, JSON.stringify(account));
          this.applyActiveToolTheme();
          this.syncHeaderProfileUI();
          this.renderUniversalAccountModal();
          window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: account } }));
          return;
        }
      } catch (err) {
        // Fallback when testing on local filesystem or unwhitelisted preview domain
      }
    }

    const gEmail = prompt('Google OAuth Account Email (e.g. yourname@gmail.com):');
    if (!gEmail || !gEmail.includes('@')) return;
    const clean = gEmail.trim().toLowerCase();
    const handle = `@${clean.split('@')[0].replace(/[^a-z0-9]/g, '_')}`;
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    let account = db.find((u) => u.email.toLowerCase() === clean);
    if (!account) {
      account = {
        uid: 'usr_ggl_' + Date.now(),
        isGuest: false,
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
    account.isGuest = false;
    this.currentUser = account;
    localStorage.setItem(VNTEX_KEYS.AUTH_USER, JSON.stringify(account));
    this.applyActiveToolTheme();
    this.syncHeaderProfileUI();
    this.renderUniversalAccountModal();
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: account } }));
  },

  signOut() {
    try { if (this.firebaseAuth) this.firebaseAuth.signOut(); } catch {}
    localStorage.removeItem(VNTEX_KEYS.AUTH_USER);
    sessionStorage.removeItem(VNTEX_KEYS.GUEST_SESSION);
    sessionStorage.removeItem(VNTEX_KEYS.OWNER_UNLOCKED);
    this.ownerUnlocked = false;
    this.loadOrAssignSession();
    this.applyActiveToolTheme();
    this.syncHeaderProfileUI();
    this.renderUniversalAccountModal();
    if (window.location.hash === '#admin' || window.location.hash === '#owner') {
      history.replaceState(null, '', window.location.pathname);
    }
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: this.currentUser } }));
  },

  // Ensures clicking the Account button in Converter, Radar, or Bloodstream ALWAYS opens the identical Universal Account Modal
  hijackAccountButtons() {
    const legacyModal = document.getElementById('accountModal');
    if (legacyModal) legacyModal.remove();

    ['openAccountHubBtn', 'openAccountBtn'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.renderUniversalAccountModal();
          document.getElementById('vntexUniversalAccountModal').classList.remove('hidden');
        });
      }
    });
  },

  syncHeaderProfileUI() {
    const u = this.currentUser;
    const nameEl = document.getElementById('userStatusName') || document.getElementById('headerAccountLabel');
    const imgEl = document.getElementById('headerUserAvatarImg');
    const badgeEl = document.getElementById('userVerifiedBadge') || document.getElementById('headerVerifiedBadge');

    if (nameEl) nameEl.textContent = u.username;
    if (imgEl) imgEl.src = this.getAvatarSvg(u.avatarId);
    if (badgeEl) badgeEl.classList.toggle('hidden', !u.verifiedBadge || u.isGuest);
  },

  submitAdminActionForOwnerApproval(actionType, targetUserEmail, summaryText, payload) {
    const list = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]');
    list.unshift({
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      adminActor: this.currentUser ? this.currentUser.username : '@vntex_admin',
      actionType,
      targetUserEmail,
      summaryText,
      payload,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });
    localStorage.setItem(VNTEX_KEYS.PENDING_APPROVALS, JSON.stringify(list));
  },

  executeOwnerApprovalDecision(reqId, approve) {
    const list = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]');
    const req = list.find((r) => r.id === reqId);
    if (!req) return;
    req.status = approve ? 'approved' : 'denied';

    if (approve && req.payload) {
      const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
      const idx = db.findIndex((u) => u.email.toLowerCase() === String(req.targetUserEmail || '').toLowerCase());
      if (idx >= 0) {
        if (req.actionType === 'TIER_CHANGE') db[idx].permissions.tier = req.payload.tier;
        if (req.actionType === 'VERIFY_TOGGLE') db[idx].verifiedBadge = req.payload.verifiedBadge;
        localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
      }
    }
    localStorage.setItem(VNTEX_KEYS.PENDING_APPROVALS, JSON.stringify(list));
    this.renderOwnerPortalModal();
  },

  mountUniversalModals() {
    if (document.getElementById('vntexUniversalAccountModal')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <!-- UNIVERSAL 5-TAB ACCOUNT HUB MODAL -->
      <div id="vntexUniversalAccountModal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="hud-glass w-full max-w-2xl rounded-2xl overflow-hidden border border-[#2a2b3d] bg-[#08080e] text-white flex flex-col max-h-[88vh]">
          <div class="px-5 py-3.5 border-b border-[#181824] flex items-center justify-between bg-[#050509]">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-id-badge text-[var(--accent-primary)]"></i>
              <h3 class="text-sm font-bold text-white">VNTEX Toolbox Account Hub</h3>
              <span id="univAcctModePill" class="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300">GUEST</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="univSignOutTopBtn" type="button" class="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white font-mono-tech font-bold text-[11px] transition">
                <i class="fa-solid fa-right-from-bracket mr-1"></i><span id="univSignOutBtnLabel">Sign Out</span>
              </button>
              <button id="closeUnivAccountModalBtn" type="button" class="hud-well w-8 h-8 rounded-lg flex items-center justify-center text-xs"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>

          <div class="px-5 pt-3 border-b border-[#181824] bg-[#06060b] flex flex-wrap items-center gap-1.5 pb-2.5 font-mono-tech text-[11px]">
            <button type="button" data-uacct-tab="profile" class="uacct-tab-btn suite-nav-pill active"><i class="fa-regular fa-user"></i><span>Account Info</span></button>
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

      <!-- ADMIN PORTAL MODAL (#admin) -->
      <div id="vntexAdminPortalModal" class="fixed inset-0 z-50 hidden bg-[#020205]/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div class="max-w-6xl w-full mx-auto space-y-4">
          <div class="hud-glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-amber-400/40 bg-[#08080e]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/50 flex items-center justify-center text-amber-400"><i class="fa-solid fa-shield-halved"></i></div>
              <div>
                <h2 class="text-sm font-extrabold text-white uppercase tracking-wider font-mono-tech">VNTEX Admin Portal — Daily Operations &amp; Conversion Monitor</h2>
                <p class="text-[11px] text-gray-400 font-mono-tech">Role: Platform Admin • Account &amp; tier modifications are queued for approval.</p>
              </div>
            </div>
            <button id="closeAdminPortalModalBtn" type="button" class="hud-well px-3.5 py-1.5 rounded-xl font-mono-tech text-xs text-white">← Back to Toolbox</button>
          </div>
          <div id="adminPortalBodyContent" class="space-y-4"></div>
        </div>
      </div>

      <!-- HIDDEN MASTER OWNER PORTAL (#owner) -->
      <div id="vntexOwnerPortalModal" class="fixed inset-0 z-50 hidden bg-black/95 backdrop-blur-2xl flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div class="max-w-6xl w-full mx-auto space-y-4">
          <div class="hud-glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-rose-500/60 bg-[#0b0205]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400"><i class="fa-solid fa-crown"></i></div>
              <div>
                <h2 class="text-sm font-extrabold text-white uppercase tracking-wider font-mono-tech">VNTEX Owner Command Portal</h2>
                <p class="text-[11px] text-rose-300 font-mono-tech">Root Approval Queue &amp; Full User Registry</p>
              </div>
            </div>
            <button id="closeOwnerPortalModalBtn" type="button" class="hud-well px-3.5 py-1.5 rounded-xl font-mono-tech text-xs text-white">Exit Owner Portal</button>
          </div>
          <div id="ownerPortalBodyContent" class="space-y-4"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    document.getElementById('closeUnivAccountModalBtn').onclick = () => document.getElementById('vntexUniversalAccountModal').classList.add('hidden');
    document.getElementById('univSignOutTopBtn').onclick = () => this.signOut();

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
      if (window.location.hash === '#admin') history.replaceState(null, '', window.location.pathname);
    };
    document.getElementById('closeOwnerPortalModalBtn').onclick = () => {
      document.getElementById('vntexOwnerPortalModal').classList.add('hidden');
      if (window.location.hash === '#owner') history.replaceState(null, '', window.location.pathname);
    };
  },

  renderUniversalAccountModal() {
    const u = this.currentUser;
    const isGuest = Boolean(u.isGuest);
    document.getElementById('univAcctModePill').textContent = isGuest ? 'GUEST SESSION (25-POOL)' : `${(u.permissions?.tier || 'pro').toUpperCase()} ACCOUNT`;
    document.getElementById('univSignOutBtnLabel').textContent = isGuest ? 'New Guest ID' : 'Sign Out';

    const profilePane = document.getElementById('uacctPane-profile');

    if (isGuest) {
      profilePane.innerHTML = `
        <div class="hud-well p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-white/10">
          <div class="flex items-center gap-3.5">
            <img src="${this.getAvatarSvg('av_guest')}" class="w-14 h-14 rounded-2xl border border-gray-600" />
            <div>
              <div class="font-mono-tech font-extrabold text-base text-white">${u.username}</div>
              <div class="font-mono-tech text-[11px] text-gray-400 mt-0.5">Basic Guest Session • Sign in to save libraries, crates &amp; profile settings</div>
            </div>
          </div>
        </div>

        <div class="hud-well p-4 rounded-xl space-y-3.5 border border-[#2a2b3d]">
          <div class="flex items-center justify-between">
            <span class="font-mono-tech text-[11px] uppercase font-bold text-[var(--accent-primary)]">Sign In or Create VNTEX Account</span>
            <span class="font-mono-tech text-[10px] text-gray-400">Admin Demo: admin@vntex.io / admin</span>
          </div>

          <button id="univGoogleSignInBtn" type="button" class="w-full py-2.5 px-4 rounded-xl bg-white text-black font-mono-tech font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-95 transition">
            <i class="fa-brands fa-google text-red-500"></i>
            <span>Continue with Google</span>
          </button>

          <div class="text-center font-mono-tech text-[10px] text-gray-500 uppercase">— OR EMAIL &amp; PASSWORD —</div>

          <form id="univAuthForm" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthEmail" type="email" required placeholder="Email address..." class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full" />
              <input id="univAuthPass" type="password" required placeholder="Password..." class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full" />
            </div>
            <div id="univSignUpExtraFields" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthFullName" type="text" placeholder="Full Name (Private)" class="hud-well px-3 py-2 rounded-lg text-xs w-full" />
              <input id="univAuthHandle" type="text" placeholder="Public @username" class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full" />
            </div>
            <div id="univAuthErrorMsg" class="hidden font-mono-tech text-[11px] text-rose-400"></div>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label class="flex items-center gap-2 font-mono-tech text-[11px] text-gray-300 cursor-pointer">
                <input id="univAuthIsSignUp" type="checkbox" class="accent-cyan-400" />
                <span>Create a New Account</span>
              </label>
              <button type="submit" class="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-black font-mono-tech font-extrabold text-xs uppercase">
                Continue
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
    } else {
      const isAdm = Boolean(u.permissions && u.permissions.isAdmin === true);
      const selectableAvatars = VNTEX_AVATARS.slice(1);
      profilePane.innerHTML = `
        <div class="hud-well p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <img src="${this.getAvatarSvg(u.avatarId)}" class="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--accent-primary)]" />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono-tech font-extrabold text-base text-white">${u.username}</span>
                <i class="fa-solid fa-certificate verified-badge-icon ${u.verifiedBadge ? '' : 'hidden'}"></i>
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
            <span>Open Admin Portal</span>
          </button>
        ` : ''}

        <form id="univProfileCustForm" class="hud-well p-4 rounded-xl space-y-3.5">
          <div class="font-mono-tech text-[10px] uppercase text-[var(--accent-primary)] font-bold">Unified Profile Identity &amp; Studio Avatar</div>
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
              ${selectableAvatars.map((av) => `
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
    }

    document.getElementById('uacctPane-converter').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT PRESET</div><div class="text-xs font-bold text-[#00f2fe] mt-1">FAST WEB</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-white mt-1">Dark + Blue</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">RADAR SYNC</div><div class="text-xs font-bold text-emerald-400 mt-1">${isGuest ? 'Sign In Required' : 'Ready'}</div></div>
      </div>
      <a href="index.html" class="block text-center py-2.5 rounded-xl bg-[#00f2fe] text-black font-extrabold text-xs uppercase">Open Converter →</a>
    `;

    document.getElementById('uacctPane-radar').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT LIBRARY</div><div class="text-xs font-bold text-[#00ff41] mt-1">Blank Void</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-[#00ff41] mt-1">Black + Neon Green</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">SUITE SONG IMPORT</div><div class="text-xs font-bold text-white mt-1">${isGuest ? 'Locked (Guest)' : 'Active Near Tree'}</div></div>
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
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">ACCOUNT STATUS</div><div class="font-bold mt-1 ${isGuest ? 'text-amber-400' : 'text-emerald-400'}">${isGuest ? 'GUEST (25-POOL)' : (perms.tier || 'PRO').toUpperCase()}</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">CLOUD CRATE SYNC</div><div class="font-bold mt-1 ${!isGuest ? 'text-emerald-400' : 'text-gray-500'}">${!isGuest ? 'ENABLED' : 'LOCKED'}</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">CROSS-TOOL IMPORT</div><div class="font-bold mt-1 ${!isGuest ? 'text-emerald-400' : 'text-gray-500'}">${!isGuest ? 'ENABLED' : 'LOCKED'}</div></div>
      </div>
    `;
  },

  openAdminPortalModal() {
    if (!this.currentUser || this.currentUser.isGuest || !this.currentUser.permissions?.isAdmin) {
      alert('Admin Portal requires a designated Admin account (Sign in with admin@vntex.io / admin).');
      return;
    }
    this.renderAdminPortalModal();
    document.getElementById('vntexAdminPortalModal').classList.remove('hidden');
  },

  renderAdminPortalModal() {
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    const pending = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]').filter((r) => r.status === 'pending');
    const container = document.getElementById('adminPortalBodyContent');
    container.innerHTML = `
      <div class="hud-glass p-4 rounded-2xl border border-[#181824] space-y-3">
        <div class="flex items-center justify-between font-mono-tech">
          <span class="text-xs font-bold uppercase text-amber-400">User Directory &amp; Change Request Queue (${pending.length} Pending Approval)</span>
          <span class="text-[11px] text-gray-400">Admin changes are submitted for approval</span>
        </div>
        <div id="adminApprovalFeedbackBanner" class="hidden p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/40 font-mono-tech text-xs text-amber-300"></div>
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
          <h3 class="font-mono-tech font-extrabold text-sm uppercase text-white">Enter Master Owner Passkey</h3>
          <input id="ownerMasterPassInput" type="password" required placeholder="Master Owner Code..." class="hud-well w-full px-4 py-2.5 rounded-xl font-mono-tech text-xs text-center text-white" />
          <div id="ownerAuthErr" class="hidden font-mono-tech text-xs text-rose-400">Invalid Passkey.</div>
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
          `).join('') || `<div class="hud-well p-4 rounded-xl text-center font-mono-tech text-xs text-gray-500">No pending requests.</div>`}
        </div>
      </div>
    `;
    container.querySelectorAll('[data-own-approve]').forEach((b) => { b.onclick = () => this.executeOwnerApprovalDecision(b.getAttribute('data-own-approve'), true); });
    container.querySelectorAll('[data-own-deny]').forEach((b) => { b.onclick = () => this.executeOwnerApprovalDecision(b.getAttribute('data-own-deny'), false); });
  },

  bindGlobalShortcutsAndRoutes() {
    const checkHash = () => {
      if (window.location.hash === '#admin') this.openAdminPortalModal();
      if (window.location.hash === '#owner') this.openOwnerPortalModal();
    };
    window.addEventListener('hashchange', checkHash);
    checkHash();
  }
};