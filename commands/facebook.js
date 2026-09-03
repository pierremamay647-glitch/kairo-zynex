import axios from 'axios';
import fs from 'fs';
import path from 'path';

// ─── .fb / .facebook <link> ─────────────────────────────────────────────────
export async function facebook(message, client, url) {
    const remoteJid = message.key.remoteJid;

    if (!url) {
        return client.sendMessage(remoteJid, {
            text: 'Please provide a Facebook video URL.\nExample: .fb https://www.facebook.com/...'
        }, { quoted: message });
    }

    if (!url.includes('facebook.com')) {
        return client.sendMessage(remoteJid, { text: 'That is not a Facebook link.' }, { quoted: message });
    }

    try {
        // Resolve share/short URLs to their final destination first
        let resolvedUrl = url;
        try {
            const res = await axios.get(url, { timeout: 20000, maxRedirects: 10, headers: { 'User-Agent': 'Mozilla/5.0' } });
            const possible = res?.request?.res?.responseUrl;
            if (possible && typeof possible === 'string') resolvedUrl = possible;
        } catch {
            // ignore resolution errors; use original url
        }

        async function fetchFromApi(u) {
            const apiUrl = `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(u)}`;
            try {
                const response = await axios.get(apiUrl, {
                    timeout: 20000,
                    headers: { accept: '*/*', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    maxRedirects: 5,
                    validateStatus: s => s >= 200 && s < 500
                });
                if (response.data) return { response };
            } catch (error) {
                console.error(`Siputzx API failed: ${error.message}`);
            }
            throw new Error('Siputzx API failed');
        }

        let apiResult;
        try {
            apiResult = await fetchFromApi(resolvedUrl);
        } catch {
            apiResult = await fetchFromApi(url);
        }

        const data = apiResult.response.data;
        let fbvid = null;
        let title = null;

        if (data?.status && data?.data && Array.isArray(data.data.data)) {
            const hdVideo = data.data.data.find(item => item.resolution === 'HD' && item.format === 'mp4');
            const sdVideo = data.data.data.find(item => item.resolution === 'SD' && item.format === 'mp4');
            fbvid = hdVideo?.url || sdVideo?.url;
            title = data.data.title || 'Facebook Video';
        }

        if (!fbvid) {
            return client.sendMessage(remoteJid, {
                text: '❌ Failed to get video URL from Facebook.\n\nPossible reasons:\n• Video is private or deleted\n• Link is invalid\n• Video is not available for download\n\nPlease try a different Facebook video link.'
            }, { quoted: message });
        }

        const caption = title ? `> *Powered by: KAIRO ZYNEX*\n\n📝 Title: ${title}` : '> *Powered by: KAIRO ZYNEX*';

        try {
            await client.sendMessage(remoteJid, { video: { url: fbvid }, mimetype: 'video/mp4', caption }, { quoted: message });
            return;
        } catch (urlError) {
            console.error(`URL method failed: ${urlError.message}`);

            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
            const tempFile = path.join(tmpDir, `fb_${Date.now()}.mp4`);

            const videoResponse = await axios({
                method: 'GET',
                url: fbvid,
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    Accept: 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    Referer: 'https://www.facebook.com/'
                }
            });

            const writer = fs.createWriteStream(tempFile);
            videoResponse.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
                throw new Error('Failed to download video');
            }

            await client.sendMessage(remoteJid, { video: { url: tempFile }, mimetype: 'video/mp4', caption }, { quoted: message });

            try { fs.unlinkSync(tempFile); } catch (err) { console.error('Error cleaning up temp file:', err); }
        }

    } catch (error) {
        console.error('Error in Facebook command:', error);
        await client.sendMessage(remoteJid, { text: 'An error occurred. API might be down. Error: ' + error.message }, { quoted: message });
    }
}

export default { facebook };
