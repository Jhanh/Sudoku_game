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
  function showGameOver(reason, state, breakdown) {
    if (!breakdown && typeof Game !== 'undefined' && Game.getScoreBreakdown) {
      breakdown = Game.getScoreBreakdown(state);
    }
    if (!breakdown) {
      breakdown = {
        diffLabel: state.difficulty,
        cellPts: 10,
        correctCount: 0,
        baseScore: 0,
        comboBonus: 0,
        rawScore: state.score || 0,
        maxStreak: 0,
        timer: state.timer || 0,
        formattedTime: '00:00',
        timeMultiplier: 1.0,
        finalScore: state.score || 0,
        mistakes: state.mistakes || 0
      };
    }

    const modalEl = document.getElementById('modal-gameover');
    if (modalEl) modalEl.classList.remove('win', 'lose', 'give-up');

    let icon, title, subtitle;
    if (reason === 'win' || reason === true) {
      if (typeof Sound !== 'undefined' && Sound.playWin) Sound.playWin();
      if (modalEl) modalEl.classList.add('win');
      icon = '🎉';
      title = 'Chiến Thắng!';
      subtitle = 'Chúc mừng bạn đã hoàn thành trọn vẹn ván cờ Sudoku!';
    } else if (reason === 'give_up') {
      if (modalEl) modalEl.classList.add('give-up');
      icon = '🏳️';
      title = 'Đã Bỏ Cuộc';
      subtitle = 'Ván đấu đã kết thúc. Dưới đây là bảng điểm chi tiết bạn đã tích lũy:';
    } else if (reason === 'streak_over') {
      if (typeof Sound !== 'undefined' && Sound.playGameOver) Sound.playGameOver();
      if (modalEl) modalEl.classList.add('lose');
      icon = '💀';
      title = 'Hết Lượt Sai Liên Tiếp!';
      const maxStreak = state.difficulty === 'hard' ? 10 : 15;
      subtitle = `Bạn đã chọn sai ${maxStreak} lần liên tiếp ở mức ${breakdown.diffLabel}. Ván đấu đã kết thúc!`;
    } else {
      if (typeof Sound !== 'undefined' && Sound.playGameOver) Sound.playGameOver();
      if (modalEl) modalEl.classList.add('lose');
      icon = '💔';
      title = 'Kết Thúc Trận Đấu';
      subtitle = 'Ván đấu đã dừng lại. Hãy xem lại bảng điểm và thử lại nhé!';
    }

    const timeMultText = breakdown.timeMultiplier === 2.0 
      ? `× 2.0 (Siêu tốc)`
      : (breakdown.timeMultiplier === 1.5 ? `× 1.5 (Tốc độ)` : `× 1.0 (Chuẩn)`);

    const contentEl = document.getElementById('gameover-content');
    contentEl.innerHTML = `
      <div class="gameover-header">
        <div class="gameover-icon">${icon}</div>
        <h2 class="gameover-title">${title}</h2>
        <p class="gameover-subtitle">${subtitle}</p>
      </div>

      <div class="gameover-final-score">
        <span class="final-score-label">TỔNG ĐIỂM ĐẠT ĐƯỢC</span>
        <span class="final-score-val">${breakdown.finalScore}</span>
      </div>

      <div class="score-breakdown-card">
        <div class="breakdown-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span>Chi Tiết Bảng Điểm (${breakdown.diffLabel})</span>
        </div>
        <div class="breakdown-row">
          <span class="row-label">Ô điền đúng (${breakdown.correctCount} ô × ${breakdown.cellPts}đ)</span>
          <span class="row-val">+${breakdown.baseScore}</span>
        </div>
        <div class="breakdown-row">
          <span class="row-label">Thưởng chuỗi combo (Max ${breakdown.maxStreak} ô)</span>
          <span class="row-val ${breakdown.comboBonus > 0 ? 'highlight-combo' : ''}">+${breakdown.comboBonus}</span>
        </div>
        ${breakdown.perfectBonus > 0 ? `
        <div class="breakdown-row">
          <span class="row-label">⭐ Thưởng hoàn hảo (0/3 lỗi)</span>
          <span class="row-val highlight-perfect">+${breakdown.perfectBonus}</span>
        </div>` : ''}
        ${breakdown.hintPenalties > 0 ? `
        <div class="breakdown-row">
          <span class="row-label">💡 Trừ dùng gợi ý (${state.hintsUsed || 0} lần)</span>
          <span class="row-val highlight-penalty">-${breakdown.hintPenalties}</span>
        </div>` : ''}
        ${breakdown.wrongPenalties > 0 ? `
        <div class="breakdown-row">
          <span class="row-label">⚠️ Trừ chuỗi chọn sai</span>
          <span class="row-val highlight-penalty">-${breakdown.wrongPenalties}</span>
        </div>` : ''}
        <div class="breakdown-row">
          <span class="row-label">Điểm tích lũy bàn cờ</span>
          <span class="row-val">${breakdown.rawScore}</span>
        </div>
        <div class="breakdown-row">
          <span class="row-label">Thời gian (${breakdown.formattedTime})</span>
          <span class="row-val ${breakdown.timeMultiplier > 1.0 ? 'highlight-time' : ''}">${timeMultText}</span>
        </div>
        <div class="breakdown-row">
          <span class="row-label">Số lỗi mắc phải</span>
          <span class="row-val ${breakdown.mistakes === 0 ? 'highlight-perfect' : ''}">${breakdown.mistakes}/3</span>
        </div>
        <div class="breakdown-divider"></div>
        <div class="breakdown-row breakdown-total">
          <span class="row-label">Tổng kết (${breakdown.rawScore} × ${breakdown.timeMultiplier})</span>
          <span class="row-val total-number">${breakdown.finalScore}</span>
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
      (reason, state, breakdown) => showGameOver(reason, state, breakdown)
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
      (reason, state, breakdown) => showGameOver(reason, state, breakdown)
    );

    Game.resume();
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
    if (typeof Sound !== 'undefined' && Sound.init) Sound.init();
    Tutorial.bindEvents();
    Profile.bindEvents();
    Variants.init();
    initMobileNotice();

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

