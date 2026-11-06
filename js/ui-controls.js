/* =========================================================
   ui-controls.js — Info bar, tools, numpad rendering
   ========================================================= */
const UIControls = (() => {
  let toolsBound = false;

  function init() {
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

      btn.addEventListener('click', () => {
        const st = Game.getState();
        if (st && st.fastFillMode) {
          Game.selectFastFillDigit(n);
        } else {
          Game.placeNumber(n);
        }
      });
      pad.appendChild(btn);
    }
  }

  /* ---- bind tool buttons ---- */
  function _bindTools() {
    document.getElementById('btn-undo').addEventListener('click', () => Game.undo());
    document.getElementById('btn-erase').addEventListener('click', () => Game.erase());
    document.getElementById('btn-fast-fill').addEventListener('click', () => Game.toggleFastFill());
    document.getElementById('btn-notes').addEventListener('click', () => Game.toggleNotes());
    document.getElementById('btn-hint').addEventListener('click', () => {
      const st = Game.getState();
      if (!st || st.isFinished || st.isPaused) return;
      if (st.hints > 0) {
        Game.useHint();
      } else {
        if (typeof App !== 'undefined' && App.showBuyHintModal) {
          App.showBuyHintModal();
        }
      }
    });

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
      mistakesEl.textContent = `${state.mistakes || 0}/3`;
      mistakesEl.classList.toggle('mistake-warning', state.mistakes === 2);
      mistakesEl.classList.toggle('mistake-danger', state.mistakes >= 3);
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

    // Fast-Fill badge & button state
    const ffBtn = document.getElementById('btn-fast-fill');
    const ffBadge = document.getElementById('fast-fill-badge');
    if (ffBtn && ffBadge) {
      if (state.fastFillMode) {
        ffBadge.textContent = 'ON';
        ffBadge.className = 'tool-badge badge-count';
        ffBtn.classList.add('active');
      } else {
        ffBadge.textContent = 'OFF';
        ffBadge.className = 'tool-badge badge-off';
        ffBtn.classList.remove('active');
      }
    }

    // Hint badge
    document.getElementById('hint-badge').textContent = state.hints;

    // Numpad remaining counts & Fast-Fill highlight/dimming
    for (let n = 1; n <= 9; n++) {
      const rem = Game.getRemaining(n);
      const remEl = document.getElementById(`rem-${n}`);
      const keyEl = remEl.parentElement;
      remEl.textContent = rem;
      const isCompleted = rem === 0;
      keyEl.classList.toggle('completed', isCompleted);

      if (state.fastFillMode && state.fastFillDigit) {
        if (n === state.fastFillDigit) {
          keyEl.classList.add('locked-digit');
          keyEl.classList.remove('dimmed');
        } else {
          keyEl.classList.remove('locked-digit');
          if (!isCompleted) {
            keyEl.classList.add('dimmed');
          } else {
            keyEl.classList.remove('dimmed');
          }
        }
      } else {
        keyEl.classList.remove('locked-digit');
        keyEl.classList.remove('dimmed');
      }
    }
  }

  return { init, update };
})();

