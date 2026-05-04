/* =============================================
   auth.js — Autenticação com Firestore.
   Professor: login "Prof" + senha "Edu321"
   Aluno: email cadastrado + senha individual
          definida pelo professor no painel.
   ============================================= */

'use strict';

const Auth = (() => {

  let _currentUser = null;

  function getCurrentUser() { return _currentUser; }
  function isLoggedIn()     { return _currentUser !== null; }
  function isProfessor()    { return _currentUser?.role === 'professor'; }

  // ── Login ─────────────────────────────────────

  async function attemptLogin(loginValue, password) {
    const errEl = document.getElementById('loginErr');
    const btn   = document.getElementById('loginSubmitBtn');
    errEl.textContent = '';

    if (!loginValue || !password) {
      errEl.textContent = 'Preencha todos os campos.';
      return;
    }

    // Feedback de carregamento
    btn.textContent = 'Entrando...';
    btn.disabled = true;

    try {
      // 1. Professor
      const prof = CREDENTIALS.professor;
      if (loginValue === prof.login && password === prof.password) {
        await _startSession({ email: prof.login, name: prof.name, role: 'professor' });
        return;
      }

      // 2. Aluno — busca no Firestore
      const student = await Storage.findStudent(loginValue.toLowerCase().trim());
      if (!student) {
        errEl.textContent = 'Email não encontrado. Fale com o professor.';
        return;
      }

      if (student.password !== password) {
        errEl.textContent = 'Senha incorreta.';
        return;
      }

      await _startSession({ email: student.email, name: student.name, role: 'student' });

    } catch (err) {
      console.error(err);
      errEl.textContent = 'Erro de conexão. Verifique sua internet.';
    } finally {
      btn.textContent = 'Entrar';
      btn.disabled = false;
    }
  }

  async function _startSession(user) {
    _currentUser = user;
    Storage.saveSession(user);

    document.getElementById('loginScreen').classList.add('out');
    document.getElementById('app').classList.add('visible');

    if (user.role === 'professor') {
      await window.UI && UI.initProfessor(user);
    } else {
      await window.UI && UI.initStudent(user);
    }
  }

  // ── Logout ────────────────────────────────────

  function logout() {
    _currentUser = null;
    Storage.clearSession();
    document.getElementById('app').classList.remove('visible');
    document.getElementById('loginScreen').classList.remove('out');
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginErr').textContent = '';
    document.querySelectorAll('.login-tab').forEach((t, i) => {
      t.classList.toggle('active', i === 0);
    });
    showStudentLoginForm();
  }

  // ── Sessão persistida ─────────────────────────

  async function checkPersistedSession() {
    const session = Storage.getSession();
    if (!session) return;
    // Revalida aluno no Firestore
    if (session.role === 'student') {
      const student = await Storage.findStudent(session.email);
      if (!student) { Storage.clearSession(); return; }
    }
    await _startSession(session);
  }

  // ── Formulários ───────────────────────────────

  function showStudentLoginForm() {
    document.getElementById('loginLabelUser').textContent   = 'Email';
    document.getElementById('loginUser').placeholder       = 'seu@email.com';
    document.getElementById('loginLabelPass').textContent  = 'Senha';
    document.getElementById('loginDemoNote').style.display = 'block';
  }

  function showProfessorLoginForm() {
    document.getElementById('loginLabelUser').textContent   = 'Login';
    document.getElementById('loginUser').placeholder       = 'Login do professor';
    document.getElementById('loginLabelPass').textContent  = 'Senha';
    document.getElementById('loginDemoNote').style.display = 'none';
  }

  return {
    attemptLogin,
    logout,
    checkPersistedSession,
    getCurrentUser,
    isLoggedIn,
    isProfessor,
    showStudentLoginForm,
    showProfessorLoginForm,
  };

})();
