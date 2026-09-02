import connectToWhatsApp from './auth/authHandler.js';
import handleIncomingMessage from './events/messageHandler.js';
import { startPairingServer } from './web/server.js';

(async () => {
    await connectToWhatsApp(handleIncomingMessage);
    await startPairingServer(handleIncomingMessage);
})();
