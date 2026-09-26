import fs from 'fs';
import path from 'path';
import { jidNormalizedUser } from 'baileys';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_PATH = path.join(DATA_DIR, 'welcome.json');

function ensureFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '{}');
}

function loadData() {
    try {
        ensureFile();
        const raw = fs.readFileSync(DATA_PATH, 'utf8').trim();
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

if (!global.welcomeData) global.welcomeData = loadData();
if (!global.welcomeActiveListeners) global.welcomeActiveListeners = new Map();

function saveData() {
    try {
        ensureFile();
        fs.writeFileSync(DATA_PATH, JSON.stringify(global.welcomeData, null, 2));
    } catch (e) {
        console.error('Welcome save error:', e.message);
    }
}

function isEnabled(groupId) {
    if (!(groupId in global.welcomeData)) return true; // ON by default
    return global.welcomeData[groupId] !== false;
}

async function getProfilePic(socket, jid) {
    try {
        return await socket.profilePictureUrl(jid, 'image');
    } catch (e) {
        return null;
    }
}

// ─── Called ONCE right after the socket is created (in utils/connector.js) ──
export function initWelcome(socket) {
    try {
        if (!socket || !socket.user || !socket.user.id) return;
        if (socket._welcomeListenerAttached) return; // already attached on THIS socket instance
        socket._welcomeListenerAttached = true;

        const sessionJid = jidNormalizedUser(socket.user.id);
        const socketId = sessionJid.split('@')[0];

        const listener = async (update) => {
            try {
                const { id: groupId, participants, action } = update || {};
                if (!groupId || !participants?.length) return;
                if (action !== 'add' && action !== 'remove') return;
                if (!isEnabled(groupId)) return;

                let groupMetadata;
                try {
                    groupMetadata = await socket.groupMetadata(groupId);
                } catch (e) {
                    return;
                }

                const memberCount = groupMetadata.participants?.length || 0;
                const groupName = groupMetadata.subject || 'this group';
                const dateStr = new Date().toLocaleString('en-US');

                for (const participantId of participants) {
                    const userTag = `@${participantId.split('@')[0]}`;

                    let pic = await getProfilePic(socket, participantId);
                    if (!pic) pic = await getProfilePic(socket, sessionJid);

                    const title = action === 'add' ? 'WELCOME 🫣❤' : 'You left my group? 🥱😂 Don’t worry, nobody even noticed you were gone… not even the group. 🐶';

                    const caption =
                        `*╭┈───〔 KAIRO ZYNEX 〕┈───⊷*\n` +
                        `*├⬗ ${title}*\n` +
                        `*├⬗ USER :* ${userTag}\n` +
                        `*├⬗ GROUP :* ${groupName}\n` +
                        `*├⬗ DATE :* ${dateStr}\n` +
                        `*├⬗ Members :* ${memberCount}\n` +
                        `*╰───────────────────⊷*\n\n` +
                        `> *POWERED BY KAIRO ZYNEX*`;

                    try {
                        await socket.sendMessage(groupId, {
                            image: pic ? { url: pic } : fs.readFileSync(path.join(process.cwd(), 'menu.jpg')),
                            caption,
                            mentions: [participantId]
                        });
                    } catch (e) {
                        console.error('Welcome send error:', e.message);
                    }
                }
            } catch (e) {
                console.error('Welcome listener error:', e.message);
            }
        };

        socket.ev.on('group-participants.update', listener);
        global.welcomeActiveListeners.set(socketId, listener);
    } catch (e) {
        console.error('Welcome init error:', e.message);
    }
}

// ─── .welcome on/off (called from events/messageHandler.js) ────────────────
export async function welcomeToggle(message, client, args, isOwner) {
    const remoteJid = message.key.remoteJid;

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, { text: '👥 This command only works in groups.' }, { quoted: message });
    }

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants || [];
        const senderJid = message.key.participant || message.key.remoteJid;
        const isSenderAdmin = participants.some(p => p.id === senderJid && p.admin);

        if (!isOwner && !isSenderAdmin) {
            return client.sendMessage(remoteJid, { text: '❌ Only group admins or the bot owner can configure this.' }, { quoted: message });
        }

        const option = (args[0] || '').toLowerCase();

        if (option === 'on') {
            global.welcomeData[remoteJid] = true;
            saveData();
            return client.sendMessage(remoteJid, { text: '⚡ Welcome & Goodbye messages turned ON for this group.' }, { quoted: message });
        }

        if (option === 'off') {
            global.welcomeData[remoteJid] = false;
            saveData();
            return client.sendMessage(remoteJid, { text: '⚡ Welcome & Goodbye messages turned OFF for this group.' }, { quoted: message });
        }

        return client.sendMessage(remoteJid, {
            text: `🧸 Welcome Settings\n\n🔴 Status: ${isEnabled(remoteJid) ? 'ON' : 'OFF'}\n\nUsage:\n.welcome on\n.welcome off`
        }, { quoted: message });

    } catch (e) {
        return client.sendMessage(remoteJid, { text: `❌ Error: ${e.message}` }, { quoted: message });
    }
}

export default { initWelcome, welcomeToggle };
