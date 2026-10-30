/* =========================================================
   variants.js — Variant cards (placeholder, coming soon)
   ========================================================= */
const Variants = (() => {

  function getVariants() {
    return [
      {
        id: 'killer',
        nameKey: 'variant_killer_name',
        descKey: 'variant_killer_desc',
        color: '#EF4444',
        svg: `<svg viewBox="0 0 80 80" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="3" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 2" fill="#FEE2E2"/>
          <rect x="28" y="2" width="50" height="24" rx="3" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 2" fill="#FEE2E2"/>
          <rect x="2" y="28" width="36" height="50" rx="3" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 2" fill="#FEF2F2"/>
          <rect x="40" y="28" width="38" height="24" rx="3" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 2" fill="#FEF2F2"/>
          <rect x="40" y="54" width="38" height="24" rx="3" stroke="#EF4444" stroke-width="2" stroke-dasharray="4 2" fill="#FEE2E2"/>
          <text x="6" y="12" font-size="7" fill="#EF4444" font-weight="600">8</text>
          <text x="32" y="12" font-size="7" fill="#EF4444" font-weight="600">15</text>
          <text x="6" y="38" font-size="7" fill="#EF4444" font-weight="600">22</text>
          <text x="14" y="20" font-size="14" fill="#1E293B" font-weight="700">3</text>
          <text x="40" y="20" font-size="14" fill="#1E293B" font-weight="700">7</text>
          <text x="60" y="20" font-size="14" fill="#1E293B" font-weight="700">8</text>
        </svg>`
      },
      {
        id: 'diagonal',
        nameKey: 'variant_diagonal_name',
        descKey: 'variant_diagonal_desc',
        color: '#8B5CF6',
        svg: `<svg viewBox="0 0 80 80" fill="none">
          <rect x="4" y="4" width="72" height="72" rx="4" stroke="#8B5CF6" stroke-width="2" fill="#F5F3FF"/>
          <line x1="4" y1="4" x2="76" y2="76" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="76" y1="4" x2="4" y2="76" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="28" y1="4" x2="28" y2="76" stroke="#8B5CF6" stroke-width="1" opacity="0.3"/>
          <line x1="52" y1="4" x2="52" y2="76" stroke="#8B5CF6" stroke-width="1" opacity="0.3"/>
          <line x1="4" y1="28" x2="76" y2="28" stroke="#8B5CF6" stroke-width="1" opacity="0.3"/>
          <line x1="4" y1="52" x2="76" y2="52" stroke="#8B5CF6" stroke-width="1" opacity="0.3"/>
          <text x="14" y="22" font-size="13" fill="#8B5CF6" font-weight="700">X</text>
          <text x="58" y="70" font-size="13" fill="#8B5CF6" font-weight="700">X</text>
        </svg>`
      },
      {
        id: 'samurai',
        nameKey: 'variant_samurai_name',
        descKey: 'variant_samurai_desc',
        color: '#F59E0B',
        svg: `<svg viewBox="0 0 80 80" fill="none">
          <rect x="20" y="2" width="20" height="20" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="42" y="2" width="20" height="20" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="2" y="20" width="20" height="20" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="20" y="20" width="20" height="20" rx="2" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="42" y="20" width="20" height="20" rx="2" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="60" y="20" width="18" height="20" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="20" y="42" width="20" height="20" rx="2" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="42" y="42" width="20" height="20" rx="2" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="2" y="42" width="20" height="20" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="60" y="42" width="18" height="20" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="20" y="62" width="20" height="16" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="42" y="62" width="20" height="16" rx="2" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
          <text x="27" y="36" font-size="10" fill="#F59E0B" font-weight="700">5</text>
          <text x="49" y="55" font-size="10" fill="#F59E0B" font-weight="700">3</text>
        </svg>`
      },
      {
        id: 'jigsaw',
        nameKey: 'variant_jigsaw_name',
        descKey: 'variant_jigsaw_desc',
        color: '#22C55E',
        svg: `<svg viewBox="0 0 80 80" fill="none">
          <rect x="4" y="4" width="72" height="72" rx="4" stroke="#22C55E" stroke-width="2" fill="#F0FDF4"/>
          <path d="M4 28 L28 28 L28 4" stroke="#22C55E" stroke-width="2" fill="none"/>
          <path d="M28 28 L28 52 L52 52 L52 28 Z" stroke="#22C55E" stroke-width="2" fill="#DCFCE7"/>
          <path d="M52 4 L52 28 L76 28" stroke="#22C55E" stroke-width="2" fill="none"/>
          <path d="M4 52 L28 52 L28 76" stroke="#22C55E" stroke-width="2" fill="none"/>
          <path d="M52 52 L52 76 L76 76 L76 52" stroke="#22C55E" stroke-width="2" fill="none"/>
          <text x="14" y="20" font-size="13" fill="#22C55E" font-weight="700">2</text>
          <text x="35" y="44" font-size="13" fill="#22C55E" font-weight="700">7</text>
          <text x="58" y="68" font-size="13" fill="#22C55E" font-weight="700">4</text>
        </svg>`
      }
    ];
  }

  function init() {
    const grid = document.getElementById('variants-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const badgeText = typeof I18n !== 'undefined' ? I18n.t('variants_badge_coming_soon') : 'Sắp ra mắt';
    const items = getVariants();

    items.forEach(v => {
      const card = document.createElement('div');
      card.className = 'variant-card';
      const name = typeof I18n !== 'undefined' ? I18n.t(v.nameKey) : v.nameKey;
      const desc = typeof I18n !== 'undefined' ? I18n.t(v.descKey) : v.descKey;

      card.innerHTML = `
        <span class="variant-badge">${badgeText}</span>
        <div class="variant-img">${v.svg}</div>
        <h3>${name}</h3>
        <p>${desc}</p>
      `;
      card.addEventListener('click', () => {
        const msg = typeof I18n !== 'undefined' && I18n.getLanguage() === 'en'
          ? 'This variant mode is coming soon in an upcoming update! 🚀'
          : 'Chế độ này đang được cập nhật, xin hãy đợi thêm trong phiên bản tới! 🚀';
        if (typeof App !== 'undefined' && App.showToast) App.showToast(msg);
      });
      grid.appendChild(card);
    });
  }

  return { init };
})();
