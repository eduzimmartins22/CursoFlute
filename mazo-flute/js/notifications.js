/* notifications.js — Sistema de notificações e integração WhatsApp
   - Envia notificações para o professor via WhatsApp quando nova aula é marcada
   - Mostra aviso no painel do professor com dados do aluno/visitante
   - Suporta Twilio API (você precisa configurar as credenciais no backend)
*/

// ── Configuração WhatsApp ─────────────────────
const PROF_WHATSAPP_NUMBER = '5527997475627'; // Seu número de WhatsApp
const WHATSAPP_WEBHOOK_URL = 'https://seu-backend.com/api/send-whatsapp';
// NOTA: Você precisa configurar um backend (Node.js, Firebase Functions, etc.)
// para enviar mensagens via Twilio WhatsApp API

// ── Fila de notificações ──────────────────────
let _notificationQueue = [];
let _unreadCount = 0;

// ═══════════════════════════════════════════════════════════
// CRIAR NOTIFICAÇÃO QUANDO AULA É MARCADA
// ═══════════════════════════════════════════════════════════

async function createNotification(bookingData) {
  const notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
    bookingId: bookingData.id,
    studentName: bookingData.studentName,
    studentEmail: bookingData.studentEmail,
    slotDate: bookingData.slotDate,
    slotTime: bookingData.slotTime,
    plan: bookingData.plan,
    price: bookingData.price,
    phone: bookingData.phone || '',
    cpf: bookingData.cpf || '',
    city: bookingData.city || '',
    state: bookingData.state || '',
    isVisitor: bookingData.role === 'visitor',
    playsFlute: bookingData.playsFlute || false,
    experience: bookingData.experience || 0,
    createdAt: new Date().toISOString(),
    read: false,
    whatsappSent: false,
  };

  // Salvar notificação no Firestore
  try {
    await db.collection('notifications').doc(notification.id).set(notification);
    console.log('✓ Notificação salva:', notification.id);
  } catch (e) {
    console.error('Erro ao salvar notificação:', e);
  }

  // Enviar WhatsApp
  await sendWhatsAppNotification(notification);

  // Atualizar fila local
  _notificationQueue.unshift(notification);
  _unreadCount++;

  return notification;
}

// ═══════════════════════════════════════════════════════════
// ENVIAR NOTIFICAÇÃO VIA WHATSAPP
// ═══════════════════════════════════════════════════════════

async function sendWhatsAppNotification(notification) {
  const dateObj = new Date(notification.slotDate + 'T' + notification.slotTime);
  const dateStr = dateObj.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long' 
  });

  // Montar mensagem WhatsApp
  let message = `🎵 *NOVA AULA MARCADA* 🎵\n\n`;
  message += `📅 *Data:* ${dateStr}\n`;
  message += `⏰ *Horário:* ${notification.slotTime}\n`;
  message += `👤 *Aluno:* ${notification.studentName}\n`;
  message += `📧 *Email:* ${notification.studentEmail}\n`;
  
  if (notification.isVisitor) {
    message += `\n*[VISITANTE]*\n`;
    message += `📞 Telefone: ${notification.phone || 'Não informado'}\n`;
    message += `📍 Cidade: ${notification.city}/${notification.state}\n`;
    if (notification.playsFlute) {
      message += `🎵 Toca flauta: ${notification.experience} ano(s)\n`;
    } else {
      message += `🎵 Nunca tocou flauta\n`;
    }
  }
  
  message += `\n💰 *Plano:* ${PLAN_DATA[notification.plan]?.label || notification.plan}\n`;
  message += `💵 *Valor:* R$${notification.price}\n`;
  message += `\n_Acesse o painel para mais detalhes._`;

  try {
    // Enviar via endpoint do seu backend
    const response = await fetch(WHATSAPP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toNumber: PROF_WHATSAPP_NUMBER,
        message: message,
        notificationId: notification.id,
      }),
    });

    if (response.ok) {
      console.log('✓ WhatsApp enviado com sucesso');
      // Marcar como enviado no Firestore
      await db.collection('notifications').doc(notification.id).update({ 
        whatsappSent: true,
        whatsappSentAt: new Date().toISOString()
      });
    } else {
      console.error('Erro ao enviar WhatsApp:', response.statusText);
    }
  } catch (e) {
    console.error('Erro ao conectar com WhatsApp API:', e);
    // Continuar mesmo se falhar o WhatsApp — notificação no site ainda funciona
  }
}

