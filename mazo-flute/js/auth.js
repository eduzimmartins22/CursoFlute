/* =============================================
   auth.js — Autenticação (aluno e professor).
   Controla fluxo de login/logout e inicializa
   o app conforme o papel do usuário.
   ============================================= */

'use strict';

const Auth = (() => {

  // Estado público da sessão atual
  let _currentUser = null; // { email, name, role }

  // ── Getters ───────────────────────────────────

  function getCurrentUser() { return _currentUser; }
  function isLoggedIn()     { return _currentUser !== null; }
  function isProfessor()    { return _currentUser?.role === 'professor'; }

  // ── Login ─────────────────────────────────────

  function attemptLogin(loginValue, password) {
    const errEl = document.getElementById('loginErr');
    errEl.textContent = '';

    // 1. Verificar credenciais do professor
    const prof = CREDENTIALS.professor;
    if (loginValue === prof.login && password === prof.password) {
      return _startSession({ email: prof.login, name: prof.name, role: 'professor' });
    }

    // 2. Verificar aluno (qualquer email + senha mínima de 3 chars)
    if (!loginValue.includes('@')) {
      errEl.textContent = 'Use seu email de aluno ou o login do professor.';
      return false;
    }
    if (password.length < 3) {
      errEl.textContent = 'Senha muito curta.';
      return false;
    }

    const name = loginValue.split('@')[0];
    Storage.ensureStudentExists(loginValue, name);
    return _startSession({ email: loginValue, name, role: 'student' });
  }

  function _startSession(user) {
    _currentUser = user;
    Storage.saveSession(user);

    // Ocultar login, mostrar app
    document.getElementById('loginScreen').classList.add('out');
    const app = document.getElementById('app');
    app.classList.add('visible');

    // Inicializar UI conforme papel
    if (user.role === 'professor') {
      UI.initProfessor(user);
    } else {
      UI.initStudent(user);
    }

    return true;
  }

  // ── Logout ────────────────────────────────────

  function logout() {
    _currentUser = null;
    Storage.clearSession();

    document.getElementById('app').classList.remove('visible');
    document.getElementById('loginScreen').classList.remove('out');

    // Resetar form
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginErr').textContent = '';

    // Resetar tab ativa para aluno
    document.querySelectorAll('.login-tab').forEach((t, i) => {
      t.classList.toggle('active', i === 0);
    });
    showStudentLoginForm();
  }

  // ── Verificar sessão persistida ───────────────

  function checkPersistedSession() {
    const session = Storage.getSession();
    if (!session) return;
    _startSession(session);
  }

  // ── Controle dos formulários de login ─────────

  function showStudentLoginForm() {
    document.getElementById('loginLabelUser').textContent = 'Email';
    document.getElementById('loginUser').placeholder = 'seu@email.com';
    document.getElementById('loginLabelPass').textContent = 'Senha';
    document.getElementById('loginDemoNote').style.display = 'block';
  }

  function showProfessorLoginForm() {
    document.getElementById('loginLabelUser').textContent = 'Login';
    document.getElementById('loginUser').placeholder = 'Login do professor';
    document.getElementById('loginLabelPass').textContent = 'Senha';
    document.getElementById('loginDemoNote').style.display = 'none';
  }

  // API pública
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
