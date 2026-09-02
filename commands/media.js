import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

import { downloadMediaMessage } from 'baileys';
import { Sticker } from 'wa-sticker-formatter';


export async function photo(message, client) {

    try {

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const target = quoted?.stickerMessage;

        if (!target) return await client.sendMessage(message.key.remoteJid, { text: "No sticker found." })

        const buffer = await downloadMediaMessage({ message: quoted, client }, "buffer");

        const filename = `./temp/sticker-${Date.now()}.png`

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

        fs.writeFileSync(filename, buffer)

        await client.sendMessage(message.key.remoteJid, { image: fs.readFileSync(filename), caption: "> *POWERED BY KAIRO ZYNEX*" })

        fs.unlinkSync(filename)

    } catch (e) {

        console.log(e)

        await client.sendMessage(message.key.remoteJid, { text: "*❌ 𝙴𝚁𝚁𝙾𝚁 𝚃𝙾 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙽𝙶 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚃𝙾 𝙸𝙼𝙰𝙶𝙴.*" })
    }
}

export async function tomp3(message, client) {

    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const target = quoted?.videoMessage;

        if (!target) return await client.sendMessage(message.key.remoteJid, { text: "No video found." })

        const buffer = await downloadMediaMessage({ message: quoted, client }, "buffer");

        const inputPath = `./temp/video-${Date.now()}.mp4`

        const outputPath = `./temp/audio-${Date.now()}.mp3`

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
            
        fs.writeFileSync(inputPath, buffer)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vn -ab 128k -ar 44100 -y ${outputPath}`, (err) => {
                if (err) return reject(err)
                resolve()
            })
        })

        await client.sendMessage(message.key.remoteJid, { audio: fs.readFileSync(outputPath), mimetype: 'audio/mp4', ptt: false })

        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)

    } catch (e) {
        console.log(e)
        await client.sendMessage(message.key.remoteJid, { text: "*❌ 𝙴𝚁𝚁𝙾𝚁 𝚃𝙾 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝙽𝙶 𝚅𝙸𝙳𝙴𝙾 𝚃𝙾 𝙰𝚄𝙳𝙸𝙾*" })
    }
}

export async function sticker(message, client) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const source = quoted?.imageMessage || quoted?.videoMessage ||
        message.message?.imageMessage || message.message?.videoMessage;
    const wrapped = quoted ? { message: quoted } : { message: message.message };
    if (!source) return client.sendMessage(message.key.remoteJid, { text: '❌ 𝚁𝙴𝙿𝙻𝚈 𝚃𝙾 𝙰𝙽 𝙸𝙼𝙰𝙶𝙴/𝚅𝙸𝙳𝙴𝙾 𝙾𝚁 𝚂𝙴𝙽𝙳 𝙾𝙽𝙴 𝚆𝙸𝚃𝙷 .𝚂𝚃𝙸𝙲𝙺𝙴𝚁*' }, { quoted: message });

    try {
        const buffer = await downloadMediaMessage(wrapped, 'buffer', {}, { reuploadRequest: client.reuploadRequest });
        const sticker = new Sticker(buffer, {
            pack: 'KAIRO ZYNEX',
            author: 'KAIRO ZYNEX',
            type: source.mimetype?.includes('video') ? 'full' : 'default'
        });
        await client.sendMessage(message.key.remoteJid, { sticker: await sticker.toBuffer() }, { quoted: message });
    } catch (e) {
        console.error('sticker:', e);
        await client.sendMessage(message.key.remoteJid, { text: `*❌ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙴𝚁𝚁𝙾𝚁: ${e.message}*` }, { quoted: message });
    }
}

export async function getProfilePicture(message, client) {
    const jid = message.message?.extendedTextMessage?.contextInfo?.participant || message.key.remoteJid;
    try {
        const url = await client.profilePictureUrl(jid, 'image');
        await client.sendMessage(message.key.remoteJid, { image: { url }, caption: '*🖼️ 𝙿𝚁𝙾𝙵𝙸𝙻𝙴 𝙿𝙸𝙲𝚃𝚄𝚁𝙴*' }, { quoted: message });
    } catch {
        await client.sendMessage(message.key.remoteJid, { text: '*❌ 𝙿𝚁𝙾𝙵𝙸𝙻𝙴 𝙿𝙸𝙲𝚃𝚄𝚁𝙴 𝙽𝙾𝚃 𝙰𝚅𝙰𝙸𝙻𝙰𝙱𝙻𝙴.*' }, { quoted: message });
    }
}

export async function setProfilePicture(message, client) {
    const remoteJid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const source = quoted?.imageMessage || message.message?.imageMessage;
    const wrapped = quoted ? { message: quoted } : { message: message.message };
    if (!source) return client.sendMessage(remoteJid, { text: '*❌ 𝚁𝙴𝙿𝙻𝚈 𝚃𝙾 𝙰𝙽 𝙸𝙼𝙰𝙶𝙴 𝚆𝙸𝚃𝙷 .𝚂𝙴𝚃𝙿𝙿*' }, { quoted: message });

    try {
        const buffer = await downloadMediaMessage(wrapped, 'buffer', {}, { reuploadRequest: client.reuploadRequest });
        const me = client.user?.id?.split(':')[0] + '@s.whatsapp.net';
        await client.updateProfilePicture(me, buffer);
        await client.sendMessage(remoteJid, { text: '*✅ 𝙿𝚁𝙾𝙵𝙸𝙻𝙴 𝙿𝙸𝙲𝚃𝚄𝚁𝙴 𝚄𝙿𝙳𝙰𝚃𝙴𝙳.*' }, { quoted: message });
    } catch (e) {
        await client.sendMessage(remoteJid, { text: `*❌ 𝚅𝙾𝚄𝙻𝙳 𝙽𝙾𝚃 𝚄𝙿𝙳𝙰𝚃𝙴 𝙿𝚁𝙾𝙵𝙸𝙻𝙴: ${e.message}*` }, { quoted: message });
    }
}

export default { photo, tomp3, sticker, getProfilePicture, setProfilePicture }
