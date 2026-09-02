import fetch from 'node-fetch';
import yts from 'yt-search';

// ─── .song / .play / .mp3 / .ytmp3 / .music / .audio ───────────────────────
export async function song(message, client, query) {
    const remoteJid = message.key.remoteJid;

    if (!query) {
        return client.sendMessage(remoteJid, { text: '❌ Provide a song name or YouTube link.\nEx: .play Faded Alan Walker' }, { quoted: message });
    }

    try {
        const search = await yts(query);
        const video = search?.videos?.[0];
        if (!video) {
            return client.sendMessage(remoteJid, { text: '❌ No results found.' }, { quoted: message });
        }

        const apiUrl = `https://arslan-apis-v2.vercel.app/download/ytmp3?url=${encodeURIComponent(video.url)}`;
        const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) });
        const data = await res.json();

        const dlUrl = data?.result?.download?.url;
        if (!data?.status || !dlUrl) {
            return client.sendMessage(remoteJid, { text: '❌ Audio not generated.' }, { quoted: message });
        }

        const meta = data.result.metadata || {};
        const quality = data.result.download.quality || '128kbps';

        await client.sendMessage(remoteJid, {
            audio: { url: dlUrl },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${meta.title || video.title || 'song'}.mp3`
        }, { quoted: message });

        await client.sendMessage(remoteJid, {
            text: `🎵 *${meta.title || video.title}*\n🎚️ Quality: ${quality}\n\n*Powered by: KAIRO ZYNEX*`
        }, { quoted: message });

    } catch (err) {
        console.error('SONG ERROR:', err);
        await client.sendMessage(remoteJid, { text: '❌ Something went wrong, try again later.' }, { quoted: message });
    }
}

// ─── .video1 / .vid / .ytv ──────────────────────────────────────────────────
export async function video1(message, client, query, apiKey) {
    const remoteJid = message.key.remoteJid;

    if (!query) {
        return client.sendMessage(remoteJid, { text: '❌ Provide a YouTube link or search query.\nEx: .video1 Pasoori' }, { quoted: message });
    }

    if (!apiKey) {
        return client.sendMessage(remoteJid, { text: '❌ .video1 needs GTECH_API_KEY set in your environment before it can be used.' }, { quoted: message });
    }

    try {
        let videoUrl = query;
        if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
            const search = await yts(query);
            const video = search?.videos?.[0];
            if (!video) return client.sendMessage(remoteJid, { text: '❌ No results found.' }, { quoted: message });
            videoUrl = video.url;
        }

        const res = await fetch(`https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(videoUrl)}`);
        const data = await res.json();

        if (!data.status) {
            return client.sendMessage(remoteJid, { text: '❌ Failed to fetch video.' }, { quoted: message });
        }

        const { video_url_hd: hdUrl, video_url_sd: sdUrl } = data.result.media;
        const finalUrl = hdUrl && !hdUrl.includes('No') ? hdUrl : sdUrl;

        if (!finalUrl || finalUrl.includes('No')) {
            return client.sendMessage(remoteJid, { text: '❌ No downloadable video found.' }, { quoted: message });
        }

        await client.sendMessage(remoteJid, {
            video: { url: finalUrl },
            caption: '*Powered by: KAIRO ZYNEX*'
        }, { quoted: message });

    } catch (err) {
        console.error('VIDEO1 ERROR:', err);
        await client.sendMessage(remoteJid, { text: '❌ Error while fetching video.' }, { quoted: message });
    }
}

// ─── .apk ────────────────────────────────────────────────────────────────
export async function apk(message, client, query) {
    const remoteJid = message.key.remoteJid;

    if (!query) {
        return client.sendMessage(remoteJid, { text: '📦 *USAGE:* .apk <app name>' }, { quoted: message });
    }

    try {
        const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(query)}/limit=1`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        const app = data?.datalist?.list?.[0];
        if (!app) {
            return client.sendMessage(remoteJid, { text: '❌ No APK found.' }, { quoted: message });
        }

        const appSize = (app.size / 1048576).toFixed(2);
        const caption = `┏━━ ✦ *APK INFO* ✦ ━━┓\n┃ 📱 Name    : *${app.name}*\n┃ 📦 Size    : *${appSize} MB*\n┃ 🧩 Package : *${app.package}*\n┃ 🔖 Version : *${app.file.vername}*\n┗━━━━━━━━━━━━━━━━━━┛\n\n*Powered by: KAIRO ZYNEX*`;

        await client.sendMessage(remoteJid, { image: { url: app.icon }, caption }, { quoted: message });

        await client.sendMessage(remoteJid, {
            document: { url: app.file.path || app.file.path_alt },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${app.name}.apk`
        }, { quoted: message });

    } catch (err) {
        console.error('APK ERROR:', err);
        await client.sendMessage(remoteJid, { text: '❌ Error, try again.' }, { quoted: message });
    }
}

export default { song, video1, apk };
