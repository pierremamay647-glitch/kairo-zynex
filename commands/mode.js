import configManager from '../utils/manageConfigs.js';

// ─── .private ────────────────────────────────────────────────────────────
export async function setPrivate(message, client, isOwner) {
    const remoteJid = message.key.remoteJid;
    if (!isOwner) {
        return client.sendMessage(remoteJid, { text: '❌ Only owner can use this command.' }, { quoted: message });
    }
    configManager.config.botMode = 'private';
    configManager.save();
    await client.sendMessage(remoteJid, { text: '🔐 Bot is now in PRIVATE mode. Only the owner can use it.' }, { quoted: message });
}

// ─── .public ─────────────────────────────────────────────────────────────
export async function setPublic(message, client, isOwner) {
    const remoteJid = message.key.remoteJid;
    if (!isOwner) {
        return client.sendMessage(remoteJid, { text: '❌ Only owner can use this command.' }, { quoted: message });
    }
    configManager.config.botMode = 'public';
    configManager.save();
    await client.sendMessage(remoteJid, { text: '🌍 Bot is now in PUBLIC mode. Everyone can use it.' }, { quoted: message });
}

export default { setPrivate, setPublic };
