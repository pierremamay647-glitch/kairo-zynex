import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import configManager from './manageConfigs.js';
import fs from 'fs';

const SESSIONS_FILE = "sessions.json";
const sessions = {};

function normalizeNumber(value) {
    return String(value || '').replace(/\D/g, '');
}

function saveSessionNumber(number) {
    let sessionsList = [];
    if (fs.existsSync(SESSIONS_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
            sessionsList = Array.isArray(data.sessions) ? data.sessions : [];
        } catch {
            sessionsList = [];
        }
    }
    if (!sessionsList.includes(number)) {
        sessionsList.push(number);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
    }
}

function removeSession(number) {
    if (fs.existsSync(SESSIONS_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
            const sessionsList = Array.isArray(data.sessions) ? data.sessions.filter(n => n !== number) : [];
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
        } catch {}
    }

    const sessionPath = `./sessions/${number}`;
    if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
    delete sessions[number];

    if (configManager.config?.users?.root?.primary === number) {
        configManager.config.users.root.primary = "";
        configManager.save();
    }
}

function ensureUserConfig(number) {
    configManager.config ||= {};
    configManager.config.users ||= {};
    configManager.config.users[number] ||= {
        sudoList: [],
        tagAudioPath: "tag.mp3",
        antilink: false,
        response: true,
        autoreact: false,
        prefix: ".",
        welcome: false,
        record: false,
        type: false,
        like: false,
        online: false,
        emoji: "🤖"
    };
    configManager.config.users.root ||= {};
    configManager.save();
}

export function getSession(number) {
    return sessions[normalizeNumber(number)];
}

export async function startSession(targetNumber, handler, makePrimary = true, onPairingCode = () => {}) {
    const number = normalizeNumber(targetNumber);
    if (!number || number.length < 7 || number.length > 15) {
        throw new Error("Invalid WhatsApp number. Use country code + number, digits only.");
    }

    if (sessions[number]) return sessions[number];

    const sessionPath = `./sessions/${number}`;
    fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60_000,
        defaultQueryTimeoutMs: 60_000,
        keepAliveIntervalMs: 25_000,
        retryRequestDelayMs: 2_000,
        generateHighQualityLinkPreview: false
    });

    sessions[number] = sock;
    ensureUserConfig(number);
    saveSessionNumber(number);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            configManager.config.users.root.primary = number;
            configManager.save();
            console.log(`✅ Session open for ${number}`);
            return;
        }

        if (connection !== 'close') return;

        // Ignore a stale socket's close event if a newer socket is already active.
        if (sessions[number] !== sock) return;

        const code = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.error?.statusCode;
        const message = lastDisconnect?.error?.message || 'unknown reason';
        const loggedOut = code === DisconnectReason.loggedOut || code === 401;

        console.warn(`🔌 WhatsApp connection closed for ${number}. code=${code ?? 'unknown'} reason=${message}`);
        delete sessions[number];

        if (loggedOut) {
            console.error(`❌ WhatsApp session logged out for ${number}. Authentication was rejected/removed.`);
            removeSession(number);
            return;
        }

        // Keep the auth folder intact for transient network/server disconnects.
        setTimeout(() => {
            if (sessions[number]) return;
            startSession(number, handler, false, onPairingCode)
                .catch(err => console.error(`❌ Reconnect failed for ${number}:`, err));
        }, 3000);
    });

    sock.ev.on('messages.upsert', async msg => {
        try {
            await handler(msg, sock);
        } catch (err) {
            console.error("Message handler error:", err);
        }
    });

    if (!state.creds.registered) {
        setTimeout(async () => {
            if (state.creds.registered || sessions[number] !== sock) return;
            try {
                const code = await sock.requestPairingCode(number);
                console.log(`📲 Pairing code for ${number}: ${code}`);
                onPairingCode(code, number);
            } catch (err) {
                console.error("Pairing code error:", err);
                onPairingCode(null, number, err);
            }
        }, 2500);
    }

    return sock;
}

export default startSession;
