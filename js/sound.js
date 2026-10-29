/* =========================================================
   sound.js — Procedural Web Audio API sound effects engine
   Zero external audio files, zero latency, 100% synthesized
   ========================================================= */
const Sound = (() => {
  let ctx = null;
  let masterGain = null;
  let isMuted = false;
  let initialized = false;

  // Pentatonic scale frequencies for combo streaks (C5 to A6)
  const COMBO_SCALE = [
    523.25, // C5 (Streak 1-10)
    587.33, // D5 (Streak 11-20)
    659.25, // E5 (Streak 21-30)
    783.99, // G5 (Streak 31-40)
    880.00, // A5 (Streak 41+)
    1046.50,// C6
    1174.66,// D6
    1318.51,// E6
    1567.98,// G6
    1760.00 // A6
  ];

  /* ---------- AudioContext Initializer & Unlocker ---------- */
  function _getAudioContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.85, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function _unlock() {
    const c = _getAudioContext();
    if (c && c.state === 'suspended') {
      c.resume().catch(() => {});
    }
  }

  /* ---------- Helpers ---------- */
  function _canPlay() {
    return !isMuted && (window.AudioContext || window.webkitAudioContext);
  }

  /* ---------- Procedural Synthesizers ---------- */

  /**
   * 1. playTap — Soft wooden tap for cell selection, menu navigation, button clicks
   */
  function playTap() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.038);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * 2. playCorrect — Marimba pop with pentatonic pitch scaling based on streak
   */
  function playCorrect(streak = 1) {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    let noteIdx = 0;
    if (streak >= 41) noteIdx = 4;
    else if (streak >= 31) noteIdx = 3;
    else if (streak >= 21) noteIdx = 2;
    else if (streak >= 11) noteIdx = 1;
    else noteIdx = 0;

    const subOffset = (streak % 10) * 8;
    const baseFreq = COMBO_SCALE[noteIdx] + subOffset;

    // Fundamental tone
    const osc1 = c.createOscillator();
    const gain1 = c.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.004);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    // Harmonic overtone (~2.76x)
    const osc2 = c.createOscillator();
    const gain2 = c.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2.756, now);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.10, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.1);
  }

  /**
   * 3. playDigitComplete — Joyful ascending 3-note arpeggio when all 9 digits are placed
   */
  function playDigitComplete() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.075;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.38);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  /**
   * 4. playError — Low gentle thud / soft buzz for incorrect moves
   */
  function playError() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const osc = c.createOscillator();
    const subOsc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.16);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(65, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.16);

    gain.gain.setValueAtTime(0.20, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.19);
    subOsc.stop(now + 0.19);
  }

  /**
   * 5. playNote — Crisp mini pencil tick for note placement / toggle
   */
  function playNote() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1250, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.022);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.028);
  }

  /**
   * 6. playErase — Soft downward whoosh for erase and undo actions
   */
  function playErase() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.11);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.11);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * 7. playHint — Shimmering celestial chimes for hint reveal
   */
  function playHint() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const chimes = [659.25, 880.00, 1174.66, 1760.00]; // E5, A5, D6, A6
    chimes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.055;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.42);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }

  /**
   * 8. playDanger — Low dramatic tension heartbeat pulses for warning stage 2 & 3
   */
  function playDanger() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    [0, 0.14].forEach(offset => {
      const pTime = now + offset;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, pTime);
      osc.frequency.exponentialRampToValueAtTime(45, pTime + 0.10);

      gain.gain.setValueAtTime(0.24, pTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pTime + 0.11);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(pTime);
      osc.stop(pTime + 0.12);
    });
  }

  /**
   * 9. playWin — Festive victory fanfare
   */
  function playWin() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const notes = [
      { f: 523.25, t: 0.00, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.14 }, // G5
      { f: 1046.5, t: 0.38, d: 0.22 }, // C6
      { f: 783.99, t: 0.58, d: 0.12 }, // G5
      { f: 1046.5, t: 0.70, d: 0.55 }, // C6
      { f: 1318.5, t: 0.70, d: 0.55 }  // E6
    ];

    notes.forEach(n => {
      const nTime = now + n.t;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, nTime);

      gain.gain.setValueAtTime(0.001, nTime);
      gain.gain.linearRampToValueAtTime(0.26, nTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, nTime + n.d);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(nTime);
      osc.stop(nTime + n.d + 0.02);
    });
  }

  /**
   * 10. playGameOver — Gentle descending minor triad for match over
   */
  function playGameOver() {
    if (!_canPlay()) return;
    const c = _getAudioContext();
    if (!c) return;
    const now = c.currentTime;

    const notes = [
      { f: 392.00, t: 0.00, d: 0.22 }, // G4
      { f: 311.13, t: 0.20, d: 0.22 }, // Eb4
      { f: 261.63, t: 0.40, d: 0.50 }  // C4
    ];

    notes.forEach(n => {
      const nTime = now + n.t;
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, nTime);

      gain.gain.setValueAtTime(0.001, nTime);
      gain.gain.linearRampToValueAtTime(0.20, nTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, nTime + n.d);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(nTime);
      osc.stop(nTime + n.d + 0.02);
    });
  }

  /* ---------- Sound State & UI Controls ---------- */

  const ICON_SOUND_ON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
  const ICON_SOUND_OFF = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

  function updateToggleButtons() {
    const buttons = document.querySelectorAll('.btn-sound-toggle');
    buttons.forEach(btn => {
      btn.innerHTML = isMuted ? ICON_SOUND_OFF : ICON_SOUND_ON;
      btn.title = isMuted ? 'Bật âm thanh' : 'Tắt âm thanh';
      btn.setAttribute('aria-label', btn.title);
      btn.classList.toggle('muted', isMuted);
    });
  }

  function toggle() {
    isMuted = !isMuted;
    if (typeof Storage !== 'undefined' && Storage.setSoundEnabled) {
      Storage.setSoundEnabled(!isMuted);
    }
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.85, ctx.currentTime);
    }
    updateToggleButtons();

    if (!isMuted) {
      playTap();
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('🔊 Đã bật âm thanh');
      }
    } else {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('🔇 Đã tắt âm thanh');
      }
    }
    return !isMuted;
  }

  function init() {
    if (initialized) return;
    initialized = true;

    // Load saved preference
    if (typeof Storage !== 'undefined' && Storage.isSoundEnabled) {
      isMuted = !Storage.isSoundEnabled();
    } else {
      isMuted = false;
    }

    // Unlock on first user gesture anywhere
    const unlockHandler = () => {
      _unlock();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };
    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });

    // Bind all sound toggle buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-sound-toggle');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    });

    updateToggleButtons();
  }

  return {
    init,
    toggle,
    isMuted: () => isMuted,
    updateUI: updateToggleButtons,
    playTap,
    playCorrect,
    playDigitComplete,
    playError,
    playNote,
    playErase,
    playHint,
    playDanger,
    playWin,
    playGameOver
  };
})();

