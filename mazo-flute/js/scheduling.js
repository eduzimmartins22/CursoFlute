/* =============================================
   scheduling.js — Sistema de Agendamento Mazo Flute
   Aluno: agendar aula (1/semana, até 1 ano)
   Professor: painel completo com tabela e gráficos
   ============================================= */

// ── Constantes ────────────────────────────────
// Início: segunda-feira da semana atual (para sempre mostrar a semana de hoje em diante)
// Fim: 1 ano a partir do início
function _getSchedStart() {
  const today = new Date(); today.setHours(0,0,0,0);
  const dow   = today.getDay();
  const mon   = new Date(today);
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return mon;
}
const SCHED_START = _getSchedStart();
const SCHED_END   = (() => { const d = new Date(SCHED_START); d.setFullYear(d.getFullYear() + 1); return d; })();

const PLAN_DATA = {
  trial:    { label: 'Aula Teste',  price: 50,  sub: '',      desc: '1 aula experimental',    aulas: '1 aula' },
  single:   { label: 'Unitário',   price: 80,   sub: '/mês',  desc: '1 aula por mês',          aulas: '1 aula/mês' },
  biweekly: { label: 'Quinzenal',  price: 160, sub: '/mês',  desc: '2 aulas por mês',         aulas: '2 aulas/mês' },
  monthly:  { label: 'Mensal',     price: 200, sub: '/mês',  desc: '4 aulas por mês',         aulas: '4 aulas/mês' },
  annual:   { label: 'Anual',      price: 175, sub: '/mês',  desc: '4 aulas/mês · pag. anual',aulas: '4 aulas/mês' },
};

const HORARIOS = ['08:00','10:00','14:00','16:00','18:00','19:00','20:00'];
const DIAS     = ['Seg','Ter','Qua','Qui','Sex'];

// ── Estado ────────────────────────────────────
let _weekOffset   = 0;
let _pickedSlot   = null;
let _pickedPlan   = null;
let _allBookings  = [];

// ═══════════════════════════════════════════════════════════
//  ALUNO — página de agendamento
// ═══════════════════════════════════════════════════════════

function tplAgendamento() {
  const endStr = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }); })();
  return `
  <div id="page-agendar" class="page">

    <div class="hero-block">
      <h1>📅 Agendar Aula</h1>
      <p>Escolha seu plano e reserve um horário. Máximo de <strong>1 aula por semana</strong>.<br>
         Agendamentos disponíveis até <strong>${endStr}</strong>.</p>
    </div>

    <!-- Planos -->
    <div class="sec-title">🎵 Escolha o Plano</div>
    <div class="sched-plans-grid">${_renderPlanCards()}</div>

    <!-- Calendário (oculto até escolher plano) -->
    <div id="schedCalSection" style="display:none">
      <div class="sec-title">📆 Horário Disponível</div>
      <div class="cbox">
        <div class="sched-info-bar">
          <div class="sched-plan-label" id="schedPlanLabel"></div>
          <div class="sched-limit-note">⚠️ Curso encerra em ${endStr}</div>
        </div>
        <div class="sched-week-nav">
          <button class="sched-nav-btn" id="schedPrev" onclick="schedPrev()">‹</button>
          <span class="sched-week-label" id="schedWeekLabel"></span>
          <button class="sched-nav-btn" id="schedNext" onclick="schedNext()">›</button>
        </div>
        <div id="schedCalendar" class="sched-cal-grid"></div>
      </div>

      <!-- Resumo -->
      <div id="schedSummary" class="sched-summary-box" style="display:none">
        <div class="sched-summary-inner">
          <div class="sched-sum-rows" id="schedSumRows"></div>
          <button class="sched-confirm-btn" id="schedConfirmBtn" onclick="schedConfirm()">✓ Confirmar Agendamento</button>
        </div>
      </div>
    </div>

    <!-- Minhas aulas -->
    <div class="sec-title" style="margin-top:2.5rem">🗓️ Minhas Aulas</div>
    <div id="myBookingsList" class="sched-bookings-list">
      <div class="empty-state"><div class="ico">📅</div><p>Carregando...</p></div>
    </div>
  </div>`;
}

