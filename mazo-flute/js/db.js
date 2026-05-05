/* db.js — Firebase + todas as operações de banco.
   Sessão local em localStorage, dados no Firestore. */

// ── Configuração Firebase ─────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyA-Xar78wLCHAaYA5W0paI7xF76vWkenys',
  authDomain:        'mazo-flute.firebaseapp.com',
  projectId:         'mazo-flute',
  storageBucket:     'mazo-flute.firebasestorage.app',
  messagingSenderId: '573983892424',
  appId:             '1:573983892424:web:26ecd8cedc5f9dacb796fd',
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Sessão (localStorage) ─────────────────────
function sessionSave(obj)  { localStorage.setItem('mf_s', JSON.stringify(obj)); }
function sessionGet()      { try { return JSON.parse(localStorage.getItem('mf_s')); } catch { return null; } }
function sessionClear()    { localStorage.removeItem('mf_s'); }

// ── Alunos ────────────────────────────────────
async function dbGetStudents() {
  const snap = await db.collection('students').get();
  return snap.docs.map(d => ({ email: d.id, ...d.data() }));
}
async function dbFindStudent(email) {
  const doc = await db.collection('students').doc(email).get();
  return doc.exists ? { email: doc.id, ...doc.data() } : null;
}
async function dbSaveStudent(email, data) {
  await db.collection('students').doc(email).set(data, { merge: true });
}
async function dbDeleteStudent(email) {
  await db.collection('students').doc(email).delete();
}

// ── Checklist ────────────────────────────────
async function dbGetChecklist(email, mIdx) {
  const doc = await db.collection('progress').doc(`${email}__${mIdx}`).get();
  return doc.exists ? (doc.data().checked || {}) : {};
}
async function dbSetChecklistItem(email, mIdx, objIdx, checked) {
  const key  = `${email}__${mIdx}`;
  const data = await dbGetChecklist(email, mIdx);
  data[objIdx] = checked;
  await db.collection('progress').doc(key).set({ checked: data });
  return data;
}

// ── Streak ───────────────────────────────────
async function dbGetStreak(email) {
  const doc = await db.collection('streaks').doc(email).get();
  return doc.exists ? (doc.data().count || 0) : 0;
}
async function dbIncrementStreak(email) {
  const next = (await dbGetStreak(email)) + 1;
  await db.collection('streaks').doc(email).set({ count: next });
  return next;
}

// ── Solicitações de avanço ───────────────────
async function dbGetRequests() {
  const snap = await db.collection('requests').get();
  const out  = {};
  snap.docs.forEach(d => { out[d.id] = d.data(); });
  return out;
}
async function dbAddRequest(email, name, mIdx) {
  await db.collection('requests').doc(email).set({
    name, monthIdx: mIdx, requestedAt: new Date().toISOString(),
  });
}
async function dbHasRequest(email) {
  const doc = await db.collection('requests').doc(email).get();
  return doc.exists;
}
async function dbClearRequest(email) {
  await db.collection('requests').doc(email).delete();
}
