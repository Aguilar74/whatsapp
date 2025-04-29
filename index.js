const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { join } = require('path');

// ===== CONFIGURACIÓN =====
const PALABRAS_PROHIBIDAS = [
  "bitcoin", "cripto", "inversión",
  "ganar dinero", "oportunidad única",
  "sin esfuerzo", "desde casa",
  "únete al equipo", "flujo de ingresos"
];

const authFolder = join(__dirname, 'auth_info');
const { state, saveState } = useSingleFileAuthState(authFolder);

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Bot Anti-Spam', 'Chrome', '1.0']
  });

  sock.ev.on('connection.update', (update) => {
    if (update.qr) qrcode.generate(update.qr, { small: true });
    if (update.connection === 'open') console.log('✅ Bot conectado');
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid.endsWith('@g.us')) return;

    try {
      const texto = (
        msg.message.conversation || 
        msg.message.extendedTextMessage?.text || 
        ''
      ).toLowerCase();

      if (PALABRAS_PROHIBIDAS.some(palabra => texto.includes(palabra))) {
        await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });
        console.log(`🚨 Mensaje eliminado: "${texto.slice(0, 50)}..."`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
}

startBot().catch(err => console.error('Error al iniciar:', err));
