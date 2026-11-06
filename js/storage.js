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

  /* ---------- Permanent Mastery Points (Hints & Ranks) ---------- */
  function getTotalPermanentScore() {
    const stats = getStats();
    return (stats.easy?.totalScore || 0) + (stats.medium?.totalScore || 0) + (stats.hard?.totalScore || 0);
  }

  function deductPermanentScore(points) {
    if (points <= 0) return true;
    const stats = getStats();
    const total = getTotalPermanentScore();
    if (total < points) return false;

    let left = points;
    const diffs = ['hard', 'medium', 'easy'];
    for (const d of diffs) {
      if (stats[d] && stats[d].totalScore > 0) {
        const can = Math.min(stats[d].totalScore, left);
        stats[d].totalScore -= can;
        left -= can;
        if (left <= 0) break;
      }
    }
    saveStats(stats);
    return true;
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
    highlightMistakes: true,
    fastFillDefault: false
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

  /* ---------- Export & Import Data (Transfer & Backup) ---------- */
  async function exportData() {
    try {
      const payload = {
        app: 'Sudoku_Web_PC',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        data: {
          game: loadGame(),
          profile: getProfile(),
          stats: getStats(),
          settings: getSettings(),
          sound: isSoundEnabled(),
          language: getLanguage(),
          theme: getTheme()
        }
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const fileName = `sudoku_backup_${dateStr}.json`;

      // 1. Modern File System Access API (Opens native Save As dialog allowing user to choose save folder)
      if (typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            id: 'sudoku-backup-file',
            types: [{
              description: 'Sudoku Backup File (*.json)',
              accept: { 'application/json': ['.json'] }
            }]
          });
          const writable = await handle.createWritable();
          await writable.write(jsonStr);
          await writable.close();
          return { success: true, method: 'picker' };
        } catch (pickerErr) {
          // If the user cancelled the Save As dialog, don't download or show error
          if (pickerErr && pickerErr.name === 'AbortError') {
            return { success: false, aborted: true };
          }
          // If security or other error, fallback to <a> download below
        }
      }

      // 2. Standard fallback: <a download>
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return { success: true, method: 'download' };
    } catch (e) {
      console.error('Export failed:', e);
      return { success: false, error: e.message };
    }
  }

  function importData(rawContent) {
    try {
      if (typeof rawContent !== 'string' || !rawContent.trim()) {
        throw new Error('Tệp trống hoặc không đúng định dạng');
      }

      const parsed = JSON.parse(rawContent);

      // Support either { app: 'Sudoku_Web_PC', data: { ... } } or raw data object { profile, stats, ... }
      let payload = (parsed && (parsed.app === 'Sudoku_Web_PC' || parsed.exportedAt) && parsed.data)
        ? parsed.data
        : parsed;

      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('Cấu trúc tệp sao lưu không hợp lệ');
      }

      // Handle raw localStorage dump if applicable
      if (payload.sudoku_stats || payload.sudoku_profile) {
        if (payload.sudoku_profile) {
          const p = typeof payload.sudoku_profile === 'string' ? JSON.parse(payload.sudoku_profile) : payload.sudoku_profile;
          saveProfile(p);
        }
        if (payload.sudoku_stats) {
          const s = typeof payload.sudoku_stats === 'string' ? JSON.parse(payload.sudoku_stats) : payload.sudoku_stats;
          saveStats(s);
        }
        if (payload.sudoku_gameplay_settings) {
          const gs = typeof payload.sudoku_gameplay_settings === 'string' ? JSON.parse(payload.sudoku_gameplay_settings) : payload.sudoku_gameplay_settings;
          saveSettings(gs);
        }
        if (payload.sudoku_current_game) {
          const cg = typeof payload.sudoku_current_game === 'string' ? JSON.parse(payload.sudoku_current_game) : payload.sudoku_current_game;
          saveGame(cg);
        }
        if (payload.sudoku_sound_enabled !== undefined) {
          setSoundEnabled(payload.sudoku_sound_enabled === true || payload.sudoku_sound_enabled === 'true');
        }
        if (payload.sudoku_language) {
          setLanguage(payload.sudoku_language);
        }
        if (payload.sudoku_theme) {
          setTheme(payload.sudoku_theme);
        }
        return { success: true };
      }

      // Check standard keys
      const hasAnyValidKey = payload.stats || payload.profile || payload.game !== undefined || payload.settings;
      if (!hasAnyValidKey) {
        throw new Error('Không tìm thấy dữ liệu game hợp lệ trong tệp');
      }

      // 1. Profile
      if (payload.profile && typeof payload.profile === 'object') {
        const p = {
          name: typeof payload.profile.name === 'string' && payload.profile.name.trim()
            ? payload.profile.name.trim().slice(0, 30)
            : DEFAULT_PROFILE.name,
          totalPlayTime: Math.max(0, Number(payload.profile.totalPlayTime) || 0)
        };
        saveProfile(p);
      }

      // 2. Stats
      if (payload.stats && typeof payload.stats === 'object') {
        const stats = {
          easy: { ..._defaultDiff(), ...(payload.stats.easy || {}) },
          medium: { ..._defaultDiff(), ...(payload.stats.medium || {}) },
          hard: { ..._defaultDiff(), ...(payload.stats.hard || {}) }
        };
        ['easy', 'medium', 'hard'].forEach(diff => {
          Object.keys(stats[diff]).forEach(k => {
            stats[diff][k] = Math.max(0, Number(stats[diff][k]) || 0);
          });
        });
        saveStats(stats);
      }

      // 3. Gameplay settings
      if (payload.settings && typeof payload.settings === 'object') {
        saveSettings({
          autoClearNotes: payload.settings.autoClearNotes !== false,
          highlightSame: payload.settings.highlightSame !== false,
          highlightMistakes: payload.settings.highlightMistakes !== false,
          fastFillDefault: payload.settings.fastFillDefault === true
        });
      }

      // 4. Sound
      if (payload.sound !== undefined) {
        setSoundEnabled(Boolean(payload.sound));
      }

      // 5. Language
      if (payload.language === 'en' || payload.language === 'vi') {
        setLanguage(payload.language);
      }

      // 6. Theme
      if (payload.theme === 'dark' || payload.theme === 'light') {
        setTheme(payload.theme);
      }

      // 7. Active game state
      if (payload.game && typeof payload.game === 'object' && Array.isArray(payload.game.board)) {
        saveGame(payload.game);
      } else if (payload.game === null) {
        clearGame();
      }

      return { success: true };
    } catch (e) {
      console.warn('Import failed:', e);
      return { success: false, error: e.message };
    }
  }

  /* ---------- public API ---------- */
  return {
    saveGame, loadGame, clearGame, hasActiveGame,
    getProfile, saveProfile,
    getStats, saveStats, recordGameResult,
    getTotalPermanentScore, deductPermanentScore,
    isSoundEnabled, setSoundEnabled,
    getLanguage, setLanguage,
    getTheme, setTheme,
    getSettings, saveSettings, updateSetting,
    resetAllData,
    exportData, importData
  };
})();