function _renderPlanCards() {
  const plans = [
    { id:'trial',    badge:'',           featured:false },
    { id:'single',   badge:'',           featured:false },
    { id:'biweekly', badge:'Mais popular',featured:true  },
    { id:'monthly',  badge:'',           featured:false },
    { id:'annual',   badge:'Melhor valor',featured:false },
  ];
  return plans.map(p => {
    const d = PLAN_DATA[p.id];
    return `
    <div class="sched-plan-card${p.featured?' featured':''}" id="planCard-${p.id}" onclick="schedPickPlan('${p.id}',this)">
      ${p.badge ? `<div class="plan-badge">${p.badge}</div>` : ''}
      <div class="plan-name">${d.label}</div>
      <div class="plan-price">R$${d.price}<span>${d.sub}</span></div>
      <div class="plan-desc">${d.desc}</div>
      <button class="plan-select-btn">Selecionar</button>
    </div>`;
  }).join('');
}

// ── Selecionar plano ──────────────────────────
function schedPickPlan(planId, card) {
  document.querySelectorAll('.sched-plan-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  _pickedPlan = planId;
  _pickedSlot = null;
  _weekOffset = 0;
  document.getElementById('schedPlanLabel').textContent = `Plano selecionado: ${PLAN_DATA[planId].label} — R$${PLAN_DATA[planId].price}${PLAN_DATA[planId].sub}`;
  document.getElementById('schedCalSection').style.display = 'block';
  document.getElementById('schedSummary').style.display    = 'none';
  renderSchedCal();
  document.getElementById('schedCalSection').scrollIntoView({ behavior:'smooth', block:'start' });
}

// ── Navegação semana ──────────────────────────
function schedPrev() { _weekOffset--; _pickedSlot = null; renderSchedCal(); }
function schedNext() { _weekOffset++; _pickedSlot = null; renderSchedCal(); }

function _getWeekDates(off) {
  const today = new Date();
  const dow   = today.getDay();
  const mon   = new Date(today);
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + off * 7);
  return Array.from({ length:5 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate()+i); return d; });
}

function _fmtDate(d) { return d.toISOString().split('T')[0]; }
function _addHour(t)  { const [h,m] = t.split(':').map(Number); return `${String((h+1)%24).padStart(2,'0')}:${m.toString().padStart(2,'0')}`; }

async function renderSchedCal() {
  const dates  = _getWeekDates(_weekOffset);
  const start  = _fmtDate(dates[0]);
  const end    = _fmtDate(dates[4]);
  const today  = new Date(); today.setHours(0,0,0,0);

  // Bloquear navegação: não ir antes da semana atual, nem além de 1 ano
  document.getElementById('schedPrev').disabled = _weekOffset <= 0;
  document.getElementById('schedNext').disabled = _weekOffset >= 52;

  document.getElementById('schedWeekLabel').textContent =
    `${dates[0].toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} — ${dates[4].toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}`;

  const cal = document.getElementById('schedCalendar');
  cal.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:.75rem;font-size:.85rem">Carregando horários...</div>`;

  // Busca agendamentos da semana (filtro de status no cliente para evitar índice composto)
  // IMPORTANTE: bookedKeys = horários já ocupados por qualquer aluno
  // Aluno só pode ter 1 aula por semana, mas professor pode ter múltiplas no mesmo dia
  let bookedKeys = new Set();
  let myDates    = new Set();
  try {
    const snap = await db.collection('bookings')
      .where('slotDate','>=',start)
      .where('slotDate','<=',end)
      .get();
    snap.forEach(doc => {
      const b = doc.data();
      if (b.status === 'canceled') return;
      bookedKeys.add(`${b.slotDate}|${b.slotTime}`);
      if (b.studentEmail === currentUser.email) myDates.add(b.slotDate);
    });
  } catch(e) { console.warn(e); }

  cal.innerHTML = dates.map((date, idx) => {
    const ds      = _fmtDate(date);
    const isPast  = date < today;   // dias que já passaram não são clicáveis
    const isAfter = _weekOffset >= 52; // bloqueia semanas além de 1 ano
    const userHas = myDates.has(ds);

    const slots = HORARIOS.map(time => {
      const key  = `${ds}|${time}`;
      const isMe = _pickedSlot && _pickedSlot.key === key;

      if (isPast || isAfter) return `<div class="sched-slot slot-past">${time}</div>`;
      if (isMe)   return `<div class="sched-slot slot-selected" onclick="schedUnpick()">${time}</div>`;
      if (userHas)return `<div class="sched-slot slot-mine">✓ Sua aula</div>`;
      if (bookedKeys.has(key)) return `<div class="sched-slot slot-booked">${time}</div>`;
      return `<div class="sched-slot slot-avail" onclick="schedPickSlot('${ds}','${time}','${DIAS[idx]} ${date.getDate()}')">${time}</div>`;
    }).join('');

    return `<div class="sched-day-col">
      <div class="sched-day-header">${DIAS[idx]}<br><small>${date.getDate()}</small></div>
      ${slots}
    </div>`;
  }).join('');
}

