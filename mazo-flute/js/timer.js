/* =============================================
   timer.js — Timer de prática.
   Módulo isolado, sem acoplamento com o resto.
   ============================================= */

'use strict';

const Timer = (() => {

  let _seconds  = 1800;
  let _maxSecs  = 1800;
  let _running  = false;
  let _interval = null;

  // ── Inicialização ─────────────────────────────

  function init() {
    _render();
  }

  // ── Controles públicos ────────────────────────

  function setPreset(minutes) {
    reset();
    _seconds = _maxSecs = minutes * 60;
    _render();
  }

  function toggle() {
    if (_running) {
      _pause();
    } else {
      _start();
    }
  }

  function reset() {
    clearInterval(_interval);
    _running  = false;
    _seconds  = _maxSecs;
    _render();
    _updateBtn('▶ Iniciar');
  }

  // ── Internos ──────────────────────────────────

  function _start() {
    if (_seconds <= 0) return;
    _running  = true;
    _updateBtn('⏸ Pausar');
    _interval = setInterval(() => {
      _seconds--;
      _render();
      if (_seconds <= 0) _complete();
    }, 1000);
  }

  function _pause() {
    clearInterval(_interval);
    _running = false;
    _updateBtn('▶ Retomar');
  }

  function _complete() {
    clearInterval(_interval);
    _running = false;
    _updateBtn('✓ Concluído!');

    const user = Auth.getCurrentUser();
    if (user) {
      const streak = Storage.incrementStreak(user.email);
      UI.refreshStreakDisplay(streak);
      alert(`🎉 Sessão concluída!\nSequência de prática: ${streak} dias 🔥`);
    }
  }

  function _render() {
    const el = document.getElementById('timerDisplay');
    if (!el) return;
    const m = Math.floor(_seconds / 60);
    const s = _seconds % 60;
    el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function _updateBtn(text) {
    const btn = document.getElementById('timerToggleBtn');
    if (btn) btn.textContent = text;
  }

  // API pública
  return { init, setPreset, toggle, reset };

})();
