/* =========================================================
   profile.js — Profile header, stats charts, stat cards
   ========================================================= */
const Profile = (() => {

  let currentDiff = 'easy';

  function render() {
    _renderProfile();
    _renderStats(currentDiff);
  }

  function _renderProfile() {
    const p = Storage.getProfile();
    document.getElementById('profile-name').textContent = p.name;
    document.getElementById('total-play-time').textContent = 'Tổng thời gian: ' + _formatHMS(p.totalPlayTime);
  }

  function _renderStats(diff) {
    const stats = Storage.getStats();
    const s = stats[diff];

    // Donut chart
    const circumference = 2 * Math.PI * 54; // r=54
    const winRate = s.played > 0 ? (s.won / s.played) : 0;
    const perfectRate = s.played > 0 ? (s.perfectWins / s.played) : 0;

    const donutWin = document.getElementById('donut-win');
    const donutPerfect = document.getElementById('donut-perfect');
    const donutPct = document.getElementById('donut-pct');

    // Win ring
    donutWin.style.strokeDashoffset = circumference * (1 - winRate);
    // Perfect ring (on top of win ring)
    donutPerfect.style.strokeDashoffset = circumference * (1 - perfectRate);

    donutPct.textContent = Math.round(winRate * 100) + '%';

    // Stat cards
    const avgTime = s.won > 0 ? Math.round(s.totalWinTime / s.won) : 0;
    const grid = document.getElementById('stats-grid');
    grid.innerHTML = '';

    const cards = [
      { icon: '🎮', label: 'Số trận đã chơi', value: s.played },
      { icon: '🏆', label: 'Số trận đã thắng', value: s.won },
      { icon: '💎', label: 'Thắng hoàn hảo', value: s.perfectWins, highlight: true },
      { icon: '📊', label: 'Tỉ lệ thắng', value: Math.round(winRate * 100) + '%' },
      { icon: '🔥', label: 'Chuỗi thắng hiện tại', value: s.currentStreak },
      { icon: '⚡', label: 'Chuỗi thắng tốt nhất', value: s.bestStreak, highlight: true },
      { icon: '⏱️', label: 'Thời gian nhanh nhất', value: s.bestTime > 0 ? Game.formatTime(s.bestTime) : '—' },
      { icon: '📈', label: 'Thời gian trung bình', value: avgTime > 0 ? Game.formatTime(avgTime) : '—' }
    ];

    cards.forEach(c => {
      const card = document.createElement('div');
      card.className = 'stat-card' + (c.highlight ? ' highlight' : '');
      card.innerHTML = `
        <span class="stat-icon">${c.icon}</span>
        <span class="stat-value">${c.value}</span>
        <span class="stat-label">${c.label}</span>
      `;
      grid.appendChild(card);
    });
  }

  function setDifficulty(diff) {
    currentDiff = diff;
    _renderStats(diff);
  }

  function _formatHMS(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return String(h).padStart(2, '0') + ':' +
           String(m).padStart(2, '0') + ':' +
           String(s).padStart(2, '0');
  }

  function bindEvents() {
    document.querySelectorAll('#profile-diff-tabs .diff-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#profile-diff-tabs .diff-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        setDifficulty(tab.dataset.diff);
      });
    });

    // Edit name
    document.getElementById('btn-edit-name').addEventListener('click', () => {
      const section = document.getElementById('name-edit-section');
      const input = document.getElementById('name-input');
      const profile = Storage.getProfile();
      input.value = profile.name;
      section.classList.remove('hidden');
      input.focus();
    });

    document.getElementById('btn-save-name').addEventListener('click', () => {
      const input = document.getElementById('name-input');
      const name = input.value.trim();
      if (name.length > 0) {
        const p = Storage.getProfile();
        p.name = name;
        Storage.saveProfile(p);
        document.getElementById('profile-name').textContent = name;
      }
      document.getElementById('name-edit-section').classList.add('hidden');
    });

    document.getElementById('btn-cancel-name').addEventListener('click', () => {
      document.getElementById('name-edit-section').classList.add('hidden');
    });

    // Enter key saves name
    document.getElementById('name-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-save-name').click();
    });
  }

  return { render, bindEvents };
})();

