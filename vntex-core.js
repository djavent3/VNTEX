/**
 * VNTEX SUITE CORE ENGINE (Argon4)
 * Unified Single Profile, 25-Guest Pool, Strict Library Isolation,
 * Universal Sliders Header, 5-Tab Account Hub, Admin Portal (#admin) & Hidden Owner Portal (#owner)
 */

const VNTEX_GUEST_POOL_25 = [
  '@guest_vortex', '@guest_nova', '@guest_pulse', '@guest_cipher', '@guest_drift',
  '@guest_zenith', '@guest_flux', '@guest_onyx', '@guest_prism', '@guest_quark',
  '@guest_vector', '@guest_solaris', '@guest_mirage', '@guest_cobalt', '@guest_argon',
  '@guest_helix', '@guest_kronos', '@guest_nexus', '@guest_stratos', '@guest_vela',
  '@guest_lyra', '@guest_orion', '@guest_hyperion', '@guest_kilo', '@guest_echo'
];

const VNTEX_AVATARS = [
  { id: 'av_guest', name: 'Guest Default', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%2312131c"/><circle cx="40" cy="30" r="12" fill="%23505266"/><path d="M20 66 C20 50 60 50 60 66" fill="%23505266"/></svg>` },
  { id: 'av_1', name: 'Cyber Deck', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%2306101e"/><circle cx="40" cy="40" r="24" fill="none" stroke="%2300f2fe" stroke-width="4"/><circle cx="40" cy="40" r="8" fill="%2300f2fe"/></svg>` },
  { id: 'av_2', name: 'Crimson Drop', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23140003"/><path d="M40 16 C40 16 60 38 60 52 C60 63 51 68 40 68 C29 68 20 63 20 52 C20 38 40 16 40 16 Z" fill="%23FF000D"/></svg>` },
  { id: 'av_3', name: 'Radar Star', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23090514"/><polygon points="40,14 47,32 66,32 51,44 57,63 40,51 23,63 29,44 14,32 33,32" fill="%23a855f7"/></svg>` },
  { id: 'av_4', name: 'Vinyl Gold', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%23140e02"/><circle cx="40" cy="40" r="26" fill="%231f2937" stroke="%23f59e0b" stroke-width="3"/><circle cx="40" cy="40" r="10" fill="%23f59e0b"/><circle cx="40" cy="40" r="3" fill="%23000"/></svg>` },
  { id: 'av_5', name: 'Emerald Wave', svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="%2302140c"/><path d="M14 42 Q26 20 40 42 T66 42" fill="none" stroke="%2310b981" stroke-width="6" stroke-linecap="round"/></svg>` }
];

const VNTEX_KEYS = {
  AUTH_USER: 'vntex_core_authenticated_user',
  GUEST_SESSION: 'vntex_core_guest_session',
  USERS_DB: 'vntex_core_users_database',
  PENDING_APPROVALS: 'vntex_core_pending_approvals',
  OWNER_UNLOCKED: 'vntex_core_owner_session_unlocked',
  ACTIVE_PALETTE: 'vntex_core_active_palette',
  ACTIVE_PRESET: 'vntex_core_active_device'
};

const VNTEX_PALETTES = {
  obsidian: { name: 'Obsidian OLED', void: '#020204', panel: '#0a0a10', accent1: '#00f2fe' },
  winamp:   { name: 'Winamp LED',    void: '#101214', panel: '#1d2026', accent1: '#00ff41' },
  crimson:  { name: 'Crimson Club',  void: '#080204', panel: '#16070c', accent1: '#f43f5e' },
  blood:    { name: 'Blood OLED',    void: '#000000', panel: '#050505', accent1: '#FF000D' }
};

window.VNTEXCore = {
  currentUser: null,
  ownerUnlocked: sessionStorage.getItem(VNTEX_KEYS.OWNER_UNLOCKED) === 'true',

  async boot(activeToolName) {
    this.activeTool = activeToolName;
    await this.purgeLegacyLeakedGuestLibraries();
    this.seedDefaultAccountsIfEmpty();
    this.loadOrAssignSession();
    this.applySavedPalette();
    this.mountUniversalModals();
    this.syncHeaderProfileUI();
    this.bindGlobalShortcutsAndRoutes();
  },

  // Security Fix: Deletes legacy 'library_guest_local' and 'playlists_guest_local' so personal XML crates never leak to guests
  async purgeLegacyLeakedGuestLibraries() {
    return new Promise((res) => {
      try {
        const req = indexedDB.open('VNTEX_CloudCache_IDB', 1);
        req.onupgradeneeded = (e) => {
          if (!e.target.result.objectStoreNames.contains('kv')) e.target.result.createObjectStore('kv');
        };
        req.onsuccess = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('kv')) return res(true);
          const tx = db.transaction('kv', 'readwrite');
          tx.objectStore('kv').delete('library_guest_local');
          tx.objectStore('kv').delete('playlists_guest_local');
          tx.oncomplete = () => res(true);
          tx.onerror = () => res(false);
        };
        req.onerror = () => res(false);
      } catch {
        res(false);
      }
    });
  },

  seedDefaultAccountsIfEmpty() {
    // Remove any legacy fake profile from old localStorage key
    const oldFake = localStorage.getItem('vntex_core_session_user');
    if (oldFake) {
      try {
        const parsed = JSON.parse(oldFake);
        if (parsed && (parsed.email === 'studio_user@vntex.io' || parsed.email === 'guest@vntex.local')) {
          localStorage.removeItem('vntex_core_session_user');
        }
      } catch {}
    }

    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    if (!db.length) {
      db.push(
        {
          uid: 'usr_owner_uno',
          email: 'uno@vntex.io',
          password: 'admin',
          fullName: 'Darren Avent Jr.',
          username: '@uno',
          avatarId: 'av_2',
          verifiedBadge: true,
          palette: 'obsidian',
          permissions: { tier: 'enterprise', rig: true, automation: true, palettes: true, isAdmin: true }
        },
        {
          uid: 'usr_admin_dave',
          email: 'dave@vntex.io',
          password: 'admin',
          fullName: 'DJ Dave',
          username: '@dj_dave',
          avatarId: 'av_1',
          verifiedBadge: true,
          palette: 'obsidian',
          permissions: { tier: 'pro', rig: true, automation: true, palettes: true, isAdmin: true }
        }
      );
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

    // Bucket 1: Ephemeral Guest User from the 25-name starter pool
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
      fullName: 'Guest Visitor',
      email: '',
      username: randomHandle,
      avatarId: 'av_guest',
      verifiedBadge: false,
      palette: 'obsidian',
      permissions: { tier: 'free', rig: false, automation: false, palettes: false, isAdmin: false }
    };
    sessionStorage.setItem(VNTEX_KEYS.GUEST_SESSION, JSON.stringify(this.currentUser));
  },

  getAvatarSvg(avatarId) {
    if (this.currentUser && this.currentUser.isGuest) return VNTEX_AVATARS[0].svg;
    return (VNTEX_AVATARS.find((a) => a.id === avatarId) || VNTEX_AVATARS[1]).svg;
  },

  // Returns a strictly isolated storage key ONLY for signed-in users; returns null for Guests
  getIsolatedUserKey() {
    if (!this.currentUser || this.currentUser.isGuest || !this.currentUser.uid) return null;
    return `auth_${this.currentUser.uid}`;
  },

  applySavedPalette() {
    const palKey = (this.currentUser && !this.currentUser.isGuest && this.currentUser.palette)
      ? this.currentUser.palette
      : (localStorage.getItem(VNTEX_KEYS.ACTIVE_PALETTE) || 'obsidian');
    const pal = VNTEX_PALETTES[palKey] || VNTEX_PALETTES.obsidian;
    if (this.activeTool !== 'bloodstream' || palKey !== 'obsidian') {
      const r = document.documentElement;
      r.style.setProperty('--bg-void', pal.void);
      r.style.setProperty('--bg-panel', pal.panel);
      r.style.setProperty('--accent-primary', pal.accent1);
    }
  },

  setSuitePalette(palKey) {
    if (!VNTEX_PALETTES[palKey]) return;
    localStorage.setItem(VNTEX_KEYS.ACTIVE_PALETTE, palKey);
    if (this.currentUser && !this.currentUser.isGuest) {
      this.currentUser.palette = palKey;
      this.persistAuthenticatedUser();
    }
    const pal = VNTEX_PALETTES[palKey];
    const r = document.documentElement;
    r.style.setProperty('--bg-void', pal.void);
    r.style.setProperty('--bg-panel', pal.panel);
    r.style.setProperty('--accent-primary', pal.accent1);
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
      if (existing) return { ok: false, msg: 'Account already exists. Please Sign In.' };
      let handle = String(customHandle || `@${cleanEmail.split('@')[0]}`).trim();
      if (!handle.startsWith('@')) handle = `@${handle.replace(/\s+/g, '_')}`;
      const isOwnerOrAdminEmail = cleanEmail === 'uno@vntex.io' || cleanEmail.includes('admin');
      existing = {
        uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        isGuest: false,
        email: cleanEmail,
        password: password || 'vntex',
        fullName: fullName || cleanEmail.split('@')[0],
        username: handle,
        avatarId: 'av_1',
        verifiedBadge: true,
        palette: 'obsidian',
        permissions: {
          tier: 'pro',
          rig: true,
          automation: true,
          palettes: true,
          isAdmin: isOwnerOrAdminEmail
        }
      };
      db.push(existing);
      localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
    } else {
      if (!existing) return { ok: false, msg: 'No account found with that email. Switch to Create Account.' };
      if (existing.password && password && existing.password !== password) {
        return { ok: false, msg: 'Incorrect password.' };
      }
    }

    existing.isGuest = false;
    this.currentUser = existing;
    localStorage.setItem(VNTEX_KEYS.AUTH_USER, JSON.stringify(existing));
    this.syncHeaderProfileUI();
    this.renderUniversalAccountModal();
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: existing } }));
    return { ok: true };
  },

  signOut() {
    localStorage.removeItem(VNTEX_KEYS.AUTH_USER);
    sessionStorage.removeItem(VNTEX_KEYS.GUEST_SESSION);
    sessionStorage.removeItem(VNTEX_KEYS.OWNER_UNLOCKED);
    this.ownerUnlocked = false;
    this.loadOrAssignSession();
    this.syncHeaderProfileUI();
    this.renderUniversalAccountModal();
    if (window.location.hash === '#admin' || window.location.hash === '#owner') {
      window.location.hash = '';
    }
    window.dispatchEvent(new CustomEvent('vntex:auth-changed', { detail: { user: this.currentUser } }));
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

  // Queue an Admin action for Owner Approval
  submitAdminActionForOwnerApproval(actionType, targetUserEmail, summaryText, payload) {
    const list = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]');
    list.unshift({
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      adminActor: this.currentUser ? this.currentUser.username : '@admin',
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
        if (req.actionType === 'ADMIN_TOGGLE') db[idx].permissions.isAdmin = req.payload.isAdmin;
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
      <!-- 1. UNIVERSAL 5-TAB ACCOUNT & PROFILE HUB MODAL (IDENTICAL ON ALL 3 TOOLS) -->
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

          <!-- 5-Tab Navigation -->
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

      <!-- 2. DEDICATED ADMIN PORTAL MODAL (#admin — SUBMITS SENSITIVE CHANGES FOR APPROVAL) -->
      <div id="vntexAdminPortalModal" class="fixed inset-0 z-50 hidden bg-[#020205]/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div class="max-w-6xl w-full mx-auto space-y-4">
          <div class="hud-glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-amber-400/40 bg-[#08080e]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/50 flex items-center justify-center text-amber-400"><i class="fa-solid fa-shield-halved"></i></div>
              <div>
                <h2 class="text-sm font-extrabold text-white uppercase tracking-wider font-mono-tech">VNTEX Admin Portal — Daily Operations &amp; Conversion Monitor</h2>
                <p class="text-[11px] text-gray-400 font-mono-tech">Role: Designated Platform Admin • Sensitive privilege changes are submitted for approval.</p>
              </div>
            </div>
            <button id="closeAdminPortalModalBtn" type="button" class="hud-well px-3.5 py-1.5 rounded-xl font-mono-tech text-xs text-white hover:border-[var(--accent-primary)]">← Back to Toolbox</button>
          </div>

          <div id="adminPortalBodyContent" class="space-y-4"></div>
        </div>
      </div>

      <!-- 3. HIDDEN MASTER OWNER PORTAL (#owner — INVISIBLE TO ADMINS & USERS) -->
      <div id="vntexOwnerPortalModal" class="fixed inset-0 z-50 hidden bg-black/95 backdrop-blur-2xl flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div class="max-w-6xl w-full mx-auto space-y-4">
          <div class="hud-glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-rose-500/60 bg-[#0b0205]">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400"><i class="fa-solid fa-crown"></i></div>
              <div>
                <h2 class="text-sm font-extrabold text-white uppercase tracking-wider font-mono-tech">VNTEX Master Owner Command Portal (Classified)</h2>
                <p class="text-[11px] text-rose-300 font-mono-tech">Root Approval Queue, Admin Oversight &amp; Full User Registry</p>
              </div>
            </div>
            <button id="closeOwnerPortalModalBtn" type="button" class="hud-well px-3.5 py-1.5 rounded-xl font-mono-tech text-xs text-white">Exit Owner Portal</button>
          </div>

          <div id="ownerPortalBodyContent" class="space-y-4"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    // Bind Account Hub Triggers (works with both #openAccountHubBtn and #openAccountBtn)
    const openAcct = () => {
      this.renderUniversalAccountModal();
      document.getElementById('vntexUniversalAccountModal').classList.remove('hidden');
    };
    document.getElementById('openAccountHubBtn')?.addEventListener('click', openAcct);
    document.getElementById('openAccountBtn')?.addEventListener('click', openAcct);
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
    document.getElementById('univAcctModePill').className = isGuest
      ? 'font-mono-tech text-[10px] px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30'
      : 'font-mono-tech text-[10px] px-2 py-0.5 rounded bg-emerald-400/15 text-emerald-300 border border-emerald-400/30';
    document.getElementById('univSignOutBtnLabel').textContent = isGuest ? 'New Guest / Reset' : 'Sign Out';

    const profilePane = document.getElementById('uacctPane-profile');

    if (isGuest) {
      // GUEST VIEW: Cannot create "fake profiles". Must Sign In or Create Account to customize profile or persist libraries.
      profilePane.innerHTML = `
        <div class="hud-well p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-amber-400/30">
          <div class="flex items-center gap-3.5">
            <img src="${this.getAvatarSvg('av_guest')}" class="w-14 h-14 rounded-2xl border border-gray-600" />
            <div>
              <div class="font-mono-tech font-extrabold text-base text-white">${u.username}</div>
              <div class="font-mono-tech text-[11px] text-amber-300 mt-0.5">Temporary Guest Session • Libraries &amp; Settings Do Not Persist</div>
            </div>
          </div>
        </div>

        <div class="hud-well p-4 rounded-xl space-y-3 border border-[#2a2b3d]">
          <div class="flex items-center justify-between">
            <span class="font-mono-tech text-[11px] uppercase font-bold text-[var(--accent-primary)]">Sign In or Create Your VNTEX Toolbox Account</span>
            <span class="font-mono-tech text-[10px] text-gray-400">Demo Admin: uno@vntex.io / admin</span>
          </div>
          <form id="univAuthForm" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthEmail" type="email" required placeholder="Email address..." class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full" />
              <input id="univAuthPass" type="password" required placeholder="Password..." class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full" />
            </div>
            <div id="univSignUpExtraFields" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input id="univAuthFullName" type="text" placeholder="Full Name (Admin-Only Visibility)" class="hud-well px-3 py-2 rounded-lg text-xs w-full" />
              <input id="univAuthHandle" type="text" placeholder="Public Handle (e.g. @dj_uno)" class="hud-well px-3 py-2 rounded-lg text-xs font-mono-tech w-full" />
            </div>
            <div id="univAuthErrorMsg" class="hidden font-mono-tech text-[11px] text-rose-400"></div>
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label class="flex items-center gap-2 font-mono-tech text-[11px] text-gray-300 cursor-pointer">
                <input id="univAuthIsSignUp" type="checkbox" class="accent-cyan-400" />
                <span>Create a New Account</span>
              </label>
              <button type="submit" class="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-black font-mono-tech font-extrabold text-xs uppercase">
                Sign In to VNTEX
              </button>
            </div>
          </form>
        </div>
      `;

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
      // SIGNED-IN USER VIEW: Full Profile & Avatar Customization + Admin Portal Button (if isAdmin)
      const isAdm = Boolean(u.permissions && u.permissions.isAdmin === true);
      const selectableAvatars = VNTEX_AVATARS.slice(1); // 5 studio avatars
      profilePane.innerHTML = `
        <div class="hud-well p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3.5">
            <img src="${this.getAvatarSvg(u.avatarId)}" class="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--accent-primary)]" />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono-tech font-extrabold text-base text-white">${u.username}</span>
                <i class="fa-solid fa-certificate verified-badge-icon ${u.verifiedBadge ? '' : 'hidden'}"></i>
              </div>
              <div class="font-mono-tech text-[11px] text-gray-400 mt-0.5">Public DJ Handle • Email &amp; Legal Name Hidden from Public UI</div>
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
          <div class="font-mono-tech text-[10px] uppercase text-[var(--accent-primary)] font-bold">Customize Single Toolbox Profile &amp; Studio Avatar</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-mono-tech text-[10px] text-gray-400">Full Name (Visible to Admin/Owner Backend Only)</label>
              <input id="univCustFullName" type="text" value="${u.fullName || ''}" class="hud-well w-full px-3 py-2 rounded-lg text-xs" />
            </div>
            <div class="space-y-1">
              <label class="font-mono-tech text-[10px] text-gray-400">@username (Public Display Across All Tools)</label>
              <input id="univCustHandle" type="text" value="${u.username || ''}" class="hud-well w-full px-3 py-2 rounded-lg font-mono-tech text-xs" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="font-mono-tech text-[10px] text-gray-400">Choose Studio Profile Picture (5 Default Options)</label>
            <div class="flex items-center gap-3 pt-1">
              ${selectableAvatars.map((av) => `
                <button type="button" data-univ-avatar="${av.id}" class="avatar-option rounded-xl p-0.5 ${u.avatarId === av.id ? 'selected' : ''}" title="${av.name}">
                  <img src="${av.svg}" class="w-11 h-11 rounded-lg block" />
                </button>
              `).join('')}
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-[#181824]">
            <label class="font-mono-tech text-[10px] uppercase text-[var(--accent-primary)] font-bold">Unified Toolbox UI Theme</label>
            <div class="grid grid-cols-4 gap-2">
              ${Object.entries(VNTEX_PALETTES).map(([k, p]) => `
                <button type="button" data-univ-pal="${k}" class="hud-well p-2 rounded-xl text-left hover:border-white">
                  <div class="font-bold text-[11px]" style="color:${p.accent1}">${p.name}</div>
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
        b.onclick = () => this.setSuitePalette(b.getAttribute('data-univ-pal'));
      });

      document.getElementById('univProfileCustForm').onsubmit = (e) => {
        e.preventDefault();
        this.currentUser.fullName = document.getElementById('univCustFullName').value.trim();
        let h = document.getElementById('univCustHandle').value.trim() || '@producer';
        if (!h.startsWith('@')) h = `@${h.replace(/\s+/g, '_')}`;
        this.currentUser.username = h;
        this.persistAuthenticatedUser();
        this.syncHeaderProfileUI();
        document.getElementById('univProfileSaveNotice').textContent = '✓ Saved across all 3 tools!';
      };
    }

    // Streamlined Tool Summary Tabs (Zero History Log Bloat)
    const activeRig = localStorage.getItem(VNTEX_KEYS.ACTIVE_PRESET) || 'fast_web';
    document.getElementById('uacctPane-converter').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">ACTIVE PRESET</div><div class="text-xs font-bold text-[var(--accent-primary)] mt-1">${activeRig.toUpperCase()}</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">PROFILE ISOLATION</div><div class="text-xs font-bold text-emerald-400 mt-1">${isGuest ? 'Guest Ephemeral' : 'Private Cloud'}</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DEFAULT MODE</div><div class="text-xs font-bold text-white mt-1">FAST WEB</div></div>
      </div>
      <a href="index.html" class="block text-center py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-extrabold text-xs uppercase">Open Converter →</a>
    `;

    document.getElementById('uacctPane-radar').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">LIBRARY ISOLATION</div><div class="text-xs font-bold text-emerald-400 mt-1">${isGuest ? 'Demo Sandbox' : 'Private Vault'}</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">RADAR BRAIN</div><div class="text-xs font-bold text-[var(--accent-primary)] mt-1">0–100% Active</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">PROGRESS LOG</div><div class="text-xs font-bold text-white mt-1">Map Layer HUD</div></div>
      </div>
      <a href="radar.html" class="block text-center py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-extrabold text-xs uppercase">Open Harmonic Radar →</a>
    `;

    document.getElementById('uacctPane-bloodstream').innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">DSP ENGINE</div><div class="text-xs font-bold text-rose-500 mt-1">100% Web Native</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">COVER ART</div><div class="text-xs font-bold text-emerald-400 mt-1">ID3v2.3 APIC ✓</div></div>
        <div class="hud-well p-3.5 rounded-xl"><div class="text-[10px] text-gray-400">ISOLATION</div><div class="text-xs font-bold text-white mt-1">Single-Song</div></div>
      </div>
      <a href="bloodstream.html" class="block text-center py-2.5 rounded-xl bg-rose-500 text-white font-extrabold text-xs uppercase">Open Bloodstream →</a>
    `;

    const perms = u.permissions || {};
    document.getElementById('uacctPane-permissions').innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">ACCOUNT TYPE</div><div class="font-bold mt-1 ${isGuest ? 'text-amber-400' : 'text-emerald-400'}">${isGuest ? 'GUEST (NON-PAID)' : (perms.tier || 'PRO').toUpperCase()}</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">PRIVATE CLOUD LIBRARY</div><div class="font-bold mt-1 ${!isGuest ? 'text-emerald-400' : 'text-gray-500'}">${!isGuest ? 'ENABLED' : 'SIGN IN REQUIRED'}</div></div>
        <div class="hud-well p-3 rounded-xl"><div class="text-[9px] text-gray-400">CUSTOM AVATARS &amp; UI</div><div class="font-bold mt-1 ${!isGuest ? 'text-emerald-400' : 'text-gray-500'}">${!isGuest ? 'UNLOCKED' : 'LOCKED (GUEST)'}</div></div>
      </div>
    `;
  },

  // ADMIN PORTAL (#admin): Daily Monitoring + Submits Sensitive Changes for Approval
  openAdminPortalModal() {
    if (!this.currentUser || this.currentUser.isGuest || !this.currentUser.permissions?.isAdmin) {
      alert('Admin Portal access requires a designated Admin account (Sign in as uno@vntex.io or dave@vntex.io with password: admin).');
      return;
    }
    this.renderAdminPortalModal();
    document.getElementById('vntexAdminPortalModal').classList.remove('hidden');
  },

  renderAdminPortalModal() {
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');
    const convs = JSON.parse(localStorage.getItem('vntex_core_convert_history') || '[]');
    const blood = JSON.parse(localStorage.getItem('vntex_core_bloodstream_history') || '[]');
    const rTel = JSON.parse(localStorage.getItem('vntex_core_radar_telemetry') || '{}');
    const pending = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]').filter((r) => r.status === 'pending');

    const container = document.getElementById('adminPortalBodyContent');
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono-tech">
        <div class="hud-glass p-4 rounded-xl border border-[#181824]"><div class="text-[10px] text-gray-400">REGISTERED USERS</div><div class="text-2xl font-extrabold text-white mt-1">${db.length}</div></div>
        <div class="hud-glass p-4 rounded-xl border border-[#181824]"><div class="text-[10px] text-gray-400">CONVERSION MONITOR</div><div class="text-2xl font-extrabold text-cyan-400 mt-1">${convs.length} Jobs</div></div>
        <div class="hud-glass p-4 rounded-xl border border-[#181824]"><div class="text-[10px] text-gray-400">RADAR TRACKS</div><div class="text-2xl font-extrabold text-emerald-400 mt-1">${rTel.totalTracks || 0}</div></div>
        <div class="hud-glass p-4 rounded-xl border border-[#181824]"><div class="text-[10px] text-gray-400">BLOODSTREAM DL</div><div class="text-2xl font-extrabold text-rose-500 mt-1">${blood.length}</div></div>
      </div>

      <div class="hud-glass p-4 rounded-2xl border border-[#181824] space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-mono-tech text-xs font-bold uppercase text-amber-400">User Directory &amp; Change Request Submission (${pending.length} Pending Approval)</span>
          <span class="font-mono-tech text-[11px] text-gray-400">Role/Tier changes are sent for approval before taking effect</span>
        </div>
        <div id="adminApprovalFeedbackBanner" class="hidden p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/40 font-mono-tech text-xs text-amber-300"></div>
        <div class="space-y-2">
          ${db.map((u) => `
            <div class="hud-well p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono-tech text-xs">
              <div class="flex items-center gap-3">
                <img src="${(VNTEX_AVATARS.find((a) => a.id === u.avatarId) || VNTEX_AVATARS[1]).svg}" class="w-9 h-9 rounded-lg" />
                <div>
                  <div class="font-bold text-white">${u.username} <span class="text-gray-400 font-normal">(${u.fullName || 'No Legal Name'})</span></div>
                  <div class="text-[11px] text-cyan-400">${u.email} • Current Tier: <strong class="uppercase text-emerald-400">${u.permissions?.tier || 'pro'}</strong></div>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" data-req-tier="${u.email}" data-next-tier="${u.permissions?.tier === 'pro' ? 'free' : 'pro'}" class="hud-well px-3 py-1.5 rounded-lg text-[11px] text-amber-300 border border-amber-400/40 hover:bg-amber-400/10">
                  Request Tier → ${u.permissions?.tier === 'pro' ? 'FREE' : 'PRO'}
                </button>
                <button type="button" data-req-verify="${u.email}" data-next-ver="${!u.verifiedBadge}" class="hud-well px-3 py-1.5 rounded-lg text-[11px] text-cyan-300 border border-cyan-400/40">
                  Request ${u.verifiedBadge ? 'Unverify' : 'Verify Badge'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const showFeedback = (msg) => {
      const b = document.getElementById('adminApprovalFeedbackBanner');
      b.textContent = msg;
      b.classList.remove('hidden');
    };

    container.querySelectorAll('[data-req-tier]').forEach((btn) => {
      btn.onclick = () => {
        const email = btn.getAttribute('data-req-tier');
        const nextTier = btn.getAttribute('data-next-tier');
        this.submitAdminActionForOwnerApproval('TIER_CHANGE', email, `Change ${email} membership tier to ${nextTier.toUpperCase()}`, { tier: nextTier });
        showFeedback(`✓ Change request submitted for approval: Set ${email} tier to ${nextTier.toUpperCase()}.`);
      };
    });

    container.querySelectorAll('[data-req-verify]').forEach((btn) => {
      btn.onclick = () => {
        const email = btn.getAttribute('data-req-verify');
        const nextVer = btn.getAttribute('data-next-ver') === 'true';
        this.submitAdminActionForOwnerApproval('VERIFY_TOGGLE', email, `${nextVer ? 'Grant' : 'Revoke'} Verified Producer badge for ${email}`, { verifiedBadge: nextVer });
        showFeedback(`✓ Change request submitted for approval: ${nextVer ? 'Grant' : 'Revoke'} badge for ${email}.`);
      };
    });
  },

  // HIDDEN OWNER PORTAL (#owner): Secret URL hash #owner or Cmd+Shift+O
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
          <div id="ownerAuthErr" class="hidden font-mono-tech text-xs text-rose-400">Invalid Master Passkey.</div>
          <button type="submit" class="w-full py-2.5 rounded-xl bg-rose-500 text-white font-mono-tech font-extrabold text-xs uppercase">Unlock Owner Portal</button>
        </form>
      `;
      document.getElementById('ownerMasterAuthForm').onsubmit = (e) => {
        e.preventDefault();
        const code = document.getElementById('ownerMasterPassInput').value.trim();
        if (code === 'Ownr$88!Vntx#Plains92Z') {
          this.ownerUnlocked = true;
          sessionStorage.setItem(VNTEX_KEYS.OWNER_UNLOCKED, 'true');
          this.renderOwnerPortalModal();
        } else {
          document.getElementById('ownerAuthErr').classList.remove('hidden');
        }
      };
      return;
    }

    const approvals = JSON.parse(localStorage.getItem(VNTEX_KEYS.PENDING_APPROVALS) || '[]');
    const pending = approvals.filter((a) => a.status === 'pending');
    const db = JSON.parse(localStorage.getItem(VNTEX_KEYS.USERS_DB) || '[]');

    container.innerHTML = `
      <div class="hud-glass p-5 rounded-2xl border border-rose-500/40 space-y-3">
        <div class="font-mono-tech text-xs font-extrabold uppercase text-rose-400">
          Pending Admin Approval Queue (${pending.length} Awaiting Your Decision)
        </div>
        <div class="space-y-2">
          ${pending.map((req) => `
            <div class="hud-well p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono-tech text-xs">
              <div>
                <div class="font-bold text-white">${req.summaryText}</div>
                <div class="text-[11px] text-gray-400">Submitted by ${req.adminActor} • ${req.createdAt}</div>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" data-own-approve="${req.id}" class="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-black font-extrabold text-xs">✓ Approve</button>
                <button type="button" data-own-deny="${req.id}" class="px-3.5 py-1.5 rounded-lg bg-rose-500 text-white font-extrabold text-xs">✕ Deny</button>
              </div>
            </div>
          `).join('') || `<div class="hud-well p-4 rounded-xl text-center font-mono-tech text-xs text-gray-500">No pending admin requests awaiting your approval.</div>`}
        </div>
      </div>

      <div class="hud-glass p-5 rounded-2xl border border-[#181824] space-y-3">
        <div class="font-mono-tech text-xs font-extrabold uppercase text-cyan-400">Direct Owner User &amp; Admin Privilege Control (Immediate Execution)</div>
        <div class="space-y-2">
          ${db.map((u) => `
            <div class="hud-well p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono-tech text-xs">
              <div>
                <div class="font-bold text-white">${u.username} — ${u.fullName} (${u.email})</div>
                <div class="text-[11px] text-gray-400">Tier: ${u.permissions?.tier?.toUpperCase()} • Admin: ${u.permissions?.isAdmin ? 'YES' : 'NO'} • Verified: ${u.verifiedBadge ? 'YES' : 'NO'}</div>
              </div>
              <button type="button" data-own-toggle-admin="${u.email}" class="hud-well px-3 py-1.5 rounded-lg text-[11px] text-rose-400 border border-rose-500/40">
                ${u.permissions?.isAdmin ? 'Revoke Admin Role' : 'Grant Admin Role'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-own-approve]').forEach((b) => {
      b.onclick = () => this.executeOwnerApprovalDecision(b.getAttribute('data-own-approve'), true);
    });
    container.querySelectorAll('[data-own-deny]').forEach((b) => {
      b.onclick = () => this.executeOwnerApprovalDecision(b.getAttribute('data-own-deny'), false);
    });
    container.querySelectorAll('[data-own-toggle-admin]').forEach((b) => {
      b.onclick = () => {
        const email = b.getAttribute('data-own-toggle-admin');
        const idx = db.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
        if (idx >= 0) {
          db[idx].permissions.isAdmin = !db[idx].permissions.isAdmin;
          localStorage.setItem(VNTEX_KEYS.USERS_DB, JSON.stringify(db));
          this.renderOwnerPortalModal();
        }
      };
    });
  },

  bindGlobalShortcutsAndRoutes() {
    const checkHash = () => {
      if (window.location.hash === '#admin') this.openAdminPortalModal();
      if (window.location.hash === '#owner') this.openOwnerPortalModal();
    };
    window.addEventListener('hashchange', checkHash);
    checkHash();

    // Secret Owner Shortcut: Cmd+Shift+O (or Ctrl+Shift+O) opens the hidden #owner portal
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        window.location.hash = '#owner';
        this.openOwnerPortalModal();
      }
    });
  }
};