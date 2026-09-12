import { downloadContentFromMessage } from 'baileys';
import Jimp from 'jimp';

export async function toImage(message, client) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMessage = quoted?.stickerMessage;

    if (!stickerMessage) {
        return client.sendMessage(remoteJid, { text: '❌ Usage: reply to a sticker with:\n.toimage' }, { quoted: message });
    }

    try {
        const stream = await downloadContentFromMessage(stickerMessage, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer.length) throw new Error('Downloaded buffer is empty.');

        if (stickerMessage.isAnimated) {
            await client.sendMessage(remoteJid, {
                video: buffer,
                gifPlayback: true,
                caption: '🖼️ Converted from animated sticker\n\n> *Powered by: KAIRO ZYNEX*'
            }, { quoted: message });
        } else {
            const image = await Jimp.read(buffer);
            const imgBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
            await client.sendMessage(remoteJid, {
                image: imgBuffer,
                caption: '🖼️ Converted to image\n\n> *Powered by: KAIRO ZYNEX*'
            }, { quoted: message });
        }

    } catch (error) {
        console.error('[TOIMAGE] error:', error);
        await client.sendMessage(remoteJid, { text: `❌ Error: Could not convert the sticker. ${error.message}` }, { quoted: message });
    }
}

export default { toImage };
