/* ═══════════════════════════════════════════════════════════════
   WHATSAPP NOTIFICATION SERVER — Node.js + Express + Twilio
   ═══════════════════════════════════════════════════════════════
   
   INSTRUÇÕES DE SETUP:
   
   1. Criar conta em https://www.twilio.com/
   2. Obter credenciais (Account SID, Auth Token, WhatsApp Sandbox)
   3. Instalar dependências:
      npm install express dotenv twilio cors
   
   4. Criar arquivo .env:
      TWILIO_ACCOUNT_SID=seu_account_sid
      TWILIO_AUTH_TOKEN=seu_auth_token
      TWILIO_WHATSAPP_NUMBER=whatsapp:+5527997475627 (seu número)
      PORT=3000
   
   5. Executar:
      node server.js
   
   6. Testar com CURL:
      curl -X POST http://localhost:3000/api/send-whatsapp \\\n        -H "Content-Type: application/json" \\\n        -d '{\n          "toNumber": "5527997475627",\n          "message": "Teste de mensagem"\n        }'\n        \n   7. Deploy (exemplo Heroku):\n      heroku create seu-app-name\n      git push heroku main\n      
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const twilio = require('twilio');
require('dotenv').config();
const cors = require('cors');

// ── Configuração ──────────────────────────────
const app = express();
app.use(express.json());
app.use(cors());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+5527997475627';
const PORT = process.env.PORT || 3000;

// ── Health Check ──────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Enviar Notificação WhatsApp ───────────────
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { toNumber, message, notificationId } = req.body;

    // Validação básica
    if (!toNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: toNumber, message',
      });
    }

    // Formatar número para WhatsApp
    const formattedNumber = `whatsapp:+${toNumber.replace(/\D/g, '')}`;

    console.log(`📤 Enviando WhatsApp para ${formattedNumber}...`);

    // Enviar via Twilio
    const result = await client.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedNumber,
    });

    console.log(`✓ Enviado com sucesso! SID: ${result.sid}`);

    res.json({
      success: true,
      messageSid: result.sid,
      notificationId: notificationId,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ── Webhook para receber respostas (optional) ──
app.post('/api/whatsapp-webhook', (req, res) => {
  const { From, Body, MessageSid } = req.body;
  console.log(`📨 Recebido de ${From}: ${Body} (SID: ${MessageSid})`);
  
  // Aqui você pode processar respostas do professor
  // Exemplo: Professor responde \"Confirmado\" e você atualiza banco de dados
  
  res.json({ success: true });
});

// ── Rota de teste ─────────────────────────────
app.post('/api/test-whatsapp', async (req, res) => {
  try {
    const testNumber = '5527997475627'; // Seu número
    const testMessage = `🎵 *TESTE DE NOTIFICAÇÃO* 🎵\n\nEste é um teste do sistema de notificações Mazo Flute.\n\n_Horário: ${new Date().toLocaleTimeString('pt-BR')}_`;

    const formattedNumber = `whatsapp:+${testNumber}`;

    const result = await client.messages.create({
      body: testMessage,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedNumber,
    });

    res.json({
      success: true,
      message: 'Mensagem de teste enviada com sucesso!',
      messageSid: result.sid,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ── Iniciar servidor ──────────────────────────
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔔 SERVIDOR DE NOTIFICAÇÕES MAZO FLUTE                 ║
║                                                           ║
║   Status: ✓ ONLINE                                        ║
║   Porta: ${PORT}                                              ║
║   WhatsApp: ${TWILIO_WHATSAPP_NUMBER}                      ║
║                                                           ║
║   Endpoints:                                              ║
║   POST /api/send-whatsapp                                ║
║   POST /api/whatsapp-webhook                             ║
║   POST /api/test-whatsapp                                ║
║   GET  /health                                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
