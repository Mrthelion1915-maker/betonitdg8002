(() => {
  //dont touch these constants, nothiig will load.
  const STORAGE_KEY = "betonit8002_store_v1";
  const SETTINGS_KEY = "betonit8002_settings_v1";

  // declare the gold as the default profile color / white bg.
  const DEFAULT_AVATAR_BG = "#fbf6e8";
  const DEFAULT_AVATAR_COLOR = "#8f6520";

  // Navigation accross pages.
  const NAV_ITEMS = [
    { key: "home", label: "Home", path: "index.html" },
    { key: "blackjack", label: "Blackjack", path: "BJ/index.html" },
    { key: "slots", label: "Slots", path: "SLOTS/index.html" },
    { key: "heads-or-tails", label: "Heads or Tails", path: "HOT/index.html" },
    { key: "higher-or-lower", label: "Higher or Lower", path: "HL/index.html" },
    { key: "tic-tac-toe", label: "Tic-Tac-Toe", path: "TTT/index.html" },
    { key: "rps", label: "Rock Paper Scissors", path: "RPS/index.html" }
  ];

  function getHomePageHref() {
    const path = window.location.pathname;
    return path.includes("/HL/") || path.includes("/TTT/") || path.includes("/BJ/") || path.includes("/HOT/") || path.includes("/RPS/") || path.includes("/SLOTS/") ? "../index.html" : "index.html";
  }

  function getPathPrefix() {
    return getHomePageHref().replace(/index\.html$/, "");
  }

  function getCurrentPageKey() {
    const path = window.location.pathname.toLowerCase();
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "index.html";
    const parent = segments[segments.length - 2] || "";

    if (parent === "HL") {
      return "higher-or-lower";
    }

    if (parent === "TTT") {
      return "tic-tac-toe";
    }

    if (parent === "BJ") {
      return "blackjack";
    }

    if (parent === "HOT") {
      return "heads-or-tails";
    }

    if (parent === "RPS") {
      return "rps";
    }

    if (parent === "SLOTS") {
      return "slots";
    }

    return "home";
  }

  function getCurrentPageHref() {
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "index.html";
    const parent = segments[segments.length - 2] || "";

    if (parent === "HL" || parent === "TTT" || parent === "BJ" || parent === "HOT" || parent === "RPS" || parent === "SLOTS") {
      return parent + "/" + last;
    }

    return last;
  }

  function buildSharedHeaderMarkup() {
    const pathPrefix = getPathPrefix();
    const currentPageKey = getCurrentPageKey();

    return `
      <a class="site-brand" href="${pathPrefix}index.html">BETONIT<span>8002</span></a>

      <nav class="site-nav" aria-label="Main navigation">
        ${NAV_ITEMS.map((item) => {
          const isActive = item.key === currentPageKey;
          return `<a class="site-nav-link${isActive ? " is-active" : ""}" href="${pathPrefix}${item.path}"${isActive ? ' aria-current="page"' : ""}>${item.label}</a>`;
        }).join("")}
      </nav>

      <div class="site-userbar">
        <div class="site-user-pill">
          <span class="site-user-label">Player</span>
          <strong data-player-name>Guest</strong>
        </div>
        <div class="site-user-pill">
          <span class="site-user-label">Credits</span>
          <strong data-player-credits>--</strong>
        </div>
        <button class="site-action-btn alt" id="open-signin-btn">Sign In</button>
        <button class="site-action-btn hidden-ui" id="sign-out-btn" data-signout>Sign Out</button>
      </div>
    `;
  }

  function renderSharedHeader() {
    const header = document.querySelector("[data-site-header], header.site-header");

    if (!header) {
      return;
    }

    header.className = "site-header";
    header.setAttribute("data-site-header", "");
    header.innerHTML = buildSharedHeaderMarkup();
  }

  function safeParse(value, fallback) {
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function sanitizeName(name) {
    return String(name || "").trim().replace(/\s+/g, " ");
  }

  function normalizeNameForMatch(name) {
    return sanitizeName(name).toLowerCase();
  }

  function makeUserKey(name) {
    const cleaned = sanitizeName(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return cleaned || "player";
  }

  function getLegacyCredits(name) {
    const cleaned = sanitizeName(name);

    if (!cleaned) {
      return null;
    }

    const legacyValue = localStorage.getItem("slot_credits_" + cleaned);
    const parsedValue = parseInt(legacyValue, 10);

    if (Number.isNaN(parsedValue)) {
      return null;
    }

    return Math.max(0, parsedValue);
  }

  function createStats() {
    return {
      blackjack: { wins: 0, losses: 0, pushes: 0 },
      slots: { wins: 0, spins: 0 },
      headsOrTails: { wins: 0, losses: 0 },
      higherLower: { wins: 0, losses: 0 },
      ticTacToe: { wins: 0, losses: 0, ties: 0 },
      rps: { wins: 0, losses: 0, ties: 0 }
    };
  }

  function createProfile(name) {
    const cleanedName = sanitizeName(name) || "Player";
    const legacyCredits = getLegacyCredits(cleanedName);

    return {
      name: cleanedName,
      credits: legacyCredits === null ? 100 : legacyCredits,
      avatar: cleanedName.charAt(0).toUpperCase() || "P",
      avatarBg: DEFAULT_AVATAR_BG,
      avatarCol: DEFAULT_AVATAR_COLOR,
      lastGame: "Home",
      stats: createStats()
    };
  }

  function ensureStats(profile) {
    const mergedStats = createStats();
    const existingStats = profile.stats || {};

    Object.keys(mergedStats).forEach((gameKey) => {
      mergedStats[gameKey] = Object.assign({}, mergedStats[gameKey], existingStats[gameKey] || {});
    });

    return mergedStats;
  }

  function normalizeProfile(profile, fallbackName) {
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const normalized = Object.assign({}, createProfile(fallbackName || safeProfile.name || "Player"), safeProfile);

    normalized.name = sanitizeName(normalized.name) || "Player";
    normalized.credits = Number.isFinite(Number(normalized.credits)) ? Math.max(0, parseInt(normalized.credits, 10)) : 100;
    normalized.avatar = String(normalized.avatar || normalized.name.charAt(0).toUpperCase() || "P").slice(0, 2).toUpperCase();
    normalized.avatarBg = normalized.avatarBg || DEFAULT_AVATAR_BG;
    normalized.avatarCol = normalized.avatarCol || DEFAULT_AVATAR_COLOR;
    normalized.lastGame = normalized.lastGame || "Home";
    normalized.stats = ensureStats(normalized);

    return normalized;
  }

  function normalizeUsers(users) {
    const normalizedUsers = {};

    if (!users || typeof users !== "object") {
      return normalizedUsers;
    }

    Object.keys(users).forEach((userKey) => {
      const normalizedProfile = normalizeProfile(users[userKey], userKey);
      const normalizedKey = makeUserKey(normalizedProfile.name || userKey);

      normalizedUsers[normalizedKey] = normalizedProfile;
    });

    return normalizedUsers;
  }

  function findUserKey(users, name) {
    const cleanedName = sanitizeName(name);

    if (!cleanedName) {
      return "";
    }

    const directKey = makeUserKey(cleanedName);

    if (users[directKey]) {
      return directKey;
    }

    const targetName = normalizeNameForMatch(cleanedName);

    return Object.keys(users).find((userKey) => {
      return normalizeNameForMatch(users[userKey].name) === targetName;
    }) || "";
  }

  function normalizeStore(store) {
    const baseStore = store && typeof store === "object" ? store : {};
    const users = normalizeUsers(baseStore.users);
    let currentUserKey = typeof baseStore.currentUserKey === "string" ? baseStore.currentUserKey : "";

    if (!currentUserKey && typeof baseStore.currentUserName === "string") {
      currentUserKey = findUserKey(users, baseStore.currentUserName);
    }

    if (currentUserKey && !users[currentUserKey]) {
      currentUserKey = "";
    }

    return {
      currentUserKey,
      users
    };
  }

  function writeStore(updater) {
    const currentStore = readStore();
    const draftStore = {
      currentUserKey: currentStore.currentUserKey,
      users: Object.assign({}, currentStore.users)
    };
    const nextStore = updater ? updater(draftStore) || draftStore : draftStore;
    const normalizedStore = normalizeStore(nextStore);
    const currentSnapshot = JSON.stringify(currentStore);
    const nextSnapshot = JSON.stringify(normalizedStore);

    if (nextSnapshot !== currentSnapshot) {
      localStorage.setItem(STORAGE_KEY, nextSnapshot);
    }

    return normalizedStore;
  }

  function readStore() {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY), null);
    return normalizeStore(parsed);
  }

  function readSettings() {
    const parsed = safeParse(localStorage.getItem(SETTINGS_KEY), null);

    return {
      fontLevel: parsed && typeof parsed.fontLevel === "number" ? parsed.fontLevel : 0
    };
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getCurrentUser() {
    const store = readStore();

    if (!store.currentUserKey || !store.users[store.currentUserKey]) {
      return null;
    }

    return clone(normalizeProfile(store.users[store.currentUserKey]));
  }

  function setCurrentUser(name, extras = {}) {
    const cleanedName = sanitizeName(name);

    if (!cleanedName) {
      return null;
    }

    const store = writeStore((draftStore) => {
      const userKey = findUserKey(draftStore.users, cleanedName) || makeUserKey(cleanedName);
      const existingProfile = draftStore.users[userKey] || createProfile(cleanedName);
      const nextProfile = normalizeProfile(Object.assign({}, existingProfile, extras, { name: cleanedName }), cleanedName);

      draftStore.currentUserKey = userKey;
      draftStore.users[userKey] = nextProfile;
      return draftStore;
    });
    const nextProfile = store.users[store.currentUserKey] || null;

    refreshUi(nextProfile);

    return nextProfile ? clone(nextProfile) : null;
  }

  function renameCurrentUser(name, extras = {}) {
    const cleanedName = sanitizeName(name);
    const currentStore = readStore();
    const currentKey = currentStore.currentUserKey;

    if (!cleanedName || !currentKey || !currentStore.users[currentKey]) {
      return null;
    }

    const store = writeStore((draftStore) => {
      const nextKey = makeUserKey(cleanedName);
      const currentProfile = normalizeProfile(draftStore.users[currentKey]);
      const nextProfile = normalizeProfile(Object.assign({}, currentProfile, extras, { name: cleanedName }), cleanedName);

      if (nextKey !== currentKey) {
        delete draftStore.users[currentKey];
      }

      draftStore.users[nextKey] = nextProfile;
      draftStore.currentUserKey = nextKey;
      return draftStore;
    });
    const nextProfile = store.users[store.currentUserKey] || null;

    refreshUi(nextProfile);

    return nextProfile ? clone(nextProfile) : null;
  }

  function updateCurrentUser(updater) {
    const currentStore = readStore();
    const userKey = currentStore.currentUserKey;

    if (!userKey || !currentStore.users[userKey]) {
      return null;
    }

    const store = writeStore((draftStore) => {
      const draftProfile = normalizeProfile(draftStore.users[userKey]);
      const updatedProfile = updater ? updater(draftProfile) || draftProfile : draftProfile;
      const finalProfile = normalizeProfile(updatedProfile, draftProfile.name);

      draftStore.users[userKey] = finalProfile;
      return draftStore;
    });
    const finalProfile = store.users[store.currentUserKey] || null;

    refreshUi(finalProfile);

    return finalProfile ? clone(finalProfile) : null;
  }

  function signOut() {
    writeStore((draftStore) => {
      draftStore.currentUserKey = "";
      return draftStore;
    });
    refreshUi(null);
  }

  function getTotalWins(profile) {
    const stats = ensureStats(profile);

    return (
      stats.blackjack.wins +
      stats.slots.wins +
      stats.headsOrTails.wins +
      stats.higherLower.wins +
      stats.ticTacToe.wins +
      stats.rps.wins
    );
  }

  function getLeaderboard() {
    const store = readStore();

    return Object.keys(store.users)
      .map((userKey) => normalizeProfile(store.users[userKey]))
      .sort((left, right) => {
        if (right.credits !== left.credits) {
          return right.credits - left.credits;
        }

        if (getTotalWins(right) !== getTotalWins(left)) {
          return getTotalWins(right) - getTotalWins(left);
        }

        return left.name.localeCompare(right.name);
      });
  }

  function changeCredits(amount) {
    return updateCurrentUser((profile) => {
      profile.credits = Math.max(0, profile.credits + amount);
      return profile;
    });
  }

  function requireCurrentUser(options = {}) {
    const currentUser = getCurrentUser();

    if (currentUser || options.redirect === false) {
      return currentUser;
    }

    const nextPage = options.nextPage || window.location.pathname.split("/").pop() || "index.html";
    const redirectUrl = getHomePageHref() + "?signin=1&next=" + encodeURIComponent(nextPage);
    window.location.href = redirectUrl;
    return null;
  }

  function applyFontLevel() {
    const settings = readSettings();
    document.body.classList.remove("font-lg", "font-sm");

    if (settings.fontLevel === 1) {
      document.body.classList.add("font-lg");
    }

    if (settings.fontLevel === -1) {
      document.body.classList.add("font-sm");
    }
  }

  function setFontLevel(nextLevel) {
    const settings = readSettings();
    settings.fontLevel = Math.max(-1, Math.min(1, nextLevel));
    saveSettings(settings);
    applyFontLevel();
  }

  function refreshUi(profile) {
    const activeProfile = profile === undefined ? getCurrentUser() : profile;

    document.querySelectorAll("[data-player-name]").forEach((node) => {
      node.textContent = activeProfile ? activeProfile.name : "Guest";
    });

    document.querySelectorAll("[data-player-credits]").forEach((node) => {
      node.textContent = activeProfile ? activeProfile.credits : "--";
    });

    const openSignInBtn = document.getElementById("open-signin-btn");
    const signOutBtn = document.getElementById("sign-out-btn");
    const hasUser = Boolean(activeProfile);

    if (openSignInBtn) {
      openSignInBtn.classList.toggle("hidden-ui", hasUser);
    }

    if (signOutBtn) {
      signOutBtn.classList.toggle("hidden-ui", !hasUser);
    }

    document.querySelectorAll("[data-player-avatar]").forEach((node) => {
      if (!activeProfile) {
        node.textContent = "?";
        node.style.background = DEFAULT_AVATAR_BG;
        node.style.color = DEFAULT_AVATAR_COLOR;
        return;
      }

      node.textContent = activeProfile.avatar;
      node.style.background = activeProfile.avatarBg;
      node.style.color = activeProfile.avatarCol;
    });
  }

  function bindCommonActions() {
    document.querySelectorAll("[data-signout]").forEach((button) => {
      button.addEventListener("click", () => {
        signOut();
        window.location.href = getHomePageHref() + "?signin=1";
      });
    });

    if (document.getElementById("signin-overlay")) {
      return;
    }

    const openSignInBtn = document.getElementById("open-signin-btn");
    const homeHref = getHomePageHref();
    const nextPage = encodeURIComponent(getCurrentPageHref());

    if (openSignInBtn) {
      openSignInBtn.addEventListener("click", () => {
        window.location.href = homeHref + "?signin=1&next=" + nextPage;
      });
    }
  }

  function syncActiveUi() {
    applyFontLevel();
    refreshUi();
  }

  renderSharedHeader();

  window.BetonitSite = {
    changeCredits,
    getCurrentUser,
    getLeaderboard,
    getSettings: readSettings,
    getTotalWins,
    makeUserKey,
    refreshUi,
    renameCurrentUser,
    requireCurrentUser,
    setCurrentUser,
    setFontLevel,
    signOut,
    updateCurrentUser
  };

  document.addEventListener("DOMContentLoaded", () => {
    syncActiveUi();
    bindCommonActions();
  });

  window.addEventListener("storage", (event) => {
    if (!event.key || event.key === STORAGE_KEY || event.key === SETTINGS_KEY) {
      syncActiveUi();
    }
  });

  window.addEventListener("pageshow", syncActiveUi);
  window.addEventListener("focus", syncActiveUi);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncActiveUi();
    }
  });
})();
