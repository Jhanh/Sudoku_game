/* =========================================================
   profile.js — Profile header, stats charts, stat cards & rank
   ========================================================= */
const Profile = (() => {

  let currentDiff = 'easy';

  function render() {
    _renderProfile();
    _renderRank();
    _renderStats(currentDiff);
    if (typeof Sound !== 'undefined' && Sound.updateUI) Sound.updateUI();
  }

  function _renderProfile() {
    const p = Storage.getProfile();
    const defaultName = typeof I18n !== 'undefined' ? I18n.t('profile_default_name') : 'Kỳ thủ Sudoku';
    const profileNameEl = document.getElementById('profile-name');
    if (profileNameEl) profileNameEl.textContent = p.name || defaultName;

    const timeLabel = typeof I18n !== 'undefined' ? I18n.t('profile_total_time') : 'Tổng thời gian: ';
    const totalTimeEl = document.getElementById('total-play-time');
    if (totalTimeEl) totalTimeEl.textContent = timeLabel + _formatHMS(p.totalPlayTime || 0);
  }

  const RANKS = [
    { level: 1, key: 'profile_rank_1', icon: '🥋', minScore: 0, nextScore: 10000 },
    { level: 2, key: 'profile_rank_2', icon: '🥉', minScore: 10000, nextScore: 35000 },
    { level: 3, key: 'profile_rank_3', icon: '🥈', minScore: 35000, nextScore: 100000 },
    { level: 4, key: 'profile_rank_4', icon: '🥇', minScore: 100000, nextScore: 300000 },
    { level: 5, key: 'profile_rank_5', icon: '🎖️', minScore: 300000, nextScore: 800000 },
    { level: 6, key: 'profile_rank_6', icon: '💠', minScore: 800000, nextScore: 2000000 },
    { level: 7, key: 'profile_rank_7', icon: '🔮', minScore: 2000000, nextScore: 5000000 },
    { level: 8, key: 'profile_rank_8', icon: '👑', minScore: 5000000, nextScore: 10000000 },
    { level: 9, key: 'profile_rank_9', icon: '🌟', minScore: 10000000, nextScore: null }
  ];

  function _renderRank() {
    const stats = Storage.getStats();
    let totalScore = (stats.easy?.totalScore || 0) + (stats.medium?.totalScore || 0) + (stats.hard?.totalScore || 0);

    // Fallback if existing player has previous wins before totalScore tracking
    const fallbackScore = (stats.easy?.won || 0) * 1000 + (stats.medium?.won || 0) * 2500 + (stats.hard?.won || 0) * 4200;
    if (totalScore < fallbackScore) {
      totalScore = fallbackScore;
    }

    let currentRank = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (totalScore >= RANKS[i].minScore) {
        currentRank = RANKS[i];
        break;
      }
    }

    const rankIconEl = document.getElementById('profile-rank-icon');
    const rankNameEl = document.getElementById('profile-rank-name');
    const rankFillEl = document.getElementById('profile-rank-fill');
    const rankExpEl = document.getElementById('profile-rank-exp');
    const rankNextEl = document.getElementById('profile-rank-next');
    const rankCardEl = document.querySelector('.profile-rank-card');

    if (rankIconEl) rankIconEl.textContent = currentRank.icon;
    if (rankNameEl) {
      rankNameEl.textContent = typeof I18n !== 'undefined' ? I18n.t(currentRank.key) : 'Nhập Môn';
    }

    const scoreFormatted = totalScore.toLocaleString();
    const isMax = currentRank.nextScore === null;
    const ptsLabel = typeof I18n !== 'undefined' ? I18n.t('profile_rank_pts') : 'điểm';

    if (isMax) {
      if (rankFillEl) {
        rankFillEl.style.width = '100%';
        rankFillEl.classList.add('rank-max');
      }
      if (rankCardEl) rankCardEl.classList.add('rank-max');
      if (rankExpEl) rankExpEl.textContent = `${scoreFormatted} ${ptsLabel}`;
      if (rankNextEl) {
        rankNextEl.textContent = typeof I18n !== 'undefined' ? I18n.t('profile_rank_max') : 'Đỉnh Cao Danh Vọng • Đạt Cấp Tối Đa';
      }
    } else {
      if (rankCardEl) rankCardEl.classList.remove('rank-max');
      if (rankFillEl) rankFillEl.classList.remove('rank-max');
      const range = currentRank.nextScore - currentRank.minScore;
      const progress = totalScore - currentRank.minScore;
      const pct = Math.min(100, Math.max(5, Math.round((progress / range) * 100)));
      if (rankFillEl) rankFillEl.style.width = pct + '%';

      const nextFormatted = currentRank.nextScore.toLocaleString();
      if (rankExpEl) {
        rankExpEl.textContent = `${scoreFormatted} / ${nextFormatted} ${ptsLabel}`;
      }
      if (rankNextEl) {
        rankNextEl.textContent = `${pct}%`;
      }
    }
  }

  function _renderStats(diff) {
    const stats = Storage.getStats();
    const s = stats[diff] || {
      played: 0,
      won: 0,
      perfectWins: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestTime: 0,
      totalWinTime: 0,
      bestScore: 0
    };

    // Donut chart (Tỉ lệ thắng)
    const circumference = 2 * Math.PI * 54; // r=54 (~339.29)
    const winRate = s.played > 0 ? (s.won / s.played) : 0;

    const donutWin = document.getElementById('donut-win');
    const donutPct = document.getElementById('donut-pct');

    if (donutWin) {
      donutWin.style.strokeDashoffset = circumference * (1 - winRate);
    }
    if (donutPct) {
      donutPct.textContent = Math.round(winRate * 100) + '%';
    }

    // Top overview rectangle: Số trận đã thắng & Số trận đã chơi
    const overviewWon = document.getElementById('overview-won');
    const overviewPlayed = document.getElementById('overview-played');
    if (overviewWon) overviewWon.textContent = s.won;
    if (overviewPlayed) overviewPlayed.textContent = s.played;

    // Stat cards in grid (6 cards, neatly paired)
    const avgTime = s.won > 0 ? Math.round(s.totalWinTime / s.won) : 0;
    const grid = document.getElementById('stats-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'vi';
    const loc = lang === 'en' ? 'en-US' : 'vi-VN';

    const cards = [
      {
        icon: '👑',
        label: typeof I18n !== 'undefined' ? I18n.t('stat_best_score') : 'Điểm cao nhất',
        value: s.bestScore ? s.bestScore.toLocaleString(loc) : 0,
        highlight: true
      },
      {
        icon: '💎',
        label: typeof I18n !== 'undefined' ? I18n.t('stat_perfect_wins') : 'Thắng hoàn hảo',
        value: s.perfectWins || 0,
        highlight: true
      },
      {
        icon: '🔥',
        label: typeof I18n !== 'undefined' ? I18n.t('stat_current_streak') : 'Chuỗi thắng hiện tại',
        value: s.currentStreak || 0
      },
      {
        icon: '⚡',
        label: typeof I18n !== 'undefined' ? I18n.t('stat_best_streak') : 'Chuỗi thắng tốt nhất',
        value: s.bestStreak || 0,
        highlight: true
      },
      {
        icon: '⏱️',
        label: typeof I18n !== 'undefined' ? I18n.t('stat_best_time') : 'Thời gian nhanh nhất',
        value: s.bestTime > 0 ? (typeof Game !== 'undefined' ? Game.formatTime(s.bestTime) : s.bestTime) : '—'
      },
      {
        icon: '📈',
        label: typeof I18n !== 'undefined' ? I18n.t('stat_avg_time') : 'Thời gian trung bình',
        value: avgTime > 0 ? (typeof Game !== 'undefined' ? Game.formatTime(avgTime) : avgTime) : '—'
      }
    ];

    cards.forEach(c => {
      const card = document.createElement('div');
      card.className = 'stat-card' + (c.highlight ? ' highlight' : '');
      card.innerHTML = `
        <span class="stat-icon">${c.icon}</span>
        <span class="stat-value">${c.value}</span>
        <span class="stat-label">${c.label}</span>
      `;
      grid.appendChild(card);
    });
  }

  function setDifficulty(diff) {
    currentDiff = diff;
    _renderStats(diff);
  }

  function _formatHMS(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return String(h).padStart(2, '0') + ':' +
           String(m).padStart(2, '0') + ':' +
           String(s).padStart(2, '0');
  }

  function bindEvents() {
    document.querySelectorAll('#profile-diff-tabs .diff-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#profile-diff-tabs .diff-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        setDifficulty(tab.dataset.diff);
      });
    });

    // Edit name button
    const editBtn = document.getElementById('btn-edit-name');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const section = document.getElementById('name-edit-section');
        const input = document.getElementById('name-input');
        const profile = Storage.getProfile();
        input.value = profile.name;
        section.classList.remove('hidden');
        input.focus();
      });
    }

    const saveNameBtn = document.getElementById('btn-save-name');
    if (saveNameBtn) {
      saveNameBtn.addEventListener('click', () => {
        const input = document.getElementById('name-input');
        const name = input.value.trim();
        if (name.length > 0) {
          const p = Storage.getProfile();
          p.name = name;
          Storage.saveProfile(p);
          document.getElementById('profile-name').textContent = name;
          if (typeof App !== 'undefined' && App.showToast) {
            App.showToast(typeof I18n !== 'undefined' ? I18n.t('toast_name_saved') : '✨ Đổi tên thành công!');
          }
        }
        document.getElementById('name-edit-section').classList.add('hidden');
      });
    }

    const cancelNameBtn = document.getElementById('btn-cancel-name');
    if (cancelNameBtn) {
      cancelNameBtn.addEventListener('click', () => {
        document.getElementById('name-edit-section').classList.add('hidden');
      });
    }

    const nameInput = document.getElementById('name-input');
    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('btn-save-name').click();
      });
    }
  }

  return { render, bindEvents, setDifficulty };
})();
