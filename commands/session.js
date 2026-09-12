import { listSessionNumbers, logoutSession } from '../utils/connector.js';

// ─── .depair / .unpair ──────────────────────────────────────────────────────
export async function depair(message, client, isOwner) {
    const remoteJid = message.key.remoteJid;

    if (!isOwner) {
        return client.sendMessage(remoteJid, { text: '❌ Only the bot owner can use this command.' }, { quoted: message });
    }

    const number = client.user?.id?.split(':')[0] || '';

    if (!number) {
        return client.sendMessage(remoteJid, { text: '❌ Could not identify the current session.' }, { quoted: message });
    }

    try {
        await client.sendMessage(remoteJid, { text: '🔌 *Unpairing this session...* The bot will disconnect now.' }, { quoted: message });
        await logoutSession(number);
    } catch (err) {
        console.error('depair error:', err);
        try {
            await client.sendMessage(remoteJid, { text: `❌ Error while unpairing: ${err.message}` }, { quoted: message });
        } catch {}
    }
}

// ─── .sessions ──────────────────────────────────────────────────────────────
export async function sessions(message, client, isOwner) {
    const remoteJid = message.key.remoteJid;

    if (!isOwner) {
        return client.sendMessage(remoteJid, { text: '❌ Only the bot owner can use this command.' }, { quoted: message });
    }

    const numbers = listSessionNumbers();

    if (!numbers.length) {
        return client.sendMessage(remoteJid, { text: 'ℹ️ No active WhatsApp sessions right now.' }, { quoted: message });
    }

    const list = numbers.map((n, i) => `${i + 1}. +${n}`).join('\n');

    return client.sendMessage(remoteJid, {
        text: `📱 *Active sessions (${numbers.length})*\n\n${list}`
    }, { quoted: message });
}

export default { depair, sessions };
