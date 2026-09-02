import configManager from '../utils/manageConfigs.js';
import startSession from '../utils/connector.js';

export async function connectToWhatsApp(handleMessage) {
    const primary = configManager.config?.users?.root?.primary;

    if (primary) {
        await startSession(primary, handleMessage, false);
        console.log(`✅ Restoring WhatsApp session for ${primary}`);
    } else {
        console.log("ℹ️ No WhatsApp session yet. Open the pairing website to connect.");
    }
}

export default connectToWhatsApp;
