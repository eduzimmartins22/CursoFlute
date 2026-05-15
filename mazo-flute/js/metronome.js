/* =============================================
   metronome.js — Metrônomo com 4/4 e 6/8.
   Usa Web Audio API para sons precisos.
   ============================================= */

'use strict';

const Metronome = (() => {

  // ── Estado ────────────────────────────────────
  let _bpm        = 80;
  let _signature  = '4/4';   // '4/4' ou '6/8'
  let _running    = false;
  let _beatIndex  = 0;
  let _nextTime   = 0;
  let _timerID    = null;
  let _audioCtx   = null;

  // Beats por compasso e subdivisões
  const SIG = {
    '4/4': { beats: 4, subdivisions: 1 },
    '6/8': { beats: 6, subdivisions: 1 },
  };

  // ── Audio Context (lazy) ──────────────────────

  function _getCtx() {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume se suspenso (política autoplay)
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  }

  // ── Geração de som via Web Audio ─────────────

  function _playClick(time, isAccent) {
    const ctx  = _getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isAccent) {
      osc.frequency.value = 1100;   // acento: mais agudo
      gain.gain.setValueAtTime(0.9, time);
    } else {
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.55, time);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.start(time);
    osc.stop(time + 0.07);
  }

  // ── Scheduler (lookahead preciso) ────────────

  const LOOKAHEAD   = 25;    // ms — intervalo do setInterval
  const SCHEDULE_AH = 0.1;   // s  — quanto à frente agendar

  function _schedule() {
    const ctx      = _getCtx();
    const sig      = SIG[_signature];
    const interval = 60 / _bpm;   // segundos por batida

    while (_nextTime < ctx.currentTime + SCHEDULE_AH) {
      const isAccent = (_beatIndex === 0);
      _playClick(_nextTime, isAccent);
      _flashBeat(_beatIndex, sig.beats);
      _beatIndex  = (_beatIndex + 1) % sig.beats;
      _nextTime  += interval;
    }
  }

  // ── Visual de beats ───────────────────────────

  function _buildBeatDots() {
    const el  = document.getElementById('metroBeats');
    if (!el) return;
    const sig = SIG[_signature];
    el.innerHTML = '';
    for (let i = 0; i < sig.beats; i++) {
      const dot = document.createElement('div');
      dot.className = 'metro-dot' + (i === 0 ? ' metro-dot--accent' : '');
      dot.id = `metroDot${i}`;
      el.appendChild(dot);
    }
  }

  function _flashBeat(idx, total) {
    // Remoção segura via rAF para não bloquear o scheduler
    requestAnimationFrame(() => {
      for (let i = 0; i < total; i++) {
        const dot = document.getElementById(`metroDot${i}`);
        if (!dot) return;
        dot.classList.remove('metro-dot--active');
      }
      const active = document.getElementById(`metroDot${idx}`);
      if (active) active.classList.add('metro-dot--active');
    });
  }

  // ── API pública ───────────────────────────────

  function setBpm(val) {
    _bpm = Math.min(240, Math.max(40, val));
    const slider  = document.getElementById('metroBpmSlider');
    const display = document.getElementById('metroBpmDisplay');
    if (slider)  slider.value     = _bpm;
    if (display) display.textContent = `${_bpm} BPM`;
  }

  function adjustBpm(delta) {
    setBpm(_bpm + delta);
  }

  function setBpmPreset(val) {
    setBpm(val);
  }

  function setSignature(sig) {
    _signature = sig;
    _beatIndex = 0;
    _buildBeatDots();

    // Atualizar botões ativos
    ['4/4', '6/8'].forEach(s => {
      const id  = 'metroSig' + s.replace('/', '');
      const btn = document.getElementById(id);
      if (btn) btn.classList.toggle('active', s === sig);
    });
  }

  function toggle() {
    if (_running) {
      stop();
    } else {
      start();
    }
  }

  function start() {
    if (_running) return;
    _running   = true;
    _beatIndex = 0;
    _nextTime  = _getCtx().currentTime + 0.05;
    _timerID   = setInterval(_schedule, LOOKAHEAD);
    _updateBtn('⏸ Pausar');
  }

  function stop() {
    clearInterval(_timerID);
    _running   = false;
    _beatIndex = 0;

    // Apagar todos os dots
    const sig = SIG[_signature];
    for (let i = 0; i < sig.beats; i++) {
      const dot = document.getElementById(`metroDot${i}`);
      if (dot) dot.classList.remove('metro-dot--active');
    }
    _updateBtn('▶ Iniciar');
  }

  function _updateBtn(text) {
    const btn = document.getElementById('metroToggleBtn');
    if (btn) btn.textContent = text;
  }

  // Inicialização: constrói dots e sincroniza UI
  function init() {
    _buildBeatDots();
    setBpm(_bpm);
  }

  return { init, setBpm, adjustBpm, setBpmPreset, setSignature, toggle, start, stop };

})();
