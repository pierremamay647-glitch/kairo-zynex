import axios from 'axios';
import { igdl } from 'ruhend-scraper';

async function fetchFromSiputzx(kind, url) {
    const apiUrl = `https://api.siputzx.my.id/api/d/${kind}?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, {
        timeout: 20000,
        headers: { accept: '*/*', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        validateStatus: s => s >= 200 && s < 500
    });
    if (!response.data) throw new Error(`${kind} API returned no data`);
    return response.data;
}

// ─── .tiktok <link> ─────────────────────────────────────────────────────────
export async function tiktok(message, client, input) {
    const remoteJid = message.key.remoteJid;

    if (!input) {
        return client.sendMessage(remoteJid, {
            text: '❌ Send a TikTok video link.\nEx: .tiktok https://vt.tiktok.com/...'
        }, { quoted: message });
    }

    if (!input.includes('tiktok.com')) {
        return client.sendMessage(remoteJid, { text: 'That is not a TikTok link.' }, { quoted: message });
    }

    try {
        const data = await fetchFromSiputzx('tiktok', input);
        const videoUrl = data?.data?.play || data?.data?.url || data?.data?.video;

        if (!videoUrl) {
            return client.sendMessage(remoteJid, { text: '❌ Could not get that TikTok video. It may be private or removed.' }, { quoted: message });
        }

        await client.sendMessage(remoteJid, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `*${data?.data?.title || 'TikTok video'}*\n\n> *Powered by: KAIRO ZYNEX*`
        }, { quoted: message });

    } catch (err) {
        console.error('TikTok error:', err);
        await client.sendMessage(remoteJid, { text: `❌ Error: ${err.message}` }, { quoted: message });
    }
}

// ─── .instagram / .ig <link> ────────────────────────────────────────────────
export async function instagram(message, client, input) {
    const remoteJid = message.key.remoteJid;

    if (!input) {
        return client.sendMessage(remoteJid, {
            text: '❌ Send an Instagram post/reel link.\nEx: .ig https://www.instagram.com/reel/...'
        }, { quoted: message });
    }

    if (!input.includes('instagram.com') && !input.includes('instagr.am')) {
        return client.sendMessage(remoteJid, { text: 'That is not an Instagram link.' }, { quoted: message });
    }

    try {
        await client.sendMessage(remoteJid, { react: { text: '🔄', key: message.key } });

        const downloadData = await igdl(input);
        const mediaData = downloadData?.data;

        if (!mediaData || mediaData.length === 0) {
            await client.sendMessage(remoteJid, { react: { text: '❌', key: message.key } });
            return client.sendMessage(remoteJid, {
                text: '❌ No media found. The post may be private or the link invalid.'
            }, { quoted: message });
        }

        // De-duplicate by URL and cap at 20 items so a carousel can't flood the chat
        const seen = new Set();
        const uniqueMedia = mediaData.filter((m) => {
            if (!m.url || seen.has(m.url)) return false;
            seen.add(m.url);
            return true;
        }).slice(0, 20);

        for (let i = 0; i < uniqueMedia.length; i++) {
            const media = uniqueMedia[i];
            const mediaUrl = media.url;
            const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) ||
                media.type === 'video' ||
                input.includes('/reel/') ||
                input.includes('/tv/');

            try {
                if (isVideo) {
                    await client.sendMessage(remoteJid, {
                        video: { url: mediaUrl },
                        mimetype: 'video/mp4',
                        caption: '> *Powered by: KAIRO ZYNEX*'
                    }, { quoted: message });
                } else {
                    await client.sendMessage(remoteJid, {
                        image: { url: mediaUrl },
                        caption: '> *Powered by: KAIRO ZYNEX*'
                    }, { quoted: message });
                }
            } catch (mediaError) {
                console.error(`Instagram media ${i + 1} failed:`, mediaError);
            }

            if (i < uniqueMedia.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        await client.sendMessage(remoteJid, { react: { text: '✅', key: message.key } });

    } catch (err) {
        console.error('Instagram error:', err);
        try { await client.sendMessage(remoteJid, { react: { text: '❌', key: message.key } }); } catch {}
        await client.sendMessage(remoteJid, { text: `❌ Error: ${err.message}` }, { quoted: message });
    }
}

export default { tiktok, instagram };
