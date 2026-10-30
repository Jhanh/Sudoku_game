/* =========================================================
   storage.js — Persistent data layer (LocalStorage with Memory Fallback)
   ========================================================= */
const Storage = (() => {
  const KEYS = {
    GAME: 'sudoku_current_game',
    PROFILE: 'sudoku_profile',
    STATS: 'sudoku_stats',
    SOUND: 'sudoku_sound_enabled',
    LANG: 'sudoku_language',
    THEME: 'sudoku_theme',
    SETTINGS: 'sudoku_gameplay_settings'
  };

  // In-memory fallback if localStorage is blocked by browser security
  const memoryStore = {};
  let isLocalStorageAvailable = false;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      isLocalStorageAvailable = true;
    }
  } catch (e) {
    isLocalStorageAvailable = false;
  }

  /* ---------- helpers ---------- */
  function _get(key) {
    try {
      if (isLocalStorageAvailable) {
        const val = window.localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
      }
      return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
    } catch (e) {
      return null;
    }
  }

  function _set(key, val) {
    try {
      const str = JSON.stringify(val);
      if (isLocalStorageAvailable) {
        window.localStorage.setItem(key, str);
      }
      memoryStore[key] = str;
    } catch (e) {
      try { memoryStore[key] = JSON.stringify(val); } catch (_) {}
    }
  }

  function _remove(key) {
    try {
      if (isLocalStorageAvailable) {
        window.localStorage.removeItem(key);
      }
      delete memoryStore[key];
    } catch (e) {
      delete memoryStore[key];
    }
  }

  /* ---------- Game state ---------- */
  function saveGame(state) { _set(KEYS.GAME, state); }

  function loadGame() { return _get(KEYS.GAME); }

  function clearGame() { _remove(KEYS.GAME); }

  function hasActiveGame() {
    try {
      const g = loadGame();
      return g !== null && !g.isFinished;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Profile ---------- */
  const DEFAULT_PROFILE = { name: 'Kỳ thủ Sudoku', totalPlayTime: 0 };

  function getProfile() {
    return _get(KEYS.PROFILE) || { ...DEFAULT_PROFILE };
  }
  function saveProfile(p) { _set(KEYS.PROFILE, p); }

  /* ---------- Stats ---------- */
  function _defaultDiff() {
    return {
      played: 0,
      won: 0,
      perfectWins: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestTime: 0,
      totalWinTime: 0,
      bestScore: 0,
      totalScore: 0
    };
  }

  function getStats() {
    const s = _get(KEYS.STATS);
    const def = { easy: _defaultDiff(), medium: _defaultDiff(), hard: _defaultDiff() };
    if (!s) return def;
    ['easy', 'medium', 'hard'].forEach(diff => {
      s[diff] = { ..._defaultDiff(), ...(s[diff] || {}) };
    });
    return s;
  }

  function saveStats(s) { _set(KEYS.STATS, s); }

  function recordGameResult(difficulty, won, time, mistakes, score = 0) {
    try {
      const stats = getStats();
      const s = stats[difficulty] || _defaultDiff();
      s.played++;
      if (won) {
        s.won++;
        if (mistakes === 0) s.perfectWins++;
        s.currentStreak++;
        if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;
        if (s.bestTime === 0 || time < s.bestTime) s.bestTime = time;
        s.totalWinTime += time;
        if (!s.bestScore || score > s.bestScore) s.bestScore = score;
        s.totalScore = (s.totalScore || 0) + (score > 0 ? score : 0);
      } else {
        s.currentStreak = 0;
      }
      stats[difficulty] = s;
      saveStats(stats);

      // Update total play time in profile
      const p = getProfile();
      p.totalPlayTime = (p.totalPlayTime || 0) + time;
      saveProfile(p);
    } catch (e) {
      console.warn('Could not record game result:', e);
    }
  }

  /* ---------- Sound Settings ---------- */
  function isSoundEnabled() {
    const val = _get(KEYS.SOUND);
    return val === null ? true : Boolean(val);
  }

  function setSoundEnabled(enabled) {
    _set(KEYS.SOUND, Boolean(enabled));
  }

  /* ---------- Language Settings ---------- */
  function getLanguage() {
    const lang = _get(KEYS.LANG);
    return (lang === 'en' || lang === 'vi') ? lang : 'vi';
  }

  function setLanguage(lang) {
    if (lang === 'en' || lang === 'vi') {
      _set(KEYS.LANG, lang);
    }
  }

  /* ---------- Theme Settings ---------- */
  function getTheme() {
    const theme = _get(KEYS.THEME);
    return (theme === 'dark' || theme === 'light') ? theme : 'light';
  }

  function setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      _set(KEYS.THEME, theme);
    }
  }

  /* ---------- Gameplay Helper Settings ---------- */
  const DEFAULT_SETTINGS = {
    autoClearNotes: true,
    highlightSame: true,
    highlightMistakes: true
  };

  function getSettings() {
    const s = _get(KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...(s || {}) };
  }

  function saveSettings(s) {
    _set(KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...(s || {}) });
  }

  function updateSetting(key, val) {
    const s = getSettings();
    s[key] = val;
    saveSettings(s);
  }

  /* ---------- Reset All Data ---------- */
  function resetAllData() {
    clearGame();
    _remove(KEYS.PROFILE);
    _remove(KEYS.STATS);
    try {
      if (isLocalStorageAvailable) {
        window.localStorage.removeItem(KEYS.GAME);
        window.localStorage.removeItem(KEYS.PROFILE);
        window.localStorage.removeItem(KEYS.STATS);
      }
    } catch (_) {}
  }

  /* ---------- public API ---------- */
  return {
    saveGame, loadGame, clearGame, hasActiveGame,
    getProfile, saveProfile,
    getStats, saveStats, recordGameResult,
    isSoundEnabled, setSoundEnabled,
    getLanguage, setLanguage,
    getTheme, setTheme,
    getSettings, saveSettings, updateSetting,
    resetAllData
  };
})();
