/* =========================================================
   ui-controls.js — Info bar, tools, numpad rendering
   ========================================================= */
const UIControls = (() => {
  let lastWarningStage = 0;

  function init() {
    lastWarningStage = 0;
    _buildNumpad();
    _bindTools();
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
    document.getElementById('info-difficulty').textContent = Game.DIFF_LABELS[state.difficulty] || state.difficulty;
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
      mistakesEl.classList.toggle('mistake-warning', state.wrongStreak >= 3 && state.wrongStreak < 5);
      mistakesEl.classList.toggle('mistake-danger', state.wrongStreak >= 5);
    }

    const wrongStreakEl = document.getElementById('info-wrong-streak');
    if (wrongStreakEl) {
      const wStreak = state.wrongStreak || 0;
      if (wStreak >= 1) {
        const penalty = Game.getWrongPenalty(state.difficulty, wStreak);
        const stage = Game.getWarningStage(state.difficulty, wStreak);
        wrongStreakEl.textContent = `⚠️ Sai ${wStreak} (-${penalty}đ)`;
        wrongStreakEl.className = 'wrong-streak-badge' + (stage === 3 ? ' stage-critical' : '');
      } else {
        wrongStreakEl.className = 'wrong-streak-badge hidden';
      }
    }

    // Danger Screen Overlay & Warning Banner
    const overlayEl = document.getElementById('danger-overlay');
    const bannerEl = document.getElementById('danger-banner');
    const stage = Game.getWarningStage(state.difficulty, state.wrongStreak || 0);

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
      if (stage === 0) {
        bannerEl.className = 'danger-banner hidden';
      } else if (stage === 1) {
        bannerEl.className = 'danger-banner stage-mild';
        if (bannerIcon) bannerIcon.textContent = '⚠️';
        if (bannerText) bannerText.textContent = 'Cảnh báo: Bạn đã chọn sai 5 lần liên tiếp! Tiếp tục sai sẽ bị trừ điểm nặng hơn.';
      } else if (stage === 2) {
        bannerEl.className = 'danger-banner stage-mild';
        const pen = Game.getWrongPenalty(state.difficulty, state.wrongStreak);
        if (bannerIcon) bannerIcon.textContent = '⚠️';
        if (bannerText) bannerText.textContent = `Cảnh báo chuỗi sai: Bạn đang bị trừ ${pen}đ cho mỗi lần chọn sai liên tiếp!`;
      } else if (stage === 3) {
        bannerEl.className = 'danger-banner stage-critical';
        const pen = Game.getWrongPenalty(state.difficulty, state.wrongStreak);
        const maxStreak = state.difficulty === 'hard' ? 10 : 15;
        const overLimit = state.difficulty === 'hard' ? 11 : 16;
        if (bannerIcon) bannerIcon.textContent = '🚨';
        if (bannerText) bannerText.textContent = `NGUY HIỂM: Sai ${state.wrongStreak}/${maxStreak} lần liên tiếp (-${pen}đ/lượt)! Sang lần ${overLimit} sẽ GAME OVER!`;
      }
    }

    // Pause icon toggle
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      if (state.isPaused) {
        pauseBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        pauseBtn.title = 'Tiếp tục';
      } else {
        pauseBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
        pauseBtn.title = 'Tạm dừng';
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

