import axios from 'axios';

// ─── 15 dramatic scene templates × 10 colors = 150 combinations ────────────
const SCENE_TEMPLATES = [
    "epic anime character wrapped in glowing {{COLOR}} lightning energy, dramatic dark background, bold stylized text '{{TEXT}}' at the top, digital art, high detail, cinematic lighting",
    "mysterious hooded figure in a {{COLOR}} neon-lit alley, cyberpunk poster style, large bold graffiti-style text '{{TEXT}}', dramatic shadows",
    "ornate fantasy calligraphy logo, the word '{{TEXT}}' engraved in shining {{COLOR}} metal, glowing sparkles, black background, luxury emblem style",
    "anime warrior silhouette standing before a giant {{COLOR}} energy explosion, dramatic manga poster, bold text '{{TEXT}}' across the bottom",
    "sleek modern tech logo badge, circuit-board patterns glowing {{COLOR}}, the word '{{TEXT}}' in futuristic bold font, dark background",
    "gothic horror poster, torn paper texture, dripping {{COLOR}} paint text reading '{{TEXT}}', dark moody atmosphere",
    "golden royal crest, {{COLOR}} crown and shield emblem, elegant serif text '{{TEXT}}', regal black backdrop",
    "explosive comic book action cover, {{COLOR}} energy blast, bold comic-style lettering '{{TEXT}}', dynamic pose character",
    "minimalist wordmark logo, the text '{{TEXT}}' in clean bold {{COLOR}} letters, subtle glow, dark studio background",
    "streetwear brand poster, urban night scene, {{COLOR}} neon sign spelling '{{TEXT}}', gritty realistic photo style",
    "mecha robot emerging from {{COLOR}} smoke and sparks, sci-fi poster, bold metallic text '{{TEXT}}'",
    "mystical wizard casting a {{COLOR}} magic spell, fantasy book cover style, elegant text '{{TEXT}}' at the top",
    "esports team logo, aggressive {{COLOR}} beast mascot, bold sporty text '{{TEXT}}', dark gradient background",
    "vintage badge emblem, {{COLOR}} ink stamp style, the word '{{TEXT}}' in bold serif letters, aged paper texture",
    "abstract {{COLOR}} smoke and light rays forming a dramatic backdrop, the word '{{TEXT}}' glowing in the center, cinematic"
];

const COLORS = [
    'blue', 'red', 'green', 'gold', 'purple',
    'cyan', 'orange', 'silver', 'pink', 'white'
];

function buildRandomPrompt(text) {
    const template = SCENE_TEMPLATES[Math.floor(Math.random() * SCENE_TEMPLATES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const prompt = template
        .replaceAll('{{TEXT}}', text)
        .replaceAll('{{COLOR}}', color);
    return { prompt, color, index: SCENE_TEMPLATES.indexOf(template) + 1 };
}

async function tryRequest(fn, tries = 3) {
    let lastErr;
    for (let i = 1; i <= tries; i++) {
        try {
            return await fn();
        } catch (e) {
            lastErr = e;
            if (i < tries) await new Promise(r => setTimeout(r, i * 1500));
        }
    }
    throw lastErr;
}

// ─── .aigen <text> ───────────────────────────────────────────────────────
// Generates a dramatic AI-art style banner/logo using the given text,
// picking a random scene + color combination (150 total combinations).
export async function aigen(message, client, text) {
    const remoteJid = message.key.remoteJid;

    if (!text || !text.trim()) {
        return client.sendMessage(remoteJid, {
            text: '❌ Usage: .aigen <text>\nEx: .aigen MR KAIRO\n\nGenerates a random dramatic AI-art style banner (150 style/color combinations).'
        }, { quoted: message });
    }

    try {
        await client.sendMessage(remoteJid, {
            text: '🎨 Generating your AI artwork, please wait...'
        }, { quoted: message });

        const { prompt, color, index } = buildRandomPrompt(text.trim());
        const seed = Math.floor(Math.random() * 1_000_000);
        const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

        const response = await tryRequest(() =>
            axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 60000
            })
        );

        const imageBuffer = Buffer.from(response.data);

        await client.sendMessage(remoteJid, {
            image: imageBuffer,
            caption: `*${text.trim()}*\n\n🎨 Style #${index} · ${color}\n\n*Powered by: KAIRO ZYNEX*`
        }, { quoted: message });

    } catch (err) {
        console.error('AIGEN ERROR:', err);
        await client.sendMessage(remoteJid, {
            text: '❌ Failed to generate the artwork. The AI service might be busy, try again in a moment.'
        }, { quoted: message });
    }
}

export default { aigen };
