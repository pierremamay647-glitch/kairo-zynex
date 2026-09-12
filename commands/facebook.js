import axios from 'axios';

function isUrl(u) {
    return typeof u === 'string' && /^https?:\/\/\S+/i.test(u.trim());
}

function cleanUrl(u) {
    if (!isUrl(u)) return null;
    return u.trim().replace(/\s+/g, '');
}

async function getJson(url) {
    return axios.get(url, {
        timeout: 25000,
        headers: {
            accept: 'application/json, text/plain, */*',
            'user-agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        },
        validateStatus: () => true,
    });
}

async function fetchThumbAsBuffer(url) {
    try {
        const r = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/120 Safari/537.36' },
            validateStatus: () => true,
        });
        if (r.status >= 200 && r.status < 300 && r.data) return Buffer.from(r.data);
    } catch {}
    return undefined;
}

// ─── .fb / .facebook <link> ─────────────────────────────────────────────────
export async function facebook(message, client, urlArg) {
    const remoteJid = message.key.remoteJid;
    const url = (urlArg || '').trim();

    if (!url) {
        return client.sendMessage(remoteJid, {
            text: '❌ Give a Facebook link.\nExample: .fb https://www.facebook.com/share/r/xxxx'
        }, { quoted: message });
    }

    const lower = url.toLowerCase();
    if (!lower.includes('facebook.com') && !lower.includes('fb.watch') && !lower.includes('m.facebook.com')) {
        return client.sendMessage(remoteJid, { text: '❌ That is not a valid Facebook link.' }, { quoted: message });
    }

    try { await client.sendMessage(remoteJid, { react: { text: '🔄', key: message.key } }); } catch {}

    try {
        const apiUrl = `https://tele-social.vercel.app/down?url=${encodeURIComponent(url)}`;
        const res = await getJson(apiUrl);

        if (res.status < 200 || res.status >= 300) {
            try { await client.sendMessage(remoteJid, { react: { text: '❌', key: message.key } }); } catch {}
            return client.sendMessage(remoteJid, { text: `❌ API error (HTTP ${res.status}). Try again.` }, { quoted: message });
        }

        const root = res.data;

        if (!root || root.status !== true || !root.data) {
            try { await client.sendMessage(remoteJid, { react: { text: '❌', key: message.key } }); } catch {}
            return client.sendMessage(remoteJid, {
                text: '❌ Could not fetch this video.\nIt may be private or the link is invalid.'
            }, { quoted: message });
        }

        const media = root.data.media || {};
        const videoUrl = cleanUrl(media.download) || cleanUrl(media.video);
        const thumb = cleanUrl(root.data.thumbnail);
        const platform = root.platform || 'Facebook';

        if (!videoUrl) {
            try { await client.sendMessage(remoteJid, { react: { text: '❌', key: message.key } }); } catch {}
            return client.sendMessage(remoteJid, { text: '❌ No downloadable video link found.' }, { quoted: message });
        }

        const caption =
            `╭━━━〔 📥 ${platform.toUpperCase()} 〕━━━╮\n` +
            `┃ ✅ Download successful\n` +
            (thumb ? `┃ 🖼️ Thumbnail: OK\n` : `┃ 🖼️ Thumbnail: N/A\n`) +
            `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
            `> *Powered by: KAIRO ZYNEX*`;

        await client.sendMessage(remoteJid, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption,
            ...(thumb ? { jpegThumbnail: await fetchThumbAsBuffer(thumb) } : {}),
        }, { quoted: message });

        try { await client.sendMessage(remoteJid, { react: { text: '✅', key: message.key } }); } catch {}
    } catch (error) {
        console.error('facebook command error:', error?.response?.data || error);
        try { await client.sendMessage(remoteJid, { react: { text: '❌', key: message.key } }); } catch {}
        await client.sendMessage(remoteJid, { text: '❌ Facebook error. Try again later.' }, { quoted: message });
    }
}

export default { facebook };
