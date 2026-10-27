/**
 * VNTEX SUITE CORE ENGINE (Argon4 — Real Firebase Google OAuth & Unified Profile)
 */

const VNTEX_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAN5Om2FeKB8wraQMNKcPho42Yvq60nH8A",
  authDomain: "vntex-e24a5.firebaseapp.com",
  projectId: "vntex-e24a5",
  storageBucket: "vntex-e24a5.firebasestorage.app",
  messagingSenderId: "977209087831",
  appId: "1:977209087831:web:ab22e81f799442164b5012"
};

function makeBase64SvgAvatar(rawSvg) {
  return 'data:image/svg+xml;base64,' + btoa(rawSvg.trim());
}

const VNTEX_AVATARS = [
  { id: 'av_1', name: 'Blue Pulse', svg: makeBase64SvgAvatar('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#06101e"/><circle cx="40" cy="40" r="24" fill="none" stroke="#00f2fe" stroke-width="5"/><circle cx="40" cy="40" r="9" fill="#00f2fe"/></svg>') },
  { id: 'av_2', name: 'Crimson Drop', svg: makeBase64SvgAvatar('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#140003"/><path d="M40 15 C40 15 60 38 60 52 C60 63 51 68 40 68 C29 68 20 63 20 52 C20 38 40 15 40 15 Z" fill="#FF000D"/></svg>') },
  { id: 'av_3', name: 'Neon Radar', svg: makeBase64SvgAvatar('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#021206"/><polygon points="40,14 47,32 66,32 51,44 57,63 40,51 23,63 29,44 14,32 33,32" fill="#00ff41"/></svg>') },
  { id: 'av_4', name: 'Vinyl Gold', svg: makeBase64SvgAvatar('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#140e02"/><circle cx="40" cy="40" r="26" fill="#1f2937" stroke="#f59e0b" stroke-width="4"/><circle cx="40" cy="40" r="10" fill="#f59e0b"/><circle cx="40" cy="40" r="3" fill="#000000"/></svg>') },
  { id: 'av_5', name: 'Violet Wave', svg: makeBase64SvgAvatar('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#0b0414"/><path d="M14 42 Q26 18 40 42 T66 42" fill="none" stroke="#a855f7" stroke-width="6" stroke-linecap="round"/></svg>') }
];

const VNTEX_KEYS = {
  AUTH_USER: 'vntex_core_authenticated_user_v7',
  USERS_DB: 'vntex_core_users_database_v7',
  PENDING_APPROVALS: 'vntex_core_pending_approvals_v7',
  SUITE_SONGS_PREFIX: 'vntex_suite_songs_',
  SUPPORT_TICKETS: 'vntex_core_support_tickets'
};

const TOOL_DEFAULT_PALETTES = {
  menu:        { name: 'Toolbox Menu Blue', void: '#020204', panel: '#0a0a10', well: '#040407', border: '#181824', accent1: '#00f2fe', glow: 'rgba(0, 242, 254, 0.25)' },
  converter:   { name: 'Converter Blue',    void: '#020204', panel: '#0a0a10', well: '#040407', border: '#181824', accent1: '#00f2fe', glow: 'rgba(0, 242, 254, 0.25)' },
  radar:       { name: 'Radar Neon Green',  void: '#000000', panel: '#040804', well: '#020402', border: '#0d2612', accent1: '#00ff41', glow: 'rgba(0, 255, 65, 0.28)' },
  bloodstream: { name: 'Bloodstream Red',   void: '#000000', panel: '#050505', well: '#000000', border: '#330000', accent1: '#FF000D', glow: 'rgba(255, 0, 13, 0.28)' }
};

const CUSTOM_PALETTES = {
  default:  { name: 'Tool Default UI', isToolDefault: true },
  obsidian: { name: 'Studio Blue',     void: '#020204', panel: '#0a0a10', well: '#040407', border: '#181824', accent1: '#00f2fe', glow: 'rgba(0, 242, 254, 0.25)' },
  neon:     { name: 'Neon Green Void', void: '#000000', panel: '#040804', well: '#020402', border: '#0d2612', accent1: '#00ff41', glow: 'rgba(0, 255, 65, 0.28)' },
  blood:    { name: 'Blood Red OLED',  void: '#000000', panel: '#050505', well: '#000000', border: '#330000', accent1: '#FF000D', glow: 'rgba(255, 0, 13, 0.28)' }
};

