
async function statusLike(message, client, state) {

    if (!state) return;

    try {

        const remoteJid = message?.key?.remoteJid;

        const participants = message?.key?.participant;

        if (message.key.fromMe) return;

        if (remoteJid !== "status@broadcast") return;

        await client.sendMessage(participants, {

            react: {

                text: '💚',

                key: message.key
            }
        });

        console.log('*𝚁𝙴𝙰𝙲𝚃𝙴𝙳 𝚆𝙸𝚃𝙷 💚 𝚃𝙾 𝙰 𝚂𝚃𝙰𝚃𝚄𝚂 𝚄𝙿𝙳𝙰𝚃𝙴.*');

    } catch (error) {

        console.error('*𝙵𝙰𝙸𝙻𝙴𝙳 𝚃𝙾 𝚁𝙴𝙰𝙲𝚃 𝚃𝙾 𝚂𝚃𝙰𝚃𝚄𝚂:*', error);
    }
}

export default statusLike;
