/* =============================================
   notifications.js — Notificações + WhatsApp
   WhatsApp via CallMeBot (sem backend necessário)
   
   CONFIGURAÇÃO (faça 1 vez):
   1. No WhatsApp, envie a mensagem abaixo para +34 644 10 30 44:
      "I allow callmebot to send me messages"
   2. Eles vão responder com seu CALLMEBOT_API_KEY
   3. Cole a chave recebida em CALLMEBOT_API_KEY abaixo
   ============================================= */

const CALLMEBOT_PHONE   = '5527997475627';   // Seu número (já preenchido)
const CALLMEBOT_API_KEY = '';                 // ← Cole aqui a chave recebida pelo WhatsApp

// ─────────────────────────────────────────────
// Listener em tempo real (Firestore onSnapshot)
// Atualiza o badge automaticamente sem reload
// ─────────────────────────────────────────────
let _notifUnsubscribe = null;
let _notifCache = [];

function _startNotifListener() {
  if (_notifUnsubscribe) return;
  try {
    _notifUnsubscribe = db.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot(snap => {
        _notifCache = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
        const unread = _notifCache.filter(n => !n.read).length;
        _setBadge(unread);
        // Re-renderiza painel se estiver visível
        const page = document.getElementById('page-prof-notificacoes');
        if (page && page.classList.contains('active')) renderNotificationPanel();
      }, err => console.warn('Notif listener:', err));
  } catch (e) {
    console.warn('onSnapshot não disponível:', e);
  }
}

