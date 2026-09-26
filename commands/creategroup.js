import { downloadContentFromMessage } from 'baileys';

async function downloadMedia(mediaMessage, type) {
    const stream = await downloadContentFromMessage(mediaMessage, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

// ─── .groupstatus / .gcstatus / .togstatus <text> ───────────────────────────
// Owner-only. Posts a "group status" (mentions everyone + status styling)
// to EVERY group the bot currently participates in.
export async function groupstatus(message, client, args, isOwner) {
    const remoteJid = message.key.remoteJid;

    if (!isOwner) {
        return client.sendMessage(remoteJid, { text: '❌ This command is for the bot owner only.' }, { quoted: message });
    }

    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const textFromArgs = args ? args.join(' ') : '';
    const textFromQuote = quotedMessage?.conversation ||
        quotedMessage?.extendedTextMessage?.text ||
        quotedMessage?.imageMessage?.caption ||
        quotedMessage?.videoMessage?.caption || '';

    const teks = textFromArgs || textFromQuote;
    let media = null;
    let type = null;

    if (quotedMessage) {
        if (quotedMessage.imageMessage) {
            type = 'image';
            media = await downloadMedia(quotedMessage.imageMessage, 'image');
        } else if (quotedMessage.videoMessage) {
            type = 'video';
            media = await downloadMedia(quotedMessage.videoMessage, 'video');
        } else if (quotedMessage.audioMessage) {
            type = 'audio';
            media = await downloadMedia(quotedMessage.audioMessage, 'audio');
        }
    }

    if (!media && !teks) {
        return client.sendMessage(remoteJid, {
            text: '❌ Please provide a message or reply to a media.\nExample: .groupstatus Hello everyone!'
        }, { quoted: message });
    }

    try {
        const getGroups = await client.groupFetchAllParticipating();
        const groupIds = Object.keys(getGroups);

        await client.sendMessage(remoteJid, { text: `🚀 Sending status to ${groupIds.length} groups...` }, { quoted: message });

        let successCount = 0;

        for (const id of groupIds) {
            try {
                const groupMetadata = await client.groupMetadata(id);
                const peserta = groupMetadata.participants.map(v => v.id);

                if (!media) {
                    await client.sendMessage(id, {
                        text: teks,
                        contextInfo: { mentionedJid: peserta, isGroupStatus: true }
                    }, { backgroundColor: '#7c3aed', statusJidList: peserta });
                } else if (type === 'image') {
                    await client.sendMessage(id, {
                        image: media,
                        caption: teks,
                        contextInfo: { mentionedJid: peserta, isGroupStatus: true }
                    }, { statusJidList: peserta });
                } else if (type === 'video') {
                    await client.sendMessage(id, {
                        video: media,
                        caption: teks,
                        contextInfo: { mentionedJid: peserta, isGroupStatus: true }
                    }, { statusJidList: peserta });
                } else if (type === 'audio') {
                    await client.sendMessage(id, {
                        audio: media,
                        mimetype: 'audio/mp4',
                        ptt: false,
                        contextInfo: { mentionedJid: peserta, isGroupStatus: true }
                    }, { statusJidList: peserta });
                }

                successCount++;
                await new Promise(res => setTimeout(res, 2000));
            } catch (err) {
                console.log(`Failed to send to: ${id}`);
            }
        }

        await client.sendMessage(remoteJid, { text: `✅ Status sent successfully to ${successCount} groups!` }, { quoted: message });

    } catch (e) {
        console.error(e);
        await client.sendMessage(remoteJid, { text: '❌ An error occurred.' }, { quoted: message });
    }
}

export default { groupstatus };
