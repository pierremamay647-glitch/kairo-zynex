import fetch from 'node-fetch';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

// ─── .telegram / .tgsticker <pack_link_or_name> <name> <quantity?> ─────────
// Downloads static stickers from a Telegram sticker pack and resends them
// as WhatsApp stickers, rebranded with a custom pack name.
// Requires TELEGRAM_BOT_TOKEN in your environment (get one from @BotFather).
export async function telegram(message, client, args) {
    const remoteJid = message.key.remoteJid;

    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!tgToken) {
        return client.sendMessage(remoteJid, {
            text: '❌ TELEGRAM_BOT_TOKEN is not configured on this bot.'
        }, { quoted: message });
    }

    const packInputRaw = args[0];
    const lastArg = args[args.length - 1];
    const requestedQty = /^\d+$/.test(lastArg) ? parseInt(lastArg, 10) : null;
    const customName = requestedQty !== null
        ? args.slice(1, -1).join(' ')
        : args.slice(1).join(' ');

    if (!packInputRaw || !customName) {
        return client.sendMessage(remoteJid, {
            text: '❌ Usage: .telegram <pack_link_or_name> <name> <quantity?>\nEx: .telegram https://t.me/addstickers/PackName MyPack 20\nMax: 30 stickers per request.'
        }, { quoted: message });
    }

    try {
        const linkMatch = packInputRaw.match(/(?:t\.me|telegram\.me)\/addstickers\/([A-Za-z0-9_]+)/i);
        const packInput = linkMatch ? linkMatch[1] : packInputRaw;
        const tgApiBase = `https://api.telegram.org/bot${tgToken}`;

        const setRes = await fetch(`${tgApiBase}/getStickerSet?name=${encodeURIComponent(packInput)}`);
        const setData = await setRes.json();

        if (!setData.ok) {
            return client.sendMessage(remoteJid, {
                text: `❌ Pack not found: ${packInput}\nCheck the exact Telegram pack name or link.`
            }, { quoted: message });
        }

        const stickers = setData.result.stickers;
        const packName = setData.result.title;
        const MAX_STICKERS = 30;
        const total = Math.min(stickers.length, requestedQty || 10, MAX_STICKERS);

        await client.sendMessage(remoteJid, {
            text: `✅ Pack: ${packName}\n📦 Total: ${stickers.length} stickers\n📤 Sending up to ${total} static stickers (animated/video stickers are skipped)...`
        }, { quoted: message });

        let sentCount = 0;
        let skipped = 0;

        for (let i = 0; i < stickers.length && sentCount < total; i++) {
            const sticker = stickers[i];

            // Only static webp stickers are supported without a video/ffmpeg pipeline.
            if (sticker.is_animated || sticker.is_video) {
                skipped++;
                continue;
            }

            try {
                const fileRes = await fetch(`${tgApiBase}/getFile?file_id=${sticker.file_id}`);
                const fileData = await fileRes.json();
                if (!fileData.ok) continue;

                const fileUrl = `https://api.telegram.org/file/bot${tgToken}/${fileData.result.file_path}`;
                const stickerRes = await fetch(fileUrl);
                const stickerBuf = Buffer.from(await stickerRes.arrayBuffer());

                let brandedBuf = stickerBuf;
                try {
                    const brandedSticker = new Sticker(stickerBuf, {
                        pack: customName,
                        author: 'KAIRO ZYNEX',
                        type: StickerTypes.FULL,
                        quality: 70,
                        background: 'transparent'
                    });
                    brandedBuf = await brandedSticker.toBuffer();
                } catch (brandErr) {
                    console.error('TG sticker branding error:', brandErr.message);
                }

                await client.sendMessage(remoteJid, { sticker: brandedBuf }, { quoted: message });
                sentCount++;
                await new Promise(r => setTimeout(r, 500));

            } catch (sErr) {
                console.error(`TG sticker ${i} error:`, sErr.message);
            }
        }

        if (sentCount === 0) {
            return client.sendMessage(remoteJid, {
                text: '❌ Failed to send any stickers (pack may only contain animated/video stickers, which are not supported).'
            }, { quoted: message });
        }

        await client.sendMessage(remoteJid, {
            text: `✅ ${sentCount} stickers sent from pack: ${packName}\n🏷️ Branded as: ${customName}${skipped ? `\n(⏭️ ${skipped} animated/video stickers skipped)` : ''}\n\n*Powered by: KAIRO ZYNEX*`
        }, { quoted: message });

    } catch (e) {
        console.error('Telegram sticker error:', e);
        await client.sendMessage(remoteJid, { text: `❌ Telegram error: ${e.message}` }, { quoted: message });
    }
}

export default { telegram };