function _setBadge(count) {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent  = count > 99 ? '99+' : String(count);
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

// ─────────────────────────────────────────────
// CRIAR NOTIFICAÇÃO — chamado por scheduling.js
// e visitor.js sempre que uma aula é marcada
// ─────────────────────────────────────────────
async function createNotification(bookingData) {
  const notif = {
    studentName:  bookingData.studentName  || '—',
    studentEmail: bookingData.studentEmail || '—',
    phone:        bookingData.phone        || '',
    cpf:          bookingData.cpf          || '',
    city:         bookingData.city         || '',
    state:        bookingData.state        || '',
    plan:         bookingData.plan         || '',
    price:        bookingData.price        || 0,
    slotDate:     bookingData.slotDate     || '',
    slotTime:     bookingData.slotTime     || '',
    role:         bookingData.role         || 'student',
    playsFlute:   bookingData.playsFlute   || false,
    experience:   bookingData.experience   || 0,
    read:         false,
    whatsappSent: false,
    createdAt:    new Date().toISOString(),
  };

  // Salva no Firestore
  try {
    await db.collection('notifications').add(notif);
  } catch (e) {
    console.error('Erro ao salvar notificação:', e);
  }

  // Envia WhatsApp (não bloqueia se falhar)
  _sendWhatsApp(notif);
}

// ─────────────────────────────────────────────
// WHATSAPP via CallMeBot
// ─────────────────────────────────────────────
async function _sendWhatsApp(notif) {
  if (!CALLMEBOT_API_KEY) {
    console.warn('WhatsApp: CALLMEBOT_API_KEY não configurado.');
    return;
  }

  const d       = new Date(notif.slotDate + 'T12:00:00');
  const dateStr = d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  const planLabel = (typeof PLAN_DATA !== 'undefined' && PLAN_DATA[notif.plan])
    ? PLAN_DATA[notif.plan].label : notif.plan;
  const isVisitor = notif.role === 'visitor';

  let msg = `🎵 NOVA AULA — Mazo Flute\n\n`;
  msg += `👤 ${notif.studentName}`;
  msg += isVisitor ? ` (Visitante)\n` : ` (Aluno)\n`;
  msg += `📅 ${dateStr}\n`;
  msg += `⏰ ${notif.slotTime}\n`;
  msg += `📧 ${notif.studentEmail}\n`;
  if (isVisitor && notif.phone) msg += `📞 ${notif.phone}\n`;
  if (isVisitor && notif.city)  msg += `📍 ${notif.city}/${notif.state}\n`;
  msg += `🎓 ${planLabel} — R$${notif.price}`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(msg)}&apikey=${CALLMEBOT_API_KEY}`;

  try {
    // CallMeBot não tem CORS — usa um <img> como workaround padrão
    const img = new Image();
    img.src   = url;
    img.onerror = img.onload = () => {};  // dispara e esquece
    console.log('✓ WhatsApp disparado via CallMeBot');
  } catch (e) {
    console.warn('WhatsApp falhou:', e);
  }
}

// ─────────────────────────────────────────────
// INICIALIZAR (chamado por professor.js)
// ─────────────────────────────────────────────
async function initNotifications() {
  _startNotifListener();
  // Renderiza painel se já estiver aberto
  const panel = document.getElementById('notificationPanel');
  if (panel && panel.closest('.page.active')) renderNotificationPanel();
}

// ─────────────────────────────────────────────
// RENDERIZAR PAINEL
// ─────────────────────────────────────────────
function renderNotificationPanel() {
  const panel = document.getElementById('notificationPanel');
  if (!panel) return;

  if (!_notifCache.length) {
    panel.innerHTML = `
      <div class="notif-toolbar">
        <span style="color:var(--muted);font-size:.85rem">Nenhuma notificação ainda.</span>
      </div>
      <div class="empty-state"><div class="ico">🔔</div><p>Quando alunos ou visitantes agendarem aulas, as notificações aparecem aqui.</p></div>`;
    return;
  }

  const unread = _notifCache.filter(n => !n.read).length;

  panel.innerHTML = `
    <div class="notif-toolbar">
      <span class="notif-count">${_notifCache.length} notificação(ões)${unread > 0 ? ` · <strong style="color:var(--gold3)">${unread} não lida(s)</strong>` : ''}</span>
      ${unread > 0 ? `<button class="notif-mark-all-btn" onclick="markAllNotifsRead()">✓ Marcar todas como lidas</button>` : ''}
    </div>
    <div class="notification-list">
      ${_notifCache.map(n => {
        const d       = new Date(n.slotDate + 'T12:00:00');
        const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
        const ts      = new Date(n.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const isV     = n.role === 'visitor';
        const planLbl = (typeof PLAN_DATA !== 'undefined' && PLAN_DATA[n.plan]) ? PLAN_DATA[n.plan].label : n.plan;
        const unreadCls = n.read ? '' : ' unread';

        return `
        <div class="notification-card${unreadCls}" id="notif-${n._docId}">
          ${!n.read ? '<div class="notification-dot"></div>' : ''}
          <div class="notification-header">
            <div class="notification-title">
              ${isV ? '👤' : '🎵'} <strong>${n.studentName}</strong>
              <span class="badge ${isV ? 'badge--visitor' : 'badge--student'}" style="font-size:.65rem;margin-left:4px">${isV ? 'Visitante' : 'Aluno'}</span>
            </div>
            <div class="notification-time">${ts}</div>
          </div>
          <div class="notification-content">
            <div class="notification-detail">📅 ${dateStr} &nbsp;·&nbsp; ⏰ ${n.slotTime}</div>
            <div class="notification-detail">📧 ${n.studentEmail}${isV && n.phone ? ` &nbsp;·&nbsp; 📞 ${n.phone}` : ''}</div>
            ${isV && n.city ? `<div class="notification-detail">📍 ${n.city}/${n.state}${n.playsFlute ? ` &nbsp;·&nbsp; 🎵 ${n.experience} ano(s) de flauta` : ' &nbsp;·&nbsp; 🎵 Iniciante'}</div>` : ''}
            <div class="notification-detail" style="color:var(--gold3);font-weight:600">🎓 ${planLbl} &nbsp;·&nbsp; 💰 R$${n.price}</div>
            ${n.whatsappSent ? `<div class="notification-detail" style="color:var(--success);font-size:.75rem">✓ WhatsApp enviado</div>` : ''}
          </div>
          <div class="notification-actions">
            ${!n.read ? `<button class="notification-action-btn" onclick="markOneNotifRead('${n._docId}')">Marcar como lida</button>` : `<span style="font-size:.75rem;color:var(--muted)">✓ Lida</span>`}
            <button class="notification-action-btn notif-delete-btn" onclick="deleteNotif('${n._docId}')">🗑 Apagar</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ─────────────────────────────────────────────
// AÇÕES
// ─────────────────────────────────────────────
async function markOneNotifRead(docId) {
  try {
    await db.collection('notifications').doc(docId).update({ read: true });
  } catch (e) { console.error(e); }
}

async function markAllNotifsRead() {
  try {
    const batch = db.batch();
    _notifCache.filter(n => !n.read).forEach(n => {
      batch.update(db.collection('notifications').doc(n._docId), { read: true });
    });
    await batch.commit();
  } catch (e) { console.error(e); }
}

async function deleteNotif(docId) {
  if (!confirm('Apagar esta notificação?')) return;
  try {
    await db.collection('notifications').doc(docId).delete();
  } catch (e) { console.error(e); }
}
