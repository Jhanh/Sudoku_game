/* =========================================================
   app.js - Main router, screen manager, event wiring
   ========================================================= */
const App = (() => {

  /* ---- i18n helper ---- */
  const t = (key, fallback = '') => {
    if (typeof I18n === 'undefined') return fallback || key;
    const val = I18n.t(key);
    return (val === key && fallback) ? fallback : val;
  };

  const isEn = () =>
    typeof I18n !== 'undefined' && I18n.getLanguage() === 'en';

  /* ---- screen management ---- */
  let isInteractionLocked = false;
  function _setInteractionLock(locked) {
    isInteractionLocked = locked;
    const gameScreen = document.getElementById('screen-game');
    if (gameScreen) {
      gameScreen.classList.toggle('interaction-locked', locked);
    }
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
  }

  function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.querySelector(`.nav-item[data-tab="${tab}"]`).classList.add('active');

    if (tab === 'profile') Profile.render();
    if (tab === 'daily') _renderDailyCalendar(dailyCurrentYear, dailyCurrentMonth);
  }

  /* ---- modals ---- */
  function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }
  function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  /* ---- toast ---- */
  let toastTimer = null;
  function showToast(msg, type = 'info', duration = 2500) {
    const el = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    const iconEl = el ? el.querySelector('.toast-icon') : null;

    if (msgEl) msgEl.textContent = msg;
    if (iconEl) {
      iconEl.classList.remove('success', 'error', 'warning');
      if (type && type !== 'info') iconEl.classList.add(type);
    }

    el.classList.remove('hidden', 'hiding');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => {
        el.classList.add('hidden');
        el.classList.remove('hiding');
      }, 350);
    }, duration);
  }

  /* ---- safe undo with warning ---- */
  function handleUndo() {
    const state = Game.getState();
    if (state && !state.isPaused && !state.isFinished && state.undoStack && state.undoStack.length > 0) {
      const lastAction = state.undoStack[state.undoStack.length - 1];
      if (lastAction && lastAction.type === 'value' && !lastAction.error) {
        const msg = typeof I18n !== 'undefined'
          ? I18n.t('toast_undo_penalty')
          : 'Hoàn tác sẽ trừ điểm combo hiện tại!';
        showToast(msg, 'warning', 2000);
      }
    }
    Game.undo();
  }

  /* ---- confirm & info dialogs ---- */
  let confirmResolve = null;

  function _renderIcon(name, size = 28) {
    if (typeof Icons !== 'undefined') {
      if (typeof Icons.icon === 'function') return Icons.icon(name, size);
      if (typeof Icons.get === 'function') return Icons.get(name, { size });
    }
    return '';
  }

  function _resetConfirmModalState() {
    const modalEl = document.getElementById('modal-confirm');
    const boxEl = modalEl ? modalEl.querySelector('.modal-box') : null;
    const iconEl = document.getElementById('confirm-icon');
    const msgEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('btn-confirm-cancel');
    const okBtn = document.getElementById('btn-confirm-ok');

    if (boxEl) boxEl.classList.remove('info-mode');
    if (msgEl) msgEl.classList.remove('is-list');
    if (iconEl) iconEl.innerHTML = _renderIcon('triangle-alert', 28);
    if (cancelBtn) {
      cancelBtn.classList.remove('hidden');
      cancelBtn.style.display = '';
      cancelBtn.textContent = t('btn_cancel', isEn() ? 'Cancel' : 'Hủy');
    }
    if (okBtn) {
      okBtn.classList.add('btn-danger');
      okBtn.textContent = t('btn_confirm', isEn() ? 'Confirm' : 'Xác nhận');
    }
  }

  function _closeConfirmModal(result) {
    closeModal('modal-confirm');
    _resetConfirmModalState();
    if (confirmResolve) {
      const resolveFn = confirmResolve;
      confirmResolve = null;
      resolveFn(result);
    }
  }

  function confirm(title, message) {
    if (confirmResolve) {
      const prev = confirmResolve;
      confirmResolve = null;
      prev(false);
    }
    return new Promise(resolve => {
      _resetConfirmModalState();
      confirmResolve = resolve;
      document.getElementById('confirm-title').textContent = title;
      const msgEl = document.getElementById('confirm-message');
      if (msgEl) {
        msgEl.textContent = message;
        msgEl.classList.toggle('is-list', typeof message === 'string' && message.includes('\n'));
      }
      openModal('modal-confirm');
    });
  }

  function showInfoModal(title, message) {
    if (confirmResolve) {
      const prev = confirmResolve;
      confirmResolve = null;
      prev(false);
    }
    return new Promise(resolve => {
      confirmResolve = resolve;
      const modalEl = document.getElementById('modal-confirm');
      const boxEl = modalEl ? modalEl.querySelector('.modal-box') : null;
      const iconEl = document.getElementById('confirm-icon');
      const cancelBtn = document.getElementById('btn-confirm-cancel');
      const okBtn = document.getElementById('btn-confirm-ok');

      if (boxEl) boxEl.classList.add('info-mode');
      if (iconEl) iconEl.innerHTML = _renderIcon('info', 28);
      if (cancelBtn) cancelBtn.classList.add('hidden');
      if (okBtn) {
        okBtn.classList.remove('btn-danger');
        okBtn.textContent = t('btn_got_it', isEn() ? 'Got it' : 'Đã hiểu');
      }
      document.getElementById('confirm-title').textContent = title;
      const msgEl = document.getElementById('confirm-message');
      if (msgEl) {
        msgEl.textContent = message;
        msgEl.classList.toggle('is-list', typeof message === 'string' && message.includes('\n'));
      }
      openModal('modal-confirm');
    });
  }

  /* ---- game over ---- */
  let lastGameOverContext = { isDaily: false, dailyDateStr: null, isWin: false };

  function showGameOver(reason, state, breakdown) {
    if (!breakdown && typeof Game !== 'undefined' && Game.getScoreBreakdown) {
      breakdown = Game.getScoreBreakdown(state);
    }
    if (!breakdown) {
      breakdown = {
        diffLabel: state ? state.difficulty : 'easy',
        cellPts: 10,
        correctCount: 0,
        baseScore: 0,
        comboBonus: 0,
        rawScore: (state && state.score) || 0,
        maxStreak: 0,
        timer: (state && state.timer) || 0,
        formattedTime: '00:00',
        timeMultiplier: 1.0,
        finalScore: (state && state.score) || 0,
        mistakes: (state && state.mistakes) || 0
      };
    }

    const isWin = (reason === 'win' || reason === true);
    const isDaily = !!(state && state.isDaily);
    const dailyDate = (state && (state.dailyDateStr || state.dailyDate)) || dailySelectedDateStr || _getTodayStr();
    lastGameOverContext = { isDaily, dailyDateStr: dailyDate, isWin };

    const modalEl = document.getElementById('modal-gameover');
    const innerModal = modalEl ? modalEl.querySelector('.modal-gameover') : null;
    if (modalEl) modalEl.classList.remove('win', 'lose', 'give-up');
    if (innerModal) innerModal.classList.remove('win', 'lose', 'give-up');

    let icon, title, subtitle;
    if (isWin) {
      if (typeof Sound !== 'undefined' && Sound.playWin) Sound.playWin();
      if (modalEl) modalEl.classList.add('win');
      if (innerModal) innerModal.classList.add('win');
      icon = 'party-popper';
      title = t('gameover_win_title', 'Chiến thắng!');
      subtitle = t('gameover_win_subtitle', 'Chúc mừng bạn đã hoàn thành trọn vẹn ván cờ Sudoku!');
    } else if (reason === 'give_up') {
      if (modalEl) modalEl.classList.add('give-up');
      if (innerModal) innerModal.classList.add('give-up');
      icon = 'flag';
      title = t('gameover_giveup_title', 'Đã bỏ cuộc');
      subtitle = t('gameover_giveup_subtitle', 'Ván đấu đã kết thúc. Dưới đây là bảng điểm chi tiết bạn đã tích lũy:');
    } else if (reason === 'total_mistakes_over' || reason === 'consecutive_streak_over' || reason === 'streak_over') {
      if (typeof Sound !== 'undefined' && Sound.playGameOver) Sound.playGameOver();
      if (modalEl) modalEl.classList.add('lose');
      if (innerModal) innerModal.classList.add('lose');
      icon = 'heart-crack';
      title = isEn() ? '3 Mistakes Reached!' : 'Hết 3 cơ hội sai!';
      subtitle = isEn()
        ? 'You reached the 3 mistakes limit and chose not to continue. Game over!'
        : 'Bạn đã phạm tối đa 3 lỗi sai cho phép và dừng ván đấu!';
    } else {
      if (typeof Sound !== 'undefined' && Sound.playGameOver) Sound.playGameOver();
      if (modalEl) modalEl.classList.add('lose');
      if (innerModal) innerModal.classList.add('lose');
      icon = 'heart-crack';
      title = t('gameover_lose_title', 'Kết thúc trận đấu');
      subtitle = t('gameover_lose_subtitle', 'Ván đấu đã dừng lại. Hãy xem lại bảng điểm và thử lại nhé!');
    }

    // Update static elements in modal without rebuilding HTML
    const iconEl = document.getElementById('gameover-icon');
    const titleEl = document.getElementById('gameover-title');
    const subtitleEl = document.getElementById('gameover-subtitle');
    const labelEl = document.getElementById('gameover-score-label');
    const valEl = document.getElementById('gameover-score-val');
    const btnNew = document.getElementById('btn-go-new');
    const btnLobby = document.getElementById('btn-go-lobby');

    if (iconEl) {
      const iconColor = isWin ? '#10B981' : (reason === 'give_up' ? '#64748B' : '#EF4444');
      iconEl.innerHTML = typeof Icons !== 'undefined' ? Icons.get(icon, { size: 56, color: iconColor }) : icon;
    }
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    if (labelEl) labelEl.textContent = t('breakdown_final_score', 'TỔNG ĐIỂM ĐẠT ĐƯỢC').toUpperCase();
    if (valEl) valEl.textContent = breakdown.finalScore;
    if (btnNew) {
      if (isDaily) {
        btnNew.textContent = isWin
          ? t('btn_back_to_daily', isEn() ? 'Back to calendar' : 'Về lịch thử thách')
          : t('btn_retry_daily', isEn() ? 'Retry this day' : 'Thử lại ngày này');
      } else {
        btnNew.textContent = t('btn_play_again', 'Ván mới');
      }
    }
    if (btnLobby) {
      btnLobby.textContent = t('btn_back_lobby', 'Về sảnh chính');
    }

    openModal('modal-gameover');
  }

  /* ---- lobby home update ---- */
  function _updateHomeActions() {
    const hasGame = Storage.hasActiveGame();
    const newGameBtn = document.getElementById('btn-new-game');
    const contSection = document.getElementById('continue-section');
    const quickPlaySection = document.querySelector('.quick-play-section');

    if (newGameBtn) newGameBtn.classList.add('hidden');

    if (hasGame) {
      if (contSection) contSection.classList.remove('hidden');
      if (quickPlaySection) quickPlaySection.classList.add('hidden');
      const saved = Storage.loadGame();
      if (saved) {
        const timeStr = Game.formatTime(saved.timer || 0);
        const infoEl = document.getElementById('continue-info');
        const savedDailyDate = saved.dailyDateStr || saved.dailyDate;
        if (infoEl) {
          if (saved.isDaily && savedDailyDate) {
            const parts = String(savedDailyDate).split('-');
            const ddmm = parts.length === 3 ? `${parts[2]}/${parts[1]}` : savedDailyDate;
            const prefix = t('daily_continue_prefix', isEn() ? 'Daily' : 'Thử thách');
            infoEl.textContent = `${prefix} ${ddmm} - ${timeStr}`;
          } else {
            const diffLabel = t('diff_' + saved.difficulty, (Game.DIFF_LABELS && Game.DIFF_LABELS[saved.difficulty]) || saved.difficulty);
            infoEl.textContent = `${diffLabel} - ${timeStr}`;
          }
        }
      }
    } else {
      if (contSection) contSection.classList.add('hidden');
      if (quickPlaySection) quickPlaySection.classList.remove('hidden');
    }
  }

  function _goToLobby() {
    _updateHomeActions();
    showScreen('lobby');
    showTab('home');
  }

  function _goToDailyTabForDate(dateStr) {
    const targetDate = dateStr || _getTodayStr();
    dailySelectedDateStr = targetDate;
    const parts = String(targetDate).split('-');
    if (parts.length === 3) {
      dailyCurrentYear = parseInt(parts[0], 10) || new Date().getFullYear();
      dailyCurrentMonth = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
    }
    _updateHomeActions();
    showScreen('lobby');
    showTab('daily');
  }

  /* ---- revive & buy hint modals ---- */
  function showReviveModal(state) {
    if (!state) return;
    const cost = Game.getReviveCost();
    const can = Game.canRevive();
    const curScoreEl = document.getElementById('revive-current-score');
    const costEl = document.getElementById('revive-cost-value');
    const remScoreEl = document.getElementById('revive-remaining-score');
    const noticeEl = document.getElementById('revive-insufficient-notice');
    const contBtn = document.getElementById('btn-revive-continue');

    if (curScoreEl) curScoreEl.textContent = (state.score || 0).toLocaleString('vi-VN');
    if (costEl) costEl.textContent = `-${cost.toLocaleString('vi-VN')}`;
    if (remScoreEl) remScoreEl.textContent = Math.max(0, (state.score || 0) - cost).toLocaleString('vi-VN');

    if (noticeEl) {
      noticeEl.classList.toggle('hidden', can);
    }
    if (contBtn) {
      contBtn.disabled = !can;
      contBtn.style.opacity = can ? '1' : '0.45';
      contBtn.style.cursor = can ? 'pointer' : 'not-allowed';
    }

    openModal('modal-revive');
  }

  function showBuyHintModal() {
    const state = Game.getState();
    if (!state || state.isFinished) return;
    if (!state.isPaused) Game.togglePause();

    const cost = Game.getHintPermanentCost(state.difficulty);
    const totalPermanent = Storage.getTotalPermanentScore();
    const can = totalPermanent >= cost;

    const curPointsEl = document.getElementById('buy-hint-current-points');
    const costEl = document.getElementById('buy-hint-cost-value');
    const remPointsEl = document.getElementById('buy-hint-remaining-points');
    const noticeEl = document.getElementById('buy-hint-insufficient-notice');
    const confirmBtn = document.getElementById('btn-buy-hint-confirm');

    if (curPointsEl) curPointsEl.textContent = totalPermanent.toLocaleString('vi-VN');
    if (costEl) costEl.textContent = `-${cost.toLocaleString('vi-VN')}`;
    if (remPointsEl) remPointsEl.textContent = Math.max(0, totalPermanent - cost).toLocaleString('vi-VN');

    if (noticeEl) {
      noticeEl.classList.toggle('hidden', can);
    }
    if (confirmBtn) {
      confirmBtn.disabled = !can;
      confirmBtn.style.opacity = can ? '1' : '0.45';
      confirmBtn.style.cursor = can ? 'pointer' : 'not-allowed';
    }

    openModal('modal-buy-hint');
  }

  function closeBuyHintModal() {
    const modalEl = document.getElementById('modal-buy-hint');
    const wasOpen = modalEl && !modalEl.classList.contains('hidden');
    closeModal('modal-buy-hint');
    if (wasOpen && typeof Game !== 'undefined' && Game.getState) {
      const st = Game.getState();
      if (st && st.isPaused && !st.isFinished && !st.isGameOver && (st.mistakes || 0) < 3) {
        Game.togglePause();
      }
    }
  }

  function resumeGame() {
    if (typeof Game !== 'undefined' && Game.getState) {
      const st = Game.getState();
      if (st && st.isPaused && !st.isFinished && !st.isGameOver && (st.mistakes || 0) < 3) {
        Game.togglePause();
      }
    }
  }

  /* ---- start game ---- */
  function _startGame(difficulty) {
    showScreen('game');
    UIBoard.init();
    UIControls.init();

    Game.setCallbacks(
      (state, source) => {
        if (source === 'timer') {
          UIControls.updateTimer(state);
          return;
        }
        UIBoard.render(state);
        UIControls.update(state);
      },
      (reason, state, breakdown) => showGameOver(reason, state, breakdown),
      (state) => showReviveModal(state)
    );

    // Show a brief loading indicator
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:1rem;">Đang tạo đề…</div>';

    setTimeout(() => {
      Game.start(difficulty);
      // Stop timer immediately so intro animation time is NOT counted towards gameplay:
      if (typeof Game.stopTimer === 'function') Game.stopTimer();

      UIBoard.init();
      UIBoard.render(Game.getState());
      UIControls.update(Game.getState());

      // Lock user interactions on board and tools during intro animation:
      _setInteractionLock(true);

      UIBoard.playIntroAnimation(Game.getState(), () => {
        _setInteractionLock(false);
        if (typeof Game.startTimer === 'function') Game.startTimer();
      });
    }, 50);
  }

  function _resumeGame() {
    showScreen('game');
    UIBoard.init();
    UIControls.init();

    Game.setCallbacks(
      (state, source) => {
        if (source === 'timer') {
          UIControls.updateTimer(state);
          return;
        }
        UIBoard.render(state);
        UIControls.update(state);
      },
      (reason, state, breakdown) => showGameOver(reason, state, breakdown),
      (state) => showReviveModal(state)
    );

    Game.resume();
  }

  /* ---- Daily Challenge & Monthly Calendar View ---- */
  let dailySelectedDateStr = null;
  let dailyCurrentYear = new Date().getFullYear();
  let dailyCurrentMonth = new Date().getMonth() + 1;
  let dailyInitialized = false;

  const DAILY_TROPHY_FALLBACKS = {
    vi: {
      none: 'Tinh thể chờ đánh thức',
      bronze: 'Cúp khiên đồng nguyệt quế',
      silver: 'Bình bạc đôi cánh tinh anh',
      gold: 'Tháp ba ngôi sao hoàng kim',
      platinum: 'Vương miện pha lê bạch kim'
    },
    en: {
      none: 'Dormant crystal',
      bronze: 'Bronze laurel chalice',
      silver: 'Silver winged amphora',
      gold: 'Golden triple-star spire',
      platinum: 'Platinum crystal crown'
    }
  };

  function _getDailySeasonConfig(month) {
    const m = Number(month) || 1;
    if (m >= 2 && m <= 4) {
      return {
        key: 'spring',
        i18nKey: 'daily_season_spring',
        fallbackVi: 'Dấu ấn mùa xuân',
        fallbackEn: 'Spring blossom crest',
        accent: '#F472B6',
        emblem: '<circle cx="80" cy="68" r="6" fill="#FCE7F3"/><circle cx="80" cy="59" r="4" fill="#F9A8D4"/><circle cx="88" cy="65" r="4" fill="#F9A8D4"/><circle cx="85" cy="74" r="4" fill="#F9A8D4"/><circle cx="75" cy="74" r="4" fill="#F9A8D4"/><circle cx="72" cy="65" r="4" fill="#F9A8D4"/>'
      };
    }
    if (m >= 5 && m <= 7) {
      return {
        key: 'summer',
        i18nKey: 'daily_season_summer',
        fallbackVi: 'Dấu ấn mùa hạ',
        fallbackEn: 'Summer sun crest',
        accent: '#FBBF24',
        emblem: '<circle cx="80" cy="68" r="7" fill="#FEF08A"/><path d="M80 55v4M80 77v4M67 68h4M89 68h4M71 59l3 3M86 74l3 3M89 59l-3 3M74 74l-3 3" stroke="#FEF08A" stroke-width="2" stroke-linecap="round"/>'
      };
    }
    if (m >= 8 && m <= 10) {
      return {
        key: 'autumn',
        i18nKey: 'daily_season_autumn',
        fallbackVi: 'Dấu ấn mùa thu',
        fallbackEn: 'Autumn leaf crest',
        accent: '#FB923C',
        emblem: '<path d="M80 56 L84 64 L92 64 L86 70 L88 78 L80 73 L72 78 L74 70 L68 64 L76 64 Z" fill="#FED7AA"/>'
      };
    }
    return {
      key: 'winter',
      i18nKey: 'daily_season_winter',
      fallbackVi: 'Dấu ấn mùa đông',
      fallbackEn: 'Winter crystal crest',
      accent: '#38BDF8',
      emblem: '<path d="M80 56v24M68 68h24M72 60l16 16M88 60L72 76" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round"/><circle cx="80" cy="68" r="3.5" fill="#FFFFFF"/>'
    };
  }

  function _getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function _formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function _updateDailyLobbyCard() {
    // Daily widget removed from lobby home
  }

  function _renderDailyTrophy(tier, month = dailyCurrentMonth) {
    const safeTier = ['none', 'bronze', 'silver', 'gold', 'platinum'].includes(tier) ? tier : 'none';
    const season = _getDailySeasonConfig(month);

    const leftPanel = document.querySelector('#tab-daily .daily-left-panel');
    if (leftPanel) {
      leftPanel.setAttribute('data-tier', safeTier);
      leftPanel.setAttribute('data-season', season.key);
    }

    const tierLabelEl = document.getElementById('daily-trophy-tier-label');
    if (tierLabelEl) {
      const lang = isEn() ? 'en' : 'vi';
      const fallbackTierName = DAILY_TROPHY_FALLBACKS[lang][safeTier];
      const tierI18nMap = {
        none: t('daily_trophy_tier_none', fallbackTierName),
        bronze: t('daily_trophy_tier_bronze', fallbackTierName),
        silver: t('daily_trophy_tier_silver', fallbackTierName),
        gold: t('daily_trophy_tier_gold', fallbackTierName),
        platinum: t('daily_trophy_tier_platinum', fallbackTierName)
      };
      tierLabelEl.textContent = tierI18nMap[safeTier];
    }

    const seasonLabelEl = document.getElementById('daily-season-label');
    if (seasonLabelEl) {
      const fallbackSeason = isEn() ? season.fallbackEn : season.fallbackVi;
      seasonLabelEl.textContent = t(season.i18nKey, fallbackSeason);
    }

    const backdrop = `
      <g class="daily-orbit-ring">
        <circle cx="80" cy="76" r="56" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1" stroke-dasharray="3 5"/>
        <circle cx="80" cy="20" r="2.6" fill="${season.accent}" opacity="0.9"/>
      </g>
      <circle cx="80" cy="76" r="44" fill="none" stroke="rgba(255,255,255,0.11)" stroke-width="1"/>
      <path d="M28 34 L30 39 L35 41 L30 43 L28 48 L26 43 L21 41 L26 39 Z" fill="#FDE047" class="daily-star-twinkle"/>
      <path d="M132 42 L133.5 46 L137.5 47.5 L133.5 49 L132 53 L130.5 49 L126.5 47.5 L130.5 46 Z" fill="#E0F2FE" class="daily-star-twinkle-delay"/>
      <path d="M26 106 L27.2 109 L30.2 110.2 L27.2 111.4 L26 114.4 L24.8 111.4 L21.8 110.2 L24.8 109 Z" fill="${season.accent}" opacity="0.85" class="daily-star-twinkle-delay"/>
      <ellipse cx="80" cy="142" rx="46" ry="7" fill="rgba(255,255,255,0.18)"/>
    `;

    let svgMarkup = '';
    if (safeTier === 'none') {
      svgMarkup = `<svg class="daily-big-trophy-svg" viewBox="0 0 160 156" data-tier="none" data-season="${season.key}" aria-hidden="true">
        ${backdrop}
        <defs>
          <linearGradient id="gDailyNone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#CBD5E1" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#64748B" stop-opacity="0.35"/>
          </linearGradient>
        </defs>
        <rect x="46" y="126" width="68" height="14" rx="4" fill="#1E293B" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>
        <polygon points="80,24 110,48 104,96 80,118 56,96 50,48" fill="url(#gDailyNone)" stroke="rgba(255,255,255,0.58)" stroke-width="1.5" stroke-dasharray="4 3"/>
        <polygon points="80,24 96,54 80,118 64,54" fill="rgba(255,255,255,0.14)"/>
        <line x1="50" y1="48" x2="110" y2="48" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <path d="M80 56 L83 65 L92 65 L85 70 L87.5 79 L80 73.5 L72.5 79 L75 70 L68 65 L77 65 Z" fill="none" stroke="rgba(255,255,255,0.68)" stroke-width="1.6"/>
      </svg>`;
    } else if (safeTier === 'bronze') {
      svgMarkup = `<svg class="daily-big-trophy-svg" viewBox="0 0 160 156" data-tier="bronze" data-season="${season.key}" aria-hidden="true">
        ${backdrop}
        <defs>
          <linearGradient id="gDailyBrz" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#7C2D12"/>
            <stop offset="35%" stop-color="#FDBA74"/>
            <stop offset="70%" stop-color="#EA580C"/>
            <stop offset="100%" stop-color="#7C2D12"/>
          </linearGradient>
        </defs>
        <path d="M44 48 L24 48 L28 78 L48 86" fill="none" stroke="url(#gDailyBrz)" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M116 48 L136 48 L132 78 L112 86" fill="none" stroke="url(#gDailyBrz)" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
        <rect x="40" y="128" width="80" height="15" rx="4" fill="#29150B"/>
        <rect x="54" y="131" width="52" height="9" rx="2" fill="url(#gDailyBrz)"/>
        <rect x="52" y="116" width="56" height="12" rx="3" fill="url(#gDailyBrz)"/>
        <path d="M72 98 L88 98 L85 117 L75 117 Z" fill="url(#gDailyBrz)"/>
        <path d="M40 36 L120 36 L114 76 C110 94 96 102 80 104 C64 102 50 94 46 76 Z" fill="url(#gDailyBrz)"/>
        <path d="M63 82 C55 72 57 56 67 49 M97 82 C105 72 103 56 93 49" fill="none" stroke="#FEF3C7" stroke-width="2.6" stroke-linecap="round"/>
        <polygon points="80,52 83.5,62 94,62 85.5,68 88.5,78 80,72 71.5,78 74.5,68 66,62 76.5,62" fill="#FFF7ED"/>
      </svg>`;
    } else if (safeTier === 'silver') {
      svgMarkup = `<svg class="daily-big-trophy-svg" viewBox="0 0 160 156" data-tier="silver" data-season="${season.key}" aria-hidden="true">
        ${backdrop}
        <defs>
          <linearGradient id="gDailySlv" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="38%" stop-color="#FFFFFF"/>
            <stop offset="72%" stop-color="#CBD5E1"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
        </defs>
        <path d="M50 58 C24 48 16 26 30 22 C36 34 44 40 52 46" fill="url(#gDailySlv)"/>
        <path d="M48 70 C24 64 18 46 28 40 C35 50 42 54 50 60" fill="url(#gDailySlv)" opacity="0.9"/>
        <path d="M110 58 C136 48 144 26 130 22 C124 34 116 40 108 46" fill="url(#gDailySlv)"/>
        <path d="M112 70 C136 64 142 46 132 40 C125 50 118 54 110 60" fill="url(#gDailySlv)" opacity="0.9"/>
        <rect x="42" y="128" width="76" height="15" rx="5" fill="#0F172A"/>
        <rect x="56" y="131" width="48" height="9" rx="2" fill="url(#gDailySlv)"/>
        <rect x="54" y="117" width="52" height="11" rx="4" fill="url(#gDailySlv)"/>
        <path d="M74 96 L86 96 L83 118 L77 118 Z" fill="url(#gDailySlv)"/>
        <path d="M50 30 L110 30 C112 68 98 98 80 98 C62 98 48 68 50 30 Z" fill="url(#gDailySlv)"/>
        <ellipse cx="80" cy="30" rx="30" ry="5.5" fill="#F8FAFC"/>
        <polygon points="80,47 91,62 80,77 69,62" fill="#0284C7" stroke="#FFFFFF" stroke-width="2"/>
        <polygon points="80,50 86,62 80,66" fill="#BAE6FD"/>
      </svg>`;
    } else if (safeTier === 'gold') {
      svgMarkup = `<svg class="daily-big-trophy-svg" viewBox="0 0 160 156" data-tier="gold" data-season="${season.key}" aria-hidden="true">
        ${backdrop}
        <defs>
          <linearGradient id="gDailyGld" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="45%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#92400E"/>
          </linearGradient>
        </defs>
        <rect x="38" y="126" width="84" height="17" rx="5" fill="#1E1B18"/>
        <rect x="50" y="130" width="60" height="9" rx="2" fill="url(#gDailyGld)"/>
        <path d="M52 114 L108 114 L114 126 L46 126 Z" fill="url(#gDailyGld)"/>
        <path d="M80 114 C62 96 58 72 68 46" fill="none" stroke="url(#gDailyGld)" stroke-width="7" stroke-linecap="round"/>
        <path d="M80 114 C96 98 102 82 96 62" fill="none" stroke="url(#gDailyGld)" stroke-width="6" stroke-linecap="round"/>
        <polygon points="80,82 84,91 94,91 86,97 89,106 80,100 71,106 74,97 66,91 76,91" fill="url(#gDailyGld)" stroke="#FEF9C3" stroke-width="1"/>
        <polygon points="98,52 103,63 115,63 105,70 109,81 98,74 87,81 91,70 81,63 93,63" fill="url(#gDailyGld)" stroke="#FEF9C3" stroke-width="1.2"/>
        <polygon points="66,22 73,38 90,38 76,48 81,64 66,54 51,64 56,48 42,38 59,38" fill="url(#gDailyGld)" stroke="#FFFFFF" stroke-width="1.5"/>
        <polygon points="66,25 71,38 84,38 73,45" fill="#FEF9C3" opacity="0.65"/>
      </svg>`;
    } else {
      svgMarkup = `<svg class="daily-big-trophy-svg" viewBox="0 0 160 156" data-tier="platinum" data-season="${season.key}" aria-hidden="true">
        ${backdrop}
        <defs>
          <linearGradient id="gDailyPlat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F0F9FF"/>
            <stop offset="40%" stop-color="#7DD3FC"/>
            <stop offset="78%" stop-color="#0284C7"/>
            <stop offset="100%" stop-color="#1E3A8A"/>
          </linearGradient>
          <linearGradient id="gDailyCrown" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="50%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#0284C7"/>
          </linearGradient>
        </defs>
        <rect x="36" y="128" width="88" height="16" rx="5" fill="#0F172A" stroke="#7DD3FC" stroke-width="1"/>
        <rect x="50" y="132" width="60" height="8" rx="2" fill="url(#gDailyCrown)"/>
        <path d="M50 116 L110 116 L116 128 L44 128 Z" fill="url(#gDailyPlat)"/>
        <polygon points="73,94 87,94 92,116 68,116" fill="url(#gDailyPlat)"/>
        <polygon points="44,48 116,48 104,88 80,98 56,88" fill="url(#gDailyPlat)" stroke="#E0F2FE" stroke-width="1.2"/>
        <polygon points="62,48 98,48 90,92 80,98 70,92" fill="rgba(255,255,255,0.24)"/>
        <path d="M42 48 L36 26 L56 38 L66 22 L80 34 L80 16 L80 34 L94 22 L104 38 L124 26 L118 48 Z" fill="url(#gDailyCrown)" stroke="#BAE6FD" stroke-width="1.2" stroke-linejoin="round"/>
        <circle cx="36" cy="24" r="2.8" fill="#FFFFFF"/>
        <circle cx="66" cy="20" r="2.6" fill="#E0F2FE"/>
        <circle cx="80" cy="14" r="3.8" fill="#FDE047"/>
        <circle cx="94" cy="20" r="2.6" fill="#E0F2FE"/>
        <circle cx="124" cy="24" r="2.8" fill="#FFFFFF"/>
        ${season.emblem}
      </svg>`;
    }

    const container = document.getElementById('daily-big-trophy-container');
    if (container) {
      container.innerHTML = svgMarkup;
    }
    return svgMarkup;
  }

  function _renderDailyCalendar(year, month) {
    const now = new Date();
    const realYear = now.getFullYear();
    const realMonth = now.getMonth() + 1;

    // Enforce calendar bounds: [2020-01 .. current real month]
    if (year > realYear || (year === realYear && month > realMonth)) {
      year = realYear;
      month = realMonth;
    }
    if (year < 2020 || (year === 2020 && month < 1)) {
      year = 2020;
      month = 1;
    }

    dailyCurrentYear = year;
    dailyCurrentMonth = month;

    const prevBtn = document.getElementById('btn-daily-prev-month');
    const nextBtn = document.getElementById('btn-daily-next-month');
    const atMinMonth = (year < 2020) || (year === 2020 && month <= 1);
    const atMaxMonth = (year > realYear) || (year === realYear && month >= realMonth);

    if (prevBtn) {
      prevBtn.disabled = atMinMonth;
      prevBtn.classList.toggle('disabled', atMinMonth);
    }
    if (nextBtn) {
      nextBtn.disabled = atMaxMonth;
      nextBtn.classList.toggle('disabled', atMaxMonth);
    }

    const todayStr = _getTodayStr();
    const summary = (typeof Storage !== 'undefined' && Storage.getDailyMonthSummary)
      ? Storage.getDailyMonthSummary(year, month)
      : { wonCount: 0, results: {} };
    const daysInMonth = summary.daysInMonth || new Date(year, month, 0).getDate();
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // Sunday = 0
    const wonCount = summary.wonCount || 0;

    // Synchronize selected date whenever switched month differs from current selection
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
    if (!dailySelectedDateStr || !dailySelectedDateStr.startsWith(monthPrefix)) {
      if (year === realYear && month === realMonth) {
        dailySelectedDateStr = todayStr;
      } else {
        let candidateDate = null;
        for (let d = daysInMonth; d >= 1; d--) {
          const dStr = `${monthPrefix}${String(d).padStart(2, '0')}`;
          if (dStr > todayStr) continue;
          const item = (summary.results && summary.results[dStr])
            || ((typeof Storage !== 'undefined' && Storage.getDailyResult) ? Storage.getDailyResult(dStr) : null);
          const won = !!(item && (item.result === 'win' || item.status === 'win'));
          if (!won) {
            candidateDate = dStr;
            break;
          }
        }
        dailySelectedDateStr = candidateDate || `${monthPrefix}${String(daysInMonth).padStart(2, '0')}`;
      }
    }

    // Header labels
    const yearLabel = document.getElementById('daily-year-label');
    const monthTitle = document.getElementById('daily-month-title');
    const badgeText = document.getElementById('daily-month-badge-text');

    if (yearLabel) yearLabel.textContent = String(year);
    if (monthTitle) {
      monthTitle.textContent = isEn() ? `Month ${month}` : `Tháng ${month}`;
    }
    if (badgeText) {
      badgeText.textContent = `${wonCount}/${daysInMonth}`;
    }

    // Determine highest trophy tier achieved
    let highestTier = 'none';
    if (wonCount >= daysInMonth) highestTier = 'platinum';
    else if (wonCount >= 21) highestTier = 'gold';
    else if (wonCount >= 14) highestTier = 'silver';
    else if (wonCount >= 7) highestTier = 'bronze';

    _renderDailyTrophy(highestTier, month);

    // Milestones track progress based on daysInMonth
    const fillEl = document.getElementById('daily-milestone-fill');
    if (fillEl) {
      const pct = Math.min(100, Math.round((wonCount / daysInMonth) * 100));
      fillEl.style.width = `${pct}%`;
    }

    const milestones = [
      { id: '7', target: 7, tier: 'bronze', label: '7' },
      { id: '14', target: 14, tier: 'silver', label: '14' },
      { id: '21', target: 21, tier: 'gold', label: '21' },
      { id: 'end', target: daysInMonth, tier: 'platinum', label: String(daysInMonth) }
    ];

    milestones.forEach(m => {
      const nodeEl = document.getElementById(`milestone-node-${m.id}`);
      const badgeEl = document.getElementById(`milestone-badge-${m.id}`);
      const isReached = wonCount >= m.target;
      const leftPct = Math.min(100, (m.target / daysInMonth) * 100);

      if (nodeEl) {
        nodeEl.style.left = `${leftPct}%`;
        nodeEl.classList.toggle('completed', isReached);
        nodeEl.title = isReached
          ? `${isEn() ? 'Reached' : 'Đã đạt'}: ${m.target} ${isEn() ? 'days' : 'ngày'}`
          : `${isEn() ? 'Target' : 'Mục tiêu'}: ${m.target} ${isEn() ? 'days' : 'ngày'}`;
      }
      if (badgeEl) {
        badgeEl.classList.toggle('achieved', isReached);
        if (isReached) {
          badgeEl.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
        } else {
          badgeEl.textContent = m.label;
        }
      }
    });

    // Calendar Days Grid
    const gridEl = document.getElementById('daily-grid');
    if (gridEl) {
      gridEl.innerHTML = '';

      // Empty padding cells before first day
      for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'daily-cell daily-day-cell empty';
        gridEl.appendChild(emptyCell);
      }

      // Day cells
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const itemResult = (summary.results && summary.results[dateStr])
          || ((typeof Storage !== 'undefined' && Storage.getDailyResult) ? Storage.getDailyResult(dateStr) : null);
        const isWon = !!(itemResult && (itemResult.result === 'win' || itemResult.status === 'win'));
        const isToday = (dateStr === todayStr);
        const isFuture = (dateStr > todayStr);
        const isSelected = (dateStr === dailySelectedDateStr);

        const cell = document.createElement('div');
        cell.className = 'daily-cell daily-day-cell';
        if (isWon) cell.classList.add('won');
        if (isSelected) cell.classList.add('selected');
        if (isFuture) cell.classList.add('future');
        if (isToday && !isWon) cell.classList.add('today-unplayed');

        if (isWon) {
          cell.innerHTML = `
            <div class="daily-coin">
              <svg viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
          `;
        } else {
          cell.innerHTML = `<span>${day}</span>`;
        }

        cell.addEventListener('click', () => {
          if (isFuture) return;
          dailySelectedDateStr = dateStr;
          document.querySelectorAll('.daily-cell').forEach(c => c.classList.remove('selected'));
          cell.classList.add('selected');
          _updateDailyDetailCard(dateStr);
        });

        gridEl.appendChild(cell);
      }
    }

    _updateDailyDetailCard(dailySelectedDateStr);
  }

  function _updateDailyDetailCard(dateStr) {
    if (!dateStr) dateStr = _getTodayStr();
    const todayStr = _getTodayStr();
    const isFuture = dateStr > todayStr;
    const diff = (typeof SudokuEngine !== 'undefined' && SudokuEngine.getDailyDifficulty)
      ? SudokuEngine.getDailyDifficulty(dateStr)
      : 'medium';
    const result = (typeof Storage !== 'undefined' && Storage.getDailyResult)
      ? Storage.getDailyResult(dateStr)
      : null;
    const isWon = !!(result && (result.result === 'win' || result.status === 'win'));

    const dateEl = document.getElementById('daily-detail-date');
    const diffEl = document.getElementById('daily-detail-diff');
    const scoreEl = document.getElementById('daily-detail-score');
    const timeEl = document.getElementById('daily-detail-time');
    const playBtn = document.getElementById('btn-daily-play');
    const completedBadge = document.getElementById('daily-completed-badge');

    if (dateEl) dateEl.textContent = _formatDateDisplay(dateStr);
    if (diffEl) {
      const activeDiff = (isWon && result.difficulty) ? result.difficulty : diff;
      diffEl.textContent = t('diff_' + activeDiff, activeDiff);
    }

    if (isWon) {
      if (scoreEl) scoreEl.textContent = (result.score || 0).toLocaleString('vi-VN');
      if (timeEl) timeEl.textContent = (typeof Game !== 'undefined' && Game.formatTime) ? Game.formatTime(result.time || 0) : String(result.time);
      if (completedBadge) completedBadge.classList.remove('hidden');
      if (playBtn) playBtn.classList.add('hidden');
    } else {
      if (scoreEl) scoreEl.textContent = '-';
      if (timeEl) timeEl.textContent = '-';
      if (completedBadge) completedBadge.classList.add('hidden');
      if (playBtn) {
        playBtn.classList.remove('hidden');
        if (isFuture) {
          playBtn.disabled = true;
          const span = playBtn.querySelector('span');
          if (span) span.textContent = t('daily_not_unlocked', 'Chưa mở');
        } else {
          playBtn.disabled = false;
          const span = playBtn.querySelector('span');
          if (span) span.textContent = t('daily_btn_play', 'Chơi');
        }
      }
    }
  }

  function _startDailyGame(dateStr) {
    if (!dateStr) dateStr = _getTodayStr();
    const diff = (typeof SudokuEngine !== 'undefined' && SudokuEngine.getDailyDifficulty)
      ? SudokuEngine.getDailyDifficulty(dateStr)
      : 'medium';
    const { puzzle, solution } = SudokuEngine.generateFromSeed(dateStr, diff);

    showScreen('game');
    UIBoard.init();
    UIControls.init();

    Game.setCallbacks(
      (state, source) => {
        if (source === 'timer') {
          UIControls.updateTimer(state);
          return;
        }
        UIBoard.render(state);
        UIControls.update(state);
      },
      (reason, state, breakdown) => {
        showGameOver(reason, state, breakdown);
      },
      (state) => showReviveModal(state)
    );

    const board = document.getElementById('sudoku-board');
    if (board) {
      board.innerHTML = '<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:1rem;">Đang tạo đề thử thách…</div>';
    }

    setTimeout(() => {
      Game.startFromPuzzle(puzzle, solution, diff, { isDaily: true, dateStr });
      if (typeof Game.stopTimer === 'function') Game.stopTimer();

      UIBoard.init();
      UIBoard.render(Game.getState());
      UIControls.update(Game.getState());

      _setInteractionLock(true);
      UIBoard.playIntroAnimation(Game.getState(), () => {
        _setInteractionLock(false);
        if (typeof Game.startTimer === 'function') Game.startTimer();
      });
    }, 50);
  }

  function _initDailyChallenge() {
    dailyInitialized = true;

    // 1. Month navigation buttons
    const prevBtn = document.getElementById('btn-daily-prev-month');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (prevBtn.disabled) return;
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        let y = dailyCurrentYear;
        let m = dailyCurrentMonth - 1;
        if (m < 1) { m = 12; y--; }
        _renderDailyCalendar(y, m);
      });
    }

    const nextBtn = document.getElementById('btn-daily-next-month');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (nextBtn.disabled) return;
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        let y = dailyCurrentYear;
        let m = dailyCurrentMonth + 1;
        if (m > 12) { m = 1; y++; }
        _renderDailyCalendar(y, m);
      });
    }

    // 2. Info / Rules button (single-button info modal)
    const infoBtn = document.getElementById('btn-daily-info');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => {
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        const dict = (typeof I18n !== 'undefined' && I18n.translations)
          ? I18n.translations[I18n.getLanguage()]
          : null;
        const rulesMsg = (dict && dict.daily_rules_body) ? dict.daily_rules_body : t('daily_info_content');
        showInfoModal(t('daily_info_title'), rulesMsg);
      });
    }

    // 3. Play button
    const playBtn = document.getElementById('btn-daily-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        _startDailyGame(dailySelectedDateStr || _getTodayStr());
      });
    }
  }

  function onLanguageChange() {
    _updateHomeActions();
    const dailyTab = document.getElementById('tab-daily');
    if (dailyTab && (dailyTab.classList.contains('active') || dailyInitialized)) {
      _renderDailyCalendar(dailyCurrentYear, dailyCurrentMonth);
    }
    const gameScreen = document.getElementById('screen-game');
    if (gameScreen && gameScreen.classList.contains('active') && typeof Game !== 'undefined' && Game.getState) {
      const st = Game.getState();
      if (st && typeof UIControls !== 'undefined') {
        if (typeof UIControls.updateStatus === 'function') {
          UIControls.updateStatus(st);
        } else if (typeof UIControls.update === 'function') {
          UIControls.update(st);
        }
      }
    }
  }

  /* ---- mobile device detection & polite notice ---- */
  function initMobileNotice() {
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileUA) {
      document.body.classList.add('mobile-device');
    }
    const overlay = document.getElementById('mobile-notice-overlay');
    const dismissBtn = document.getElementById('btn-dismiss-mobile-notice');
    if (overlay && dismissBtn) {
      if (sessionStorage.getItem('sudoku_mobile_notice_dismissed') === '1') {
        overlay.classList.add('dismissed');
      }
      dismissBtn.addEventListener('click', () => {
        overlay.classList.add('dismissed');
        sessionStorage.setItem('sudoku_mobile_notice_dismissed', '1');
      });
    }
  }


  /* ---- Settings Modal & Controls ---- */
  function initSettings() {
    // Current stored settings
    const lang = Storage.getLanguage();
    const theme = Storage.getTheme();
    const settings = Storage.getSettings();

    // 1. Language segmented buttons
    const langBtns = document.querySelectorAll('#control-language .seg-btn');
    langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.addEventListener('click', () => {
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        I18n.setLanguage(btn.dataset.lang);
        onLanguageChange();
      });
    });

    // 2. Theme segmented buttons
    const themeBtns = document.querySelectorAll('#control-theme .seg-btn');
    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
      btn.addEventListener('click', () => {
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const newTheme = btn.dataset.theme;
        Storage.setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      });
    });

    // 3. Audio toggle
    const soundToggle = document.getElementById('setting-toggle-sound');
    if (soundToggle) {
      soundToggle.checked = !Sound.isMuted();
      soundToggle.addEventListener('change', () => {
        Sound.toggle();
      });
    }

    // 4. Gameplay helper toggles
    const autoclearToggle = document.getElementById('setting-toggle-autoclear');
    if (autoclearToggle) {
      autoclearToggle.checked = settings.autoClearNotes !== false;
      autoclearToggle.addEventListener('change', () => {
        Storage.updateSetting('autoClearNotes', autoclearToggle.checked);
      });
    }

    const sameNumToggle = document.getElementById('setting-toggle-same-num');
    if (sameNumToggle) {
      sameNumToggle.checked = settings.highlightSame !== false;
      sameNumToggle.addEventListener('change', () => {
        Storage.updateSetting('highlightSame', sameNumToggle.checked);
        if (Game.isActive()) UIBoard.render(Game.getState());
      });
    }

    const mistakesToggle = document.getElementById('setting-toggle-mistakes');
    if (mistakesToggle) {
      mistakesToggle.checked = settings.highlightMistakes !== false;
      mistakesToggle.addEventListener('change', () => {
        Storage.updateSetting('highlightMistakes', mistakesToggle.checked);
        if (Game.isActive()) UIBoard.render(Game.getState());
      });
    }

    const fastfillToggle = document.getElementById('setting-toggle-fastfill');
    if (fastfillToggle) {
      fastfillToggle.checked = settings.fastFillDefault === true;
      fastfillToggle.addEventListener('change', () => {
        Storage.updateSetting('fastFillDefault', fastfillToggle.checked);
      });
    }

    // 5. Gear button in profile header
    const gearBtn = document.getElementById('btn-settings-profile');
    if (gearBtn) {
      gearBtn.addEventListener('click', () => {
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        // Sync toggles state right before showing modal
        if (soundToggle) soundToggle.checked = !Sound.isMuted();
        const curSettings = Storage.getSettings();
        if (autoclearToggle) autoclearToggle.checked = curSettings.autoClearNotes !== false;
        if (sameNumToggle) sameNumToggle.checked = curSettings.highlightSame !== false;
        if (mistakesToggle) mistakesToggle.checked = curSettings.highlightMistakes !== false;
        if (fastfillToggle) fastfillToggle.checked = curSettings.fastFillDefault === true;
        openModal('modal-settings');
      });
    }

    // 6. Reset data inside settings modal
    const resetBtn = document.getElementById('btn-settings-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        const title = t('settings_reset_confirm_title', 'Xóa dữ liệu');
        const msg = t('settings_reset_confirm_msg', 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu, thời gian chơi và đưa game về trạng thái ban đầu?');
        const ok = await confirm(title, msg);
        if (ok) {
          Storage.resetAllData();
          Profile.render();
          closeModal('modal-settings');
          _updateHomeActions();
          showToast(t('toast_data_reset', 'Đã xóa toàn bộ dữ liệu thành công!'));
        }
      });
    }

    // 7. Export data (Backup)
    const exportBtn = document.getElementById('btn-settings-export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        const res = await Storage.exportData();
        if (res && res.success) {
          showToast(t('toast_export_success', 'Đã xuất dữ liệu sao lưu thành công!'));
        } else if (res && res.aborted) {
          // User cancelled Save As dialog - do nothing
        } else {
          showToast(t('toast_export_failed', 'Có lỗi khi tạo tệp sao lưu!'));
        }
      });
    }

    // 8. Import data (Transfer / Restore)
    const importBtn = document.getElementById('btn-settings-import-data');
    const importInput = document.getElementById('input-import-file');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => {
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        importInput.value = '';
        importInput.click();
      });

      importInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const title = t('settings_import_confirm_title', 'Khôi phục dữ liệu');
        const msg = t('settings_import_confirm_msg', 'Nhập dữ liệu từ tệp này sẽ ghi đè toàn bộ tiến trình, lịch sử đấu và cài đặt hiện tại trên máy. Bạn có chắc chắn muốn tiếp tục?');
        const ok = await confirm(title, msg);
        if (!ok) {
          importInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const raw = event.target.result;
            const res = Storage.importData(raw);
            if (res && res.success) {
              // 1. Language & Theme synchronization
              const newLang = Storage.getLanguage();
              const newTheme = Storage.getTheme();
              if (typeof I18n !== 'undefined' && I18n.setLanguage) {
                I18n.setLanguage(newLang);
              }
              document.documentElement.setAttribute('data-theme', newTheme);

              // 2. Segmented buttons state
              const curLangBtns = document.querySelectorAll('#control-language .seg-btn');
              curLangBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === newLang));
              const curThemeBtns = document.querySelectorAll('#control-theme .seg-btn');
              curThemeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === newTheme));

              // 3. Audio synchronization
              if (typeof Sound !== 'undefined' && Sound.syncWithStorage) {
                Sound.syncWithStorage();
              }
              if (soundToggle) soundToggle.checked = Storage.isSoundEnabled();

              // 4. Gameplay toggles
              const curSettings = Storage.getSettings();
              if (autoclearToggle) autoclearToggle.checked = curSettings.autoClearNotes !== false;
              if (sameNumToggle) sameNumToggle.checked = curSettings.highlightSame !== false;
              if (mistakesToggle) mistakesToggle.checked = curSettings.highlightMistakes !== false;
              if (fastfillToggle) fastfillToggle.checked = curSettings.fastFillDefault === true;

              // 5. Update Profile UI
              if (typeof Profile !== 'undefined' && Profile.render) {
                Profile.render();
              }

              // 6. Update Lobby Continue card
              _updateHomeActions();

              // 7. Audio & Toast feedback
              if (typeof Sound !== 'undefined' && Sound.playCorrect) Sound.playCorrect();
              showToast(t('toast_import_success', 'Đã khôi phục dữ liệu thành công!'));
            } else {
              showToast(t('toast_import_invalid', 'Tệp dữ liệu không hợp lệ hoặc bị lỗi định dạng!'));
            }
          } catch (err) {
            console.error('Import reading error:', err);
            showToast(t('toast_import_failed', 'Lỗi khi đọc tệp sao lưu!'));
          } finally {
            importInput.value = '';
          }
        };

        reader.onerror = () => {
          showToast(t('toast_import_failed', 'Lỗi khi đọc tệp sao lưu!'));
          importInput.value = '';
        };

        reader.readAsText(file);
      });
    }
  }

  /* ---- wire everything ---- */
  function init() {
    // Initialize Theme & Language on boot
    if (typeof I18n !== 'undefined' && I18n.init) I18n.init();
    if (typeof Storage !== 'undefined' && Storage.getTheme) {
      document.documentElement.setAttribute('data-theme', Storage.getTheme());
    }
    initSettings();

    // Splash → Lobby navigation
    const splashEl = document.getElementById('screen-splash');
    const exploreBtn = document.getElementById('btn-explore');

    let isNavigatingToLobby = false;
    const navigateToLobby = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isNavigatingToLobby) return;
      isNavigatingToLobby = true;
      _goToLobby();
      setTimeout(() => { isNavigatingToLobby = false; }, 400);
    };

    if (exploreBtn) {
      exploreBtn.addEventListener('click', navigateToLobby);
    }

    // Auto-save on page unload / hide
    window.addEventListener('beforeunload', () => {
      if (Game.isActive()) Game.destroy();
    });
    window.addEventListener('pagehide', () => {
      if (Game.isActive()) Game.destroy();
    });

    // In-game New Game button
    const inGameNewBtn = document.getElementById('btn-in-game-new');
    if (inGameNewBtn) {
      inGameNewBtn.addEventListener('click', async () => {
        const st = Game.getState();
        if (st && st.isPaused) return;
        const title = t('in_game_new_game_confirm_title', 'Ván chơi mới');
        const msg = t('in_game_new_game_confirm_msg', 'Bạn có muốn bắt đầu ván mới không? (Ván hiện tại sẽ bị hủy)');
        const ok = await confirm(title, msg);
        if (ok) {
          Game.abandonSaved();
          openModal('modal-difficulty');
        }
      });
    }

    // Navbar tabs
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        showTab(item.dataset.tab);
      });
    });

    // How to play
    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
      Tutorial.show();
    });

    // New game → difficulty modal
    document.getElementById('btn-new-game').addEventListener('click', () => {
      if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
      openModal('modal-difficulty');
    });

    // Continue game
    document.getElementById('btn-continue').addEventListener('click', () => _resumeGame());

    // Abandon saved game
    document.getElementById('btn-abandon').addEventListener('click', async () => {
      const title = t('home_abandon_confirm_title', 'Bỏ cuộc');
      const msg = t('home_abandon_confirm_msg', 'Ván đang chơi sẽ bị xóa. Bạn có chắc chắn muốn bỏ cuộc?');
      const ok = await confirm(title, msg);
      if (ok) {
        Game.abandonSaved();
        _updateHomeActions();
      }
    });

    // Difficulty selection
    document.querySelectorAll('.diff-card').forEach(card => {
      card.addEventListener('click', () => {
        closeModal('modal-difficulty');
        _startGame(card.dataset.difficulty);
      });
    });

    // Quick play difficulty cards
    document.querySelectorAll('.quick-play-card').forEach(card => {
      card.addEventListener('click', async () => {
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        if (Storage.hasActiveGame()) {
          const title = t('home_abandon_confirm_title', 'Bỏ cuộc');
          const msg = t('home_abandon_confirm_msg', 'Ván đang chơi sẽ bị xóa. Bạn có chắc chắn muốn bỏ cuộc?');
          const ok = await confirm(title, msg);
          if (!ok) return;
        }
        _startGame(card.dataset.difficulty);
      });
    });

    // Back to lobby (auto-save)
    document.getElementById('btn-back').addEventListener('click', () => {
      Game.destroy();
      _goToLobby();
    });

    // Give up in-game
    document.getElementById('btn-give-up-header').addEventListener('click', async () => {
      const title = t('in_game_give_up_confirm_title', 'Bỏ cuộc');
      const msg = t('in_game_give_up_confirm_msg', 'Ván này sẽ được tính là thua. Bạn có chắc chắn?');
      const ok = await confirm(title, msg);
      if (ok) {
        Game.giveUp();
      }
    });

    // Confirm dialog buttons
    document.getElementById('btn-confirm-ok').addEventListener('click', () => {
      _closeConfirmModal(true);
    });
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
      _closeConfirmModal(false);
    });

    // Revive Modal buttons (3 Mistakes)
    const reviveContBtn = document.getElementById('btn-revive-continue');
    if (reviveContBtn) {
      reviveContBtn.addEventListener('click', () => {
        if (Game.canRevive()) {
          closeModal('modal-revive');
          Game.revive();
          if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
          showToast(isEn() ? 'Revived! Mistakes set to 2/3.' : 'Tiếp tục ván đấu! Lỗi giảm về 2/3.');
        }
      });
    }

    const reviveGiveupBtn = document.getElementById('btn-revive-giveup');
    if (reviveGiveupBtn) {
      reviveGiveupBtn.addEventListener('click', () => {
        closeModal('modal-revive');
        Game.giveUpFromMistakes();
      });
    }

    // Buy Hint Modal buttons (Mastery Points)
    const buyHintConfirmBtn = document.getElementById('btn-buy-hint-confirm');
    if (buyHintConfirmBtn) {
      buyHintConfirmBtn.addEventListener('click', () => {
        const ok = Game.buyExtraHint();
        closeBuyHintModal();
        if (ok) {
          showToast(isEn() ? 'Extra hint unlocked!' : 'Đã đổi thêm 1 gợi ý!');
        }
      });
    }

    const buyHintCancelBtn = document.getElementById('btn-buy-hint-cancel');
    if (buyHintCancelBtn) {
      buyHintCancelBtn.addEventListener('click', () => {
        closeBuyHintModal();
      });
    }

    // Game Over Modal buttons
    const btnGoNew = document.getElementById('btn-go-new');
    if (btnGoNew) {
      btnGoNew.addEventListener('click', () => {
        closeModal('modal-gameover');
        if (lastGameOverContext.isDaily) {
          if (lastGameOverContext.isWin) {
            Game.destroy();
            _goToDailyTabForDate(lastGameOverContext.dailyDateStr);
          } else {
            _startDailyGame(lastGameOverContext.dailyDateStr);
          }
        } else {
          openModal('modal-difficulty');
        }
      });
    }

    const btnGoLobby = document.getElementById('btn-go-lobby');
    if (btnGoLobby) {
      btnGoLobby.addEventListener('click', () => {
        closeModal('modal-gameover');
        Game.destroy();
        if (lastGameOverContext.isDaily) {
          _goToDailyTabForDate(lastGameOverContext.dailyDateStr);
        } else {
          _goToLobby();
        }
      });
    }

    // Modal close buttons
    document.querySelectorAll('.btn-modal-close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    // Pause overlay click to resume safely
    const pauseOverlayEl = document.getElementById('pause-overlay');
    if (pauseOverlayEl) {
      pauseOverlayEl.addEventListener('click', (e) => {
        if (e.target === pauseOverlayEl) {
          resumeGame();
        }
      });
    }

    // Close modals on overlay click (protect critical game-state modals)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target !== overlay) return;
        if (overlay.id === 'modal-revive' || overlay.id === 'modal-gameover') {
          return;
        }
        if (overlay.id === 'modal-buy-hint') {
          closeBuyHintModal();
          return;
        }
        if (overlay.id === 'modal-pause') {
          overlay.classList.add('hidden');
          resumeGame();
          return;
        }
        if (overlay.id === 'modal-confirm') {
          _closeConfirmModal(false);
          return;
        }
        overlay.classList.add('hidden');
      });
    });

    // Keyboard support for splash, modals & gameplay
    document.addEventListener('keydown', (e) => {
      // Escape key handling with critical modal protection
      if (e.key === 'Escape') {
        const reviveModal = document.getElementById('modal-revive');
        const gameoverModal = document.getElementById('modal-gameover');
        if ((reviveModal && !reviveModal.classList.contains('hidden')) ||
            (gameoverModal && !gameoverModal.classList.contains('hidden'))) {
          e.preventDefault();
          return;
        }
        const buyHintModal = document.getElementById('modal-buy-hint');
        if (buyHintModal && !buyHintModal.classList.contains('hidden')) {
          e.preventDefault();
          closeBuyHintModal();
          return;
        }
        const confirmModal = document.getElementById('modal-confirm');
        if (confirmModal && !confirmModal.classList.contains('hidden')) {
          e.preventDefault();
          _closeConfirmModal(false);
          return;
        }
        const openDismissable = document.querySelector('.modal-overlay:not(.hidden)');
        if (openDismissable) {
          e.preventDefault();
          if (openDismissable.id === 'modal-pause') {
            openDismissable.classList.add('hidden');
            resumeGame();
          } else {
            openDismissable.classList.add('hidden');
          }
          return;
        }
      }

      const splashScreen = document.getElementById('screen-splash');
      if (splashScreen && splashScreen.classList.contains('active')) {
        if (e.key === 'Enter' || e.key === ' ') {
          navigateToLobby(e);
          return;
        }
      }

      if (isInteractionLocked) return;
      if (!Game.isActive()) return;

      // Space shortcut to toggle pause in gameplay (guarded against critical modals & end states)
      if (e.key === ' ' || e.code === 'Space') {
        const gameScreen = document.getElementById('screen-game');
        const isGameplay = gameScreen && gameScreen.classList.contains('active');
        const reviveOpen = !document.getElementById('modal-revive')?.classList.contains('hidden');
        const gameoverOpen = !document.getElementById('modal-gameover')?.classList.contains('hidden');
        const buyHintOpen = !document.getElementById('modal-buy-hint')?.classList.contains('hidden');
        const hasActiveModal = reviveOpen || gameoverOpen || buyHintOpen || !!document.querySelector('.modal-overlay:not(.hidden)');
        const curState = Game.getState();
        const isBlockedState = !curState || curState.isFinished || curState.isGameOver || (curState.mistakes || 0) >= 3;
        const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

        if (isGameplay && !isTyping) {
          if (hasActiveModal || isBlockedState) {
            if (reviveOpen || gameoverOpen || buyHintOpen || isBlockedState) {
              e.preventDefault();
            }
            return;
          }
          e.preventDefault();
          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
          Game.togglePause();
          return;
        }
      }

      const state = Game.getState();
      if (!state || state.isPaused || state.isFinished || state.isGameOver || (state.mistakes || 0) >= 3) return;

      const key = e.key;
      if (key >= '1' && key <= '9') {
        const n = parseInt(key);
        if (state.fastFillMode) {
          Game.selectFastFillDigit(n);
        } else {
          Game.placeNumber(n);
        }
      } else if (key === 'Backspace' || key === 'Delete') {
        Game.erase();
      } else if (key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      } else if (key === 'n' || key === 'N') {
        Game.toggleNotes();
      } else if (key === 'a' || key === 'A') {
        const res = Game.toggleAutoNotes();
        if (res && res.penaltyJustApplied > 0) {
          const msg = isEn()
            ? `Fast Notes: -${res.penaltyJustApplied} pts (deducted at game end)`
            : `Bút chì nhanh: -${res.penaltyJustApplied}đ (trừ vào tổng kết khi kết thúc ván)`;
          if (typeof App !== 'undefined' && App.toast) {
            App.toast(msg, 'warning');
          }
        }
      } else if (key === 'f' || key === 'F') {
        Game.toggleFastFill();
      } else if (key === 'h' || key === 'H') {
        if ((state.hints || 0) > 0) {
          Game.useHint();
        } else {
          showBuyHintModal();
        }
      }

      // Arrow key navigation
      if (state.selectedCell && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key)) {
        e.preventDefault();
        let { row, col } = state.selectedCell;
        if (key === 'ArrowUp') row = Math.max(0, row - 1);
        else if (key === 'ArrowDown') row = Math.min(8, row + 1);
        else if (key === 'ArrowLeft') col = Math.max(0, col - 1);
        else if (key === 'ArrowRight') col = Math.min(8, col + 1);
        Game.selectCell(row, col);
      }
    });

    // Initialize sub-modules
    if (typeof Sound !== 'undefined' && Sound.init) Sound.init();
    Tutorial.bindEvents();
    Profile.bindEvents();
    Variants.init();
    initMobileNotice();
    _initDailyChallenge();

    // Reset via URL query param ?reset=1
    if (typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('reset=1')) {
      Storage.resetAllData();
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch (_) {}
    }

    // Always show Splash screen on load; pre-populate lobby actions in background
    _updateHomeActions();
  }

  return {
    init,
    showScreen,
    showTab,
    showToast,
    toast: showToast,
    handleUndo,
    confirm,
    showInfoModal,
    goToLobby: _goToLobby,
    showReviveModal,
    showBuyHintModal,
    closeBuyHintModal,
    resumeGame,
    onLanguageChange,
    renderDailyTrophy: _renderDailyTrophy
  };
})();

// ---- Bootstrap with reliable DOM-ready check ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

