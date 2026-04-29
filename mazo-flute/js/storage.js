/* =============================================
   storage.js — Camada de acesso ao localStorage.
   Toda leitura/escrita passa por aqui.
   ============================================= */

'use strict';

const Storage = (() => {

  const KEYS = {
    session:      () => 'mf_session',
    students:     () => 'mf_students',
    monthIdx:     (email) => `mf_month_${email}`,
    checklist:    (email, mIdx) => `mf_ck_${email}_${mIdx}`,
    streak:       (email) => `mf_streak_${email}`,
    initialized:  () => 'mf_initialized',
    advanceReqs:  () => 'mf_advance_requests',
  };

  // ── Helpers internos ──────────────────────────

  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }

  function _set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  function _remove(key) {
    localStorage.removeItem(key);
  }

  // ── Sessão ────────────────────────────────────

  function saveSession(sessionObj) {
    _set(KEYS.session(), sessionObj);
  }

  function getSession() {
    return _get(KEYS.session());
  }

  function clearSession() {
    _remove(KEYS.session());
  }

  // ── Alunos ────────────────────────────────────
  // Lista gerenciada exclusivamente pelo professor.
  // Nenhum aluno entra sem estar aqui.

  function initStudents() {
    if (_get(KEYS.initialized())) return;
    _set(KEYS.students(), DEMO_STUDENTS);
    DEMO_STUDENTS.forEach(s => {
      _set(KEYS.monthIdx(s.email), s.monthIdx);
    });
    _set(KEYS.initialized(), true);
  }

  function getStudents() {
    return _get(KEYS.students()) || [];
  }

  // Retorna o aluno pelo email, ou null se não cadastrado
  function findStudent(email) {
    return getStudents().find(s => s.email === email) || null;
  }

  function upsertStudent(studentObj) {
    const students = getStudents();
    const idx = students.findIndex(s => s.email === studentObj.email);
    if (idx >= 0) students[idx] = { ...students[idx], ...studentObj };
    else students.push(studentObj);
    _set(KEYS.students(), students);
  }

  function removeStudent(email) {
    const students = getStudents().filter(s => s.email !== email);
    _set(KEYS.students(), students);
  }

  // ── Mês do aluno ─────────────────────────────

  function getStudentMonth(email) {
    const val = _get(KEYS.monthIdx(email));
    return (val !== null && val !== undefined) ? val : 0;
  }

  function setStudentMonth(email, monthIdx) {
    _set(KEYS.monthIdx(email), monthIdx);
    upsertStudent({ email, monthIdx });
  }

  // ── Checklist do mês ─────────────────────────

  function getChecklist(email, monthIdx) {
    return _get(KEYS.checklist(email, monthIdx)) || {};
  }

  function setChecklistItem(email, monthIdx, objIdx, checked) {
    const data = getChecklist(email, monthIdx);
    data[objIdx] = checked;
    _set(KEYS.checklist(email, monthIdx), data);
    return data;
  }

  // ── Streak ───────────────────────────────────

  function getStreak(email) {
    return _get(KEYS.streak(email)) || 0;
  }

  function incrementStreak(email) {
    const newStreak = getStreak(email) + 1;
    _set(KEYS.streak(email), newStreak);
    return newStreak;
  }

  // ── Solicitações de avanço de módulo ─────────
  // Estrutura: { [email]: { name, monthIdx, requestedAt } }
  // O aluno solicita → o professor aprova ou ignora.

  function getAdvanceRequests() {
    return _get(KEYS.advanceReqs()) || {};
  }

  function requestAdvance(email, name, monthIdx) {
    const reqs = getAdvanceRequests();
    reqs[email] = { name, monthIdx, requestedAt: new Date().toISOString() };
    _set(KEYS.advanceReqs(), reqs);
  }

  function hasAdvanceRequest(email) {
    return !!getAdvanceRequests()[email];
  }

  function clearAdvanceRequest(email) {
    const reqs = getAdvanceRequests();
    delete reqs[email];
    _set(KEYS.advanceReqs(), reqs);
  }

  // API pública
  return {
    initStudents,
    saveSession,
    getSession,
    clearSession,
    getStudents,
    findStudent,
    upsertStudent,
    removeStudent,
    getStudentMonth,
    setStudentMonth,
    getChecklist,
    setChecklistItem,
    getStreak,
    incrementStreak,
    getAdvanceRequests,
    requestAdvance,
    hasAdvanceRequest,
    clearAdvanceRequest,
  };

})();
