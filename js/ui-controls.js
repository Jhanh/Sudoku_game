/* =========================================================
   ui-controls.js - Info bar, tools, numpad rendering
   ========================================================= */
const UIControls = (() => {
  let toolsBound = false;
  let lastRenderedStreak = 0;
  let comboTimer = null;

  function init() {
    _buildNumpad();
    if (!toolsBound) {
      _bindTools();
      toolsBound = true;
    }
    lastRenderedStreak = 0;
    if (comboTimer) {
      clearTimeout(comboTimer);
      comboTimer = null;
    }
    const streakEl = document.getElementById('info-streak');
    if (streakEl) {
      streakEl.classList.remove('streak-pop-flash');
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
        if (!st || st.isPaused) return;
        if (st.fastFillMode) {
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
    document.getElementById('btn-undo').addEventListener('click', () => {
      const st = Game.getState();
      if (!st || st.isPaused) return;
      if (typeof App !== 'undefined' && App.handleUndo) {
        App.handleUndo();
      } else {
        Game.undo();
      }
    });
    document.getElementById('btn-erase').addEventListener('click', () => {
      const st = Game.getState();
      if (!st || st.isPaused) return;
      Game.erase();
    });
    document.getElementById('btn-fast-fill').addEventListener('click', () => {
      const st = Game.getState();
      if (!st || st.isPaused) return;
      Game.toggleFastFill();
    });
    document.getElementById('btn-notes').addEventListener('click', () => {
      const st = Game.getState();
      if (!st || st.isPaused) return;
      Game.toggleNotes();
    });

    const autoNotesBtn = document.getElementById('btn-auto-notes');
    if (autoNotesBtn) {
      autoNotesBtn.addEventListener('click', () => {
        const st = Game.getState();
        if (!st || st.isPaused) return;
        const res = Game.toggleAutoNotes();
        if (res && res.penaltyJustApplied > 0) {
          const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'vi';
          const msg = lang === 'en'
            ? `Fast Notes: -${res.penaltyJustApplied} pts (deducted at game end)`
            : `Bút chì nhanh: -${res.penaltyJustApplied}đ (trừ vào tổng kết khi kết thúc ván)`;
          if (typeof App !== 'undefined' && App.toast) {
            App.toast(msg, 'warning');
          }
        }
      });
    }

    const closeBannerBtn = document.getElementById('btn-close-hint-banner');
    if (closeBannerBtn) {
      closeBannerBtn.addEventListener('click', () => {
        const st = Game.getState();
        if (st) st.hintExplanation = null;
        const banner = document.getElementById('hint-explanation-banner');
        if (banner) banner.classList.add('hidden');
      });
    }

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

  /* ---- streak milestone glow & pop (Task P1-03 Option 2) ---- */
  function _triggerStreakPop(streak) {
    const streakEl = document.getElementById('info-streak');
    if (!streakEl) return;

    let iconName = '';
    let popText = '';
    let normalText = '';

    if (streak === 11) {
      iconName = 'flame-kindling';
      popText = 'COMBO! x1.2';
      normalText = 'x1.2';
    } else if (streak === 21) {
      iconName = 'flame';
      popText = 'SUPER! x1.5';
      normalText = 'x1.5';
    } else if (streak === 31) {
      iconName = 'biceps-flexed';
      popText = 'ULTRA! x1.7';
      normalText = 'x1.7';
    } else if (streak >= 41) {
      iconName = 'brain-circuit';
      popText = 'MASTER! x2.0';
      normalText = 'x2.0';
    } else {
      return;
    }

    const iconSvg = typeof Icons !== 'undefined' ? Icons.get(iconName, { size: 13 }) : '';
    streakEl.innerHTML = `${iconSvg}<span>${popText}</span>`;

    // Restart pop animation
    streakEl.classList.remove('streak-pop-flash');
    void streakEl.offsetWidth;
    streakEl.classList.add('streak-pop-flash');

    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      streakEl.classList.remove('streak-pop-flash');
      streakEl.innerHTML = `${iconSvg}<span>${normalText}</span>`;
      comboTimer = null;
    }, 1200);
  }

  /* ---- update ---- */
  function update(state) {
    if (!state) return;

    // Controls panel paused state lock
    const controlsPanel = document.querySelector('.controls-panel');
    if (controlsPanel) {
      controlsPanel.classList.toggle('controls-paused', !!state.isPaused);
    }

    // Info bar
    document.getElementById('info-difficulty').textContent = (typeof I18n !== 'undefined' ? I18n.t('diff_' + state.difficulty) : (Game.DIFF_LABELS[state.difficulty] || state.difficulty));
    document.getElementById('info-score').textContent = state.score;

    const streakEl = document.getElementById('info-streak');
    const streak = state.correctStreak || 0;
    if (streakEl) {
      if (streak >= 41) {
        streakEl.className = 'streak-badge tier-4';
        if (!comboTimer) {
          const icon = typeof Icons !== 'undefined' ? Icons.get('brain-circuit', { size: 13 }) : '';
          streakEl.innerHTML = `${icon}<span>x2.0</span>`;
        }
      } else if (streak >= 31) {
        streakEl.className = 'streak-badge tier-3';
        if (!comboTimer) {
          const icon = typeof Icons !== 'undefined' ? Icons.get('biceps-flexed', { size: 13 }) : '';
          streakEl.innerHTML = `${icon}<span>x1.7</span>`;
        }
      } else if (streak >= 21) {
        streakEl.className = 'streak-badge tier-2';
        if (!comboTimer) {
          const icon = typeof Icons !== 'undefined' ? Icons.get('flame', { size: 13 }) : '';
          streakEl.innerHTML = `${icon}<span>x1.5</span>`;
        }
      } else if (streak >= 11) {
        streakEl.className = 'streak-badge tier-1';
        if (!comboTimer) {
          const icon = typeof Icons !== 'undefined' ? Icons.get('flame-kindling', { size: 13 }) : '';
          streakEl.innerHTML = `${icon}<span>x1.2</span>`;
        }
      } else {
        streakEl.className = 'streak-badge hidden';
        if (comboTimer) {
          clearTimeout(comboTimer);
          comboTimer = null;
          streakEl.classList.remove('streak-pop-flash');
        }
      }
    }

    // Trigger visual streak pop & glow on crossing tier thresholds
    if (!state.isPaused && streak !== lastRenderedStreak) {
      if (streak === 11 || streak === 21 || streak === 31 || (streak === 41 && lastRenderedStreak < 41)) {
        _triggerStreakPop(streak);
      }
    }
    lastRenderedStreak = streak;

    const timerEl = document.getElementById('info-timer');
    if (timerEl) {
      const timeStr = Game.formatTime(state.timer);
      timerEl.textContent = state.isPaused ? `⏸ ${timeStr}` : timeStr;
      timerEl.classList.toggle('timer-paused', !!state.isPaused);
    }

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
        pauseBtn.innerHTML = typeof Icons !== 'undefined' ? Icons.get('circle-play', { size: 18 }) : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>';
        pauseBtn.title = (typeof I18n !== 'undefined' ? I18n.t('btn_resume_tooltip') : 'Tiếp tục [Space]');
      } else {
        pauseBtn.innerHTML = typeof Icons !== 'undefined' ? Icons.get('circle-pause', { size: 18 }) : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>';
        pauseBtn.title = (typeof I18n !== 'undefined' ? I18n.t('btn_pause_tooltip') : 'Tạm dừng [Space]');
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

    // Auto Notes badge & button state
    const autoNotesBtn = document.getElementById('btn-auto-notes');
    const autoNotesBadge = document.getElementById('auto-notes-badge');
    if (autoNotesBtn && autoNotesBadge) {
      if (state.autoNotesMode) {
        autoNotesBadge.textContent = 'ON';
        autoNotesBadge.className = 'tool-badge badge-count';
        autoNotesBtn.classList.add('active');
      } else {
        autoNotesBadge.textContent = 'OFF';
        autoNotesBadge.className = 'tool-badge badge-off';
        autoNotesBtn.classList.remove('active');
      }
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

    // Hint Explanation Banner
    const hintBanner = document.getElementById('hint-explanation-banner');
    const hintText = document.getElementById('hint-explanation-text');
    if (hintBanner && hintText) {
      if (state.hintExplanation && !state.isPaused) {
        const isEn = typeof I18n !== 'undefined' && I18n.getLanguage() === 'en';
        hintText.textContent = isEn ? state.hintExplanation.reasonEn : state.hintExplanation.reasonVi;
        hintBanner.classList.remove('hidden');
      } else {
        hintBanner.classList.add('hidden');
      }
    }

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

  /* ---- lightweight timer-only update (avoids full DOM traversal on 1s tick) ---- */
  function updateTimer(state) {
    if (!state) return;
    const timerEl = document.getElementById('info-timer');
    if (timerEl) {
      const timeStr = Game.formatTime(state.timer);
      timerEl.textContent = state.isPaused ? `⏸ ${timeStr}` : timeStr;
      timerEl.classList.toggle('timer-paused', !!state.isPaused);
    }
  }

  return { init, update, updateTimer };
})();