function schedPickSlot(date, time, dayLabel) {
  _pickedSlot = { key:`${date}|${time}`, date, time, dayLabel };
  const d = new Date(date+'T12:00:00');
  const dateStr = d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
  document.getElementById('schedSumRows').innerHTML = `
    <div class="sched-sum-row">📅 <span>Data:</span><strong>${dateStr}</strong></div>
    <div class="sched-sum-row">⏰ <span>Horário:</span><strong>${time} — ${_addHour(time)}</strong></div>
    <div class="sched-sum-row">🎵 <span>Plano:</span><strong>${PLAN_DATA[_pickedPlan].label} — R$${PLAN_DATA[_pickedPlan].price}${PLAN_DATA[_pickedPlan].sub}</strong></div>`;
  document.getElementById('schedSummary').style.display = 'block';
  document.getElementById('schedSummary').scrollIntoView({ behavior:'smooth', block:'nearest' });
  renderSchedCal();
}

function schedUnpick() { _pickedSlot = null; document.getElementById('schedSummary').style.display='none'; renderSchedCal(); }

// ── Confirmar agendamento ─────────────────────
async function schedConfirm() {
  if (!_pickedSlot || !_pickedPlan) return;
  const btn = document.getElementById('schedConfirmBtn');
  btn.disabled = true; btn.textContent = 'Agendando...';

  try {
    // Verifica 1 aula por semana
    const dates = _getWeekDates(_weekOffset);
    // Busca sem filtro de status — filtra no cliente
    const snap  = await db.collection('bookings')
      .where('studentEmail','==',currentUser.email)
      .where('slotDate','>=',_fmtDate(dates[0]))
      .where('slotDate','<=',_fmtDate(dates[4]))
      .get();
    const hasActive = snap.docs.some(d => d.data().status !== 'canceled');
    if (hasActive) {
      alert('Você já tem uma aula nesta semana. Máximo 1 aula por semana.');
      btn.disabled = false; btn.textContent = '✓ Confirmar Agendamento';
      return;
    }

    const bookingData = {
      studentEmail: currentUser.email,
      studentName:  currentUser.name,
      plan:         _pickedPlan,
      price:        PLAN_DATA[_pickedPlan].price,
      slotDate:     _pickedSlot.date,
      slotTime:     _pickedSlot.time,
      status:       'confirmed',
      createdAt:    new Date().toISOString(),
      role:         currentUser.role || 'student',
    };

    const docRef = await db.collection('bookings').add(bookingData);
    
    // CRIAR NOTIFICAÇÃO PARA O PROFESSOR
    if (typeof createNotification === 'function') {
      const fullBookingData = { id: docRef.id, ...bookingData };
      await createNotification(fullBookingData);
    }

    schedToast('✓ Aula agendada com sucesso!');
    _pickedSlot = null; _pickedPlan = null;
    document.querySelectorAll('.sched-plan-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('schedCalSection').style.display = 'none';
    document.getElementById('schedSummary').style.display    = 'none';
    await loadMyBookings();
    document.getElementById('myBookingsList').scrollIntoView({ behavior:'smooth' });
  } catch(e) {
    console.error(e);
    alert('Erro ao agendar. Verifique sua conexão.');
  } finally {
    btn.disabled = false; btn.textContent = '✓ Confirmar Agendamento';
  }
}

// ── Minhas aulas ──────────────────────────────
async function loadMyBookings() {
  const el = document.getElementById('myBookingsList');
  if (!el) return;
  el.innerHTML = `<div class="empty-state"><div class="ico">⏳</div><p>Carregando...</p></div>`;
  try {
    // Sem orderBy para evitar índice composto — ordenamos no cliente
    const snap = await db.collection('bookings')
      .where('studentEmail','==',currentUser.email)
      .get();
    if (snap.empty) {
      el.innerHTML = `<div class="empty-state"><div class="ico">📅</div><p>Nenhuma aula agendada ainda.</p></div>`;
      return;
    }
    const today = _fmtDate(new Date());
    const sorted = snap.docs.slice().sort((a,b) => b.data().slotDate.localeCompare(a.data().slotDate));
    el.innerHTML = sorted.map(doc => {
      const b      = doc.data();
      const d      = new Date(b.slotDate+'T12:00:00');
      const dateStr = d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
      const isPast  = b.slotDate < today;
      const sMap    = { confirmed:'Confirmada', canceled:'Cancelada', pending:'Pendente' };
      const sCls    = { confirmed:'s-ok', canceled:'s-cancel', pending:'s-warn' };
      return `
      <div class="sched-booking-card">
        <div>
          <div class="sched-booking-date">${dateStr} · ${b.slotTime}</div>
          <div class="sched-booking-plan">${PLAN_DATA[b.plan]?.label || b.plan} — R$${b.price}</div>
        </div>
        <div class="sched-booking-right">
          <span class="sched-status ${sCls[b.status]||''}">${sMap[b.status]||b.status}</span>
          ${b.status==='confirmed' && !isPast
            ? `<button class="sched-cancel-btn" onclick="cancelMyBooking('${doc.id}')">Cancelar</button>`
            : ''}
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    el.innerHTML = `<div class="empty-state"><p>Erro ao carregar aulas.</p></div>`;
    console.error(e);
  }
}

async function cancelMyBooking(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  await db.collection('bookings').doc(id).update({ status:'canceled' });
  schedToast('Agendamento cancelado.');
  await loadMyBookings();
}

function schedToast(msg) {
  const t = document.getElementById('schedToast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}


// ═══════════════════════════════════════════════════════════
//  PROFESSOR — painel de agendamentos (aba dentro do painel)
// ═══════════════════════════════════════════════════════════

function tplProfAgendamentos() {
  return `
  <div id="page-prof-agendamentos" class="page">
    <div class="hero-block">
      <h1>📊 Agendamentos</h1>
      <p>Controle completo de todas as aulas — tabela, gráficos e filtros.</p>
    </div>

    <!-- Stats -->
    <div class="prof-sched-stats" id="profSchedStats"></div>

    <!-- Gráficos -->
    <div class="sec-title">📈 Análise Visual</div>
    <div class="sched-charts-grid">
      <div class="chart-card"><h4>Aulas por Semana</h4><canvas id="chartWeekly"  height="200"></canvas></div>
      <div class="chart-card"><h4>Planos Mais Usados</h4><canvas id="chartPlans"   height="200"></canvas></div>
      <div class="chart-card"><h4>Status Geral</h4><canvas id="chartStatus"  height="200"></canvas></div>
      <div class="chart-card"><h4>Aulas por Aluno</h4><canvas id="chartByStud" height="200"></canvas></div>
    </div>

    <!-- Tabela -->
    <div class="sec-title">🗓️ Todos os Agendamentos</div>
    <div class="cbox" style="padding:0;overflow:hidden">
      <div class="sched-toolbar">
        <div class="sched-filters">
          <select class="sched-filter" id="fStatus"  onchange="filterTable()">
            <option value="">Todos os status</option>
            <option value="confirmed">Confirmadas</option>
            <option value="canceled">Canceladas</option>
          </select>
          <select class="sched-filter" id="fPlan"    onchange="filterTable()">
            <option value="">Todos os planos</option>
            <option value="trial">Aula Teste</option>
            <option value="single">Unitário</option>
            <option value="biweekly">Quinzenal</option>
            <option value="monthly">Mensal</option>
            <option value="annual">Anual</option>
          </select>
          <select class="sched-filter" id="fStudent" onchange="filterTable()">
            <option value="">Todos os alunos</option>
          </select>
          <select class="sched-filter" id="fRole" onchange="filterTable()">
            <option value="">Alunos + Visitantes</option>
            <option value="student">Só Alunos</option>
            <option value="visitor">Só Visitantes</option>
          </select>
        </div>
        <span class="sched-count" id="tableCount"></span>
      </div>
      <div style="overflow-x:auto">
        <table class="students-table" id="bookingsTable">
          <thead><tr>
            <th>Nome</th><th>Data</th><th>Horário</th>
            <th>Plano</th><th>Valor</th><th>Tipo</th><th>Status</th><th>Ações</th>
          </tr></thead>
          <tbody id="bookingsBody"></tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ── Carregar dados do professor ───────────────
async function loadProfAgendamentos() {
  try {
    const snap = await db.collection('bookings').orderBy('slotDate','desc').get();
    _allBookings = snap.docs.map(doc => ({ id:doc.id, ...doc.data() }));
    _renderProfStats(_allBookings);
    _renderCharts(_allBookings);
    _populateStudentFilter(_allBookings);
    filterTable();
  } catch(e) { console.error('Erro ao carregar agendamentos', e); }
}

function _renderProfStats(bookings) {
  const conf    = bookings.filter(b => b.status==='confirmed');
  const canc    = bookings.filter(b => b.status==='canceled');
  const today   = _fmtDate(new Date());
  const upcoming= conf.filter(b => b.slotDate >= today);
  const rev     = conf.reduce((s,b) => s+(b.price||0), 0);
  const studs    = new Set(bookings.filter(b=>(b.role||'student')==='student').map(b => b.studentEmail)).size;
  const visitors = bookings.filter(b => b.role === 'visitor').length;

  document.getElementById('profSchedStats').innerHTML = `
    <div class="prof-stat"><div class="prof-stat-num">${bookings.length}</div><div class="prof-stat-label">Total de Aulas</div></div>
    <div class="prof-stat"><div class="prof-stat-num">${conf.length}</div><div class="prof-stat-label">Confirmadas</div></div>
    <div class="prof-stat"><div class="prof-stat-num">${upcoming.length}</div><div class="prof-stat-label">Próximas</div></div>
    <div class="prof-stat"><div class="prof-stat-num">${canc.length}</div><div class="prof-stat-label">Canceladas</div></div>
    <div class="prof-stat"><div class="prof-stat-num">${studs}</div><div class="prof-stat-label">Alunos</div></div>
    <div class="prof-stat" style="border-color:rgba(201,169,110,0.4)"><div class="prof-stat-num" style="color:var(--gold2)">${visitors}</div><div class="prof-stat-label">Visitantes</div></div>
    <div class="prof-stat" style="border-color:var(--gold)"><div class="prof-stat-num" style="color:var(--gold3)">R$${rev}</div><div class="prof-stat-label">Receita Total</div></div>`;
}

// ── Gráficos ──────────────────────────────────
const _charts = {};
function _chart(id, type, data, extraOpts={}) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (_charts[id]) _charts[id].destroy();
  _charts[id] = new Chart(ctx, {
    type, data,
    options: {
      responsive: true,
      plugins: { legend:{ labels:{ font:{ family:"'DM Sans',sans-serif", size:11 } } } },
      scales: (type==='bar'||type==='line') ? {
        y:{ ticks:{ font:{family:"'DM Sans',sans-serif",size:11} }, grid:{color:'rgba(0,0,0,.05)'} },
        x:{ ticks:{ font:{family:"'DM Sans',sans-serif",size:10} }, grid:{display:false} },
      } : {},
      ...extraOpts,
    },
  });
}

function _weekKey(d) {
  const mon = new Date(d);
  const dow = mon.getDay();
  mon.setDate(mon.getDate() - (dow===0?6:dow-1));
  return mon.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
}

function _renderCharts(bookings) {
  const GOLD   = '#c9a96e', NAVY = '#1d3454', GREEN='#3d8b6e', RED='#c0392b', MID='#6b6880';

  // 1 — Aulas por semana (8 semanas)
  const weekMap = {};
  for (let i=7; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i*7);
    const k = _weekKey(d); weekMap[k] = { label:k, n:0 };
  }
  bookings.filter(b=>b.status==='confirmed').forEach(b=>{
    const k = _weekKey(new Date(b.slotDate+'T12:00:00'));
    if (weekMap[k]) weekMap[k].n++;
  });
  const wd = Object.values(weekMap);
  _chart('chartWeekly','bar',{
    labels: wd.map(w=>w.label),
    datasets:[{ label:'Aulas', data:wd.map(w=>w.n), backgroundColor:GOLD, borderRadius:6 }]
  });

  // 2 — Planos
  const planCount = {};
  bookings.forEach(b=>{ planCount[b.plan]=(planCount[b.plan]||0)+1; });
  _chart('chartPlans','doughnut',{
    labels: Object.keys(planCount).map(k=>PLAN_DATA[k]?.label||k),
    datasets:[{ data:Object.values(planCount),
      backgroundColor:[GOLD,NAVY,GREEN,'#8b6e3d',MID], borderWidth:2, borderColor:'#fff' }]
  });

  // 3 — Status
  const conf=bookings.filter(b=>b.status==='confirmed').length;
  const canc=bookings.filter(b=>b.status==='canceled').length;
  const pend=bookings.filter(b=>!b.status||b.status==='pending').length;
  _chart('chartStatus','pie',{
    labels:['Confirmadas','Canceladas','Pendentes'],
    datasets:[{ data:[conf,canc,pend], backgroundColor:[GREEN,RED,GOLD], borderWidth:2, borderColor:'#fff' }]
  });

  // 4 — Por aluno (top 8)
  const byStud = {};
  bookings.filter(b=>b.status==='confirmed').forEach(b=>{
    const n = b.studentName||b.studentEmail;
    byStud[n]=(byStud[n]||0)+1;
  });
  const sorted = Object.entries(byStud).sort((a,b)=>b[1]-a[1]).slice(0,8);
  _chart('chartByStud','bar',{
    labels:sorted.map(s=>s[0]),
    datasets:[{ label:'Aulas', data:sorted.map(s=>s[1]), backgroundColor:NAVY, borderRadius:6 }]
  },{ indexAxis:'y' });
}

// ── Filtros e tabela ──────────────────────────
function _populateStudentFilter(bookings) {
  const sel = document.getElementById('fStudent');
  if (!sel) return;
  const emails = [...new Set(bookings.map(b=>b.studentEmail))];
  emails.forEach(email=>{
    const name = bookings.find(b=>b.studentEmail===email)?.studentName||email;
    const opt  = document.createElement('option');
    opt.value = email; opt.textContent = name; sel.appendChild(opt);
  });
}

function filterTable() {
  const st   = document.getElementById('fStatus')?.value  || '';
  const pl   = document.getElementById('fPlan')?.value    || '';
  const eml  = document.getElementById('fStudent')?.value || '';
  const role = document.getElementById('fRole')?.value    || '';

  const filtered = _allBookings.filter(b =>
    (!st   || b.status       === st ) &&
    (!pl   || b.plan         === pl ) &&
    (!eml  || b.studentEmail === eml) &&
    (!role || (b.role||'student')    === role)
  );

  const visCount  = filtered.filter(b=>(b.role||'student')==='visitor').length;
  document.getElementById('tableCount').textContent = `${filtered.length} aulas${visCount>0?' ('+visCount+' visitantes)':''}`;

  const tbody = document.getElementById('bookingsBody');
  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="ico">📅</div><p>Nenhum agendamento encontrado.</p></div></td></tr>`;
    return;
  }

  const today  = _fmtDate(new Date());
  const sCls   = { confirmed:'badge--success', canceled:'badge', pending:'badge--warn' };
  const sLabel = { confirmed:'✓ Confirmada', canceled:'✗ Cancelada', pending:'⏳ Pendente' };

  tbody.innerHTML = filtered.map(b => {
    const d       = new Date(b.slotDate+'T12:00:00');
    const dateStr = d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
    const isPast  = b.slotDate < today;
    const isVisitor = (b.role||'student') === 'visitor';
    // Tooltip com dados extras do visitante
    const _exp = parseInt(b.experience) || 0;
    const visitorDetail = isVisitor ? `
      📞 ${b.phone||'—'} &nbsp;|&nbsp; CPF: ${b.cpf||'—'} &nbsp;|&nbsp;
      📍 ${(b.city||'?')}/${(b.state||'?')} &nbsp;|&nbsp;
      🎵 ${b.playsFlute ? 'Toca flauta ('+_exp+' ano'+(_exp!==1?'s':'')+')'  : 'Nunca tocou'}
    ` : '';
    return `
    <tr${isVisitor?' style="background:rgba(201,169,110,0.04)"':''}>
      <td>
        <div class="student-name">${b.studentName||'—'}${isVisitor?' <span class="visitor-tag">Visitante</span>':''}</div>
        <div class="student-email">${b.studentEmail||''}</div>
        ${isVisitor?`<div class="visitor-detail">${visitorDetail}</div>`:''}
      </td>
      <td style="font-size:.85rem">${dateStr}</td>
      <td style="font-weight:600">${b.slotTime}</td>
      <td><span class="badge badge--gold" style="font-size:.7rem">${PLAN_DATA[b.plan]?.label||b.plan}</span></td>
      <td style="font-weight:600;color:var(--gold3)">R$${b.price||0}</td>
      <td><span class="badge ${isVisitor?'badge--visitor':'badge--student'}" style="font-size:.7rem">${isVisitor?'👤 Visitante':'🎵 Aluno'}</span></td>
      <td><span class="badge ${sCls[b.status]||'badge'}" style="font-size:.7rem">${sLabel[b.status]||b.status}</span></td>
      <td style="display:flex;gap:6px;padding:8px;flex-wrap:wrap">
        ${b.status==='confirmed'&&!isPast
          ? `<button class="save-row-btn" style="background:rgba(192,57,43,.1);color:var(--danger)" onclick="profCancelBooking('${b.id}')">Cancelar</button>`
          : ''}
        ${b.status==='canceled'
          ? `<button class="save-row-btn" onclick="profRestoreBooking('${b.id}')">Restaurar</button>`
          : ''}
      </td>
    </tr>`;
  }).join('');
}

async function profCancelBooking(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  await db.collection('bookings').doc(id).update({ status:'canceled' });
  await loadProfAgendamentos();
}
async function profRestoreBooking(id) {
  await db.collection('bookings').doc(id).update({ status:'confirmed' });
  await loadProfAgendamentos();
}
