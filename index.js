const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

// Configuración inicial
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });

  sock.ev.on('connection.update', (update) => {
    if (update.qr) qrcode.generate(update.qr, { small: true });
    if (update.connection === 'open') console.log('✅ Bot conectado');
  });

  sock.ev.on('creds.update', saveState);
}

startBot();