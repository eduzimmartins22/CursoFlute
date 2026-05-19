/* visitor.js — Agendamento de visitante (sem login)
   Salva em bookings com role:'visitor' para aparecer
   na mesma agenda do professor e dos alunos internos. */

let _vWeekOffset = 0;
let _vPickedSlot = null;

const V_PLAN_ID    = 'trial';      // visitante sempre agenda aula teste
const V_PLAN_LABEL = 'Aula Experimental (Visitante)';
const V_PLAN_PRICE = 50;

const _HORARIOS = ['08:00','10:00','14:00','16:00','18:00','19:00','20:00'];
const _DIAS     = ['Seg','Ter','Qua','Qui','Sex'];

// ── Máscara CPF ──────────────────────────────
function maskCpf(el) {
  let v = el.value.replace(/\D/g,'').substring(0,11);
  if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/,'$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/,'$1.$2.$3');
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/,'$1.$2');
  el.value = v;
}

// ── Validação e avanço para calendário ───────
async function visitorGoToCalendar() {
  const errEl = document.getElementById('visitorErr');
  errEl.textContent = '';

  const name  = document.getElementById('vName').value.trim();
  const email = document.getElementById('vEmail').value.trim().toLowerCase();
  const phone = document.getElementById('vPhone').value.trim();
  const cpf   = document.getElementById('vCpf').value.trim();
  const city  = document.getElementById('vCity').value.trim();
  const state = document.getElementById('vState').value.trim().toUpperCase();
  const plays = document.getElementById('vPlays').value;
  const exp   = plays === 'sim' ? (parseInt(document.getElementById('vExp').value) || 0) : 0;

  if (!name)                           { errEl.textContent = 'Informe seu nome.'; return; }
  if (!email || !email.includes('@'))  { errEl.textContent = 'Informe um email válido.'; return; }
  if (!phone)                          { errEl.textContent = 'Informe seu WhatsApp.'; return; }
  if (cpf.replace(/\D/g,'').length < 11) { errEl.textContent = 'CPF inválido.'; return; }
  if (!city)                           { errEl.textContent = 'Informe sua cidade.'; return; }
  if (!state || state.length < 2)      { errEl.textContent = 'Informe o estado (ex: SP).'; return; }

  document.getElementById('visitorStep1').style.display = 'none';
  document.getElementById('visitorStep2').style.display = 'block';
  _vWeekOffset = 0;
  _vPickedSlot = null;
  await vRenderCal();
}

function visitorGoBack() {
  document.getElementById('visitorStep2').style.display = 'none';
  document.getElementById('visitorStep1').style.display = 'block';
  _vPickedSlot = null;
  document.getElementById('vSchedSummary').style.display = 'none';
}

// ── Navegação de semana ───────────────────────
function vSchedPrev() { _vWeekOffset--; _vPickedSlot = null; document.getElementById('vSchedSummary').style.display='none'; vRenderCal(); }
function vSchedNext() { _vWeekOffset++; _vPickedSlot = null; document.getElementById('vSchedSummary').style.display='none'; vRenderCal(); }

function _vGetWeekDates(off) {
  const today = new Date();
  const dow   = today.getDay();
  const mon   = new Date(today);
  mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + off * 7);
  return Array.from({ length:5 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate()+i); return d; });
}

function _vFmtDate(d) { return d.toISOString().split('T')[0]; }
function _vAddHour(t) { const [h,m]=t.split(':').map(Number); return `${String((h+1)%24).padStart(2,'0')}:${m.toString().padStart(2,'0')}`; }

async function vRenderCal() {
  const dates = _vGetWeekDates(_vWeekOffset);
  const start = _vFmtDate(dates[0]);
  const end   = _vFmtDate(dates[4]);
  const today = new Date(); today.setHours(0,0,0,0);

  document.getElementById('vSchedPrev').disabled = _vWeekOffset <= 0;
  document.getElementById('vSchedNext').disabled = _vWeekOffset >= 52;

  document.getElementById('vSchedWeekLabel').textContent =
    `${dates[0].toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})} — ${dates[4].toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}`;

  const cal = document.getElementById('vSchedCalendar');
  cal.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:.75rem;font-size:.82rem">Carregando horários...</div>`;

  // Busca agendamentos da semana (filtro no cliente)
  let bookedKeys = new Set();
  try {
    const snap = await db.collection('bookings')
      .where('slotDate','>=',start)
      .where('slotDate','<=',end)
      .get();
    snap.forEach(doc => {
      const b = doc.data();
      if (b.status !== 'canceled') bookedKeys.add(`${b.slotDate}|${b.slotTime}`);
    });
  } catch(e) { console.warn(e); }

  cal.innerHTML = dates.map((date, idx) => {
    const ds     = _vFmtDate(date);
    const isPast = date < today;

    const slots = _HORARIOS.map(time => {
      const key    = `${ds}|${time}`;
      const isMe   = _vPickedSlot && _vPickedSlot.key === key;
      const booked = bookedKeys.has(key);

      if (isPast)  return `<div class="sched-slot slot-past">${time}</div>`;
      if (isMe)    return `<div class="sched-slot slot-selected" onclick="vUnpick()">${time}</div>`;
      if (booked)  return `<div class="sched-slot slot-booked">${time}</div>`;
      return `<div class="sched-slot slot-avail" onclick="vPickSlot('${ds}','${time}','${_DIAS[idx]} ${date.getDate()}')">${time}</div>`;
    }).join('');

    return `<div class="sched-day-col">
      <div class="sched-day-header">${_DIAS[idx]}<br><small>${date.getDate()}</small></div>
      ${slots}
    </div>`;
  }).join('');
}

