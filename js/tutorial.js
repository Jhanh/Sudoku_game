/* =========================================================
   tutorial.js — Animated step-by-step Sudoku tutorial
   ========================================================= */
const Tutorial = (() => {
  let currentStep = 0;
  const totalSteps = 3;
  let animTimers = [];

  function getSteps() {
    return [
      {
        title: typeof I18n !== 'undefined' ? I18n.t('tut_step1_title') : 'Quy tắc Hàng & Cột',
        desc: typeof I18n !== 'undefined' ? I18n.t('tut_step1_desc') : 'Mỗi <strong>hàng ngang</strong> và mỗi <strong>cột dọc</strong> phải chứa đầy đủ các số từ 1 đến 9 — không có số nào được lặp lại.',
        buildDemo: buildStep1
      },
      {
        title: typeof I18n !== 'undefined' ? I18n.t('tut_step2_title') : 'Quy tắc Khối 3×3',
        desc: typeof I18n !== 'undefined' ? I18n.t('tut_step2_desc') : 'Bảng Sudoku được chia thành 9 <strong>khối 3×3</strong>. Mỗi khối cũng phải chứa đúng các số từ 1 đến 9, không trùng lặp.',
        buildDemo: buildStep2
      },
      {
        title: typeof I18n !== 'undefined' ? I18n.t('tut_step3_title') : 'Suy luận & Ghi chú',
        desc: typeof I18n !== 'undefined' ? I18n.t('tut_step3_desc') : 'Dùng <strong>giao điểm</strong> giữa hàng, cột và khối để loại trừ. Bật chế độ <strong>Ghi chú</strong> (✏️) để đánh dấu các số có thể điền vào ô trống.',
        buildDemo: buildStep3
      }
    ];
  }

  function show() {
    currentStep = 0;
    _render();
    document.getElementById('modal-tutorial').classList.remove('hidden');
  }

  function hide() {
    _clearAnims();
    document.getElementById('modal-tutorial').classList.add('hidden');
  }

  function _render() {
    _clearAnims();
    const carousel = document.getElementById('tutorial-carousel');
    carousel.innerHTML = '';

    const step = getSteps()[currentStep];
    const container = document.createElement('div');
    container.className = 'tutorial-step active';

    const demoDiv = document.createElement('div');
    demoDiv.className = 'tut-demo';
    step.buildDemo(demoDiv);

    const h3 = document.createElement('h3');
    h3.textContent = step.title;

    const p = document.createElement('p');
    p.innerHTML = step.desc;

    container.appendChild(demoDiv);
    container.appendChild(h3);
    container.appendChild(p);
    carousel.appendChild(container);

    // Dots
    const dotsDiv = document.getElementById('tutorial-dots');
    dotsDiv.innerHTML = '';
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === currentStep ? ' active' : '');
      dotsDiv.appendChild(dot);
    }

    // Buttons
    document.getElementById('btn-tut-prev').disabled = currentStep === 0;
    const nextBtn = document.getElementById('btn-tut-next');
    const finishText = typeof I18n !== 'undefined' ? I18n.t('tut_btn_start_play') : 'Hoàn tất';
    const nextText = typeof I18n !== 'undefined' ? I18n.t('btn_next') : 'Tiếp theo';
    nextBtn.textContent = currentStep === totalSteps - 1 ? finishText : nextText;
  }

  function next() {
    if (currentStep < totalSteps - 1) {
      currentStep++;
      _render();
    } else {
      hide();
    }
  }

  function prev() {
    if (currentStep > 0) {
      currentStep--;
      _render();
    }
  }

  function _clearAnims() {
    animTimers.forEach(t => clearTimeout(t));
    animTimers = [];
  }

  function _delay(fn, ms) {
    animTimers.push(setTimeout(fn, ms));
  }

  /* ============ STEP 1: Row & Column rule ============ */
  function buildStep1(container) {
    const label = document.createElement('div');
    label.className = 'tut-label';
    label.innerHTML = '▶ <strong>Hàng ngang</strong> &amp; <strong>Cột dọc</strong> cắt nhau trên bảng:';
    container.appendChild(label);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(9,26px);grid-template-rows:repeat(9,26px);gap:1px;background:var(--border);border:2px solid var(--text);border-radius:4px;margin:8px auto;';

    // Demo data for 9x9 mini board focusing on Row 3 and Col 5
    // Row 3: [3, 1, 6, 0, 8, 5, 2, 0, 4] (missing 7 at col 3, missing 9 at col 7)
    // Col 5: [9, 2, 0, 5, 1, 6, 3, 0, 8] (row 3 has 5, missing 4 at row 2, missing 7 at row 7)
    const rowValues = [3, 1, 6, 0, 8, 5, 2, 0, 4];
    const colValues = [9, 2, 0, 5, 1, 6, 3, 0, 8];

    const targetRow = 3;
    const targetCol = 5;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'tut-cell';
        cell.style.cssText = 'background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;transition:all 0.3s;';

        // 3x3 block visual cues
        if (c === 2 || c === 5) cell.style.borderRight = '1.5px solid var(--text)';
        if (r === 2 || r === 5) cell.style.borderBottom = '1.5px solid var(--text)';

        const inRow = r === targetRow;
        const inCol = c === targetCol;

        if (inRow && inCol) {
          cell.textContent = '5';
          cell.style.background = '#93C5FD';
          cell.style.color = '#1E3A8A';
          cell.style.fontWeight = '700';
        } else if (inRow) {
          const val = rowValues[c];
          cell.style.background = '#EFF6FF';
          if (val !== 0) {
            cell.textContent = val;
          } else {
            cell.dataset.missingRow = c === 3 ? '7' : '9';
            cell.style.background = '#DBEAFE';
          }
        } else if (inCol) {
          const val = colValues[r];
          cell.style.background = '#F5F3FF';
          if (val !== 0) {
            cell.textContent = val;
            cell.style.color = '#7C3AED';
          } else {
            cell.dataset.missingCol = r === 2 ? '4' : '7';
            cell.style.background = '#EDE9FE';
          }
        } else {
          cell.style.opacity = '0.35';
          // Fill a few background digits for realism
          if ((r + c) % 4 === 0) cell.textContent = ((r * 3 + c) % 9) + 1;
        }

        grid.appendChild(cell);
      }
    }

    container.appendChild(grid);

    // Animate row missing numbers
    _delay(() => {
      const rowMissingCells = grid.querySelectorAll('[data-missing-row]');
      rowMissingCells.forEach(cell => {
        cell.textContent = cell.dataset.missingRow;
        cell.classList.add('fill-anim');
        cell.style.color = '#2563EB';
        cell.style.fontWeight = '700';
      });
    }, 1200);

    // Animate col missing numbers
    _delay(() => {
      const colMissingCells = grid.querySelectorAll('[data-missing-col]');
      colMissingCells.forEach(cell => {
        cell.textContent = cell.dataset.missingCol;
        cell.classList.add('fill-anim');
        cell.style.color = '#7C3AED';
        cell.style.fontWeight = '700';
      });
    }, 2200);
  }

  /* ============ STEP 2: 3x3 Box rule ============ */
  function buildStep2(container) {
    const label = document.createElement('div');
    label.className = 'tut-label';
    label.textContent = '▶ Khối 3×3:';
    container.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'tut-grid grid-3x3';

    const boxNums = [4, 1, 7, 8, 0, 3, 6, 2, 5]; // missing: 9

    boxNums.forEach((n, i) => {
      const cell = document.createElement('div');
      cell.className = 'tut-cell';
      if (n !== 0) {
        cell.textContent = n;
      }
      grid.appendChild(cell);
    });

    container.appendChild(grid);

    // Animate: zoom box slightly then fill the missing number
    _delay(() => {
      grid.style.transition = 'transform 0.5s ease';
      grid.style.transform = 'scale(1.08)';
    }, 600);

    _delay(() => {
      grid.style.transform = 'scale(1)';
    }, 1200);

    _delay(() => {
      const emptyCell = grid.querySelectorAll('.tut-cell')[4]; // center cell
      emptyCell.textContent = '9';
      emptyCell.classList.add('fill-anim');
      emptyCell.style.color = '#22C55E';
      emptyCell.style.fontWeight = '700';
      emptyCell.style.fontSize = '1.3rem';
    }, 1500);

    const desc2 = document.createElement('div');
    desc2.className = 'tut-label';
    desc2.style.marginTop = '12px';
    desc2.innerHTML = 'Số <strong style="color:#22C55E">9</strong> là số còn thiếu duy nhất trong khối!';
    container.appendChild(desc2);
  }

  /* ============ STEP 3: Deduction & Notes ============ */
  function buildStep3(container) {
    const label = document.createElement('div');
    label.className = 'tut-label';
    label.textContent = '▶ Giao điểm hàng – cột – khối:';
    container.appendChild(label);

    // 5x5 mini grid to show intersection
    const grid = document.createElement('div');
    grid.className = 'tut-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,40px);grid-template-rows:repeat(5,40px);gap:2px;background:var(--border);border:2px solid var(--text);border-radius:4px;margin:8px auto;';

    const data = [
      [3, 0, 0, 7, 1],
      [0, 0, 0, 0, 0],
      [0, 0, '?', 0, 0],
      [8, 0, 0, 4, 0],
      [2, 0, 0, 0, 6]
    ];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'tut-cell';
        cell.style.cssText = 'background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:600;transition:all 0.4s;position:relative;';
        const v = data[r][c];
        if (v === '?') {
          cell.id = 'tut-target';
          cell.style.background = '#BFDBFE';
        } else if (v !== 0) {
          cell.textContent = v;
        }
        // Highlight row 2 and col 2
        if (r === 2 || c === 2) {
          cell.classList.add('highlight');
        }
        grid.appendChild(cell);
      }
    }
    container.appendChild(grid);

    // Animate: show pencil notes in target cell
    _delay(() => {
      const target = document.getElementById('tut-target');
      if (!target) return;
      target.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);font-size:0.55rem;color:#64748B;width:100%;height:100%;padding:2px;">' +
        '<span style="display:flex;align-items:center;justify-content:center;">5</span>' +
        '<span></span>' +
        '<span></span>' +
        '<span></span>' +
        '<span style="display:flex;align-items:center;justify-content:center;">5</span>' +
        '<span style="display:flex;align-items:center;justify-content:center;">6</span>' +
        '<span></span>' +
        '<span></span>' +
        '<span style="display:flex;align-items:center;justify-content:center;">9</span>' +
        '</div>';
    }, 1000);

    // Then resolve to the answer
    _delay(() => {
      const target = document.getElementById('tut-target');
      if (!target) return;
      target.innerHTML = '5';
      target.style.color = '#3B82F6';
      target.style.fontSize = '1.2rem';
      target.classList.add('fill-anim');
    }, 3000);

    const noteLabel = document.createElement('div');
    noteLabel.className = 'tut-label';
    noteLabel.style.marginTop = '12px';
    noteLabel.innerHTML = 'Bật <strong>✏️ Ghi chú</strong> để ghi nhớ các số tiềm năng, sau đó suy luận ra đáp án!';
    container.appendChild(noteLabel);
  }

  /* ---- bind events ---- */
  function bindEvents() {
    document.getElementById('btn-tut-next').addEventListener('click', next);
    document.getElementById('btn-tut-prev').addEventListener('click', prev);
  }

  return { show, hide, bindEvents, updateLanguage: () => { if (!document.getElementById('modal-tutorial').classList.contains('hidden')) _render(); } };
})();

