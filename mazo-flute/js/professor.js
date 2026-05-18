/* professor.js — painel do professor com aba de agendamentos */

async function loadProfessorPage() {
  document.getElementById('navBar').innerHTML = `
    <button class="nav-tab active" onclick="profNavTo('alunos',this)">🎓 Alunos</button>
    <button class="nav-tab"        onclick="profNavTo('agendamentos',this)">📅 Agendamentos</button>`;

  document.getElementById('pagesContainer').innerHTML =
    tplProfAlunos() + tplProfAgendamentos();

  await refreshProfessorPage();
}

function profNavTo(section, el) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-prof-' + section);
  if (target) {
    target.classList.add('active');
  } else {
    console.error('Página não encontrada: page-prof-' + section);
  }
  window.scrollTo(0, 0);
  if (section === 'agendamentos') loadProfAgendamentos();
}

// ── Painel de Alunos ──────────────────────────
function tplProfAlunos() {
  return `
  <div id="page-prof-alunos" class="page active">
    <div class="prof-header">
      <h2>Painel do Professor</h2>
      <p>Gerencie alunos e módulos. Só você decide quem avança.</p>
    </div>
    <div class="prof-stats" id="profStats"></div>
    <div id="advanceRequests"></div>

    <div class="sec-title">➕ Cadastrar Aluno</div>
    <div class="cbox">
      <div class="add-student-form">
        <div class="add-field"><label>Nome</label><input type="text" id="newName" placeholder="Nome completo"></div>
        <div class="add-field"><label>Email</label><input type="email" id="newEmail" placeholder="email@exemplo.com"></div>
        <div class="add-field"><label>Senha</label><input type="text" id="newPass" placeholder="ex: flauta2025"></div>
        <div class="add-field">
          <label>Módulo inicial</label>
          <select id="newMonth" class="month-select">
            ${MONTHS_DATA.map((m,i) => `<option value="${i}">${m.name} — ${m.tag}</option>`).join('')}
          </select>
        </div>
        <button class="save-row-btn" onclick="addStudent()">Cadastrar</button>
      </div>
      <div class="tip" style="margin-top:1rem">🔑 Defina uma senha para cada aluno e compartilhe com ele após o cadastro.</div>
    </div>

    <div class="sec-title">👥 Alunos</div>
    <div class="cbox" style="padding:0;overflow:hidden">
      <table class="students-table">
        <thead><tr><th>Aluno</th><th>Senha</th><th>Módulo</th><th>Alterar</th><th>Ações</th></tr></thead>
        <tbody id="studentsBody"></tbody>
      </table>
    </div>
  </div>`;
}

