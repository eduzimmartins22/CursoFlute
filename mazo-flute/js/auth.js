/* =============================================
   auth.js — Autenticação (aluno e professor).
   - Professor: login "Prof" + senha "Edu321"
   - Aluno: email cadastrado pelo professor +
     senha definida pelo professor no cadastro.
   ============================================= */

'use strict';

const Auth = (() => {

  let _currentUser = null; // { email, name, role }

  // ── Getters ───────────────────────────────────

  function getCurrentUser() { return _currentUser; }
  function isLoggedIn()     { return _currentUser !== null; }
  function isProfessor()    { return _currentUser?.role === 'professor'; }

  // ── Login ─────────────────────────────────────

  function attemptLogin(loginValue, password) {
    const errEl = document.getElementById('loginErr');
    errEl.textContent = '';

    if (!loginValue || !password) {
      errEl.textContent = 'Preencha todos os campos.';
      return false;
    }

    // 1. Professor
    const prof = CREDENTIALS.professor;
    if (loginValue === prof.login && password === prof.password) {
      return _startSession({ email: prof.login, name: prof.name, role: 'professor' });
    }

    // 2. Aluno — busca pelo email na lista do professor
    const student = Storage.findStudent(loginValue.toLowerCase().trim());
    if (!student) {
      errEl.textContent = 'Email não encontrado. Fale com o professor.';
      return false;
    }

    // 3. Valida a senha individual do aluno
    if (student.password !== password) {
      errEl.textContent = 'Senha incorreta.';
      return false;
    }

    return _startSession({ email: student.email, name: student.name, role: 'student' });
  }

  function _startSession(user) {
    _currentUser = user;
    Storage.saveSession(user);

    document.getElementById('loginScreen').classList.add('out');
    document.getElementById('app').classList.add('visible');

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

    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginErr').textContent = '';

    document.querySelectorAll('.login-tab').forEach((t, i) => {
      t.classList.toggle('active', i === 0);
    });
    showStudentLoginForm();
  }

  // ── Sessão persistida ─────────────────────────

  function checkPersistedSession() {
    const session = Storage.getSession();
    if (!session) return;
    // Revalida: professor ok, aluno precisa ainda estar cadastrado
    if (session.role === 'student' && !Storage.findStudent(session.email)) {
      Storage.clearSession();
      return;
    }
    _startSession(session);
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
