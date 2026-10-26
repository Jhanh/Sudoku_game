/* =========================================================
   app.js — Main router, screen manager, event wiring
   ========================================================= */
const App = (() => {

  /* ---- screen management ---- */
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
  function showToast(msg) {
    const el = document.getElementById('toast');
    document.getElementById('toast-message').textContent = msg;
    el.classList.remove('hidden', 'hiding');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => { el.classList.add('hidden'); el.classList.remove('hiding'); }, 350);
    }, 3000);
  }

  /* ---- confirm dialog ---- */
  let confirmResolve = null;
  function confirm(title, message) {
    return new Promise(resolve => {
      confirmResolve = resolve;
      document.getElementById('confirm-title').textContent = title;
      document.getElementById('confirm-message').textContent = message;
      openModal('modal-confirm');
    });
  }

  /* ---- game over ---- */
  function showGameOver(won, state) {
    const content = document.getElementById('gameover-content');
    const icon = won ? '🎉' : '😔';
    const title = won ? 'Chúc mừng!' : 'Hết lượt sai!';
    const subtitle = won ? 'Bạn đã hoàn thành bảng Sudoku thành công!' : 'Bạn đã mắc quá 3 lỗi. Hãy thử lại nhé!';

    content.innerHTML = `
      <div class="gameover-icon">${icon}</div>
      <h2 class="gameover-title">${title}</h2>
      <p class="gameover-subtitle">${subtitle}</p>
      <div class="gameover-stats">
        <div class="gameover-stat">
          <span class="stat-val">${Game.formatTime(state.timer)}</span>
          <span class="stat-label">Thời gian</span>
        </div>
        <div class="gameover-stat">
          <span class="stat-val">${state.score}</span>
          <span class="stat-label">Điểm số</span>
        </div>
        <div class="gameover-stat">
          <span class="stat-val">${state.mistakes}/3</span>
          <span class="stat-label">Lỗi</span>
        </div>
      </div>
      <div class="gameover-actions">
        <button class="btn-primary btn-large" id="btn-go-new">Ván Chơi Mới</button>
        <button class="btn-secondary btn-large" id="btn-go-lobby">Về Sảnh Chính</button>
      </div>
    `;

    document.getElementById('btn-go-new').addEventListener('click', () => {
      closeModal('modal-gameover');
      openModal('modal-difficulty');
    });
    document.getElementById('btn-go-lobby').addEventListener('click', () => {
      closeModal('modal-gameover');
      Game.destroy();
      _goToLobby();
    });

    openModal('modal-gameover');
  }

  /* ---- lobby home update ---- */
  function _updateHomeActions() {
    const hasGame = Storage.hasActiveGame();
    const newGameBtn = document.getElementById('btn-new-game');
    const contSection = document.getElementById('continue-section');

    if (!newGameBtn || !contSection) return;

    if (hasGame) {
      newGameBtn.classList.add('hidden');
      contSection.classList.remove('hidden');
      const saved = Storage.loadGame();
      if (saved) {
        const diffLabel = Game.DIFF_LABELS[saved.difficulty] || saved.difficulty;
        const time = Game.formatTime(saved.timer);
        const infoEl = document.getElementById('continue-info');
        if (infoEl) infoEl.textContent = `${diffLabel} — ${time}`;
      }
    } else {
      newGameBtn.classList.remove('hidden');
      contSection.classList.add('hidden');
    }
  }

  function _goToLobby() {
    _updateHomeActions();
    showScreen('lobby');
    showTab('home');
  }

  /* ---- start game ---- */
  function _startGame(difficulty) {
    showScreen('game');
    UIBoard.init();
    UIControls.init();

    Game.setCallbacks(
      (state) => { UIBoard.render(state); UIControls.update(state); },
      (won, state) => showGameOver(won, state)
    );

    // Show a brief loading indicator
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:1rem;">Đang tạo đề…</div>';

    setTimeout(() => {
      Game.start(difficulty);
      UIBoard.init();
      UIBoard.render(Game.getState());
      UIControls.update(Game.getState());
    }, 50);
  }

  function _resumeGame() {
    showScreen('game');
    UIBoard.init();
    UIControls.init();

    Game.setCallbacks(
      (state) => { UIBoard.render(state); UIControls.update(state); },
      (won, state) => showGameOver(won, state)
    );

    Game.resume();
  }

  /* ---- wire everything ---- */
  function init() {
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
      exploreBtn.addEventListener('pointerup', navigateToLobby);
    }
    if (splashEl) {
      splashEl.addEventListener('click', navigateToLobby);
      splashEl.addEventListener('pointerup', navigateToLobby);
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
        const ok = await confirm('Ván Chơi Mới', 'Bạn có muốn bắt đầu ván mới không? (Ván hiện tại sẽ bị hủy)');
        if (ok) {
          Game.abandonSaved();
          openModal('modal-difficulty');
        }
      });
    }

    // Navbar tabs
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => showTab(item.dataset.tab));
    });

    // How to play
    document.getElementById('btn-how-to-play').addEventListener('click', () => Tutorial.show());

    // New game → difficulty modal
    document.getElementById('btn-new-game').addEventListener('click', () => openModal('modal-difficulty'));

    // Continue game
    document.getElementById('btn-continue').addEventListener('click', () => _resumeGame());

    // Abandon saved game
    document.getElementById('btn-abandon').addEventListener('click', async () => {
      const ok = await confirm('Bỏ Cuộc', 'Ván đang chơi sẽ bị xóa. Bạn có chắc chắn muốn bỏ cuộc?');
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

    // Back to lobby (auto-save)
    document.getElementById('btn-back').addEventListener('click', () => {
      Game.destroy();
      _goToLobby();
    });

    // Give up in-game
    document.getElementById('btn-give-up-header').addEventListener('click', async () => {
      const ok = await confirm('Bỏ Cuộc', 'Ván này sẽ được tính là thua. Bạn có chắc chắn?');
      if (ok) {
        Game.giveUp();
      }
    });

    // Confirm dialog buttons
    document.getElementById('btn-confirm-ok').addEventListener('click', () => {
      closeModal('modal-confirm');
      if (confirmResolve) { confirmResolve(true); confirmResolve = null; }
    });
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
      closeModal('modal-confirm');
      if (confirmResolve) { confirmResolve(false); confirmResolve = null; }
    });

    // Modal close buttons
    document.querySelectorAll('.btn-modal-close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.add('hidden');
          if (overlay.id === 'modal-confirm' && confirmResolve) {
            confirmResolve(false);
            confirmResolve = null;
          }
        }
      });
    });

    // Keyboard support for gameplay
    document.addEventListener('keydown', (e) => {
      if (!Game.isActive()) return;
      const state = Game.getState();
      if (!state || state.isPaused) return;

      const key = e.key;
      if (key >= '1' && key <= '9') {
        Game.placeNumber(parseInt(key));
      } else if (key === 'Backspace' || key === 'Delete') {
        Game.erase();
      } else if (key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        Game.undo();
      } else if (key === 'n' || key === 'N') {
        Game.toggleNotes();
      } else if (key === 'h' || key === 'H') {
        Game.useHint();
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
    Tutorial.bindEvents();
    Profile.bindEvents();
    Variants.init();

    // Reset via URL query param ?reset=1
    if (typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('reset=1')) {
      Storage.resetAllData();
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch (_) {}
    }

    // Check for saved game on load
    if (Storage.hasActiveGame()) {
      // Skip splash, go to lobby with continue option
      _goToLobby();
    }
  }

  return {
    init,
    showScreen,
    showTab,
    showToast,
    confirm,
    goToLobby: _goToLobby
  };
})();

// ---- Bootstrap with reliable DOM-ready check ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

