const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { join } = require('path');

// IMPORTANTE: Ahora debe importarse así
const authFolder = join(__dirname, 'auth_info');
const { state, saveState } = useSingleFileAuthState(authFolder);

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    if (update.qr) qrcode.generate(update.qr, { small: true });
    if (update.connection === 'open') console.log('✅ Bot conectado');
  });

  sock.ev.on('creds.update', saveState);
}

startBot().catch(err => console.error('Error:', err));
