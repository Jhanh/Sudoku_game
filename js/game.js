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
  const WIN_BONUS = { easy: 100, medium: 200, hard: 300 };

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
      score: state.score,
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
      score: 0,
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
      state.mistakes++;
      state.undoStack.push({ type: 'value', row, col, oldValue, oldNotes, error: true });
      save();
      if (onUpdate) onUpdate(state);

      if (state.mistakes >= 3) {
        state.isFinished = true;
        stopTimer();
        Storage.recordGameResult(state.difficulty, false, state.timer, state.mistakes);
        Storage.clearGame();
        if (onGameOver) onGameOver(false, state);
      }
      return;
    }

    // Correct placement
    state.score += SCORE_PER_CELL[state.difficulty];
    removeRelatedNotes(row, col, num);
    state.undoStack.push({ type: 'value', row, col, oldValue, oldNotes, error: false });
    save();

    if (checkComplete()) {
      state.isFinished = true;
      state.score += WIN_BONUS[state.difficulty];
      stopTimer();
      Storage.recordGameResult(state.difficulty, true, state.timer, state.mistakes);
      Storage.clearGame();
      if (onUpdate) onUpdate(state);
      if (onGameOver) onGameOver(true, state);
      return;
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
      // If it was an error, decrease mistake count
      if (action.error) {
        state.mistakes = Math.max(0, state.mistakes - 1);
      } else {
        state.score = Math.max(0, state.score - SCORE_PER_CELL[state.difficulty]);
      }
      state.current[i] = action.oldValue;
      state.notes[key] = action.oldNotes;
    } else if (action.type === 'note') {
      state.notes[key] = action.oldNotes;
    } else if (action.type === 'erase') {
      const i = idx(action.row, action.col);
      state.current[i] = action.oldValue;
      state.notes[key] = action.oldNotes;
      if (action.wasCorrect) {
        state.score += SCORE_PER_CELL[state.difficulty];
      }
    }

    save();
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
    if (wasCorrect) {
      state.score = Math.max(0, state.score - SCORE_PER_CELL[state.difficulty]);
    }

    state.current[i] = 0;
    state.notes[key] = [];
    state.undoStack.push({ type: 'erase', row, col, oldValue, oldNotes, wasCorrect });
    save();
    if (onUpdate) onUpdate(state);
  }

  function toggleNotes() {
    if (!state || state.isFinished) return;
    state.notesMode = !state.notesMode;
    save();
    if (onUpdate) onUpdate(state);
  }

  function useHint() {
    if (!state || state.isFinished || state.isPaused || state.hints <= 0) return;

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

    state.current[i] = state.solution[i];
    state.notes[key] = [];
    state.hints--;
    state.given[i] = true; // Mark as given so it can't be erased

    removeRelatedNotes(row, col, state.solution[i]);

    // Don't add to undo stack (hints are permanent)
    state.selectedCell = { row, col };
    state.hintedCell = { row, col }; // For flash animation
    save();

    if (onUpdate) onUpdate(state);

    // Check completion
    if (checkComplete()) {
      state.isFinished = true;
      state.score += WIN_BONUS[state.difficulty];
      stopTimer();
      Storage.recordGameResult(state.difficulty, true, state.timer, state.mistakes);
      Storage.clearGame();
      if (onUpdate) onUpdate(state);
      if (onGameOver) onGameOver(true, state);
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
    Storage.recordGameResult(state.difficulty, false, state.timer, state.mistakes);
    Storage.clearGame();
    if (onGameOver) onGameOver(false, state);
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
    DIFF_LABELS, idx
  };
})();

