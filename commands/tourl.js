import fs from 'fs';
import path from 'path';
import { downloadMediaMessage } from 'baileys';
import { OWNER_NAME } from '../config.js';

export async function tourl(message, client) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return client.sendMessage(remoteJid, { text: '❌ Reply to an image, video, audio, or document.' }, { quoted: message });

    const mimeType = quoted.imageMessage?.mimetype || quoted.videoMessage?.mimetype ||
        quoted.audioMessage?.mimetype || quoted.documentMessage?.mimetype;
    if (!mimeType) return client.sendMessage(remoteJid, { text: '❌ Unsupported media.' }, { quoted: message });

    const tempDir = './temp';
    fs.mkdirSync(tempDir, { recursive: true });
    const ext = (mimeType.split('/')[1] || 'bin').split(';')[0];
    const filePath = path.join(tempDir, `upload-${Date.now()}.${ext}`);

    try {
        const buffer = await downloadMediaMessage(
            { message: quoted },
            'buffer',
            {},
            { reuploadRequest: client.reuploadRequest }
        );

        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', new Blob([buffer], { type: mimeType }), path.basename(filePath));

        const response = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
        const url = (await response.text()).trim();
        if (!response.ok || !url.startsWith('http')) throw new Error(url || `HTTP ${response.status}`);

        await client.sendMessage(remoteJid, {
            text: `✅ URL:\n${url}\n\n> Powered by ${OWNER_NAME}`,
        }, { quoted: message });
    } catch (err) {
        console.error('tourl:', err);
        await client.sendMessage(remoteJid, { text: `❌ Upload failed: ${err.message}` }, { quoted: message });
    } finally {
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    }
}

export default tourl;
