/* =============================================
   storage.js — Camada de dados via Firestore.
   Toda leitura/escrita passa por aqui.

   Coleções no Firestore:
   - students/{email}  → { name, password, monthIdx }
   - progress/{email}__{monthIdx} → { checked: {} }
   - requests/{email}  → { name, monthIdx, requestedAt }
   - streaks/{email}   → { count }
   ============================================= */

'use strict';

const Storage = (() => {

  // ── Helpers Firestore ─────────────────────────

  const col = {
    students:  () => db.collection('students'),
    progress:  () => db.collection('progress'),
    requests:  () => db.collection('requests'),
    streaks:   () => db.collection('streaks'),
  };

  // Sessão ainda fica em localStorage (só dados do dispositivo logado)
  const _session = {
    save: (obj) => localStorage.setItem('mf_session', JSON.stringify(obj)),
    get:  ()    => { try { return JSON.parse(localStorage.getItem('mf_session')); } catch { return null; } },
    clear: ()   => localStorage.removeItem('mf_session'),
  };

  // ── Sessão ────────────────────────────────────

  function saveSession(obj)  { _session.save(obj); }
  function getSession()      { return _session.get(); }
  function clearSession()    { _session.clear(); }

  // ── Alunos ────────────────────────────────────

  // Retorna todos os alunos como array
  async function getStudents() {
    const snap = await col.students().get();
    return snap.docs.map(d => ({ email: d.id, ...d.data() }));
  }

  // Busca um aluno pelo email (id do documento)
  async function findStudent(email) {
    const doc = await col.students().doc(email).get();
    if (!doc.exists) return null;
    return { email: doc.id, ...doc.data() };
  }

  // Cria ou atualiza um aluno
  async function upsertStudent(studentObj) {
    const { email, ...data } = studentObj;
    await col.students().doc(email).set(data, { merge: true });
  }

  // Remove um aluno
  async function removeStudent(email) {
    await col.students().doc(email).delete();
  }

  // ── Mês do aluno ─────────────────────────────

  async function getStudentMonth(email) {
    const doc = await col.students().doc(email).get();
    if (!doc.exists) return 0;
    return doc.data().monthIdx ?? 0;
  }

  async function setStudentMonth(email, monthIdx) {
    await col.students().doc(email).set({ monthIdx }, { merge: true });
  }

  // ── Checklist ────────────────────────────────
  // chave do doc: "email__monthIdx"

  async function getChecklist(email, monthIdx) {
    const key = `${email}__${monthIdx}`;
    const doc = await col.progress().doc(key).get();
    if (!doc.exists) return {};
    return doc.data().checked || {};
  }

  async function setChecklistItem(email, monthIdx, objIdx, checked) {
    const key  = `${email}__${monthIdx}`;
    const current = await getChecklist(email, monthIdx);
    current[objIdx] = checked;
    await col.progress().doc(key).set({ checked: current });
    return current;
  }

  // ── Streak ───────────────────────────────────

  async function getStreak(email) {
    const doc = await col.streaks().doc(email).get();
    if (!doc.exists) return 0;
    return doc.data().count || 0;
  }

  async function incrementStreak(email) {
    const current = await getStreak(email);
    const next = current + 1;
    await col.streaks().doc(email).set({ count: next });
    return next;
  }

  // ── Solicitações de avanço ───────────────────

  async function getAdvanceRequests() {
    const snap = await col.requests().get();
    const result = {};
    snap.docs.forEach(d => { result[d.id] = d.data(); });
    return result;
  }

  async function requestAdvance(email, name, monthIdx) {
    await col.requests().doc(email).set({
      name, monthIdx,
      requestedAt: new Date().toISOString(),
    });
  }

  async function hasAdvanceRequest(email) {
    const doc = await col.requests().doc(email).get();
    return doc.exists;
  }

  async function clearAdvanceRequest(email) {
    await col.requests().doc(email).delete();
  }

  // ── Init (não precisa mais de seed local) ────

  function initStudents() {
    // Tudo no Firestore agora — nada a fazer no boot
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
