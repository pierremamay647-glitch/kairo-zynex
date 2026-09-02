case 'telegram':
case 'tgsticker': {
    if (!usedWithPrefix(m, command, prefix)) return;
    try {
        await prim.sendMessage(from, { react: { text: '✈️', key: m.key } });

        const packInputRaw = args[0];
        const lastArg = args[args.length - 1];
        const requestedQty = /^\d+$/.test(lastArg) ? parseInt(lastArg, 10) : null;
        const customName = requestedQty !== null
            ? args.slice(1, -1).join(' ')
            : args.slice(1).join(' ');

        if (!packInputRaw || !customName) {
            return await prim.sendMessage(from, {
                text: `*❌ 𝚄𝚂𝙰𝙶𝙴:* .telegram <pack_link_or_name> <name> <quantity?>\n_𝙴𝚇𝙰𝙼𝙿𝙻𝙴: .telegram https://t.me/addstickers/Fellow_Azure_Crab_by_fStikBot MyPack_\n_𝙴𝚇𝙰𝙼𝙿𝙻𝙴: .telegram Fellow_Azure_Crab_by_fStikBot MyPack 20_\n_𝙼𝙰𝚇𝙸𝙼𝚄𝙼: 30 𝚂𝚃𝙸𝙲𝙻𝙴𝚁𝚂 𝙿𝙴𝚁 𝚁𝙴𝚀𝚄𝙴𝚂𝚃`
            }, { quoted: m });
        }

        const linkMatch = packInputRaw.match(/(?:t\.me|telegram\.me)\/addstickers\/([A-Za-z0-9_]+)/i);
        const packInput = linkMatch ? linkMatch[1] : packInputRaw;

        const tgToken = "put one here";

        if (!tgToken) {
            return await prim.sendMessage(from, {
                text: `*❌ 𝚃𝙴𝙻𝙴𝙶𝚁𝙰𝙼_𝙱𝙾𝚃_𝚃𝙾𝙺𝙴𝙽 𝙽𝙾𝚃 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙴𝙳*`
            }, { quoted: m });
        }

        await prim.sendMessage(from, {
            text: `*⏳ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝚃𝙴𝙻𝙴𝙶𝚁𝙰𝙼 𝙿𝙰𝙲𝙺:* ${packInput}...\n*🏷️ 𝚆𝙸𝙻𝙻 𝙱𝙴 𝙱𝚁𝙰𝙽𝙳𝙴𝙳 𝙰𝚂:* ${customName}`
        }, { quoted: m });

        const tgApiBase = `https://api.telegram.org/bot${tgToken}`;
        const packRes = await axios.get(`${tgApiBase}/getStickerSet?name=${encodeURIComponent(packInput)}`);

        if (!packRes.data.ok) {
            return await prim.sendMessage(from, {
                text: `*❌ 𝙿𝙰𝙲𝙺 𝙽𝙾𝚃 𝙵𝙾𝚄𝙽𝙳:* ${packInput}\n_𝙲𝙷𝙴𝙲𝙺 𝚃𝙷𝙴 𝙴𝚇𝙰𝙲𝚃 𝚃𝙴𝙻𝙴𝙶𝚁𝙰𝙼 𝙿𝙰𝙲𝙺 𝙽𝙰𝙼𝙴 𝙾𝚁 𝙻𝙸𝙽𝙺._`
            }, { quoted: m });
        }

        const stickers = packRes.data.result.stickers;
        const packName = packRes.data.result.title;
        const MAX_STICKERS = 30;
        const total = Math.min(stickers.length, requestedQty || 10, MAX_STICKERS);

        await prim.sendMessage(from, {
            text: `*✅ 𝙿𝙰𝙲𝙺:* ${packName}\n*📦 𝚃𝙾𝚃𝙰𝙻:* ${stickers.length} 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂\n*📤 𝚂𝙴𝙽𝙳𝙸𝙽𝙶 𝙵𝙸𝚁𝚂𝚃 ${total}...*`
        }, { quoted: m });

        const tmpDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        let sentCount = 0;
        let lastError = null;

        for (let i = 0; i < total; i++) {
            try {
                const sticker = stickers[i];
                const fileId = sticker.file_id;

                const fileRes = await axios.get(`${tgApiBase}/getFile?file_id=${fileId}`);
                if (!fileRes.data.ok) continue;

                const filePath = fileRes.data.result.file_path;
                const fileUrl = `https://api.telegram.org/file/bot${tgToken}/${filePath}`;

                const stickerRes = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                const stickerBuf = Buffer.from(stickerRes.data);

                const ext = sticker.is_video ? '.webm' : sticker.is_animated ? '.tgs' : '.webp';
                const stickerPath = path.join(tmpDir, `tg_${Date.now()}_${i}${ext}`);

                fs.writeFileSync(stickerPath, stickerBuf);

                let finalBuf;

                if (ext === '.webp') {
                    finalBuf = stickerBuf;
                } else {
                    const outPath = path.join(tmpDir, `tg_out_${Date.now()}_${i}.webp`);

                    try {
                        await new Promise((resolve, reject) => {
                            execLimited(`ffmpeg -i "${stickerPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" "${outPath}" -y`,
                                (err) => err ? reject(err) : resolve()
                            );
                        });

                        finalBuf = fs.readFileSync(outPath);
                        try { fs.unlinkSync(outPath); } catch(e) {}
                    } catch {
                        try { fs.unlinkSync(stickerPath); } catch(e) {}
                        continue;
                    }
                }

                let brandedBuf = finalBuf;
                try {
                    const brandedSticker = new Sticker(finalBuf, {
                        pack: customName,
                        author: 'Squichy Bot',
                        type: StickerTypes.FULL,
                        quality: 70,
                        background: 'transparent'
                    });
                    brandedBuf = await brandedSticker.toBuffer();
                } catch (brandErr) {
                    console.error('TG sticker branding error:', brandErr.message);
                }

                await prim.sendMessage(from, { sticker: brandedBuf }, { quoted: m });
                sentCount++;

                try { fs.unlinkSync(stickerPath); } catch(e) {}
                await delay(500);

            } catch (sErr) {
                console.error(`TG sticker ${i} error:`, sErr.message);
                lastError = sErr.message;
            }
        }

        if (sentCount === 0) {
            return await prim.sendMessage(from, {
                text: `*❌ 𝙵𝙰𝙸𝙻𝙴𝙳 𝚃𝙾 𝚂𝙴𝙽𝙳 𝙰𝙽𝚈 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂.*\n\n*— 𝙻𝙰𝚂𝚃 𝙴𝚁𝚁𝙾𝚁:* ${lastError || 'Unknown'}`
            }, { quoted: m });
        }

        await prim.sendMessage(from, {
            text: `*✅ ${sentCount}/${total} 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂 𝚂𝙴𝙽𝚃 𝙵𝚁𝙾𝙼 𝙿𝙰𝙲𝙺:* ${packName}\n*🏷️ 𝙱𝚁𝙰𝙽𝙳𝙴𝙳 𝙰𝚂:* ${customName}\n> *𝚂𝚀𝚄𝙸𝙲𝙷𝚈 𝙱𝙾𝚃*`
        }, { quoted: m });

        await prim.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Telegram sticker error:', e);
        await prim.sendMessage(from, {
            text: `*❌ 𝚃𝙴𝙻𝙴𝙶𝚁𝙰𝙼 𝙴𝚁𝚁𝙾𝚁:* ${e.message}`
        }, { quoted: m });
    }
    break;
}