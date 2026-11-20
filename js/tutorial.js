/* =========================================================
   tutorial.js - Static 3-step Sudoku player tutorial
   3 visual static steps: Basic Rules (Row/Col/Box), Lightning Mode, Auto Notes
   ========================================================= */
const Tutorial = (() => {
  let currentStep = 0;
  const totalSteps = 3;

  function getSteps() {
    return [
      {
        title: typeof I18n !== 'undefined' ? I18n.t('tut_step1_title') : '1. Quy tắc cơ bản (Hàng, Cột & Khối 3×3)',
        desc: typeof I18n !== 'undefined' ? I18n.t('tut_step1_desc') : 'Mỗi <strong>hàng ngang</strong>, <strong>cột dọc</strong> và mỗi <strong>khối 3×3</strong> đều phải chứa đủ các chữ số từ 1 đến 9 mà <strong>không được trùng lặp</strong>.',
        buildDemo: buildStep1
      },
      {
        title: typeof I18n !== 'undefined' ? I18n.t('tut_step2_title') : '2. Chế độ Tia chớp (Lightning / Fast-Fill)',
        desc: typeof I18n !== 'undefined' ? I18n.t('tut_step2_desc') : 'Phím tắt <code>F</code>. Chọn 1 chữ số trên bàn phím số để khóa số đó, sau đó nhấp chuột liên tục vào các ô trống trên bàn cờ để điền nhanh mà không cần chọn lại số nhiều lần. Khi đã điền đủ 9 số, phím số sẽ tự động ẩn đi để bạn thuận tiện chọn số tiếp theo.',
        buildDemo: buildStep2
      },
      {
        title: typeof I18n !== 'undefined' ? I18n.t('tut_step3_title') : '3. Bút chì nhanh (Auto Notes)',
        desc: typeof I18n !== 'undefined' ? I18n.t('tut_step3_desc') : 'Phím tắt <code>A</code>. Tự động tính toán và điền tất cả các con số khả dĩ (ứng viên) vào từng ô trống trên bàn cờ, giúp bạn nhanh chóng phát hiện các ô chỉ còn 1 khả năng duy nhất để suy luận dễ dàng hơn. Bạn có thể bấm lại nút này để tắt và xóa sạch ghi chú bất kỳ lúc nào.',
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
    document.getElementById('modal-tutorial').classList.add('hidden');
  }

  function _render() {
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

    // Dots (3 dots with click support)
    const dotsDiv = document.getElementById('tutorial-dots');
    dotsDiv.innerHTML = '';
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === currentStep ? ' active' : '');
      dot.style.cursor = 'pointer';
      dot.title = `Trang ${i + 1}`;
      dot.addEventListener('click', () => {
        currentStep = i;
        _render();
      });
      dotsDiv.appendChild(dot);
    }

    // Buttons
    document.getElementById('btn-tut-prev').disabled = currentStep === 0;
    const nextBtn = document.getElementById('btn-tut-next');
    const finishText = typeof I18n !== 'undefined' ? I18n.t('tut_btn_start_play') : 'Bắt đầu chơi!';
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

  /* ============ STEP 1: Basic Rules (Row, Column & 3x3 Box) ============ */
  function buildStep1(container) {
    const label = document.createElement('div');
    label.className = 'tut-label';
    label.innerHTML = '▶ <strong>Hàng ngang</strong>, <strong>Cột dọc</strong> &amp; <strong>Khối 3×3</strong> giao nhau:';
    container.appendChild(label);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(9,28px);grid-template-rows:repeat(9,28px);gap:0;border:2.5px solid #1E293B;border-radius:6px;margin:8px auto;box-shadow:0 4px 12px rgba(0,0,0,0.08);background:#FFFFFF;';

    const targetRow = 3;
    const targetCol = 4;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'tut-cell';
        cell.style.cssText = 'display:flex;align-items:center;justify-content:center;box-sizing:border-box;font-family:inherit;';

        // Outer borders for 3x3 subgrids without gaps
        cell.style.borderRight = (c === 2 || c === 5) ? '2px solid #1E293B' : (c === 8 ? 'none' : '1px solid #CBD5E1');
        cell.style.borderBottom = (r === 2 || r === 5) ? '2px solid #1E293B' : (r === 8 ? 'none' : '1px solid #CBD5E1');

        const inRow = r === targetRow;
        const inCol = c === targetCol;
        const inBox = (r >= 3 && r <= 5) && (c >= 3 && c <= 5);
        const isCenter = inRow && inCol;

        if (isCenter) {
          // Center intersection
          cell.textContent = '5';
          cell.style.background = '#2563EB';
          cell.style.color = '#FFFFFF';
          cell.style.fontWeight = '800';
          cell.style.fontSize = '0.95rem';
        } else if (inBox) {
          // 3x3 Box highlight (Warm amber, high contrast)
          cell.style.background = '#FEF08A';
          cell.style.color = '#854D0E';
          cell.style.fontWeight = '700';
          cell.style.fontSize = '0.82rem';
          if (r === 3 && c === 3) cell.textContent = '1';
          if (r === 3 && c === 5) cell.textContent = '3';
          if (r === 4 && c === 4) cell.textContent = '4';
          if (r === 5 && c === 3) cell.textContent = '7';
          if (r === 5 && c === 5) cell.textContent = '9';
        } else if (inRow) {
          // Row highlight (Vibrant sky blue, high contrast)
          cell.style.background = '#BAE6FD';
          cell.style.color = '#0369A1';
          cell.style.fontWeight = '700';
          cell.style.fontSize = '0.82rem';
          if (c === 0) cell.textContent = '2';
          if (c === 1) cell.textContent = '6';
          if (c === 6) cell.textContent = '8';
          if (c === 7) cell.textContent = '9';
        } else if (inCol) {
          // Col highlight (Clear violet, high contrast)
          cell.style.background = '#DDD6FE';
          cell.style.color = '#6D28D9';
          cell.style.fontWeight = '700';
          cell.style.fontSize = '0.82rem';
          if (r === 1) cell.textContent = '2';
          if (r === 7) cell.textContent = '8';
          if (r === 8) cell.textContent = '1';
        } else {
          // Other cells
          cell.style.background = '#FFFFFF';
          cell.style.color = '#94A3B8';
          cell.style.fontWeight = '600';
          cell.style.fontSize = '0.75rem';
          if (r === 0 && c === 0) cell.textContent = '1';
          if (r === 0 && c === 8) cell.textContent = '9';
          if (r === 1 && c === 2) cell.textContent = '7';
          if (r === 2 && c === 7) cell.textContent = '4';
          if (r === 4 && c === 0) cell.textContent = '4';
          if (r === 5 && c === 8) cell.textContent = '3';
          if (r === 6 && c === 1) cell.textContent = '3';
          if (r === 7 && c === 6) cell.textContent = '7';
          if (r === 8 && c === 0) cell.textContent = '7';
          if (r === 8 && c === 8) cell.textContent = '6';
        }

        grid.appendChild(cell);
      }
    }

    container.appendChild(grid);

    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:14px;font-size:0.75rem;margin-top:8px;font-weight:600;flex-wrap:wrap;';
    legend.innerHTML = `
      <span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;background:#BAE6FD;border:1px solid #7DD3FC;border-radius:2px;"></span> <span style="color:var(--text);">Hàng ngang</span></span>
      <span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;background:#DDD6FE;border:1px solid #C4B5FD;border-radius:2px;"></span> <span style="color:var(--text);">Cột dọc</span></span>
      <span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;background:#FEF08A;border:1px solid #FDE047;border-radius:2px;"></span> <span style="color:var(--text);">Khối 3×3</span></span>
      <span style="display:flex;align-items:center;gap:5px;"><span style="width:12px;height:12px;background:#2563EB;border-radius:2px;"></span> <span style="color:var(--text);">Giao điểm</span></span>
    `;
    container.appendChild(legend);
  }

  /* ============ STEP 2: Lightning Mode (Fast-Fill) ============ */
  function buildStep2(container) {
    const card = document.createElement('div');
    card.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:18px 16px;background:var(--highlight-row);border-radius:12px;border:1px solid var(--border);max-width:400px;margin:8px auto;width:100%;box-shadow:0 2px 8px rgba(0,0,0,0.04);';
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="position:relative;width:58px;height:58px;border-radius:12px;border:2px solid #F59E0B;background:#FEF3C7;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:1.4rem;color:#D97706;line-height:1;">⚡</span>
            <span style="font-size:0.62rem;font-weight:700;color:#B45309;margin-top:2px;">Tia chớp</span>
            <span style="position:absolute;bottom:-6px;padding:1px 5px;border-radius:4px;background:#D97706;color:#FFF;font-size:0.58rem;font-weight:700;">ON</span>
          </div>
          <span style="font-size:0.68rem;color:var(--text-secondary);font-weight:600;">1. Bật Tia chớp</span>
        </div>

        <span style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:14px;">➔</span>

        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="width:52px;height:52px;border:2px solid #2563EB;border-radius:10px;background:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(37,99,235,0.18);">
            <span style="font-size:1.25rem;font-weight:800;color:#2563EB;line-height:1;">5</span>
            <span style="font-size:0.58rem;color:#2563EB;font-weight:600;margin-top:2px;">còn 4</span>
          </div>
          <span style="font-size:0.68rem;color:var(--text-secondary);font-weight:600;">2. Chọn số 5</span>
        </div>

        <span style="color:var(--text-secondary);font-size:1.1rem;margin-bottom:14px;">➔</span>

        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="display:flex;gap:6px;">
            <div style="width:38px;height:38px;border:1.5px solid #93C5FD;background:#EFF6FF;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#2563EB;font-size:1.05rem;">5</div>
            <div style="width:38px;height:38px;border:1.5px solid #93C5FD;background:#EFF6FF;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#2563EB;font-size:1.05rem;">5</div>
          </div>
          <span style="font-size:0.68rem;color:var(--text-secondary);font-weight:600;">3. Nhấp điền liên tục</span>
        </div>
      </div>

      <div style="width:100%;padding:10px 12px;border-radius:8px;background:#F0FDF4;border:1px solid #BBF7D0;color:#166534;font-size:0.78rem;text-align:left;line-height:1.45;">
        ⚡ <strong>Tối ưu tốc độ:</strong> Giúp bạn điền nhanh toàn bộ vị trí của 1 con số trên khắp bàn cờ chỉ với một lần chọn phím, tiết kiệm tối đa thời gian thao tác.
      </div>
    `;
    container.appendChild(card);
  }

  /* ============ STEP 3: Fast Notes (Auto Candidates) ============ */
  function buildStep3(container) {
    const card = document.createElement('div');
    card.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:18px 16px;background:var(--highlight-row);border-radius:12px;border:1px solid var(--border);max-width:400px;margin:8px auto;width:100%;box-shadow:0 2px 8px rgba(0,0,0,0.04);';
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:20px;width:100%;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="position:relative;width:60px;height:60px;border-radius:12px;border:2px solid #10B981;background:#ECFDF5;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:1.4rem;color:#059669;line-height:1;">✎</span>
            <span style="font-size:0.62rem;font-weight:700;color:#047857;margin-top:2px;">Bút chì</span>
            <span style="position:absolute;bottom:-6px;padding:1px 5px;border-radius:4px;background:#059669;color:#FFF;font-size:0.58rem;font-weight:700;">ON</span>
          </div>
          <span style="font-size:0.68rem;color:var(--text-secondary);font-weight:600;">Bật Bút chì nhanh</span>
        </div>

        <span style="color:var(--text-secondary);font-size:1.2rem;">➔</span>

        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="width:64px;height:64px;border:1.5px solid #3B82F6;background:var(--surface);border-radius:8px;display:grid;grid-template-columns:repeat(3,1fr);padding:3px;font-size:0.65rem;color:#1E40AF;font-weight:700;text-align:center;align-items:center;box-shadow:0 3px 8px rgba(59,130,246,0.15);">
            <span>1</span><span style="opacity:0;">2</span><span>3</span>
            <span style="opacity:0;">4</span><span>5</span><span style="opacity:0;">6</span>
            <span>7</span><span style="opacity:0;">8</span><span>9</span>
          </div>
          <span style="font-size:0.68rem;color:var(--text-secondary);font-weight:600;">Tự động điền ứng viên</span>
        </div>
      </div>

      <div style="width:100%;padding:10px 12px;border-radius:8px;background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF;font-size:0.78rem;text-align:left;line-height:1.45;">
        ✎ <strong>Hỗ trợ suy luận:</strong> Tự động ghi chú các con số tiềm năng vào tất cả ô trống, giúp bạn phát hiện ngay các ô chỉ còn 1 ứng viên duy nhất.
      </div>

      <div style="font-size:0.75rem;color:var(--text-secondary);text-align:center;line-height:1.4;">
        Bấm lại nút (hoặc phím tắt <strong style="font-family:monospace;background:var(--border);padding:2px 6px;border-radius:4px;">A</strong>) để tắt và xóa sạch ghi chú bất cứ khi nào bạn muốn bàn cờ thoáng đãng.
      </div>
    `;
    container.appendChild(card);
  }

  /* ---- bind events ---- */
  function bindEvents() {
    document.getElementById('btn-tut-next').addEventListener('click', next);
    document.getElementById('btn-tut-prev').addEventListener('click', prev);
  }

  return {
    show,
    hide,
    bindEvents,
    updateLanguage: () => {
      if (!document.getElementById('modal-tutorial').classList.contains('hidden')) _render();
    }
  };
})();