window.VNTEXCore = {
  currentUser: null,
  activeTool: 'menu',
  firebaseAuth: null,

  async boot(activeToolName) {
    this.activeTool = activeToolName || 'menu';
    await this.ensureFirebaseLoaded();
    this.seedNeutralAdminIfEmpty();
    this.loadSession();
    this.applyActiveToolTheme();
    this.mountUniversalModals();
    this.installGlobalCaptureListeners();
    this.normalizeHeaderLinks();
    this.syncHeaderProfileUI();
  },

  async ensureFirebaseLoaded() {
    const loadScript = (src) => new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });

    try {
      if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
      }
      if (window.firebase && !window.firebase.auth) {
        await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
      }
      if (window.firebase) {
        if (!firebase.apps.length) firebase.initializeApp(VNTEX_FIREBASE_CONFIG);
        if (firebase.auth) this.firebaseAuth = firebase.auth();
      }
    } catch (e) {
      console.warn('Firebase SDK load warning:', e);
    }
  },

  seedNeutralAdminIfEmpty() {
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    if (!db.length) {
      db.push(
        { uid: 'usr_vntex_admin', email: 'admin@vntex.io', password: 'admin', fullName: 'Platform Administrator', username: '@vntex_admin', avatarId: 'av_1', verifiedBadge: true, palette: 'default', permissions: { tier: 'enterprise', rig: true, automation: true, palettes: true, isAdmin: true } },
        { uid: 'usr_sample_pro', email: 'producer@vntex.io', password: 'vntex', fullName: 'Studio Producer', username: '@studio_producer', avatarId: 'av_3', verifiedBadge: false, palette: 'default', permissions: { tier: 'pro', rig: true, automation: true, palettes: true, isAdmin: false } }
      );
      localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
    }
  },

  loadSession() {
    const savedAuth = localStorage.getItem(VNTEX_KEYS.AUTH_USER);
    if (savedAuth) {
      try {
        const u = JSON.parse(savedAuth);
        if (u && u.uid && u.email) {
          if (!VNTEX_AVATARS.some((a) => a.id === u.avatarId)) u.avatarId = 'av_1';
          this.currentUser = u;
          return;
        }
      } catch {}
    }
    this.currentUser = null;
  },

  isLoggedIn() { return Boolean(this.currentUser && this.currentUser.uid && this.currentUser.email); },
  getAvatarSvg(avatarId) { return (VNTEX_AVATARS.find((a) => a.id === avatarId) || VNTEX_AVATARS[0]).svg; },

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

  getIsolatedUserKey() { return this.isLoggedIn() ? ('auth_' + this.currentUser.uid) : null; },

  recordSuiteSong(songObj) {
    const uKey = this.getIsolatedUserKey();
    if (!uKey) return;
    const storageKey = VNTEX_KEYS.SUITE_SONGS_PREFIX + uKey;
    const list = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const cleanTitle = String(songObj.title || 'Untitled Track').trim();
    const cleanArtist = String(songObj.artist || 'Artist').trim();
    if (!list.some((x) => x.title.toLowerCase() === cleanTitle.toLowerCase() && x.artist.toLowerCase() === cleanArtist.toLowerCase())) {
      list.unshift({
        id: 'suite_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        title: cleanTitle, artist: cleanArtist,
        bpm: Number(songObj.bpm) || 124, camelot: songObj.camelot || '8A',
        energy: Number(songObj.energy) || 7, genre: songObj.genre || 'Electronic',
        sourceTool: songObj.sourceTool || this.activeTool, addedAt: new Date().toISOString()
      });
      localStorage.setItem(storageKey, JSON.stringify(list));
    }
  },

  getUnimportedSuiteSongs(currentRadarTracks = []) {
    const uKey = this.getIsolatedUserKey();
    if (!uKey) return [];
    const suiteList = JSON.parse(localStorage.getItem(VNTEX_KEYS.SUITE_SONGS_PREFIX + uKey) || '[]');
    const existingSet = new Set(currentRadarTracks.map((t) => (String(t.title).toLowerCase() + '::' + String(t.artist).toLowerCase())));
    return suiteList.filter((s) => !existingSet.has(s.title.toLowerCase() + '::' + s.artist.toLowerCase()));
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
      if (existing) return { ok: false, msg: 'Account already exists. Uncheck "Create a New Account" to Sign In.' };
      let handle = String(customHandle || ('@' + cleanEmail.split('@')[0])).trim();
      if (!handle.startsWith('@')) handle = '@' + handle.replace(/\s+/g, '_');
      existing = {
        uid: 'usr_' + Date.now(), email: cleanEmail, password: password || 'vntex',
        fullName: fullName || cleanEmail.split('@')[0], username: handle, avatarId: 'av_1',
        verifiedBadge: true, palette: 'default',
        permissions: { tier: 'pro', rig: true, automation: true, palettes: true, isAdmin: cleanEmail === 'admin@vntex.io' }
      };
      db.push(existing);
      localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
    } else {
      if (!existing) return { ok: false, msg: 'Account not found. Check "Create a New Account" below.' };
      if (existing.password && password && existing.password !== password) return { ok: false, msg: 'Incorrect password.' };
    }
    this.completeLoginTransition(existing);
    return { ok: true };
  },

  // True Firebase Google OAuth Popup (Zero prompt() fallback!)
  async signInWithGoogle() {
    const errEl = document.getElementById('univAuthErrorMsg');
    const gBtn = document.getElementById('univGoogleSignInBtn');
    if (errEl) errEl.classList.add('hidden');

    await this.ensureFirebaseLoaded();

    if (!this.firebaseAuth || !window.firebase?.auth?.GoogleAuthProvider) {
      if (errEl) {
        errEl.textContent = 'Firebase Google Auth SDK could not be initialized. Check your network connection.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    try {
      if (gBtn) gBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-red-500"></i><span>Opening Google Sign-In...</span>';
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await this.firebaseAuth.signInWithPopup(provider);
      if (result && result.user) {
        const fbUser = result.user;
        const email = (fbUser.email || 'google_user@vntex.io').toLowerCase();
        const handle = '@' + (fbUser.displayName || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '_');
        const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
        let account = db.find((u) => u.email.toLowerCase() === email);
        if (!account) {
          account = {
            uid: fbUser.uid || ('usr_ggl_' + Date.now()),
            email,
            fullName: fbUser.displayName || email.split('@')[0],
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
      }
    } catch (err) {
      if (gBtn) gBtn.innerHTML = '<i class="fa-brands fa-google text-red-500"></i><span>Continue with Google</span>';
      if (errEl) {
        if (err.code === 'auth/unauthorized-domain') {
          errEl.textContent = 'Domain not authorized in Firebase: Add "' + window.location.hostname + '" in Firebase Console -> Authentication -> Settings -> Authorized domains.';
        } else if (err.code === 'auth/popup-closed-by-user') {
          errEl.textContent = 'Google Sign-In popup was closed before completing login.';
        } else {
          errEl.textContent = 'Google Sign-In error: ' + (err.message || err.code || 'Popup blocked by browser.');
        }
        errEl.classList.remove('hidden');
      }
    }
  },

  completeLoginTransition(account) {
    if (!VNTEX_AVATARS.some((a) => a.id === account.avatarId)) account.avatarId = 'av_1';
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
    this.currentUser = null;
    this.applyActiveToolTheme();
    this.syncHeaderProfileUI();
    this.renderUniversalAccountModal();
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: null } }));
  },

  normalizeHeaderLinks() {
    document.querySelectorAll('header nav a').forEach((a) => {
      if (a.textContent.toLowerCase().includes('converter')) {
        a.setAttribute('href', 'converter.html');
      }
    });
  },

  installGlobalCaptureListeners() {
    document.addEventListener('click', (e) => {
      const acctBtn = e.target.closest('#openAccountHubBtn, #openAccountBtn, [data-vntex-login-trigger]');
      if (acctBtn) {
        e.preventDefault(); e.stopPropagation();
        this.renderUniversalAccountModal();
        document.getElementById('vntexUniversalAccountModal').classList.remove('hidden');
        return;
      }
      const chatBtn = e.target.closest('#openSupportChatBtn, [data-vntex-chat-trigger]');
      if (chatBtn) {
        e.preventDefault(); e.stopPropagation();
        document.getElementById('vntexUniversalChatModal').classList.remove('hidden');
        return;
      }
    }, true);
  },

  syncHeaderProfileUI() {
    const buttons = [document.getElementById('openAccountHubBtn'), document.getElementById('openAccountBtn')].filter(Boolean);
    buttons.forEach((btn) => {
      if (!this.isLoggedIn()) {
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket text-[var(--accent-primary)] text-[11px]"></i><span class="font-mono-tech font-bold">Log In</span>';
      } else {
        const u = this.currentUser;
        const avSrc = this.getAvatarSvg(u.avatarId);
        btn.innerHTML = '<img src="' + avSrc + '" alt="Avatar" class="w-5 h-5 rounded-full object-cover border border-[var(--accent-primary)] shrink-0" /><span class="font-mono-tech font-bold text-white">' + u.username + '</span>' + (u.verifiedBadge ? '<i class="fa-solid fa-certificate text-[#00f2fe] text-[10px]"></i>' : '');
      }
    });
  },

  mountUniversalModals() {
    if (document.getElementById('vntexUniversalAccountModal')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="vntexUniversalAccountModal" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="hud-glass w-full max-w-2xl rounded-2xl overflow-hidden border border-[#2a2b3d] bg-[#08080e] text-white flex flex-col max-h-[88vh]">
          <div class="px-5 py-3.5 border-b border-[#181824] flex items-center justify-between bg-[#050509]">
            <div class="flex items-center gap-2.5">
              <i class="fa-solid fa-id-badge text-[var(--accent-primary)]"></i>
              <h3 id="univModalTitleText" class="text-sm font-bold text-white">Sign In to VNTEX Toolbox</h3>
              <span id="univAcctModePill" class="font-mono-tech text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">NOT LOGGED IN</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="univSignOutTopBtn" type="button" class="hidden px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500 hover:text-white font-mono-tech font-bold text-[11px] cursor-pointer">Sign Out</button>
              <button id="closeUnivAccountModalBtn" type="button" class="hud-well w-8 h-8 rounded-lg flex items-center justify-center text-xs cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
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

      <div id="vntexUniversalChatModal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-end sm:justify-center p-4">
        <div class="hud-glass w-full max-w-md rounded-2xl overflow-hidden border border-[#2a2b3d] bg-[#08080e] text-white flex flex-col h-[460px]">
          <div class="px-4 py-3 border-b border-[#181824] flex items-center justify-between bg-[#050509]">
            <div class="flex items-center gap-2"><i class="fa-solid fa-headset text-[var(--accent-primary)]"></i><h3 class="text-xs font-mono-tech font-bold text-white">VNTEX AI Studio Assistant</h3></div>
            <button id="closeUnivChatModalBtn" type="button" class="hud-well w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div id="univChatMessagesBox" class="flex-1 p-4 overflow-y-auto space-y-2.5 text-xs">
            <div class="hud-well p-3 rounded-xl text-gray-300 leading-relaxed">
              <strong class="text-[var(--accent-primary)]">VNTEX AI Assistant:</strong> Ask me anything about <strong>Converter</strong>, <strong>Harmonic Radar</strong>, or <strong>Bloodstream</strong>!
            </div>
          </div>
          <div class="p-3 border-t border-[#181824] bg-[#050509] space-y-2">
            <form id="univChatForm" class="flex gap-1.5">
              <input id="univChatInput" type="text" required placeholder="Ask a question..." class="hud-well flex-1 px-3 py-2 rounded-xl text-xs text-white" />
              <button type="submit" class="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-black font-mono-tech font-extrabold text-xs cursor-pointer">Send</button>
            </form>
            <button id="univEscalateTicketBtn" type="button" class="w-full py-1.5 rounded-lg hud-well font-mono-tech text-[10px] text-amber-400 cursor-pointer">Submit Support Ticket to Admin/Owner Inbox</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    document.getElementById('closeUnivAccountModalBtn').onclick = () => document.getElementById('vntexUniversalAccountModal').classList.add('hidden');
    document.getElementById('univSignOutTopBtn').onclick = () => this.signOut();
    document.getElementById('closeUnivChatModalBtn').onclick = () => document.getElementById('vntexUniversalChatModal').classList.add('hidden');

    document.querySelectorAll('.uacct-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.uacct-tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.uacct-pane').forEach((p) => p.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById('uacctPane-' + btn.getAttribute('data-uacct-tab')).classList.remove('hidden');
      };
    });

    const chatBox = document.getElementById('univChatMessagesBox');
    document.getElementById('univChatForm').onsubmit = (e) => {
      e.preventDefault();
      const inp = document.getElementById('univChatInput');
      const q = inp.value.trim();
      if (!q) return;
      inp.value = '';
      const uDiv = document.createElement('div');
      uDiv.className = 'p-2.5 rounded-xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/40 text-white text-right ml-8';
      uDiv.textContent = q;
      chatBox.appendChild(uDiv);
      setTimeout(() => {
        const bDiv = document.createElement('div');
        bDiv.className = 'hud-well p-3 rounded-xl text-gray-300 mr-8';
        bDiv.innerHTML = '<strong class="text-[var(--accent-primary)]">VNTEX AI:</strong> Your single profile syncs across index.html, converter.html, radar.html, and bloodstream.html!';
        chatBox.appendChild(bDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
      }, 160);
    };

    document.getElementById('univEscalateTicketBtn').onclick = () => {
      const issue = prompt('Describe your issue for the Support Inbox:');
      if (!issue || !issue.trim()) return;
      const tickets = JSON.parse(localStorage.getItem(VNTEX_KEYS.SUPPORT_TICKETS) || '[]');
      tickets.unshift({ id: 'tkt_' + Date.now(), user: this.isLoggedIn() ? this.currentUser.username : 'not logged in', tool: this.activeTool, message: issue.trim(), createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') });
      localStorage.setItem(VNTEX_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));
      alert('Support ticket submitted to the Admin & Owner Portals.');
    };
  },

  renderUniversalAccountModal() {
    const loggedIn = this.isLoggedIn();
    const u = this.currentUser;
    const tabsBar = document.getElementById('univAccountTabsBar');
    const signOutBtn = document.getElementById('univSignOutTopBtn');
    const modePill = document.getElementById('univAcctModePill');
    const titleText = document.getElementById('univModalTitleText');
    const profilePane = document.getElementById('uacctPane-profile');

    document.querySelectorAll('.uacct-pane').forEach((p) => p.classList.add('hidden'));
    profilePane.classList.remove('hidden');

    if (!loggedIn) {
      tabsBar.classList.add('hidden');
      signOutBtn.classList.add('hidden');
      titleText.textContent = 'Sign In or Create VNTEX Account';
      modePill.textContent = 'NOT LOGGED IN';
      profilePane.innerHTML = `
        <div class="hud-well p-5 rounded-xl space-y-4 border border-[#2a2b3d]">
          <button id="univGoogleSignInBtn" type="button" class="w-full py-2.5 px-4 rounded-xl bg-white text-black font-mono-tech font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-95 transition cursor-pointer">
            <i class="fa-brands fa-google text-red-500"></i><span>Continue with Google</span>
          </button>
          <div class="text-center font-mono-tech text-[10px] text-gray-500 uppercase">— OR SIGN IN WITH EMAIL —</div>
          <form id="univAuthForm" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthEmail" type="email" required placeholder="Email address..." class="hud-well px-3 py-2.5 rounded-lg text-xs font-mono-tech w-full text-white" />
              <input id="univAuthPass" type="password" required placeholder="Password..." class="hud-well px-3 py-2.5 rounded-lg text-xs font-mono-tech w-full text-white" />
            </div>
            <div id="univSignUpExtraFields" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthFullName" type="text" placeholder="Full Name (Private)" class="hud-well px-3 py-2 rounded-lg text-xs w-full text-white" />
              <input id="univAuthHandle" type="text" placeholder="Public @username" class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full text-white" />
            </div>
            <div id="univAuthErrorMsg" class="hidden p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 font-mono-tech text-[11px] text-rose-300 leading-relaxed"></div>
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 font-mono-tech text-[11px] text-gray-300 cursor-pointer">
                <input id="univAuthIsSignUp" type="checkbox" class="accent-cyan-400" /><span>Create a New Account</span>
              </label>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-mono-tech font-extrabold text-xs uppercase cursor-pointer">Sign In</button>
            </div>
          </form>
        </div>
      `;
      document.getElementById('univGoogleSignInBtn').onclick = () => this.signInWithGoogle();
      const chk = document.getElementById('univAuthIsSignUp');
      chk.onchange = () => document.getElementById('univSignUpExtraFields').classList.toggle('hidden', !chk.checked);
      document.getElementById('univAuthForm').onsubmit = (e) => {
        e.preventDefault();
        const res = this.signInWithCredentials(document.getElementById('univAuthEmail').value, document.getElementById('univAuthPass').value, chk.checked, document.getElementById('univAuthFullName').value, document.getElementById('univAuthHandle').value);
        if (!res.ok) { const err = document.getElementById('univAuthErrorMsg'); err.textContent = res.msg; err.classList.remove('hidden'); }
      };
      return;
    }

    tabsBar.classList.remove('hidden');
    signOutBtn.classList.remove('hidden');
    titleText.textContent = 'VNTEX Toolbox Account Hub';
    modePill.textContent = ((u.permissions?.tier || 'pro').toUpperCase()) + ' ACCOUNT';
    const currentAvatarSrc = this.getAvatarSvg(u.avatarId);

    profilePane.innerHTML = `
      <div class="hud-well p-4 rounded-xl flex items-center justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <img src="${currentAvatarSrc}" alt="Avatar" class="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--accent-primary)] block shrink-0" />
          <div>
            <div class="font-mono-tech font-extrabold text-base text-white">${u.username}</div>
            <div class="font-mono-tech text-[11px] text-gray-400">Public Handle • Email &amp; Name Hidden for Privacy</div>
          </div>
        </div>
        <button id="univProfileSignOutBtn" type="button" class="px-3.5 py-2 rounded-xl bg-rose-500 text-white font-mono-tech font-extrabold text-xs uppercase cursor-pointer">Sign Out</button>
      </div>
      <form id="univProfileCustForm" class="hud-well p-4 rounded-xl space-y-3.5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label class="font-mono-tech text-[10px] text-gray-400">Full Name (Private)</label><input id="univCustFullName" type="text" value="${u.fullName || ''}" class="hud-well w-full px-3 py-2 rounded-lg text-xs text-white mt-1" /></div>
          <div><label class="font-mono-tech text-[10px] text-gray-400">@username (Public)</label><input id="univCustHandle" type="text" value="${u.username || ''}" class="hud-well w-full px-3 py-2 rounded-lg font-mono-tech text-xs text-white mt-1" /></div>
        </div>
        <div>
          <label class="font-mono-tech text-[10px] text-gray-400">Choose Studio Avatar (5 Default Options)</label>
          <div class="flex items-center gap-3 pt-1.5">
            ${VNTEX_AVATARS.map((av) => `<button type="button" data-univ-avatar="${av.id}" class="rounded-xl p-1 border-2 cursor-pointer ${u.avatarId === av.id ? 'border-[var(--accent-primary)] scale-105' : 'border-transparent opacity-70'}"><img src="${av.svg}" class="w-11 h-11 rounded-lg block pointer-events-none" /></button>`).join('')}
          </div>
        </div>
        <div class="space-y-2 pt-2 border-t border-[#181824]">
          <label class="font-mono-tech text-[10px] uppercase text-[var(--accent-primary)] font-bold">UI Theme Preference</label>
          <div class="grid grid-cols-4 gap-2">
            ${Object.entries(CUSTOM_PALETTES).map(([k, p]) => `<button type="button" data-univ-pal="${k}" class="hud-well p-2 rounded-xl text-left hover:border-white cursor-pointer"><div class="font-bold text-[11px] text-white">${p.name}</div></button>`).join('')}
          </div>
        </div>
        <div class="flex items-center justify-between pt-1">
          <span id="univProfileSaveNotice" class="font-mono-tech text-[11px] text-emerald-400"></span>
          <button type="submit" class="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-black font-mono-tech font-extrabold text-xs uppercase cursor-pointer">Save Profile</button>
        </div>
      </form>
    `;

    document.getElementById('univProfileSignOutBtn').onclick = () => this.signOut();
    profilePane.querySelectorAll('[data-univ-avatar]').forEach((b) => {
      b.onclick = () => { this.currentUser.avatarId = b.getAttribute('data-univ-avatar'); this.persistAuthenticatedUser(); this.syncHeaderProfileUI(); this.renderUniversalAccountModal(); };
    });
    profilePane.querySelectorAll('[data-univ-pal]').forEach((b) => {
      b.onclick = () => this.setUserPalette(b.getAttribute('data-univ-pal'));
    });
    document.getElementById('univProfileCustForm').onsubmit = (e) => {
      e.preventDefault();
      this.currentUser.fullName = document.getElementById('univCustFullName').value.trim();
      let h = document.getElementById('univCustHandle').value.trim() || '@producer';
      if (!h.startsWith('@')) h = '@' + h.replace(/\s+/g, '_');
      this.currentUser.username = h;
      this.persistAuthenticatedUser(); this.syncHeaderProfileUI();
      document.getElementById('univProfileSaveNotice').textContent = '✓ Saved!';
    };

    document.getElementById('uacctPane-converter').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT PRESET</div><div class="text-xs font-bold text-[#00f2fe] mt-1">FAST WEB</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-white mt-1">Dark + Blue</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">RADAR SYNC</div><div class="text-xs font-bold text-emerald-400 mt-1">Active</div></div>
      </div>
      <a href="converter.html" class="block text-center py-2.5 rounded-xl bg-[#00f2fe] text-black font-extrabold text-xs uppercase no-underline">Open Converter Studio →</a>
    `;
    document.getElementById('uacctPane-radar').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT LIBRARY</div><div class="text-xs font-bold text-[#00ff41] mt-1">Blank Void</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-[#00ff41] mt-1">Black + Neon Green</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">SUITE SONG IMPORT</div><div class="text-xs font-bold text-white mt-1">Active Near Tree</div></div>
      </div>
      <a href="radar.html" class="block text-center py-2.5 rounded-xl bg-[#00ff41] text-black font-extrabold text-xs uppercase no-underline">Open Harmonic Radar →</a>
    `;
    document.getElementById('uacctPane-bloodstream').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">AUDIO ENGINE</div><div class="text-xs font-bold text-[#FF000D] mt-1">Clean 1152-Frame</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT THEME</div><div class="text-xs font-bold text-[#FF000D] mt-1">Blood Red OLED</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">COVER ART</div><div class="text-xs font-bold text-emerald-400 mt-1">ID3v2.3 APIC ✓</div></div>
      </div>
      <a href="bloodstream.html" class="block text-center py-2.5 rounded-xl bg-[#FF000D] text-black font-extrabold text-xs uppercase no-underline">Open Bloodstream →</a>
    `;
    const perms = u.permissions || {};
    document.getElementById('uacctPane-permissions').innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">TIER</div><div class="font-bold text-emerald-400 mt-1">${(perms.tier || 'PRO').toUpperCase()}</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">CLOUD SYNC</div><div class="font-bold text-emerald-400 mt-1">ENABLED</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">ROLE</div><div class="font-bold text-white mt-1">${perms.isAdmin ? 'ADMIN' : 'PRODUCER'}</div></div>
      </div>
    `;
  }
};
