// ─── .add <number/mention/reply> ────────────────────────────────────────────
// Adds a member directly to the group (bot must be admin).
export async function addMember(message, client, args) {
    const remoteJid = message.key.remoteJid;

    if (!remoteJid.endsWith('@g.us')) {
        return client.sendMessage(remoteJid, { text: '❌ This command can only be used in groups.' }, { quoted: message });
    }

    const ctx = message.message?.extendedTextMessage?.contextInfo;
    const mentioned = ctx?.mentionedJid?.[0];
    const participant = ctx?.participant;
    const rawText = args[0] ? args[0].replace(/[^0-9]/g, '') : '';

    const targetUser = mentioned || participant || (rawText ? rawText + '@s.whatsapp.net' : null);

    if (!targetUser) {
        return client.sendMessage(remoteJid, {
            text: ' *KAIRO ZYNEX - ADD COMMAND*\n\n❌ Please tag (@) a user, reply to their message, or provide a valid phone number!'
        }, { quoted: message });
    }

    try {
        const [result] = await client.onWhatsApp(targetUser.split('@')[0]);
        if (!result || !result.exists) {
            return client.sendMessage(remoteJid, { text: '❌ This phone number is not registered on WhatsApp.' }, { quoted: message });
        }

        const validJid = result.jid;

        await client.groupParticipantsUpdate(remoteJid, [validJid], 'add');

        const responseText = `╭━━━〔 *KAIRO ZYNEX ADMIN* 〕━━━⡱\n┃ 👤 *User:* @${validJid.split('@')[0]}\n┃ 🕷 *Action:* Added to group successfully ✅\n┃  *Bot:* KAIRO ZYNEX\n╰━━━━━━━━━━━━━━━━━━━━⬣`;

        await client.sendMessage(remoteJid, { text: responseText, mentions: [validJid] }, { quoted: message });

    } catch (err) {
        console.error('Add Command Error:', err);
        await client.sendMessage(remoteJid, {
            text: '⚠️ Critical Error: Make sure I am an Admin in this group, and check if the user\'s privacy settings allow being added directly.'
        }, { quoted: message });
    }
}

export default { addMember };