function vPickSlot(date, time, dayLabel) {
  _vPickedSlot = { key:`${date}|${time}`, date, time, dayLabel };
  vRenderCal();
  const d       = new Date(date+'T12:00:00');
  const dateStr = d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
  document.getElementById('vSchedSumInfo').innerHTML = `
    <div class="sched-sum-row">📅 <span>Data:</span><strong>${dateStr}</strong></div>
    <div class="sched-sum-row">⏰ <span>Horário:</span><strong>${time} — ${_vAddHour(time)}</strong></div>
    <div class="sched-sum-row">🎵 <span>Tipo:</span><strong>${V_PLAN_LABEL}</strong></div>`;
  document.getElementById('vSchedSummary').style.display = 'block';
  document.getElementById('vSchedSummary').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function vUnpick() {
  _vPickedSlot = null;
  document.getElementById('vSchedSummary').style.display = 'none';
  vRenderCal();
}

// ── Confirmar agendamento de visitante ────────
async function visitorConfirm() {
  if (!_vPickedSlot) return;
  const btn    = document.getElementById('vConfirmBtn');
  const errEl  = document.getElementById('visitorCalErr');
  errEl.textContent = '';
  btn.disabled = true; btn.textContent = 'Agendando...';

  const name  = document.getElementById('vName').value.trim();
  const email = document.getElementById('vEmail').value.trim().toLowerCase();
  const phone = document.getElementById('vPhone').value.trim();
  const cpf   = document.getElementById('vCpf').value.trim();
  const city  = document.getElementById('vCity').value.trim();
  const state = document.getElementById('vState').value.trim().toUpperCase();
  const plays = document.getElementById('vPlays').value;
  const exp   = plays === 'sim' ? (parseInt(document.getElementById('vExp').value) || 0) : 0;

  try {
    // Verifica se esse email visitante já tem aula nessa semana
    const dates = _vGetWeekDates(_vWeekOffset);
    const snap  = await db.collection('bookings')
      .where('studentEmail','==',email)
      .where('slotDate','>=',_vFmtDate(dates[0]))
      .where('slotDate','<=',_vFmtDate(dates[4]))
      .get();
    const hasActive = snap.docs.some(d => d.data().status !== 'canceled');
    if (hasActive) {
      errEl.textContent = 'Este email já tem uma aula nesta semana.';
      btn.disabled = false; btn.textContent = '✓ Confirmar Aula Experimental';
      return;
    }

    await db.collection('bookings').add({
      studentEmail: email,
      studentName:  name,
      phone,
      cpf,
      city,
      state,
      playsFlute:   plays === 'sim',
      experience:   exp,
      plan:         V_PLAN_ID,
      price:        V_PLAN_PRICE,
      slotDate:     _vPickedSlot.date,
      slotTime:     _vPickedSlot.time,
      status:       'confirmed',
      role:         'visitor',          // marca como visitante
      createdAt:    new Date().toISOString(),
    });

    // Sucesso
    const d       = new Date(_vPickedSlot.date+'T12:00:00');
    const dateStr = d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    document.getElementById('visitorSuccessMsg').textContent =
      `${name}, sua aula experimental foi marcada para ${dateStr} às ${_vPickedSlot.time}. Entraremos em contato pelo email ${email} para confirmar.`;

    document.getElementById('visitorStep2').style.display = 'none';
    document.getElementById('visitorStep3').style.display = 'block';

  } catch(e) {
    console.error(e);
    errEl.textContent = 'Erro ao agendar. Verifique sua conexão.';
  } finally {
    btn.disabled = false; btn.textContent = '✓ Confirmar Aula Experimental';
  }
}

// ── Reset formulário ──────────────────────────
function visitorReset() {
  _vPickedSlot = null; _vWeekOffset = 0;
  ['vName','vEmail','vPhone','vCpf','vCity','vState','vExp'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('vPlays').value = 'nao';
  document.getElementById('vExpField').style.display = 'none';
  document.getElementById('visitorErr').textContent = '';
  document.getElementById('visitorCalErr').textContent = '';
  document.getElementById('visitorStep1').style.display = 'block';
  document.getElementById('visitorStep2').style.display = 'none';
  document.getElementById('visitorStep3').style.display = 'none';
  document.getElementById('vSchedSummary').style.display = 'none';
}
