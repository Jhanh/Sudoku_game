/* =========================================================
   ui-controls.js — Info bar, tools, numpad rendering
   ========================================================= */
const UIControls = (() => {

  function init() {
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
    document.getElementById('info-timer').textContent = Game.formatTime(state.timer);

    const mistakesEl = document.getElementById('info-mistakes');
    mistakesEl.textContent = `${state.mistakes}/3`;
    mistakesEl.classList.toggle('mistake-warning', state.mistakes === 1);
    mistakesEl.classList.toggle('mistake-danger', state.mistakes >= 2);

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

