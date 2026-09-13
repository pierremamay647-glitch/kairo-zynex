import fs from 'fs';
import path from 'path';

export async function creategroup(message, client, isOwner, groupName) {
    const remoteJid = message.key.remoteJid;

    if (!isOwner) {
        return client.sendMessage(remoteJid, { text: '❌ Owner only.' }, { quoted: message });
    }

    if (!groupName) {
        return client.sendMessage(remoteJid, { text: 'Usage: .creategc <group name>' }, { quoted: message });
    }

    try {
        const created = await client.groupCreate(groupName, []);
        const code = await client.groupInviteCode(created.id);
        const link = `https://chat.whatsapp.com/${code}`;

        const createdAt = new Date((created.creation || Date.now() / 1000) * 1000).toLocaleString('en-US');

        const caption =
            `「 GROUP CREATED 」\n` +
            `▸ Name: ${created.subject}\n` +
            `▸ ID: ${created.id}\n` +
            `▸ Owner: @${created.owner.split('@')[0]}\n` +
            `▸ Created: ${createdAt}\n` +
            `▸ Invite Link: ${link}\n\n> *Powered by: KAIRO ZYNEX*`;

        await client.sendMessage(remoteJid, {
            image: fs.readFileSync(path.join(process.cwd(), 'menu.jpg')),
            caption,
            mentions: [created.owner]
        }, { quoted: message });

    } catch (e) {
        console.error('CreateGC Error:', e);
        await client.sendMessage(remoteJid, { text: '❌ Failed to create the group.' }, { quoted: message });
    }
}

export default { creategroup };