// ═══════════════════════════════════════════════════════════
// CARREGAR NOTIFICAÇÕES DO FIRESTORE
// ═══════════════════════════════════════════════════════════

async function loadNotifications() {
  try {
    const snap = await db.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    _notificationQueue = snap.docs.map(d => d.data());
    _unreadCount = _notificationQueue.filter(n => !n.read).length;

    return _notificationQueue;
  } catch (e) {
    console.error('Erro ao carregar notificações:', e);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// MARCAR COMO LIDA
// ═══════════════════════════════════════════════════════════

async function markNotificationAsRead(notifId) {
  const notif = _notificationQueue.find(n => n.id === notifId);
  if (!notif) return;

  notif.read = true;
  _unreadCount = Math.max(0, _unreadCount - 1);

  try {
    await db.collection('notifications').doc(notifId).update({ read: true });
  } catch (e) {
    console.error('Erro ao marcar notificação como lida:', e);
  }
}

// ═══════════════════════════════════════════════════════════
// RENDERIZAR BADGE DE NOTIFICAÇÕES (NOS TABS)
// ═══════════════════════════════════════════════════════════

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;

  if (_unreadCount > 0) {
    badge.textContent = _unreadCount > 99 ? '99+' : _unreadCount;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════
// RENDERIZAR PAINEL DE NOTIFICAÇÕES (MODAL/TAB)
// ═══════════════════════════════════════════════════════════

function renderNotificationPanel() {
  const panel = document.getElementById('notificationPanel');
  if (!panel) return;

  if (_notificationQueue.length === 0) {
    panel.innerHTML = `
      <div class="empty-state">
        <div class="ico">🔔</div>
        <p>Nenhuma notificação ainda.</p>
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div class="notification-list">
      ${_notificationQueue.map(notif => {
        const dateObj = new Date(notif.createdAt);
        const dateStr = dateObj.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        const unreadClass = notif.read ? '' : 'unread';
        
        return `
        <div class="notification-card ${unreadClass}" id="notif-${notif.id}">
          <div class="notification-header">
            <div class="notification-time">${dateStr}</div>
            ${!notif.read ? '<span class="notification-dot"></span>' : ''}
          </div>
          <div class="notification-content">
            <div class="notification-title">
              ${notif.isVisitor ? '👤' : '🎵'} ${notif.studentName}
            </div>
            <div class="notification-detail">
              📅 ${notif.slotDate} · ⏰ ${notif.slotTime}
            </div>
            <div class="notification-detail">
              📧 ${notif.studentEmail}
              ${notif.phone ? ` · 📞 ${notif.phone}` : ''}
            </div>
            ${notif.isVisitor ? `
              <div class="notification-detail">
                📍 ${notif.city}/${notif.state}
                ${notif.playsFlute ? ` · 🎵 ${notif.experience} ano(s)` : ' · 🎵 Iniciante'}
              </div>
            ` : ''}
            <div class="notification-detail" style="color:var(--gold3);font-weight:600">
              💰 ${PLAN_DATA[notif.plan]?.label || notif.plan} — R$${notif.price}
            </div>
            ${notif.whatsappSent ? `
              <div class="notification-detail" style="color:var(--success);font-size:.75rem">
                ✓ WhatsApp enviado
              </div>
            ` : ''}
          </div>
          <div class="notification-actions">
            <button class="notification-action-btn" onclick="markNotificationAsRead('${notif.id}')">
              ${notif.read ? '✓ Lido' : 'Marcar como lido'}
            </button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════════
// INICIALIZAR (Executar ao carregar página do professor)
// ═══════════════════════════════════════════════════════════

async function initNotifications() {
  await loadNotifications();
  updateNotificationBadge();
  renderNotificationPanel();
  console.log(`✓ Notificações inicializadas (${_unreadCount} não lidas)`);
}
