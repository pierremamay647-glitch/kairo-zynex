import group from './group.js';

// ─── .groupstatus / .gcstatus / .togstatus <text or reply to media> ────────
export async function groupstatus(message, client, prefix, cmd, text) {
    const remoteJid = message.key.remoteJid;

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, { text: '❌ This command only works inside a group.' }, { quoted: message });
    }

    const senderJid = message.key.participant || message.key.remoteJid;
    const admin = await group.isAdmin(client, remoteJid, senderJid);
    if (!admin) {
        return client.sendMessage(remoteJid, { text: '❌ Group admins only.' }, { quoted: message });
    }

    try {
        const meta = await client.groupMetadata(remoteJid);
        const participants = (meta?.participants || []).map(p => p.id);

        const ctx = message.message?.extendedTextMessage?.contextInfo;
        const quotedMsgObj = ctx?.quotedMessage;

        const directIm = message.message?.imageMessage;
        const directVm = message.message?.videoMessage;
        const directAm = message.message?.audioMessage;

        const im = directIm || quotedMsgObj?.imageMessage;
        const vm = directVm || quotedMsgObj?.videoMessage;
        const am = directAm || quotedMsgObj?.audioMessage;
        const caption = text || '';

        if (!im && !vm && !am && !caption) {
            return client.sendMessage(remoteJid, {
                text: `❗ Usage: ${prefix}${cmd} <text>\nOr put ${prefix}${cmd} as the caption of an image/video, or reply to a media with ${prefix}${cmd} <optional caption>`
            }, { quoted: message });
        }

        if (!im && !vm && !am) {
            await client.sendMessage(remoteJid, {
                text: caption,
                contextInfo: { mentionedJid: participants, isGroupStatus: true }
            }, { backgroundColor: '#000000', statusJidList: participants });
            return client.sendMessage(remoteJid, { text: '🎉 Group Status posted successfully!' }, { quoted: message });
        }

        const quoted = quotedMsgObj ? { message: quotedMsgObj } : { message: message.message };
        const { downloadMediaMessage } = await import('baileys');
        const buffer = await downloadMediaMessage(quoted, 'buffer', {}, { reuploadRequest: client.reuploadRequest });

        const payload = im
            ? { image: buffer, caption }
            : vm
                ? { video: buffer, caption }
                : { audio: buffer, mimetype: 'audio/mpeg' };

        await client.sendMessage(remoteJid, {
            ...payload,
            contextInfo: { mentionedJid: participants, isGroupStatus: true }
        }, { backgroundColor: '#000000', statusJidList: participants });

        await client.sendMessage(remoteJid, { text: '🎉 Group Status posted successfully!' }, { quoted: message });

    } catch (e) {
        console.error('groupstatus:', e);
        await client.sendMessage(remoteJid, { text: `❌ Failed to post group status: ${e.message}` }, { quoted: message });
    }
}

export default { groupstatus };
