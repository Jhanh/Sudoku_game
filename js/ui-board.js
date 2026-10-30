/* =========================================================
   ui-board.js — Sudoku board rendering & interaction
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
        for (let n = 1; n <= 9; n++) {
          const noteSpan = document.createElement('span');
          noteSpan.className = 'note empty';
          noteSpan.dataset.note = n;
          notesDiv.appendChild(noteSpan);
        }
        cell.appendChild(notesDiv);

        cell.addEventListener('click', () => Game.selectCell(r, c));
        board.appendChild(cell);
        cells.push(cell);
      }
    }
  }

  function render(state) {
    if (!state) return;
    const { current, solution, given, notes, selectedCell, isPaused, hintedCell } = state;

    // Determine selected cell info
    let selRow = -1, selCol = -1, selNum = 0;
    if (selectedCell) {
      selRow = selectedCell.row;
      selCol = selectedCell.col;
      const si = selRow * 9 + selCol;
      selNum = current[si];
    }

    const selBoxR = Math.floor(selRow / 3) * 3;
    const selBoxC = Math.floor(selCol / 3) * 3;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const i = r * 9 + c;
        const cell = cells[i];
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
        if (!isPaused && selRow >= 0) {
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

          // Same number highlight
          const settings = (typeof Storage !== 'undefined' && Storage.getSettings) ? Storage.getSettings() : {};
          if (settings.highlightSame !== false && selNum !== 0 && val === selNum && !(r === selRow && c === selCol)) {
            cell.classList.add('same-number');
          }
        }

        // Given vs user
        if (isGiven) {
          cell.classList.add('given');
        } else if (val !== 0) {
          cell.classList.add('user');
          const s = (typeof Storage !== 'undefined' && Storage.getSettings) ? Storage.getSettings() : {};
          if (!isCorrect && s.highlightMistakes !== false) cell.classList.add('error');
        }

        // Hint flash
        if (hintedCell && hintedCell.row === r && hintedCell.col === c) {
          cell.classList.add('hint-flash');
        }

        // Render value or notes
        const valSpan = cell.querySelector('.cell-value');
        const notesDiv = cell.querySelector('.cell-notes');

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
          const noteSpans = notesDiv.querySelectorAll('.note');
          noteSpans.forEach(ns => {
            const n = parseInt(ns.dataset.note);
            if (cellNotes.includes(n)) {
              ns.textContent = n;
              ns.classList.remove('empty');
            } else {
              ns.textContent = '';
              ns.classList.add('empty');
            }
          });
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

  return { init, render, destroy };
})();

