/* =========================================================
   game.js — Game state, timer, scoring, undo, auto-save
   ========================================================= */
const Game = (() => {
  let state = null;
  let timerInterval = null;
  let onUpdate = null;
  let onGameOver = null;

  const DIFF_LABELS = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  const SCORE_PER_CELL = { easy: 10, medium: 20, hard: 30 };
  const PERFECT_BONUS = { easy: 100, medium: 150, hard: 200 };

  /* ---- penalties configuration ---- */
  const HINT_PENALTIES = {
    easy: [30, 50, 70],
    medium: [50, 70, 90],
    hard: [50, 100, 150]
  };

  const MAX_WRONG_STREAK = {
    easy: 15,    // 16th is game over
    medium: 15,  // 16th is game over
    hard: 10     // 11th is game over
  };

  function getHintPenalty(difficulty, hintCountUsed) {
    const list = HINT_PENALTIES[difficulty] || [30, 50, 70];
    const idx = Math.min(Math.max(0, hintCountUsed), list.length - 1);
    return list[idx];
  }

  function getWrongPenalty(difficulty, wrongStreak) {
    if (difficulty === 'easy') {
      if (wrongStreak <= 5) return 5;
      if (wrongStreak <= 10) return 50;
      return 100;
    }
    if (difficulty === 'medium') {
      if (wrongStreak <= 5) return 7;
      if (wrongStreak <= 10) return 70;
      return 140;
    }
    if (difficulty === 'hard') {
      if (wrongStreak <= 5) return 10;
      return 100;
    }
    return 5;
  }

  function getWarningStage(difficulty, wrongStreak) {
    if (wrongStreak < 5) return 0;
    if (wrongStreak === 5) return 1; // ửng đỏ nhẹ lần 5
    if (difficulty === 'hard') {
      if (wrongStreak >= 6) return 3; // Hard từ lần 6 nhấp nháy đỏ đậm liên tục
    } else {
      if (wrongStreak >= 11) return 3; // Easy/Medium từ lần 11 nhấp nháy đỏ đậm
      if (wrongStreak >= 6) return 2;  // Easy/Medium từ lần 6 đỏ nhẹ liên tục
    }
    return 0;
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
    const finalScore = Math.round(st.score * timeMult);
    const baseScore = st.baseScore || 0;
    const perfectBonus = st.perfectBonus || 0;
    const hintPenalties = st.hintPenalties || 0;
    const wrongPenalties = st.wrongPenalties || 0;
    const comboBonus = Math.max(0, (st.score + hintPenalties + wrongPenalties - perfectBonus) - baseScore);
    const cellPts = SCORE_PER_CELL[st.difficulty] || 10;

    return {
      difficulty: st.difficulty,
      diffLabel: DIFF_LABELS[st.difficulty] || st.difficulty,
      cellPts,
      correctCount: st.correctCount || 0,
      baseScore,
      comboBonus,
      perfectBonus,
      hintPenalties,
      wrongPenalties,
      isPerfect: st.mistakes === 0 && perfectBonus > 0,
      rawScore: st.score || 0,
      maxStreak: st.maxStreak || 0,
      currentStreak: st.correctStreak || 0,
      wrongStreak: st.wrongStreak || 0,
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
      hints: state.hints,
      hintsUsed: state.hintsUsed || 0,
      score: state.score,
      baseScore: state.baseScore,
      perfectBonus: state.perfectBonus || 0,
      hintPenalties: state.hintPenalties || 0,
      wrongPenalties: state.wrongPenalties || 0,
      correctCount: state.correctCount,
      correctStreak: state.correctStreak,
      wrongStreak: state.wrongStreak || 0,
      maxStreak: state.maxStreak,
      difficulty: state.difficulty,
      timer: state.timer,
      undoStack: state.undoStack,
      notesMode: state.notesMode,
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
    state = {
      puzzle: [...puzzle],
      solution: [...solution],
      current: [...puzzle],
      notes: {},
      given: puzzle.map(v => v !== 0),
      mistakes: 0,
      hints: 3,
      hintsUsed: 0,
      score: 0,
      baseScore: 0,
      perfectBonus: 0,
      hintPenalties: 0,
      wrongPenalties: 0,
      correctCount: 0,
      correctStreak: 0,
      wrongStreak: 0,
      maxStreak: 0,
      difficulty,
      timer: 0,
      undoStack: [],
      selectedCell: null,
      notesMode: false,
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
      hintsUsed: saved.hintsUsed || 0,
      baseScore: saved.baseScore || 0,
      perfectBonus: saved.perfectBonus || 0,
      hintPenalties: saved.hintPenalties || 0,
      wrongPenalties: saved.wrongPenalties || 0,
      correctCount: saved.correctCount || 0,
      correctStreak: saved.correctStreak || 0,
      wrongStreak: saved.wrongStreak || 0,
      maxStreak: saved.maxStreak || 0,
      selectedCell: null,
      isPaused: false
    };
    startTimer();
    if (onUpdate) onUpdate(state);
    return true;
  }

  function selectCell(row, col) {
    if (!state || state.isFinished || state.isPaused) return;
    state.selectedCell = { row, col };
    if (typeof Sound !== 'undefined' && Sound.playTap) Sound.playTap();
    if (onUpdate) onUpdate(state);
  }

  function placeNumber(num) {
    if (!state || !state.selectedCell || state.isFinished || state.isPaused) return;
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
    if (ni >= 0) { state.notes[key].splice(ni, 1); }
    else { state.notes[key].push(num); }

    state.undoStack.push({ type: 'note', row, col, oldNotes });
    save();
    if (typeof Sound !== 'undefined' && Sound.playNote) Sound.playNote();
    if (onUpdate) onUpdate(state);
  }

  function _placeValue(row, col, num) {
    const i = idx(row, col);
    const oldValue = state.current[i];
    const key = `${row},${col}`;
    const oldNotes = state.notes[key] ? [...state.notes[key]] : [];

    // If cell already has the correct number, don't overwrite
    if (oldValue === state.solution[i] && oldValue !== 0) return;

    // If same value already placed, do nothing
    if (oldValue === num) return;

    state.current[i] = num;
    state.notes[key] = [];

    const isCorrect = num === state.solution[i];

    if (!isCorrect) {
      const prevCorrectStreak = state.correctStreak || 0;
      const prevWrongStreak = state.wrongStreak || 0;
      state.correctStreak = 0;
      state.wrongStreak = prevWrongStreak + 1;
      state.mistakes++;

      // Penalty per consecutive wrong turn
      const penalty = getWrongPenalty(state.difficulty, state.wrongStreak);
      state.score = Math.max(0, state.score - penalty);
      state.wrongPenalties = (state.wrongPenalties || 0) + penalty;

      state.undoStack.push({
        type: 'value',
        row, col,
        oldValue, oldNotes,
        error: true,
        prevCorrectStreak,
        prevWrongStreak,
        penaltyDeducted: penalty,
        pointsEarned: 0,
        basePts: 0
      });
      save();
      if (typeof Sound !== 'undefined' && Sound.playError) Sound.playError();
      if (onUpdate) onUpdate(state);

      // Check consecutive error limit:
      // Hard: max 10 consecutive, 11th is game over
      // Easy & Medium: max 15 consecutive, 16th is game over
      const maxAllowed = MAX_WRONG_STREAK[state.difficulty] || 15;
      if (state.wrongStreak > maxAllowed) {
        state.isFinished = true;
        stopTimer();
        const breakdown = getScoreBreakdown(state);
        Storage.recordGameResult(state.difficulty, false, state.timer, state.mistakes, breakdown.finalScore);
        Storage.clearGame();
        if (onGameOver) onGameOver('streak_over', state, breakdown);
      }
      return;
    }

    // Correct placement
    const prevCorrectStreak = state.correctStreak || 0;
    const prevWrongStreak = state.wrongStreak || 0;
    state.correctStreak = prevCorrectStreak + 1;
    state.wrongStreak = 0; // RESET WRONG STREAK!
    state.maxStreak = Math.max(state.maxStreak || 0, state.correctStreak);
    state.correctCount = (state.correctCount || 0) + 1;

    const streakMult = getStreakMultiplier(state.correctStreak);
    const basePts = SCORE_PER_CELL[state.difficulty] || 10;
    const pointsEarned = Math.round(basePts * streakMult);

    state.baseScore = (state.baseScore || 0) + basePts;
    state.score = (state.score || 0) + pointsEarned;

    removeRelatedNotes(row, col, num);
    state.undoStack.push({
      type: 'value',
      row, col,
      oldValue, oldNotes,
      error: false,
      prevCorrectStreak,
      prevWrongStreak,
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

    if (typeof Sound !== 'undefined') {
      const remainingForDigit = getRemaining(num);
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

    const action = state.undoStack.pop();
    const key = `${action.row},${action.col}`;

    if (action.type === 'value') {
      const i = idx(action.row, action.col);
      // If it was an error, decrease mistake count and refund penalty
      if (action.error) {
        state.mistakes = Math.max(0, state.mistakes - 1);
        if (action.penaltyDeducted) {
          state.score += action.penaltyDeducted;
          state.wrongPenalties = Math.max(0, (state.wrongPenalties || 0) - action.penaltyDeducted);
        }
        state.wrongStreak = action.prevWrongStreak || 0;
      } else {
        const pts = action.pointsEarned !== undefined ? action.pointsEarned : SCORE_PER_CELL[state.difficulty];
        const basePts = action.basePts !== undefined ? action.basePts : SCORE_PER_CELL[state.difficulty];
        state.score = Math.max(0, state.score - pts);
        state.baseScore = Math.max(0, (state.baseScore || 0) - basePts);
        state.correctCount = Math.max(0, (state.correctCount || 0) - 1);
        state.wrongStreak = action.prevWrongStreak || 0;
      }
      // Không hoàn lại lượt streak: quay về trạng thái chưa điền và reset streak về 0
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

  let lastHintTime = 0;

  function useHint() {
    if (!state || state.isFinished || state.isPaused || state.hints <= 0) return;
    const now = Date.now();
    if (now - lastHintTime < 350) return;
    lastHintTime = now;

    let row, col;
    if (state.selectedCell) {
      const i = idx(state.selectedCell.row, state.selectedCell.col);
      if (!state.given[i] && state.current[i] !== state.solution[i]) {
        row = state.selectedCell.row;
        col = state.selectedCell.col;
      }
    }

    // If selected cell can't be hinted, find a random empty/wrong cell
    if (row === undefined) {
      const empties = [];
      for (let i = 0; i < 81; i++) {
        if (!state.given[i] && state.current[i] !== state.solution[i]) {
          empties.push(i);
        }
      }
      if (empties.length === 0) return;
      const ri = empties[Math.floor(Math.random() * empties.length)];
      row = Math.floor(ri / 9);
      col = ri % 9;
    }

    const i = idx(row, col);
    const key = `${row},${col}`;
    const oldValue = state.current[i];
    const oldNotes = state.notes[key] ? [...state.notes[key]] : [];

    // Deduct hint penalty
    const hintIdx = state.hintsUsed || 0;
    const penalty = getHintPenalty(state.difficulty, hintIdx);
    state.hintsUsed = hintIdx + 1;
    state.hints--;
    state.score = Math.max(0, state.score - penalty);
    state.hintPenalties = (state.hintPenalties || 0) + penalty;

    state.current[i] = state.solution[i];
    state.notes[key] = [];
    state.given[i] = true; // Mark as given so it can't be erased

    removeRelatedNotes(row, col, state.solution[i]);

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

  function setCallbacks(update, gameover) {
    onUpdate = update;
    onGameOver = gameover;
  }

  return {
    start, resume, selectCell, placeNumber,
    undo, erase, toggleNotes, useHint,
    togglePause, giveUp, abandonSaved, destroy,
    getState, isActive, setCallbacks,
    getRemaining, formatTime,
    getStreakMultiplier, getTimeMultiplier, getScoreBreakdown,
    getHintPenalty, getWrongPenalty, getWarningStage,
    HINT_PENALTIES, MAX_WRONG_STREAK,
    DIFF_LABELS, SCORE_PER_CELL, PERFECT_BONUS, idx
  };
})();

