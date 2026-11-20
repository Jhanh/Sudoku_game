/* =========================================================
   ui-board.js - Sudoku board rendering & interaction
   ========================================================= */
const UIBoard = (() => {
  const boardEl = () => document.getElementById('sudoku-board');
  const pauseEl = () => document.getElementById('pause-overlay');
  let cells = [];

  function init() {
    const board = boardEl();
    board.innerHTML = '';
    cells = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        // 3x3 box border classes
        if (c === 2 || c === 5) cell.classList.add('box-right');
        if (r === 2 || r === 5) cell.classList.add('box-bottom');

        // Value
        const valSpan = document.createElement('span');
        valSpan.className = 'cell-value';
        cell.appendChild(valSpan);

        // Notes grid
        const notesDiv = document.createElement('div');
        notesDiv.className = 'cell-notes';
        const noteSpansArr = [];
        for (let n = 1; n <= 9; n++) {
          const noteSpan = document.createElement('span');
          noteSpan.className = 'note empty';
          noteSpan.dataset.note = n;
          notesDiv.appendChild(noteSpan);
          noteSpansArr.push(noteSpan);
        }
        cell.appendChild(notesDiv);

        cell.addEventListener('click', () => Game.selectCell(r, c));
        board.appendChild(cell);
        cells.push({ el: cell, valSpan, notesDiv, noteSpansArr });
      }
    }
  }

  function render(state) {
    if (!state) return;
    const { current, solution, given, notes, selectedCell, isPaused, hintedCell } = state;

    // Cache settings once per render call instead of inside the 81-cell loop
    const settings = (typeof Storage !== 'undefined' && Storage.getSettings) ? Storage.getSettings() : {};

    // Determine selected cell info
    let selRow = -1, selCol = -1, selNum = 0;
    if (selectedCell) {
      selRow = selectedCell.row;
      selCol = selectedCell.col;
      const si = selRow * 9 + selCol;
      selNum = current[si];
    }

    // Only compute selBoxR and selBoxC when a cell is actually selected
    let selBoxR = -1, selBoxC = -1;
    if (selRow >= 0) {
      selBoxR = Math.floor(selRow / 3) * 3;
      selBoxC = Math.floor(selCol / 3) * 3;
    }

    const targetNum = (state.fastFillMode && state.fastFillDigit) ? state.fastFillDigit : selNum;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        const { el: cell, valSpan, notesDiv, noteSpansArr } = cells[i];
        const val = current[i];
        const isGiven = given[i];
        const isCorrect = val === solution[i];
        const key = `${r},${c}`;
        const cellNotes = notes[key] || [];

        // Reset classes
        cell.className = 'cell';
        if (c === 2 || c === 5) cell.classList.add('box-right');
        if (r === 2 || r === 5) cell.classList.add('box-bottom');

        // Highlight logic (only when not paused)
        if (!isPaused && (selRow >= 0 || (state.fastFillMode && state.fastFillDigit))) {
          if (selRow >= 0) {
            const inRow = r === selRow;
            const inCol = c === selCol;
            const boxR = Math.floor(r / 3) * 3;
            const boxC = Math.floor(c / 3) * 3;
            const inBox = boxR === selBoxR && boxC === selBoxC;

            if (r === selRow && c === selCol) {
              cell.classList.add('selected');
            } else if (inRow || inCol || inBox) {
              cell.classList.add('highlighted');
            }
          }

          // Same number highlight (uses fast-fill digit if active, else selected cell's number)
          if (settings.highlightSame !== false && targetNum !== 0 && val === targetNum && !(r === selRow && c === selCol)) {
            cell.classList.add('same-number');
          }
        }

        // Given vs user
        if (isGiven) {
          cell.classList.add('given');
        } else if (val !== 0) {
          cell.classList.add('user');
          if (!isCorrect && settings.highlightMistakes !== false) cell.classList.add('error');
        }

        // Hint flash
        if (hintedCell && hintedCell.row === r && hintedCell.col === c) {
          cell.classList.add('hint-flash');
        }

        // Conflict flash (manual note collision with existing placed numbers)
        if (state.conflictCells && state.conflictCells.includes(i)) {
          cell.classList.add('conflict-flash');
        }

        // Render value or notes using cached elements (no DOM query)
        if (isPaused) {
          valSpan.textContent = '';
          notesDiv.style.display = 'none';
        } else if (val !== 0) {
          valSpan.textContent = val;
          valSpan.style.display = '';
          notesDiv.style.display = 'none';
        } else if (cellNotes.length > 0) {
          valSpan.style.display = 'none';
          notesDiv.style.display = '';
          for (let ni = 0; ni < 9; ni++) {
            const ns = noteSpansArr[ni];
            const n = ni + 1;
            if (cellNotes.includes(n)) {
              ns.textContent = n;
              ns.classList.remove('empty');
              if (targetNum && n === targetNum) {
                ns.classList.add('note-highlighted');
              } else {
                ns.classList.remove('note-highlighted');
              }
            } else {
              ns.textContent = '';
              ns.classList.add('empty');
              ns.classList.remove('note-highlighted');
            }
          }
        } else {
          valSpan.textContent = '';
          valSpan.style.display = '';
          notesDiv.style.display = 'none';
        }
      }
    }

    // Pause overlay
    const po = pauseEl();
    if (isPaused) po.classList.remove('hidden');
    else po.classList.add('hidden');
  }

  function destroy() {
    const board = boardEl();
    if (board) board.innerHTML = '';
    cells = [];
  }

  /* ---- intro wave animation (circular ripple on digits only) ---- */
  function playIntroAnimation(state, onComplete) {
    if (!state || !state.given) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const CENTER_R = 4;
    const CENTER_C = 4;
    const animatedElements = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        if (state.given[i] && cells[i]) {
          const { valSpan } = cells[i];
          // Euclidean distance creates a smooth circular ripple outward from center
          const dist = Math.hypot(r - CENTER_R, c - CENTER_C);
          const delay = Math.round(dist * 85);

          valSpan.style.animationDelay = `${delay}ms`;
          valSpan.classList.add('reveal-anim');
          animatedElements.push(valSpan);
        }
      }
    }

    setTimeout(() => {
      animatedElements.forEach(valSpan => {
        valSpan.classList.remove('reveal-anim');
        valSpan.style.animationDelay = '';
      });
      if (typeof onComplete === 'function') onComplete();
    }, 950);
  }

  return { init, render, playIntroAnimation, destroy };
})();

