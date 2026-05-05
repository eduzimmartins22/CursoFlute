/* auth.js — login / logout */

let currentUser = null; // { email, name, role }

async function doLogin() {
  const loginVal = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl    = document.getElementById('loginErr');
  const btn      = document.getElementById('loginBtn');

  errEl.textContent = '';
  if (!loginVal || !password) { errEl.textContent = 'Preencha todos os campos.'; return; }

  btn.textContent = 'Entrando...';
  btn.disabled    = true;

  try {
    // Professor
    if (loginVal === PROF_LOGIN && password === PROF_PASSWORD) {
      currentUser = { email: PROF_LOGIN, name: PROF_NAME, role: 'professor' };
      sessionSave(currentUser);
      showApp();
      await loadProfessorPage();
      return;
    }

    // Aluno — busca no Firestore
    const student = await dbFindStudent(loginVal.toLowerCase());
    if (!student) {
      errEl.textContent = 'Email não encontrado. Fale com o professor.';
      return;
    }
    if (student.password !== password) {
      errEl.textContent = 'Senha incorreta.';
      return;
    }

    currentUser = { email: student.email, name: student.name, role: 'student' };
    sessionSave(currentUser);
    showApp();
    await loadStudentPage(student);

  } catch (err) {
    console.error(err);
    errEl.textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
  } finally {
    btn.textContent = 'Entrar';
    btn.disabled    = false;
  }
}

function doLogout() {
  currentUser = null;
  sessionClear();
  document.getElementById('app').style.display    = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginErr').textContent = '';
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display         = 'block';
  document.getElementById('hName').textContent = currentUser.name;
  document.getElementById('hRole').textContent =
    currentUser.role === 'professor' ? '🎓 Professor' : '🎵 Aluno';
  document.getElementById('hAvatar').textContent =
    currentUser.name.substring(0,2).toUpperCase();
}

// Auto-login por sessão persistida
async function checkSession() {
  const s = sessionGet();
  if (!s) return;
  // Revalida aluno no Firestore
  if (s.role === 'student') {
    try {
      const student = await dbFindStudent(s.email);
      if (!student) { sessionClear(); return; }
      currentUser = s;
      showApp();
      await loadStudentPage(student);
    } catch(e) { sessionClear(); }
  } else {
    currentUser = s;
    showApp();
    await loadProfessorPage();
  }
}

// Troca de tab no login
function switchLoginTab(role, el) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const isProf = role === 'professor';
  document.getElementById('loginLabelUser').textContent  = isProf ? 'Login' : 'Email';
  document.getElementById('loginUser').placeholder       = isProf ? 'Login do professor' : 'seu@email.com';
  document.getElementById('loginDemoNote').style.display = isProf ? 'none' : 'block';
}
