/* =========================================================
   sudoku-engine.js — Puzzle generator & solver
   Guarantees unique solution, international givens standards
   ========================================================= */
const SudokuEngine = (() => {

  /* ---------- utility ---------- */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---------- validation (bitmask) ---------- */
  function isValidPlacement(board, row, col, num) {
    for (let c = 0; c < 9; c++)
      if (board[row * 9 + c] === num) return false;
    for (let r = 0; r < 9; r++)
      if (board[r * 9 + col] === num) return false;
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (board[r * 9 + c] === num) return false;
    return true;
  }

  /* ---------- generate full solution ---------- */
  function fillBoard(board) {
    for (let i = 0; i < 81; i++) {
      if (board[i] === 0) {
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        const row = Math.floor(i / 9), col = i % 9;
        for (const n of nums) {
          if (isValidPlacement(board, row, col, n)) {
            board[i] = n;
            if (fillBoard(board)) return true;
            board[i] = 0;
          }
        }
        return false;
      }
    }
    return true;
  }

  /* ---------- count solutions (bitmask-accelerated) ---------- */
  function countSolutions(board, limit) {
    const rows = new Uint16Array(9);
    const cols = new Uint16Array(9);
    const boxes = new Uint16Array(9);

    for (let i = 0; i < 81; i++) {
      if (board[i]) {
        const r = Math.floor(i / 9), c = i % 9;
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        const bit = 1 << board[i];
        rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
      }
    }

    let count = 0;

    function solve(pos) {
      if (count >= limit) return;
      while (pos < 81 && board[pos] !== 0) pos++;
      if (pos === 81) { count++; return; }

      const r = Math.floor(pos / 9), c = pos % 9;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      const used = rows[r] | cols[c] | boxes[b];

      for (let n = 1; n <= 9; n++) {
        const bit = 1 << n;
        if (!(used & bit)) {
          board[pos] = n;
          rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
          solve(pos + 1);
          board[pos] = 0;
          rows[r] &= ~bit; cols[c] &= ~bit; boxes[b] &= ~bit;
        }
      }
    }

    solve(0);
    return count;
  }

  /* ---------- generate puzzle ---------- */
  function generate(difficulty) {
    const givensRanges = {
      easy:   [38, 45],
      medium: [30, 35],
      hard:   [24, 28]
    };
    const [minG, maxG] = givensRanges[difficulty];
    const targetGivens = minG + Math.floor(Math.random() * (maxG - minG + 1));
    const targetRemove = 81 - targetGivens;

    for (let attempt = 0; attempt < 60; attempt++) {
      const solution = new Array(81).fill(0);
      fillBoard(solution);

      const puzzle = [...solution];
      const positions = shuffle([...Array(81).keys()]);
      let removed = 0;

      for (const pos of positions) {
        if (removed >= targetRemove) break;
        const backup = puzzle[pos];
        puzzle[pos] = 0;
        if (countSolutions([...puzzle], 2) === 1) {
          removed++;
        } else {
          puzzle[pos] = backup;
        }
      }

      if (removed >= targetRemove) {
        return { puzzle, solution };
      }
    }

    // Fallback — always return something valid
    const solution = new Array(81).fill(0);
    fillBoard(solution);
    const puzzle = [...solution];
    const positions = shuffle([...Array(81).keys()]);
    let removed = 0;
    for (const pos of positions) {
      if (removed >= 81 - maxG) break;
      const backup = puzzle[pos];
      puzzle[pos] = 0;
      if (countSolutions([...puzzle], 2) === 1) removed++;
      else puzzle[pos] = backup;
    }
    return { puzzle, solution };
  }

  /* ---------- public ---------- */
  return { generate, isValidPlacement };
})();

