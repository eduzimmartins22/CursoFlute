/* =============================================
   storage.js — Firestore como banco de dados.
   
   Coleções:
   - students/{email}            → { name, password, monthIdx }
   - progress/{email}__{mIdx}   → { checked: {} }
   - requests/{email}            → { name, monthIdx, requestedAt }
   - streaks/{email}             → { count }
   ============================================= */

'use strict';

const Storage = (() => {

  // Referências das coleções
  const col = {
    students: () => db.collection('students'),
    progress: () => db.collection('progress'),
    requests: () => db.collection('requests'),
    streaks:  () => db.collection('streaks'),
  };

  // Sessão local (só identifica quem está logado no dispositivo)
  const _session = {
    save:  (obj) => localStorage.setItem('mf_session', JSON.stringify(obj)),
    get:   ()    => { try { return JSON.parse(localStorage.getItem('mf_session')); } catch { return null; } },
    clear: ()    => localStorage.removeItem('mf_session'),
  };

  // ── Sessão ────────────────────────────────────
  function saveSession(obj) { _session.save(obj); }
  function getSession()     { return _session.get(); }
  function clearSession()   { _session.clear(); }

  // ── Alunos ────────────────────────────────────

  async function getStudents() {
    const snap = await col.students().get();
    return snap.docs.map(d => ({ email: d.id, ...d.data() }));
  }

  async function findStudent(email) {
    const doc = await col.students().doc(email).get();
    if (!doc.exists) return null;
    return { email: doc.id, ...doc.data() };
  }

  async function upsertStudent({ email, ...data }) {
    await col.students().doc(email).set(data, { merge: true });
  }

  async function removeStudent(email) {
    await col.students().doc(email).delete();
  }

  // ── Mês ───────────────────────────────────────

  async function getStudentMonth(email) {
    const doc = await col.students().doc(email).get();
    return doc.exists ? (doc.data().monthIdx ?? 0) : 0;
  }

  async function setStudentMonth(email, monthIdx) {
    await col.students().doc(email).set({ monthIdx }, { merge: true });
  }

  // ── Checklist ────────────────────────────────

  async function getChecklist(email, monthIdx) {
    const doc = await col.progress().doc(`${email}__${monthIdx}`).get();
    return doc.exists ? (doc.data().checked || {}) : {};
  }

  async function setChecklistItem(email, monthIdx, objIdx, checked) {
    const key     = `${email}__${monthIdx}`;
    const current = await getChecklist(email, monthIdx);
    current[objIdx] = checked;
    await col.progress().doc(key).set({ checked: current });
    return current;
  }

  // ── Streak ───────────────────────────────────

  async function getStreak(email) {
    const doc = await col.streaks().doc(email).get();
    return doc.exists ? (doc.data().count || 0) : 0;
  }

  async function incrementStreak(email) {
    const next = (await getStreak(email)) + 1;
    await col.streaks().doc(email).set({ count: next });
    return next;
  }

  // ── Solicitações ─────────────────────────────

  async function getAdvanceRequests() {
    const snap = await col.requests().get();
    const result = {};
    snap.docs.forEach(d => { result[d.id] = d.data(); });
    return result;
  }

  async function requestAdvance(email, name, monthIdx) {
    await col.requests().doc(email).set({
      name, monthIdx, requestedAt: new Date().toISOString(),
    });
  }

  async function hasAdvanceRequest(email) {
    const doc = await col.requests().doc(email).get();
    return doc.exists;
  }

  async function clearAdvanceRequest(email) {
    await col.requests().doc(email).delete();
  }

  // Sem-op — dados estão no Firestore
  function initStudents() {}

  return {
    initStudents,
    saveSession, getSession, clearSession,
    getStudents, findStudent, upsertStudent, removeStudent,
    getStudentMonth, setStudentMonth,
    getChecklist, setChecklistItem,
    getStreak, incrementStreak,
    getAdvanceRequests, requestAdvance, hasAdvanceRequest, clearAdvanceRequest,
  };

