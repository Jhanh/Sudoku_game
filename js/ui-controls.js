/* =========================================================
   ui-controls.js — Info bar, tools, numpad rendering
   ========================================================= */
const UIControls = (() => {
  let lastWarningStage = 0;
  let toolsBound = false;

  function init() {
    lastWarningStage = 0;
    _buildNumpad();
    if (!toolsBound) {
      _bindTools();
      toolsBound = true;
    }
  }

  /* ---- build numpad ---- */
  function _buildNumpad() {
    const pad = document.getElementById('numpad');
    pad.innerHTML = '';
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.className = 'num-key';
      btn.dataset.num = n;

      const digit = document.createElement('span');
      digit.className = 'num-digit';
      digit.textContent = n;

      const remaining = document.createElement('span');
      remaining.className = 'num-remaining';
      remaining.id = `rem-${n}`;
      remaining.textContent = '9';

      btn.appendChild(digit);
      btn.appendChild(remaining);

      btn.addEventListener('click', () => Game.placeNumber(n));
      pad.appendChild(btn);
    }
  }

  /* ---- bind tool buttons ---- */
  function _bindTools() {
    document.getElementById('btn-undo').addEventListener('click', () => Game.undo());
    document.getElementById('btn-erase').addEventListener('click', () => Game.erase());
    document.getElementById('btn-notes').addEventListener('click', () => Game.toggleNotes());
    document.getElementById('btn-hint').addEventListener('click', () => Game.useHint());

    document.getElementById('btn-pause').addEventListener('click', () => Game.togglePause());
    document.getElementById('btn-resume').addEventListener('click', () => Game.togglePause());
  }

  /* ---- update ---- */
  function update(state) {
    if (!state) return;

    // Info bar
    document.getElementById('info-difficulty').textContent = (typeof I18n !== 'undefined' ? I18n.t('diff_' + state.difficulty) : (Game.DIFF_LABELS[state.difficulty] || state.difficulty));
    document.getElementById('info-score').textContent = state.score;

    const streakEl = document.getElementById('info-streak');
    if (streakEl) {
      const streak = state.correctStreak || 0;
      if (streak >= 41) {
        streakEl.textContent = '⚡ x2.0';
        streakEl.className = 'streak-badge tier-4';
      } else if (streak >= 31) {
        streakEl.textContent = '🔥 x1.7';
        streakEl.className = 'streak-badge tier-3';
      } else if (streak >= 21) {
        streakEl.textContent = '🔥 x1.5';
        streakEl.className = 'streak-badge tier-2';
      } else if (streak >= 11) {
        streakEl.textContent = '🔥 x1.2';
        streakEl.className = 'streak-badge tier-1';
      } else {
        streakEl.className = 'streak-badge hidden';
      }
    }
    document.getElementById('info-timer').textContent = Game.formatTime(state.timer);

    const mistakesEl = document.getElementById('info-mistakes');
    if (mistakesEl) {
      mistakesEl.textContent = state.mistakes;
      mistakesEl.classList.toggle('mistake-warning', state.mistakes >= 5 && state.mistakes < 10);
      mistakesEl.classList.toggle('mistake-danger', state.mistakes >= 10);
    }

    const wrongStreakEl = document.getElementById('info-wrong-streak');
    if (wrongStreakEl) {
      const wStreak = state.wrongStreak || 0;
      const mistakes = state.mistakes || 0;
      if (mistakes >= 1 || wStreak >= 1) {
        const penalty = Game.getWrongPenalty(state.difficulty, mistakes);
        const stage = Game.getWarningStage(state.difficulty, mistakes, wStreak);
        const isEn = typeof I18n !== 'undefined' && I18n.getLanguage() === 'en';
        wrongStreakEl.textContent = isEn ? `⚠️ Error #${mistakes} (-${penalty}pts)` : `⚠️ Lỗi #${mistakes} (-${penalty}đ)`;
        wrongStreakEl.className = 'wrong-streak-badge' + (stage === 3 ? ' stage-critical' : '');
      } else {
        wrongStreakEl.className = 'wrong-streak-badge hidden';
      }
    }

    // Danger Screen Overlay & Warning Banner
    const overlayEl = document.getElementById('danger-overlay');
    const bannerEl = document.getElementById('danger-banner');
    const stage = Game.getWarningStage(state.difficulty, state.mistakes || 0, state.wrongStreak || 0);

    if (stage >= 2 && stage > lastWarningStage && typeof Sound !== 'undefined' && Sound.playDanger) {
      Sound.playDanger();
    }
    lastWarningStage = stage;

    if (overlayEl) {
      overlayEl.className = 'danger-overlay';
      if (stage === 1) {
        overlayEl.classList.add('flash-mild');
      } else if (stage === 2) {
        overlayEl.classList.add('stage-mild');
      } else if (stage === 3) {
        overlayEl.classList.add('stage-critical');
      }
    }

    if (bannerEl) {
      const bannerText = document.getElementById('danger-banner-text');
      const bannerIcon = document.getElementById('danger-banner-icon');
      const pen = Game.getWrongPenalty(state.difficulty, state.mistakes || 0);
      const diff = state.difficulty;
      const wStreak = state.wrongStreak || 0;
      const mistakes = state.mistakes || 0;

      if (stage === 0) {
        bannerEl.className = 'danger-banner hidden';
      } else if (stage === 1) {
        bannerEl.className = 'danger-banner stage-mild';
        if (bannerIcon) bannerIcon.textContent = '⚠️';
        if (bannerText) bannerText.textContent = `Cảnh báo: Bạn đã phạm ${mistakes} lỗi! Lỗi tiếp theo sẽ bị trừ ${pen}đ.`;
      } else if (stage === 2) {
        bannerEl.className = 'danger-banner stage-mild';
        if (bannerIcon) bannerIcon.textContent = '⚠️';
        if (diff === 'hard' && wStreak >= 1) {
          bannerText.textContent = `Cảnh báo chuỗi sai: Đang sai ${wStreak}/3 lần liên tiếp! Tiếp tục sai sẽ bị xử thua!`;
        } else if (diff === 'medium' && wStreak >= 2) {
          bannerText.textContent = `Cảnh báo chuỗi sai: Đang sai ${wStreak}/5 lần liên tiếp! Tiếp tục sai sẽ bị xử thua!`;
        } else {
          bannerText.textContent = `Cảnh báo: Bạn đã phạm ${mistakes} lỗi! Mỗi lần sai tiếp theo bị trừ ${pen}đ.`;
        }
      } else if (stage === 3) {
        bannerEl.className = 'danger-banner stage-critical';
        if (bannerIcon) bannerIcon.textContent = '🚨';
        if (diff === 'hard') {
          if (wStreak >= 2) {
            bannerText.textContent = `NGUY HIỂM CẤP BÁO: Đã sai 2/3 lần liên tiếp! Sai thêm 1 lần nữa sẽ GAME OVER!`;
          } else {
            bannerText.textContent = `NGUY HIỂM: Đã phạm ${mistakes}/10 lỗi (-${pen}đ/lượt)! Phạm lỗi thứ 11 sẽ GAME OVER!`;
          }
        } else if (diff === 'medium') {
          if (wStreak >= 4) {
            bannerText.textContent = `NGUY HIỂM CẤP BÁO: Đã sai 4/5 lần liên tiếp! Sai thêm 1 lần nữa sẽ GAME OVER!`;
          } else {
            bannerText.textContent = `NGUY HIỂM: Đã phạm ${mistakes}/15 lỗi (-${pen}đ/lượt)! Phạm lỗi thứ 16 sẽ GAME OVER!`;
          }
        } else {
          bannerText.textContent = `NGUY HIỂM: Đã phạm ${mistakes}/15 lỗi (-${pen}đ/lượt)! Phạm lỗi thứ 16 sẽ GAME OVER!`;
        }
      }
    }

    // Pause icon toggle
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      if (state.isPaused) {
        pauseBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        pauseBtn.title = (typeof I18n !== 'undefined' ? I18n.t('btn_resume') : 'Tiếp tục');
      } else {
        pauseBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
        pauseBtn.title = (typeof I18n !== 'undefined' && I18n.getLanguage() === 'en' ? 'Pause' : 'Tạm dừng');
      }
    }

    // Notes badge
    const notesBadge = document.getElementById('notes-badge');
    if (state.notesMode) {
      notesBadge.textContent = 'ON';
      notesBadge.className = 'tool-badge badge-count';
      document.getElementById('btn-notes').classList.add('active');
    } else {
      notesBadge.textContent = 'OFF';
      notesBadge.className = 'tool-badge badge-off';
      document.getElementById('btn-notes').classList.remove('active');
    }

    // Hint badge
    document.getElementById('hint-badge').textContent = state.hints;

    // Numpad remaining counts
    for (let n = 1; n <= 9; n++) {
      const rem = Game.getRemaining(n);
      const remEl = document.getElementById(`rem-${n}`);
      const keyEl = remEl.parentElement;
      remEl.textContent = rem;
      keyEl.classList.toggle('completed', rem === 0);
    }
  }

  return { init, update };
})();

