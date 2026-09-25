import { downloadMediaMessage } from 'baileys';

// ─── .groupstatus / .gcstatus / .togstatus <text> ───────────────────────────
// Reply to (or send directly) text / image / video / audio to post it as a
// styled "group status" message, mentioning every participant.
export async function groupstatus(message, client, text, isOwner) {
    const remoteJid = message.key.remoteJid;

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, { text: '👥 This command only works in groups.' }, { quoted: message });
    }

    try { await client.sendMessage(remoteJid, { react: { text: '📣', key: message.key } }); } catch {}

    try {
        const meta = await client.groupMetadata(remoteJid);
        const participants = meta?.participants || [];

        const senderJid = message.key.participant || message.key.remoteJid;
        const isSenderAdmin = participants.some(p => p.id === senderJid && p.admin);

        if (!isOwner && !isSenderAdmin) {
            return client.sendMessage(remoteJid, { text: '❌ Only group admins or the bot owner can use this command.' }, { quoted: message });
        }

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
                text: '❗ Usage: .groupstatus <text>\nOr put .groupstatus as the caption of an image/video, or reply to media with .groupstatus <optional caption>'
            }, { quoted: message });
        }

        const participantIds = participants.map((p) => p.id);

        if (!im && !vm && !am) {
            await client.sendMessage(remoteJid, {
                text: caption,
                contextInfo: { mentionedJid: participantIds, isGroupStatus: true }
            }, { backgroundColor: '#000000', statusJidList: participantIds });
            return client.sendMessage(remoteJid, { text: '🎉 Group Status posted successfully!' }, { quoted: message });
        }

        // Media case: download the direct or quoted media, then repost it styled.
        const mediaMessageWrapper = directIm || directVm || directAm
            ? message
            : { key: message.key, message: quotedMsgObj };

        const buffer = await downloadMediaMessage(mediaMessageWrapper, 'buffer', {});

        if (im) {
            await client.sendMessage(remoteJid, {
                image: buffer,
                caption,
                contextInfo: { mentionedJid: participantIds, isGroupStatus: true }
            }, { backgroundColor: '#000000', statusJidList: participantIds });
        } else if (vm) {
            await client.sendMessage(remoteJid, {
                video: buffer,
                caption,
                contextInfo: { mentionedJid: participantIds, isGroupStatus: true }
            }, { backgroundColor: '#000000', statusJidList: participantIds });
        } else if (am) {
            await client.sendMessage(remoteJid, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: { mentionedJid: participantIds, isGroupStatus: true }
            }, { statusJidList: participantIds });
        }

        await client.sendMessage(remoteJid, { text: '🎉 Group Status posted successfully!' }, { quoted: message });

    } catch (err) {
        console.error('groupstatus error:', err);
        await client.sendMessage(remoteJid, { text: `❌ Error: ${err.message}` }, { quoted: message });
    }
}

export default { groupstatus };
