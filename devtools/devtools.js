/* =========================================================
   devtools.js — Developer & QA Testing Tools Module
   Tách biệt hoàn toàn với mã nguồn chính của game.
   Kích hoạt bằng tổ hợp phím: Ctrl + Shift + D hoặc phím ` (Tilde)
   Mật khẩu mở khóa: 123456
   ========================================================= */

const DevTools = (() => {
  const PASSCODE = '123456';
  const STORAGE_KEY_AUTH = 'sudoku_dev_authenticated';

  let isGhostMode = false;
  let isInfiniteHints = false;
  let isHudOpen = false;
  let isMinimized = false;
  let statsTimer = null;

  /* ---------- DOM Creation ---------- */
  function init() {
    _createAuthModal();
    _createHudPanel();
    _createMinimizedPill();
    _hookBoardRender();
    _hookGameCallbacks();
    _bindShortcuts();

    // Check if previously authenticated in this session
    if (sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true') {
      _showPill();
    }
  }

  /* ---------- Auth Modal ---------- */
  function _createAuthModal() {
    if (document.getElementById('dev-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'dev-auth-modal';
    modal.className = 'dev-auth-modal hidden';
    modal.innerHTML = `
      <div class="dev-auth-card">
        <div class="dev-auth-header">
          <span class="dev-auth-icon">🛠️</span>
          <div>
            <h3 class="dev-auth-title">Developer & QA Tools</h3>
            <span style="font-size:0.75rem; color:#818CF8; font-weight:600;">Chế độ Dành Cho Nhà Phát Triển</span>
          </div>
        </div>
        <p class="dev-auth-desc">
          Công cụ kiểm thử độc lập giúp kiểm định nhanh cơ chế tính điểm, cảnh báo nguy hiểm và chuỗi thắng/thua.
        </p>
        <div class="dev-auth-input-group">
          <input type="password" id="dev-auth-input" class="dev-auth-input" placeholder="Nhập mã truy cập..." autocomplete="off">
          <div id="dev-auth-error" class="dev-auth-error">Mật khẩu không chính xác. Vui lòng thử lại!</div>
        </div>
        <div class="dev-auth-actions">
          <button id="dev-auth-cancel" class="dev-auth-btn dev-auth-btn-cancel">Hủy</button>
          <button id="dev-auth-submit" class="dev-auth-btn dev-auth-btn-submit">Mở Khóa</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('dev-auth-submit').addEventListener('click', _verifyPassword);
    document.getElementById('dev-auth-cancel').addEventListener('click', _closeAuthModal);
    document.getElementById('dev-auth-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') _verifyPassword();
      if (e.key === 'Escape') _closeAuthModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) _closeAuthModal();
    });
  }

  function _openAuthModal() {
    const modal = document.getElementById('dev-auth-modal');
    const input = document.getElementById('dev-auth-input');
    const err = document.getElementById('dev-auth-error');
    if (!modal) return;
    err.classList.remove('visible');
    input.value = '';
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 50);
  }

  function _closeAuthModal() {
    const modal = document.getElementById('dev-auth-modal');
    if (modal) modal.classList.add('hidden');
  }

  function _verifyPassword() {
    const input = document.getElementById('dev-auth-input');
    const err = document.getElementById('dev-auth-error');
    if (input.value === PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
      _closeAuthModal();
      _openHud();
      _showPill();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('🔓 Đã kích hoạt Developer Tools thành công!');
      }
    } else {
      err.classList.add('visible');
      input.focus();
      input.select();
    }
  }

  /* ---------- HUD Panel ---------- */
  function _createHudPanel() {
    if (document.getElementById('dev-hud-panel')) return;

    const hud = document.createElement('div');
    hud.id = 'dev-hud-panel';
    hud.className = 'dev-hud-panel hidden';
    hud.innerHTML = `
      <div class="dev-hud-header">
        <div class="dev-hud-title-wrap">
          <span style="font-size:1.1rem;">🛠️</span>
          <span class="dev-hud-title">QA DEV CONSOLE</span>
          <span class="dev-hud-badge">ACTIVE</span>
        </div>
        <div class="dev-hud-controls">
          <button id="dev-hud-btn-min" class="dev-hud-toolbtn" title="Thu nhỏ/Mở rộng">_</button>
          <button id="dev-hud-btn-lock" class="dev-hud-toolbtn" title="Khóa lại Dev Mode">🔒</button>
          <button id="dev-hud-btn-close" class="dev-hud-toolbtn" title="Đóng bảng">✕</button>
        </div>
      </div>

      <div class="dev-hud-body">
        <!-- Live Game Stats Bar -->
        <div class="dev-stats-bar">
          <div class="dev-stat-box">
            <span class="dev-stat-label">Thời gian</span>
            <span id="dev-stat-timer" class="dev-stat-val">00:00</span>
          </div>
          <div class="dev-stat-box">
            <span class="dev-stat-label">Điểm số</span>
            <span id="dev-stat-score" class="dev-stat-val">0</span>
          </div>
          <div class="dev-stat-box">
            <span class="dev-stat-label">Chuỗi Đúng/Sai</span>
            <span id="dev-stat-streak" class="dev-stat-val">0 / 0</span>
          </div>
        </div>

        <!-- Section 1: Core Cheats -->
        <div class="dev-hud-section">
          <div class="dev-section-title">⚡ Trợ Năng & Kiểm Định</div>
          
          <div class="dev-toggle-row">
            <div class="dev-toggle-label">
              <span class="dev-toggle-title">Vô Hạn Gợi Ý (Infinite Hints)</span>
              <span class="dev-toggle-desc">Tự động hồi 9999 gợi ý (vẫn trừ điểm chuẩn)</span>
            </div>
            <label class="dev-switch">
              <input type="checkbox" id="dev-toggle-hints">
              <span class="dev-slider"></span>
            </label>
          </div>

          <div class="dev-toggle-row">
            <div class="dev-toggle-label">
              <span class="dev-toggle-title">Hiện Đáp Án Mờ (Ghost Answers)</span>
              <span class="dev-toggle-desc">Hiện số nhạt trên ô trống để tự chọn kiểm thử</span>
            </div>
            <label class="dev-switch">
              <input type="checkbox" id="dev-toggle-ghost">
              <span class="dev-slider"></span>
            </label>
          </div>

          <div class="dev-btn-grid">
            <button id="dev-btn-win" class="dev-action-btn btn-win">
              🏆 Thắng Ngay Ván Này
            </button>
            <button id="dev-btn-fill-80" class="dev-action-btn">
              🎯 Điền Sẵn 80/81 Ô
            </button>
          </div>
        </div>

        <!-- Section 2: Danger Warnings & Penalties -->
        <div class="dev-hud-section">
          <div class="dev-section-title">⚠️ Thử Nghiệm Cảnh Báo Nguy Hiểm</div>
          <div class="dev-btn-grid">
            <button id="dev-btn-stage1" class="dev-action-btn">
              ⚠️ Cấp 1 (Sai 5 lần)
            </button>
            <button id="dev-btn-stage2" class="dev-action-btn">
              🔶 Cấp 2 (Sai 6 lần)
            </button>
            <button id="dev-btn-stage3" class="dev-action-btn btn-danger">
              🚨 Cấp 3 (Nhấp nháy đỏ)
            </button>
            <button id="dev-btn-gameover" class="dev-action-btn btn-danger">
              💀 Test Game Over
            </button>
          </div>
          <button id="dev-btn-reset-wrong" class="dev-action-btn" style="width:100%;">
            🔄 Reset Chuỗi Sai Về 0 (Khử Cảnh Báo)
          </button>
        </div>

        <!-- Section 3: Time Multiplier Testing -->
        <div class="dev-hud-section">
          <div class="dev-section-title">⏱️ Thử Nghiệm Hệ Số Thời Gian</div>
          <div class="dev-btn-grid">
            <button id="dev-btn-time-fast" class="dev-action-btn" title="Dưới 1p30s: x2.0 điểm">
              🚀 Đặt 01:10 (x2.0)
            </button>
            <button id="dev-btn-time-med" class="dev-action-btn" title="Dưới 5p: x1.5 điểm">
              ⚡ Đặt 04:00 (x1.5)
            </button>
            <button id="dev-btn-time-slow" class="dev-action-btn" title="Trên 5p: x1.0 điểm">
              🐢 Đặt 15:00 (x1.0)
            </button>
            <button id="dev-btn-time-add1m" class="dev-action-btn">
              ➕ Cộng 1 Phút
            </button>
          </div>
        </div>

        <!-- Section 4: Sound FX Testing -->
        <div class="dev-hud-section">
          <div class="dev-section-title">🔊 Thử Nghiệm Hiệu Ứng Âm Thanh (SFX)</div>
          <div class="dev-btn-grid" style="grid-template-columns: repeat(2, 1fr);">
            <button id="dev-sfx-tap" class="dev-action-btn">🔊 Tap Ô / Nút</button>
            <button id="dev-sfx-correct" class="dev-action-btn">🎵 Điền Đúng (Combo)</button>
            <button id="dev-sfx-complete" class="dev-action-btn">🎉 Xong 9 Số</button>
            <button id="dev-sfx-error" class="dev-action-btn">⚠️ Báo Lỗi</button>
            <button id="dev-sfx-note" class="dev-action-btn">✏️ Ghi Chú</button>
            <button id="dev-sfx-erase" class="dev-action-btn">🧹 Xóa / Hoàn Tác</button>
            <button id="dev-sfx-hint" class="dev-action-btn">💡 Dùng Gợi Ý</button>
            <button id="dev-sfx-danger" class="dev-action-btn">🚨 Nhịp Nguy Hiểm</button>
            <button id="dev-sfx-win" class="dev-action-btn btn-win">🏆 Fanfare Thắng</button>
            <button id="dev-sfx-gameover" class="dev-action-btn btn-danger">💀 Nhạc Game Over</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(hud);

    // Bind HUD events
    document.getElementById('dev-hud-btn-close').addEventListener('click', _closeHud);
    document.getElementById('dev-hud-btn-min').addEventListener('click', _toggleMinimize);
    document.getElementById('dev-hud-btn-lock').addEventListener('click', _lockDevTools);

    // Feature 1: Infinite Hints
    const hintsToggle = document.getElementById('dev-toggle-hints');
    hintsToggle.addEventListener('change', () => {
      isInfiniteHints = hintsToggle.checked;
      _applyInfiniteHints();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(isInfiniteHints ? '✨ Vô hạn gợi ý: BẬT' : 'Gợi ý: TẮT chế độ vô hạn');
      }
    });

    // Feature 2: Ghost Answers
    const ghostToggle = document.getElementById('dev-toggle-ghost');
    ghostToggle.addEventListener('change', () => {
      isGhostMode = ghostToggle.checked;
      if (isGhostMode) {
        document.body.classList.add('dev-ghost-active');
      } else {
        document.body.classList.remove('dev-ghost-active');
      }
      _renderGhostAnswers();
      if (!isGhostMode && typeof UIBoard !== 'undefined' && typeof Game !== 'undefined') {
        UIBoard.render(Game.getState());
      }
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast(isGhostMode ? '👻 Hiện đáp án mờ: BẬT' : 'Ẩn đáp án mờ');
      }
    });

    // Feature 3: Instant Win
    document.getElementById('dev-btn-win').addEventListener('click', _instantWin);

    // Feature 4: Fill 80/81
    document.getElementById('dev-btn-fill-80').addEventListener('click', _fillExceptOne);

    // Danger Stage Tests
    document.getElementById('dev-btn-stage1').addEventListener('click', () => _setWrongStreak(5));
    document.getElementById('dev-btn-stage2').addEventListener('click', () => _setWrongStreak(6));
    document.getElementById('dev-btn-stage3').addEventListener('click', () => {
      const state = typeof Game !== 'undefined' ? Game.getState() : null;
      const target = (state && state.difficulty === 'hard') ? 6 : 11;
      _setWrongStreak(target);
    });
    document.getElementById('dev-btn-gameover').addEventListener('click', _triggerGameOver);
    document.getElementById('dev-btn-reset-wrong').addEventListener('click', () => _setWrongStreak(0));

    // Time Testing
    document.getElementById('dev-btn-time-fast').addEventListener('click', () => _setTimer(70));
    document.getElementById('dev-btn-time-med').addEventListener('click', () => _setTimer(240));
    document.getElementById('dev-btn-time-slow').addEventListener('click', () => _setTimer(900));
    document.getElementById('dev-btn-time-add1m').addEventListener('click', () => {
      const state = typeof Game !== 'undefined' ? Game.getState() : null;
      if (state) _setTimer((state.timer || 0) + 60);
    });

    // Sound FX Tests
    let devComboCount = 0;
    const bindSfx = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => {
        if (typeof Sound !== 'undefined' && fn) fn();
      });
    };
    bindSfx('dev-sfx-tap', () => Sound.playTap());
    bindSfx('dev-sfx-correct', () => {
      devComboCount = (devComboCount % 45) + 5;
      Sound.playCorrect(devComboCount);
      if (typeof App !== 'undefined' && App.showToast) App.showToast(`🎵 SFX Điền đúng (Streak ${devComboCount})`);
    });
    bindSfx('dev-sfx-complete', () => Sound.playDigitComplete());
    bindSfx('dev-sfx-error', () => Sound.playError());
    bindSfx('dev-sfx-note', () => Sound.playNote());
    bindSfx('dev-sfx-erase', () => Sound.playErase());
    bindSfx('dev-sfx-hint', () => Sound.playHint());
    bindSfx('dev-sfx-danger', () => Sound.playDanger());
    bindSfx('dev-sfx-win', () => Sound.playWin());
    bindSfx('dev-sfx-gameover', () => Sound.playGameOver());
  }

  /* ---------- Minimized Pill Trigger ---------- */
  function _createMinimizedPill() {
    if (document.getElementById('dev-pill-trigger')) return;
    const pill = document.createElement('div');
    pill.id = 'dev-pill-trigger';
    pill.className = 'dev-pill-trigger hidden';
    pill.innerHTML = `🛠️ <span>QA Console</span>`;
    pill.title = 'Bấm để mở QA Dev Tools (hoặc bấm Ctrl+Shift+D)';
    pill.addEventListener('click', () => {
      if (sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true') {
        _openHud();
      } else {
        _openAuthModal();
      }
    });
    document.body.appendChild(pill);
  }

  function _showPill() {
    const pill = document.getElementById('dev-pill-trigger');
    if (pill) pill.classList.remove('hidden');
  }

  function _hidePill() {
    const pill = document.getElementById('dev-pill-trigger');
    if (pill) pill.classList.add('hidden');
  }

  /* ---------- HUD Controls ---------- */
  function _openHud() {
    const hud = document.getElementById('dev-hud-panel');
    if (!hud) return;
    hud.classList.remove('hidden');
    isHudOpen = true;
    _startStatsWatcher();
    _applyInfiniteHints();
    if (isGhostMode) _renderGhostAnswers();
  }

  function _closeHud() {
    const hud = document.getElementById('dev-hud-panel');
    if (hud) hud.classList.add('hidden');
    isHudOpen = false;
    _stopStatsWatcher();
  }

  function _toggleMinimize() {
    const hud = document.getElementById('dev-hud-panel');
    if (!hud) return;
    isMinimized = !isMinimized;
    hud.classList.toggle('minimized', isMinimized);
  }

  function _lockDevTools() {
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    _closeHud();
    _hidePill();
    isGhostMode = false;
    isInfiniteHints = false;
    document.body.classList.remove('dev-ghost-active');
    const gToggle = document.getElementById('dev-toggle-ghost');
    const hToggle = document.getElementById('dev-toggle-hints');
    if (gToggle) gToggle.checked = false;
    if (hToggle) hToggle.checked = false;
    if (typeof UIBoard !== 'undefined' && typeof Game !== 'undefined') {
      UIBoard.render(Game.getState());
    }
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('🔒 Đã khóa Developer Tools.');
    }
  }

  /* ---------- Watcher for Live HUD Stats ---------- */
  function _startStatsWatcher() {
    _stopStatsWatcher();
    statsTimer = setInterval(() => {
      if (!isHudOpen || typeof Game === 'undefined') return;
      const state = Game.getState();
      const elTimer = document.getElementById('dev-stat-timer');
      const elScore = document.getElementById('dev-stat-score');
      const elStreak = document.getElementById('dev-stat-streak');

      if (state) {
        if (elTimer) elTimer.textContent = Game.formatTime(state.timer || 0);
        if (elScore) elScore.textContent = (state.score || 0).toLocaleString('vi-VN');
        if (elStreak) elStreak.textContent = `${state.correctStreak || 0} / ${state.wrongStreak || 0}`;

        // Ensure infinite hints is maintained if toggled
        if (isInfiniteHints && state.hints < 100) {
          state.hints = 9999;
          const hintBadge = document.getElementById('hint-badge');
          if (hintBadge) hintBadge.textContent = '∞';
        }
      } else {
        if (elTimer) elTimer.textContent = '--:--';
        if (elScore) elScore.textContent = '0';
        if (elStreak) elStreak.textContent = '0 / 0';
      }
    }, 400);
  }

  function _stopStatsWatcher() {
    if (statsTimer) {
      clearInterval(statsTimer);
      statsTimer = null;
    }
  }

  /* ---------- Core Cheat Implementations ---------- */

  // 1. Infinite Hints
  function _applyInfiniteHints() {
    if (!isInfiniteHints || typeof Game === 'undefined') return;
    const state = Game.getState();
    if (state) {
      state.hints = 9999;
      const hintBadge = document.getElementById('hint-badge');
      if (hintBadge) hintBadge.textContent = '∞';
    }
  }

  // 2. Ghost Answers (Render Solution in Empty Cells faintly)
  function _renderGhostAnswers() {
    if (typeof Game === 'undefined') return;
    const state = Game.getState();
    if (!state || !state.solution) return;

    const cellElements = document.querySelectorAll('#sudoku-board .cell');
    if (!cellElements || cellElements.length === 0) return;

    for (let i = 0; i < 81; i++) {
      const cell = cellElements[i];
      if (!cell) continue;
      const valSpan = cell.querySelector('.cell-value');
      if (!valSpan) continue;
      const notesDiv = cell.querySelector('.cell-notes');

      if (isGhostMode) {
        // If cell is currently empty, show ghost number
        if (state.current[i] === 0) {
          valSpan.textContent = state.solution[i];
          valSpan.classList.add('dev-ghost-number');
          if (notesDiv) notesDiv.style.display = 'none';
        } else {
          // If cell has been placed by user or is given, remove ghost styling immediately so it displays solid black!
          valSpan.classList.remove('dev-ghost-number');
        }
      } else {
        // If turning off ghost, clean it
        valSpan.classList.remove('dev-ghost-number');
        if (state.current[i] === 0) {
          valSpan.textContent = '';
        }
      }
    }
  }

  let cachedGameOverCallback = null;

  function _hookGameCallbacks() {
    if (typeof Game === 'undefined') return;
    const originalSetCallbacks = Game.setCallbacks;
    Game.setCallbacks = function (onUpdate, onGameOver) {
      cachedGameOverCallback = onGameOver;
      return originalSetCallbacks.call(this, onUpdate, onGameOver);
    };
  }

  function _hookBoardRender() {
    if (typeof UIBoard === 'undefined') return;
    const originalRender = UIBoard.render;
    UIBoard.render = function (state) {
      originalRender.call(this, state);
      if (isGhostMode) {
        _renderGhostAnswers();
      }
      if (isInfiniteHints && state) {
        _applyInfiniteHints();
      }
    };
  }

  // 3. Instant Win
  function _instantWin() {
    if (typeof Game === 'undefined') return;
    const state = Game.getState();
    if (!state) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Không có ván chơi nào! Hãy bắt đầu ván mới.');
      return;
    }
    if (state.isFinished) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Ván chơi này đã kết thúc! Hãy bắt đầu ván mới.');
      return;
    }

    // Place all remaining cells using actual game engine
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        if (state.current[i] !== state.solution[i]) {
          Game.selectCell(r, c);
          Game.placeNumber(state.solution[i]);
        }
      }
    }
    if (typeof App !== 'undefined' && App.showToast) App.showToast('🎉 Đã kích hoạt Chiến Thắng!');
  }

  // 4. Fill 80/81 cells
  function _fillExceptOne() {
    if (typeof Game === 'undefined') return;
    const state = Game.getState();
    if (!state) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Không có ván chơi nào! Hãy bắt đầu ván mới.');
      return;
    }
    if (state.isFinished) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Ván chơi này đã kết thúc! Hãy bắt đầu ván mới.');
      return;
    }

    const empties = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        if (state.current[i] !== state.solution[i]) {
          empties.push({ r, c, val: state.solution[i] });
        }
      }
    }

    if (empties.length <= 1) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Ván cờ chỉ còn 1 ô hoặc đã hoàn thành!');
      return;
    }

    // Fill all except the last one
    for (let k = 0; k < empties.length - 1; k++) {
      Game.selectCell(empties[k].r, empties[k].c);
      Game.placeNumber(empties[k].val);
    }

    // Select the last remaining cell
    const last = empties[empties.length - 1];
    Game.selectCell(last.r, last.c);
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`🎯 Đã điền 80/81 ô! Điền số ${last.val} vào ô cuối để chiến thắng.`);
    }
  }

  // 5. Danger Stage Simulator
  function _setWrongStreak(streakCount) {
    if (typeof Game === 'undefined') return;
    const state = Game.getState();
    if (!state) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Không có ván chơi nào! Hãy bắt đầu ván mới.');
      return;
    }
    if (state.isFinished) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Ván chơi này đã kết thúc! Hãy bắt đầu ván mới.');
      return;
    }

    const maxAllowed = (Game.MAX_WRONG_STREAK && Game.MAX_WRONG_STREAK[state.difficulty]) || 15;
    if (streakCount > maxAllowed) {
      _triggerGameOver();
      return;
    }

    state.wrongStreak = streakCount;
    if (streakCount > 0) {
      state.mistakes = Math.min(3, streakCount);
    } else {
      state.mistakes = 0;
    }

    if (typeof UIControls !== 'undefined' && UIControls.update) {
      UIControls.update(state);
    }
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(streakCount === 0 ? '🔄 Đã reset chuỗi sai về 0' : `⚠️ Đã đặt Chuỗi Sai = ${streakCount}`);
    }
  }

  // 6. Realistic Game Over Trigger
  function _triggerGameOver() {
    if (typeof Game === 'undefined') return;
    const state = Game.getState();
    if (!state) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Không có ván chơi nào! Hãy bắt đầu ván mới.');
      return;
    }
    if (state.isFinished) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Ván chơi này đã kết thúc! Hãy bắt đầu ván mới để kiểm tra.');
      return;
    }

    // Find any non-given cell to place a guaranteed wrong digit
    let targetRow = -1, targetCol = -1, wrongDigit = 1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        if (!state.given[i]) {
          targetRow = r;
          targetCol = c;
          wrongDigit = (state.solution[i] % 9) + 1; // Always different from solution!
          break;
        }
      }
      if (targetRow !== -1) break;
    }

    if (targetRow !== -1) {
      // Set streak to exactly max allowed so this wrong placement triggers Game Over via genuine engine
      const maxAllowed = (Game.MAX_WRONG_STREAK && Game.MAX_WRONG_STREAK[state.difficulty]) || 15;
      state.wrongStreak = maxAllowed;
      state.mistakes = 2; // Making this 3rd mistake
      Game.selectCell(targetRow, targetCol);
      Game.placeNumber(wrongDigit);
      return;
    }

    // Fallback if no empty/non-given cell found
    state.isFinished = true;
    if (Game.stopTimer) Game.stopTimer();
    const breakdown = Game.getScoreBreakdown ? Game.getScoreBreakdown(state) : null;
    if (typeof Storage !== 'undefined') {
      Storage.recordGameResult(state.difficulty, false, state.timer, state.mistakes, breakdown ? breakdown.finalScore : state.score);
      Storage.clearGame();
    }
    if (cachedGameOverCallback) {
      cachedGameOverCallback('streak_over', state, breakdown);
    } else {
      const modal = document.getElementById('modal-gameover');
      if (modal) modal.classList.remove('hidden');
    }
  }

  // 7. Set Timer
  function _setTimer(seconds) {
    if (typeof Game === 'undefined') return;
    const state = Game.getState();
    if (!state) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Không có ván chơi nào! Hãy bắt đầu ván mới.');
      return;
    }
    if (state.isFinished) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('Ván chơi này đã kết thúc! Hãy bắt đầu ván mới.');
      return;
    }
    state.timer = Math.max(0, seconds);
    const timerEl = document.getElementById('game-timer');
    if (timerEl) timerEl.textContent = Game.formatTime(state.timer);
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`⏱️ Đã đặt thời gian = ${Game.formatTime(state.timer)}`);
    }
  }

  /* ---------- Shortcut Binding ---------- */
  function _bindShortcuts() {
    // Keyboard: Ctrl + Shift + D or ` (Tilde/Backquote)
    window.addEventListener('keydown', (e) => {
      const isCtrlShiftD = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'd' || e.key === 'D');
      const isTilde = e.key === '`' || e.key === '~';

      // Avoid triggering tilde when typing in normal text inputs
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (isTilde && isInput) return;

      if (isCtrlShiftD || isTilde) {
        e.preventDefault();
        _toggleDevTools();
      }
    });

    // Mobile Secret Trigger: 5 rapid taps on app title or header
    let tapCount = 0;
    let lastTapTime = 0;
    document.addEventListener('click', (e) => {
      const isHeaderTap = e.target.closest('.profile-name') || e.target.closest('#game-timer') || e.target.closest('.game-header h2');
      if (!isHeaderTap) return;

      const now = Date.now();
      if (now - lastTapTime < 500) {
        tapCount++;
      } else {
        tapCount = 1;
      }
      lastTapTime = now;

      if (tapCount >= 5) {
        tapCount = 0;
        _toggleDevTools();
      }
    });
  }

  function _toggleDevTools() {
    if (sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true') {
      if (isHudOpen) {
        _closeHud();
      } else {
        _openHud();
      }
    } else {
      _openAuthModal();
    }
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    open: _toggleDevTools,
    instantWin: _instantWin,
    fillExceptOne: _fillExceptOne,
    isGhostActive: () => isGhostMode,
    isInfiniteHintsActive: () => isInfiniteHints
  };
})();

