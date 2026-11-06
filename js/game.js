/* =========================================================
   game.js — Game state, timer, scoring, undo, auto-save
   ========================================================= */
const Game = (() => {
  let state = null;
  let timerInterval = null;
  let onUpdate = null;
  let onGameOver = null;
  let onThreeMistakes = null;

  const DIFF_LABELS = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  const SCORE_PER_CELL = { easy: 10, medium: 20, hard: 40 };
  const PERFECT_BONUS = { easy: 100, medium: 200, hard: 300 };

  /* ---- mistake & revive configuration ---- */
  const MISTAKE_PENALTIES = { easy: 5, medium: 7, hard: 10 };
  const REVIVE_BASE_COST = { easy: 50, medium: 100, hard: 150 };
  const HINT_PERMANENT_COST = { easy: 50, medium: 100, hard: 150 };
  const AUTO_NOTES_COST = { easy: 100, medium: 200, hard: 300 };

  /* ---- penalties configuration ---- */
  const HINT_PENALTIES = {
    easy: [30, 50, 70],
    medium: [50, 70, 90],
    hard: [50, 100, 150]
  };

  function getHintPenalty(difficulty, hintCountUsed) {
    const list = HINT_PENALTIES[difficulty] || [30, 50, 70];
    const idx = Math.min(Math.max(0, hintCountUsed), list.length - 1);
    return list[idx];
  }

  function getWrongPenalty(difficulty) {
    return MISTAKE_PENALTIES[difficulty] || 5;
  }

  /* ---- scoring multipliers ---- */
  function getStreakMultiplier(streak) {
    if (streak >= 41) return 2.0;
    if (streak >= 31) return 1.7;
    if (streak >= 21) return 1.5;
    if (streak >= 11) return 1.2;
    return 1.0;
  }

  function getTimeMultiplier(difficulty, seconds) {
    if (difficulty === 'easy') {
      if (seconds < 90) return 2.0;
      if (seconds < 300) return 1.5;
      return 1.0;
    }
    if (difficulty === 'medium') {
      if (seconds < 180) return 2.0;
      if (seconds < 600) return 1.5;
      return 1.0;
    }
    if (difficulty === 'hard') {
      if (seconds < 360) return 2.0;
      if (seconds < 1200) return 1.5;
      return 1.0;
    }
    return 1.0;
  }

  function getScoreBreakdown(st) {
    if (!st) return null;
    const timeMult = getTimeMultiplier(st.difficulty, st.timer);
    const autoNotesPenalty = st.autoNotesPenalty || 0;
    const rawScore = st.score || 0;
    const finalScore = Math.max(0, Math.round(Math.max(0, rawScore - autoNotesPenalty) * timeMult));
    const baseScore = st.baseScore || 0;
    const perfectBonus = st.perfectBonus || 0;
    const hintPenalties = st.hintPenalties || 0;
    const wrongPenalties = st.wrongPenalties || 0;
    const comboBonus = Math.max(0, (st.score + hintPenalties + wrongPenalties - perfectBonus) - baseScore);
    const cellPts = SCORE_PER_CELL[st.difficulty] || 10;

    return {
      difficulty: st.difficulty,
      diffLabel: (typeof I18n !== 'undefined' ? I18n.t('diff_' + st.difficulty) : (DIFF_LABELS[st.difficulty] || st.difficulty)),
      cellPts,
      correctCount: st.correctCount || 0,
      baseScore,
      comboBonus,
      perfectBonus,
      hintPenalties,
      wrongPenalties,
      autoNotesPenalty,
      isPerfect: st.mistakes === 0 && perfectBonus > 0,
      rawScore,
      maxStreak: st.maxStreak || 0,
      currentStreak: st.correctStreak || 0,
      reviveCount: st.reviveCount || 0,
      timer: st.timer || 0,
      formattedTime: formatTime(st.timer || 0),
      timeMultiplier: timeMult,
      finalScore,
      mistakes: st.mistakes || 0
    };
  }

  /* ---- helpers ---- */
  function idx(r, c) { return r * 9 + c; }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  function serializeState() {
    if (!state) return null;
    return {
      puzzle: state.puzzle,
      solution: state.solution,
      current: state.current,
      notes: state.notes,
      given: state.given,
      mistakes: state.mistakes,
      reviveCount: state.reviveCount || 0,
      hints: state.hints,
      hintsUsed: state.hintsUsed || 0,
      hintsBought: state.hintsBought || 0,
      score: state.score,
      baseScore: state.baseScore,
      perfectBonus: state.perfectBonus || 0,
      hintPenalties: state.hintPenalties || 0,
      wrongPenalties: state.wrongPenalties || 0,
      autoNotesPenalty: state.autoNotesPenalty || 0,
      correctCount: state.correctCount,
      correctStreak: state.correctStreak,
      maxStreak: state.maxStreak,
      difficulty: state.difficulty,
      timer: state.timer,
      undoStack: state.undoStack,
      notesMode: state.notesMode,
      autoNotesMode: state.autoNotesMode || false,
      autoNotesUsed: state.autoNotesUsed || false,
      fastFillMode: state.fastFillMode,
      fastFillDigit: state.fastFillDigit,
      isFinished: state.isFinished
    };
  }

  function save() {
    if (state && !state.isFinished) {
      Storage.saveGame(serializeState());
    }
  }

  /* ---- timer ---- */
  function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
      if (state && !state.isPaused && !state.isFinished) {
        state.timer++;
        save();
        if (onUpdate) onUpdate(state);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  /* ---- auto-remove notes ---- */
  function removeRelatedNotes(row, col, num) {
    // Row
    for (let c = 0; c < 9; c++) {
      const k = `${row},${c}`;
      if (state.notes[k]) state.notes[k] = state.notes[k].filter(n => n !== num);
    }
    // Column
    for (let r = 0; r < 9; r++) {
      const k = `${r},${col}`;
      if (state.notes[k]) state.notes[k] = state.notes[k].filter(n => n !== num);
    }
    // Box
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++) {
        const k = `${r},${c}`;
        if (state.notes[k]) state.notes[k] = state.notes[k].filter(n => n !== num);
      }
  }

  function checkComplete() {
    for (let i = 0; i < 81; i++) {
      if (state.current[i] !== state.solution[i]) return false;
    }
    return true;
  }

  /* Count correct placements of a digit */
  function countDigit(num) {
    let c = 0;
    for (let i = 0; i < 81; i++) {
      if (state.current[i] === num && state.current[i] === state.solution[i]) c++;
    }
    return c;
  }

  function getRemaining(num) { return 9 - countDigit(num); }

  /* ---- public API ---- */

  function start(difficulty) {
    const { puzzle, solution } = SudokuEngine.generate(difficulty);
    const settings = (typeof Storage !== 'undefined' && Storage.getSettings) ? Storage.getSettings() : {};
    const defaultFastFill = !!settings.fastFillDefault;
    state = {
      puzzle: [...puzzle],
      solution: [...solution],
      current: [...puzzle],
      notes: {},
      given: puzzle.map(v => v !== 0),
      mistakes: 0,
      reviveCount: 0,
      hints: 3,
      hintsUsed: 0,
      hintsBought: 0,
      score: 0,
      baseScore: 0,
      perfectBonus: 0,
      hintPenalties: 0,
      wrongPenalties: 0,
      autoNotesPenalty: 0,
      correctCount: 0,
      correctStreak: 0,
      maxStreak: 0,
      difficulty,
      timer: 0,
      undoStack: [],
      selectedCell: null,
      notesMode: false,
      autoNotesMode: false,
      autoNotesUsed: false,
      fastFillMode: defaultFastFill,
      fastFillDigit: null,
      conflictCells: null,
      hintExplanation: null,
      isFinished: false,
      isPaused: false
    };
    save();
    startTimer();
    if (onUpdate) onUpdate(state);
  }

  function resume() {
    const saved = Storage.loadGame();
    if (!saved || saved.isFinished) return false;
    state = {
      ...saved,
      reviveCount: saved.reviveCount || 0,
      hintsUsed: saved.hintsUsed || 0,
      hintsBought: saved.hintsBought || 0,
      baseScore: saved.baseScore || 0,
      perfectBonus: saved.perfectBonus || 0,
      hintPenalties: saved.hintPenalties || 0,
      wrongPenalties: saved.wrongPenalties || 0,
      autoNotesPenalty: saved.autoNotesPenalty || 0,
      autoNotesMode: saved.autoNotesMode || false,
      autoNotesUsed: saved.autoNotesUsed || false,
      correctCount: saved.correctCount || 0,
      correctStreak: saved.correctStreak || 0,
      maxStreak: saved.maxStreak || 0,
      selectedCell: null,
      fastFillMode: saved.fastFillMode || false,
      fastFillDigit: saved.fastFillDigit || null,
      conflictCells: null,
      hintExplanation: null,
      isPaused: false
    };
    startTimer();
    if (onUpdate) onUpdate(state);
    return true;
  }

  function selectCell(row, col) {
    if (!state || state.isFinished || state.isPaused) return;

    const i = idx(row, col);
    const val = state.current[i];
    const isGiven = state.given[i];
    const isCorrectPlaced = (val !== 0 && val === state.solution[i]);

    // In Fast-Fill (Tia chớp) mode:
    if (state.fastFillMode) {
      // 1. If clicking a cell that already contains a valid digit (given or correctly placed):
      if (isGiven || isCorrectPlaced) {
        // Toggle or switch active Tia chớp digit to this number (even if completed, to inspect its 9 cells!)
        if (state.fastFillDigit === val) {
          state.fastFillDigit = null;
          state.selectedCell = { row, col };
        } else {
          state.fastFillDigit = val;
          state.selectedCell = { row, col };
        }
        if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
        save();
        if (onUpdate) onUpdate(state);
        return;
      }

      // 2. If clicking an editable cell (empty or mistake):
      if (!isGiven) {
        if (state.fastFillDigit !== null) {
          if (getRemaining(state.fastFillDigit) > 0) {
            state.selectedCell = { row, col };
            if (state.notesMode) {
              _placeNote(row, col, state.fastFillDigit);
            } else {
              _placeValue(row, col, state.fastFillDigit);
            }
            return;
          } else {
            // Selected digit is already completed (viewing mode): do not place!
            // Just select the clicked cell
            state.selectedCell = { row, col };
            if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
            save();
            if (onUpdate) onUpdate(state);
            return;
          }
        } else {
          // Waiting for player to select next Tia chớp digit
          state.selectedCell = { row, col };
          if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
          save();
          if (onUpdate) onUpdate(state);
          return;
        }
      }
    }

    // Standard mode (Tia chớp off):
    state.selectedCell = { row, col };
    if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
    if (onUpdate) onUpdate(state);
  }

  function placeNumber(num) {
    if (!state || !state.selectedCell || state.isFinished || state.isPaused) return;
    if (getRemaining(num) === 0) return;
    const { row, col } = state.selectedCell;
    const i = idx(row, col);
    if (state.given[i]) return;

    if (state.notesMode) {
      _placeNote(row, col, num);
    } else {
      _placeValue(row, col, num);
    }
  }

  function _placeNote(row, col, num) {
    const i = idx(row, col);
    // Can't add notes to a cell that already has a value
    if (state.current[i] !== 0) return;

    const key = `${row},${col}`;
    const oldNotes = state.notes[key] ? [...state.notes[key]] : [];

    if (!state.notes[key]) state.notes[key] = [];
    const ni = state.notes[key].indexOf(num);
    if (ni >= 0) {
      // Removing note is always allowed
      state.notes[key].splice(ni, 1);
      state.undoStack.push({ type: 'note', row, col, oldNotes });
      save();
      if (typeof Sound !== 'undefined' && Sound.playNote) Sound.playNote();
      if (onUpdate) onUpdate(state);
      return;
    }

    // Adding note: verify collision against existing placed numbers in row, col, and 3x3 block
    const conflicts = [];
    // Check row
    for (let c = 0; c < 9; c++) {
      const ci = idx(row, c);
      if (state.current[ci] === num) conflicts.push(ci);
    }
    // Check col
    for (let r = 0; r < 9; r++) {
      const ci = idx(r, col);
      if (state.current[ci] === num && !conflicts.includes(ci)) conflicts.push(ci);
    }
    // Check 3x3 box
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        const ci = idx(r, c);
        if (state.current[ci] === num && !conflicts.includes(ci)) conflicts.push(ci);
      }
    }

    if (conflicts.length > 0) {
      state.conflictCells = conflicts;
      if (typeof Sound !== 'undefined' && Sound.playError) Sound.playError();
      if (onUpdate) onUpdate(state);
      setTimeout(() => {
        if (state && state.conflictCells) {
          state.conflictCells = null;
          if (onUpdate) onUpdate(state);
        }
      }, 2000);
      return;
    }

    state.notes[key].push(num);
    state.undoStack.push({ type: 'note', row, col, oldNotes });
    save();
    if (typeof Sound !== 'undefined' && Sound.playNote) Sound.playNote();
    if (onUpdate) onUpdate(state);
  }

  function _placeValue(row, col, num) {
    state.hintExplanation = null;
    const i = idx(row, col);
    const oldValue = state.current[i];
    const key = `${row},${col}`;
    const oldNotes = state.notes[key] ? [...state.notes[key]] : [];

    // If cell already has the correct number, don't overwrite
    if (oldValue === state.solution[i] && oldValue !== 0) {
      if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
      if (onUpdate) onUpdate(state);
      return;
    }

    // If same value already placed, do nothing
    if (oldValue === num) {
      if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
      if (onUpdate) onUpdate(state);
      return;
    }

    state.current[i] = num;
    state.notes[key] = [];

    const isCorrect = num === state.solution[i];

    if (!isCorrect) {
      const prevCorrectStreak = state.correctStreak || 0;
      state.correctStreak = 0;
      state.mistakes++;

      // Penalty per mistake turn (Easy: -5, Medium: -7, Hard: -10)
      const penalty = getWrongPenalty(state.difficulty);
      state.score = Math.max(0, state.score - penalty);
      state.wrongPenalties = (state.wrongPenalties || 0) + penalty;

      state.undoStack.push({
        type: 'value',
        row, col,
        oldValue, oldNotes,
        error: true,
        prevCorrectStreak,
        penaltyDeducted: penalty,
        pointsEarned: 0,
        basePts: 0
      });
      save();
      if (typeof Sound !== 'undefined' && Sound.playError) Sound.playError();
      if (onUpdate) onUpdate(state);

      // Check 3 mistakes limit
      if (state.mistakes >= 3) {
        stopTimer();
        state.isPaused = true;
        if (onThreeMistakes) {
          onThreeMistakes(state);
        } else if (typeof App !== 'undefined' && App.showReviveModal) {
          App.showReviveModal(state);
        }
      }
      return;
    }

    // Correct placement
    const prevCorrectStreak = state.correctStreak || 0;
    state.correctStreak = prevCorrectStreak + 1;
    state.maxStreak = Math.max(state.maxStreak || 0, state.correctStreak);
    state.correctCount = (state.correctCount || 0) + 1;

    const streakMult = getStreakMultiplier(state.correctStreak);
    const basePts = SCORE_PER_CELL[state.difficulty] || 10;
    const pointsEarned = Math.round(basePts * streakMult);

    state.baseScore = (state.baseScore || 0) + basePts;
    state.score = (state.score || 0) + pointsEarned;

    // Automatically remove number from related notes in row, column, and box
    removeRelatedNotes(row, col, num);

    state.undoStack.push({
      type: 'value',
      row, col,
      oldValue, oldNotes,
      error: false,
      prevCorrectStreak,
      pointsEarned,
      basePts
    });
    save();

    if (checkComplete()) {
      state.isFinished = true;
      stopTimer();
      if (state.mistakes === 0) {
        state.perfectBonus = PERFECT_BONUS[state.difficulty] || 0;
        state.score += state.perfectBonus;
      }
      const breakdown = getScoreBreakdown(state);
      Storage.recordGameResult(state.difficulty, true, state.timer, state.mistakes, breakdown.finalScore);
      Storage.clearGame();
      if (onUpdate) onUpdate(state);
      if (onGameOver) onGameOver('win', state, breakdown);
      return;
    }

    const remainingForDigit = getRemaining(num);
    if (remainingForDigit === 0 && state.fastFillDigit === num) {
      state.fastFillDigit = null;
      state.selectedCell = null;
    }

    if (typeof Sound !== 'undefined') {
      if (remainingForDigit === 0 && Sound.playDigitComplete) {
        Sound.playDigitComplete();
      } else if (Sound.playCorrect) {
        Sound.playCorrect(state.correctStreak);
      }
    }

    if (onUpdate) onUpdate(state);
  }

  function undo() {
    if (!state || state.isFinished || state.isPaused) return;
    if (state.undoStack.length === 0) return;

    state.hintExplanation = null;
    const action = state.undoStack.pop();
    const key = `${action.row},${action.col}`;

    if (action.type === 'value') {
      const i = idx(action.row, action.col);
      // If it was an error: DO NOT refund mistake count, DO NOT refund mistake penalty!
      // The mistakes counter stays (e.g. 2/3 remains 2/3).
      // Only reset cell value to empty/oldValue and restore notes.
      if (action.error) {
        // state.mistakes and score penalty are IRREVERSIBLE
      } else {
        // If undoing a correct placement: deduct earned points to prevent score exploit
        const pts = action.pointsEarned !== undefined ? action.pointsEarned : SCORE_PER_CELL[state.difficulty];
        const basePts = action.basePts !== undefined ? action.basePts : SCORE_PER_CELL[state.difficulty];
        state.score = Math.max(0, state.score - pts);
        state.baseScore = Math.max(0, (state.baseScore || 0) - basePts);
        state.correctCount = Math.max(0, (state.correctCount || 0) - 1);
      }
      // Reset streak to 0
      state.correctStreak = 0;
      state.current[i] = action.oldValue;
      state.notes[key] = action.oldNotes;
    } else if (action.type === 'note') {
      state.notes[key] = action.oldNotes;
    } else if (action.type === 'erase') {
      const i = idx(action.row, action.col);
      state.current[i] = action.oldValue;
      state.notes[key] = action.oldNotes;
      if (action.wasCorrect) {
        state.score += action.deductedScore || SCORE_PER_CELL[state.difficulty];
        state.baseScore = (state.baseScore || 0) + (action.deductedBase || SCORE_PER_CELL[state.difficulty]);
        state.correctCount = (state.correctCount || 0) + 1;
      }
      state.correctStreak = 0;
    }

    save();
    if (typeof Sound !== 'undefined' && Sound.playErase) Sound.playErase();
    if (onUpdate) onUpdate(state);
  }

  function erase() {
    if (!state || !state.selectedCell || state.isFinished || state.isPaused) return;
    const { row, col } = state.selectedCell;
    const i = idx(row, col);
    if (state.given[i]) return;

    const key = `${row},${col}`;
    const oldValue = state.current[i];
    const oldNotes = state.notes[key] ? [...state.notes[key]] : [];

    if (oldValue === 0 && oldNotes.length === 0) return;

    // If erasing a correct cell, adjust score
    const wasCorrect = oldValue !== 0 && oldValue === state.solution[i];
    let deductedScore = 0;
    let deductedBase = 0;
    if (wasCorrect) {
      deductedBase = SCORE_PER_CELL[state.difficulty];
      deductedScore = deductedBase;
      state.score = Math.max(0, state.score - deductedScore);
      state.baseScore = Math.max(0, (state.baseScore || 0) - deductedBase);
      state.correctCount = Math.max(0, (state.correctCount || 0) - 1);
      state.correctStreak = 0;
    }

    state.current[i] = 0;
    state.notes[key] = [];
    state.undoStack.push({ type: 'erase', row, col, oldValue, oldNotes, wasCorrect, deductedScore, deductedBase });
    save();
    if (typeof Sound !== 'undefined' && Sound.playErase) Sound.playErase();
    if (onUpdate) onUpdate(state);
  }

  function toggleNotes() {
    if (!state || state.isFinished) return;
    state.notesMode = !state.notesMode;
    save();
    if (onUpdate) onUpdate(state);
  }

  function toggleFastFill(digit) {
    if (!state || state.isFinished || state.isPaused) return;
    state.fastFillMode = !state.fastFillMode;
    if (state.fastFillMode) {
      if (digit !== undefined && digit >= 1 && digit <= 9) {
        state.fastFillDigit = digit;
      } else if (state.selectedCell) {
        const curVal = state.current[idx(state.selectedCell.row, state.selectedCell.col)];
        state.fastFillDigit = (curVal >= 1 && curVal <= 9) ? curVal : null;
      } else {
        state.fastFillDigit = null;
      }
    } else {
      state.fastFillDigit = null;
    }
    if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
    save();
    if (onUpdate) onUpdate(state);
  }

  function selectFastFillDigit(num) {
    if (!state || state.isFinished || state.isPaused) return;
    if (!state.fastFillMode) {
      placeNumber(num);
      return;
    }
    state.fastFillDigit = (state.fastFillDigit === num) ? null : num;
    state.selectedCell = null;
    if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
    save();
    if (onUpdate) onUpdate(state);
  }

  let lastHintTime = 0;

  function _applyHint(isPurchased = false) {
    if (!state || state.isFinished) return false;

    // Use Smart Hint algorithm to find logical deduction
    const smartHint = (typeof SudokuEngine !== 'undefined' && SudokuEngine.getSmartHint)
      ? SudokuEngine.getSmartHint(state.current, state.solution)
      : null;

    let row, col, hintVal;
    if (smartHint) {
      row = smartHint.row;
      col = smartHint.col;
      hintVal = smartHint.value;
      state.hintExplanation = {
        technique: smartHint.technique,
        reasonVi: smartHint.reasonVi,
        reasonEn: smartHint.reasonEn
      };
    } else {
      if (state.selectedCell) {
        const i = idx(state.selectedCell.row, state.selectedCell.col);
        if (!state.given[i] && state.current[i] !== state.solution[i]) {
          row = state.selectedCell.row;
          col = state.selectedCell.col;
        }
      }
      if (row === undefined) {
        const empties = [];
        for (let i = 0; i < 81; i++) {
          if (!state.given[i] && state.current[i] !== state.solution[i]) {
            empties.push(i);
          }
        }
        if (empties.length === 0) return false;
        const ri = empties[Math.floor(Math.random() * empties.length)];
        row = Math.floor(ri / 9);
        col = ri % 9;
      }
      hintVal = state.solution[idx(row, col)];
      state.hintExplanation = {
        technique: 'Direct Placement',
        reasonVi: `Điền số ${hintVal} vào ô hàng ${row + 1}, cột ${col + 1} (Direct Placement)`,
        reasonEn: `Place ${hintVal} at Row ${row + 1}, Col ${col + 1} (Direct Placement)`
      };
    }

    const i = idx(row, col);
    const key = `${row},${col}`;

    if (!isPurchased) {
      // Free hint: deduct in-match hint penalty
      const hintIdx = state.hintsUsed || 0;
      const penalty = getHintPenalty(state.difficulty, hintIdx);
      state.hintsUsed = hintIdx + 1;
      state.hints--;
      state.score = Math.max(0, state.score - penalty);
      state.hintPenalties = (state.hintPenalties || 0) + penalty;
    } else {
      // Purchased via profile points: already paid permanent score, don't deduct match score
      state.hintsUsed = (state.hintsUsed || 0) + 1;
    }

    state.current[i] = hintVal;
    state.notes[key] = [];
    state.given[i] = true; // Mark as given so it can't be erased

    removeRelatedNotes(row, col, hintVal);

    // Don't add to undo stack (hints are permanent)
    state.selectedCell = { row, col };
    state.hintedCell = { row, col }; // For flash animation
    save();

    if (typeof Sound !== 'undefined' && Sound.playHint) Sound.playHint();
    if (onUpdate) onUpdate(state);

    // Check completion
    if (checkComplete()) {
      state.isFinished = true;
      stopTimer();
      if (state.mistakes === 0) {
        state.perfectBonus = PERFECT_BONUS[state.difficulty] || 0;
        state.score += state.perfectBonus;
      }
      const breakdown = getScoreBreakdown(state);
      Storage.recordGameResult(state.difficulty, true, state.timer, state.mistakes, breakdown.finalScore);
      Storage.clearGame();
      if (onUpdate) onUpdate(state);
      if (onGameOver) onGameOver('win', state, breakdown);
    }

    // Clear hinted cell marker after animation
    setTimeout(() => {
      if (state) {
        state.hintedCell = null;
        if (onUpdate) onUpdate(state);
      }
    }, 900);

    return true;
  }

  function useHint() {
    if (!state || state.isFinished || state.isPaused || state.hints <= 0) return;
    const now = Date.now();
    if (now - lastHintTime < 350) return;
    lastHintTime = now;
    _applyHint(false);
  }

  function getHintPermanentCost(difficulty) {
    const diff = difficulty || (state ? state.difficulty : 'easy');
    const base = HINT_PERMANENT_COST[diff] || 50;
    const count = (state ? (state.hintsBought || 0) : 0) + 1;
    return base * count;
  }

  function buyExtraHint() {
    if (!state || state.isFinished) return false;
    const cost = getHintPermanentCost(state.difficulty);
    const totalPermanent = Storage.getTotalPermanentScore();
    if (totalPermanent < cost) return false;

    const ok = Storage.deductPermanentScore(cost);
    if (!ok) return false;

    state.hintsBought = (state.hintsBought || 0) + 1;
    save();
    _applyHint(true);
    return true;
  }

  /* ---- auto notes (fast notes) ---- */
  function fillAllCandidates() {
    if (!state || typeof SudokuEngine === 'undefined') return;
    const validCands = SudokuEngine.getAllValidCandidates(state.current);
    for (let i = 0; i < 81; i++) {
      if (state.current[i] === 0) {
        const r = Math.floor(i / 9), c = i % 9;
        state.notes[`${r},${c}`] = validCands[i];
      }
    }
  }

  function toggleAutoNotes() {
    if (!state || state.isFinished || state.isPaused) return null;
    state.autoNotesMode = !state.autoNotesMode;

    let penaltyJustApplied = 0;
    if (state.autoNotesMode) {
      if (!state.autoNotesUsed) {
        state.autoNotesUsed = true;
        state.autoNotesPenalty = AUTO_NOTES_COST[state.difficulty] || 100;
        penaltyJustApplied = state.autoNotesPenalty;
      }
      fillAllCandidates();
    } else {
      // Clear all notes to keep screen clean
      state.notes = {};
    }

    save();
    if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
    if (onUpdate) onUpdate(state);

    return {
      mode: state.autoNotesMode,
      penaltyJustApplied,
      totalPenalty: state.autoNotesPenalty
    };
  }

  /* ---- mistake revival & scoring cheats ---- */
  function getReviveCost() {
    if (!state) return 0;
    const base = REVIVE_BASE_COST[state.difficulty] || 50;
    const count = (state.reviveCount || 0) + 1;
    return base * count;
  }

  function canRevive() {
    if (!state) return false;
    return (state.score || 0) >= getReviveCost();
  }

  function revive() {
    if (!state || state.isFinished) return false;
    const cost = getReviveCost();
    if ((state.score || 0) < cost) return false;

    state.score = Math.max(0, state.score - cost);
    state.reviveCount = (state.reviveCount || 0) + 1;
    state.mistakes = 2; // Reduced from 3/3 to 2/3!

    // Clear the error cell that caused the 3rd mistake
    if (state.undoStack && state.undoStack.length > 0) {
      const last = state.undoStack[state.undoStack.length - 1];
      if (last.type === 'value' && last.error) {
        const i = idx(last.row, last.col);
        state.current[i] = 0;
        state.selectedCell = { row: last.row, col: last.col };
      }
    }

    state.isPaused = false;
    startTimer();
    save();
    if (onUpdate) onUpdate(state);
    return true;
  }

  function giveUpFromMistakes() {
    if (!state) return;
    state.isFinished = true;
    stopTimer();
    const breakdown = getScoreBreakdown(state);
    Storage.recordGameResult(state.difficulty, false, state.timer, state.mistakes, breakdown.finalScore);
    Storage.clearGame();
    if (onGameOver) onGameOver('total_mistakes_over', state, breakdown);
  }

  function modifyScore(delta) {
    if (!state || state.isFinished) return;
    state.score = Math.max(0, (state.score || 0) + delta);
    save();
    if (onUpdate) onUpdate(state);
  }

  function togglePause() {
    if (!state || state.isFinished) return;
    state.isPaused = !state.isPaused;
    if (onUpdate) onUpdate(state);
  }

  function giveUp() {
    if (!state) return;
    state.isFinished = true;
    stopTimer();
    const breakdown = getScoreBreakdown(state);
    Storage.recordGameResult(state.difficulty, false, state.timer, state.mistakes, breakdown.finalScore);
    Storage.clearGame();
    if (onGameOver) onGameOver('give_up', state, breakdown);
  }

  function abandonSaved() {
    Storage.clearGame();
    state = null;
    stopTimer();
  }

  function destroy() {
    save();
    stopTimer();
    state = null;
  }

  function getState() { return state; }
  function isActive() { return state !== null && !state.isFinished; }

  function setCallbacks(update, gameover, threeMistakes) {
    onUpdate = update;
    onGameOver = gameover;
    onThreeMistakes = threeMistakes;
  }

  return {
    start, resume, selectCell, placeNumber,
    undo, erase, toggleNotes, toggleAutoNotes, fillAllCandidates, toggleFastFill, selectFastFillDigit,
    useHint, buyExtraHint, getHintPermanentCost,
    getReviveCost, canRevive, revive, giveUpFromMistakes, modifyScore,
    togglePause, giveUp, abandonSaved, destroy,
    getState, isActive, setCallbacks,
    getRemaining, formatTime,
    getStreakMultiplier, getTimeMultiplier, getScoreBreakdown,
    getHintPenalty, getWrongPenalty,
    HINT_PENALTIES, MISTAKE_PENALTIES, REVIVE_BASE_COST, HINT_PERMANENT_COST, AUTO_NOTES_COST,
    DIFF_LABELS, SCORE_PER_CELL, PERFECT_BONUS, idx
  };
})();