async function refreshProfessorPage() {
  const [students, requests] = await Promise.all([dbGetStudents(), dbGetRequests()]);

  const avg     = students.length > 0
    ? (students.reduce((s,a) => s+(a.monthIdx||0), 0) / students.length).toFixed(1) : 0;
  const inFinal = students.filter(s => (s.monthIdx||0) >= 9).length;
  const pendN   = Object.keys(requests).length;

  document.getElementById('profStats').innerHTML = `
    <div class="prof-stat"><div class="prof-stat-num">${students.length}</div><div class="prof-stat-label">Alunos</div></div>
    <div class="prof-stat"><div class="prof-stat-num">${avg}</div><div class="prof-stat-label">Módulo Médio</div></div>
    <div class="prof-stat"><div class="prof-stat-num">${inFinal}</div><div class="prof-stat-label">Projeto Final</div></div>
    <div class="prof-stat" style="${pendN>0?'border:2px solid var(--gold)':''}">
      <div class="prof-stat-num" style="color:${pendN>0?'var(--warn)':'var(--muted)'}">${pendN}</div>
      <div class="prof-stat-label">Solicitações</div>
    </div>`;

  const reqEl = document.getElementById('advanceRequests');
  if (pendN > 0) {
    const cards = Object.entries(requests).map(([email, req]) => {
      const curr = MONTHS_DATA[req.monthIdx];
      const next = MONTHS_DATA[req.monthIdx + 1];
      return `
      <div class="request-card">
        <div class="request-info">
          <div class="request-name">📩 ${req.name}</div>
          <div class="request-detail">Quer avançar de <strong>${curr?.emoji} ${curr?.name}</strong> para <strong>${next?.emoji} ${next?.name}</strong></div>
        </div>
        <div class="request-actions">
          <button class="req-approve-btn" onclick="approveRequest('${email}',${req.monthIdx})">✓ Aprovar</button>
          <button class="req-deny-btn"    onclick="denyRequest('${email}')">✗ Recusar</button>
        </div>
      </div>`;
    }).join('');
    reqEl.innerHTML = `<div class="sec-title" style="color:var(--warn)">⏳ Solicitações Pendentes</div><div class="requests-list">${cards}</div>`;
  } else { reqEl.innerHTML = ''; }

  const tbody = document.getElementById('studentsBody');
  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="ico">🎵</div><p>Nenhum aluno cadastrado ainda.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = students.map((s, i) => {
    const mIdx = s.monthIdx ?? 0;
    const m    = MONTHS_DATA[mIdx];
    const hasPending = !!requests[s.email];
    const opts = MONTHS_DATA.map((mo,j) => `<option value="${j}" ${j===mIdx?'selected':''}>${mo.name} — ${mo.tag}</option>`).join('');
    return `
    <tr>
      <td><div class="student-name">${hasPending?'⏳ ':''}${s.name}</div><div class="student-email">${s.email}</div></td>
      <td>
        <span id="pw-${i}" style="font-size:.82rem;color:var(--muted)">${'•'.repeat(s.password?.length||6)}</span>
        <button onclick="togglePw(${i},'${s.email}')" style="background:none;border:none;cursor:pointer;font-size:.75rem;color:var(--gold3);font-family:var(--ff-body);margin-left:6px">ver</button>
      </td>
      <td><span class="badge badge--gold">${m.emoji} ${m.name}</span></td>
      <td><select class="month-select" id="sel-${i}">${opts}</select></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;padding:8px">
        <button class="save-row-btn" id="savebtn-${i}" onclick="saveMonth(${i},'${s.email}')">Salvar</button>
        <button class="save-row-btn" style="background:rgba(192,57,43,0.1);color:var(--danger)" onclick="removeStudent('${s.email}')">Remover</button>
      </td>
    </tr>`;
  }).join('');
}

// ── Ações do professor ────────────────────────
async function addStudent() {
  const name  = document.getElementById('newName').value.trim();
  const email = document.getElementById('newEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('newPass').value.trim();
  const mIdx  = parseInt(document.getElementById('newMonth').value);
  if (!name)                         { alert('Informe o nome.'); return; }
  if (!email || !email.includes('@')){ alert('Informe um email válido.'); return; }
  if (!pass || pass.length < 3)      { alert('Senha mínima de 3 caracteres.'); return; }
  if (await dbFindStudent(email))    { alert('Email já cadastrado.'); return; }
  await dbSaveStudent(email, { name, password: pass, monthIdx: mIdx });
  document.getElementById('newName').value  = '';
  document.getElementById('newEmail').value = '';
  document.getElementById('newPass').value  = '';
  document.getElementById('newMonth').value = '0';
  await refreshProfessorPage();
}

async function saveMonth(rowIdx, email) {
  const sel = document.getElementById(`sel-${rowIdx}`);
  const btn = document.getElementById(`savebtn-${rowIdx}`);
  if (!sel) return;
  await dbSaveStudent(email, { monthIdx: parseInt(sel.value) });
  await dbClearRequest(email);
  btn.textContent = '✓ Salvo!'; btn.classList.add('saved');
  setTimeout(async () => { btn.textContent='Salvar'; btn.classList.remove('saved'); await refreshProfessorPage(); }, 1500);
}

async function removeStudent(email) {
  if (!confirm(`Remover o aluno "${email}"?`)) return;
  await dbDeleteStudent(email); await dbClearRequest(email);
  await refreshProfessorPage();
}

async function approveRequest(email, currentMIdx) {
  const next = currentMIdx + 1;
  if (next >= MONTHS_DATA.length) return;
  await dbSaveStudent(email, { monthIdx: next }); await dbClearRequest(email);
  await refreshProfessorPage();
}

async function denyRequest(email) {
  await dbClearRequest(email); await refreshProfessorPage();
}

const _pwVisible = {};
async function togglePw(rowIdx, email) {
  const student = await dbFindStudent(email);
  const el = document.getElementById(`pw-${rowIdx}`);
  if (!el || !student) return;
  _pwVisible[rowIdx] = !_pwVisible[rowIdx];
  el.textContent = _pwVisible[rowIdx] ? (student.password || '—') : '•'.repeat(student.password?.length || 6);
}
