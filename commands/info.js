import configManager from '../utils/manageConfigs.js'

import { BOT_NAME } from '../config.js'

import { OWNER_NAME } from '../config.js'

import fs from 'fs';

import path from 'path';

import { WA_CHANNEL } from "../config.js"


export async function info(message, client) {

    const remoteJid = message.key.remoteJid;

    const today = new Date();

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const currentDay = daysOfWeek[today.getDay()];

    const currentDate = today.getDate();

    const currentMonth = today.getMonth() + 1; 

    const currentYear = today.getFullYear();

    const owner = "KAIRO ZYNEX";

    const number = client.user.id.split(':')[0];

    const username = message.pushName || "Unknown";

    const prefix = (configManager.config.users[number]?.prefix || '.');

    const t = `
*╭─🔸 ${BOT_NAME}🔸  ─╮*
*│*
*│  ◈ 𝙿𝚁𝙴𝙵𝙸𝚇   : ${prefix}*
*│  ◈ 𝚆𝙰𝚂𝚂𝚄𝙿   : ${username}*
*│  ◈ 𝙳𝙰𝚈      : ${currentDay.toUpperCase()}*
*│  ◈ 𝙳𝙰𝚃𝙴     : ${currentDate}/${currentMonth}/${currentYear}*
*│  ◈ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽  : 1.0.0*
*│  ◈ 𝙿𝙻𝚄𝙶𝙸𝙽𝚂  : 69*
*│*
*╰────────────────────────────────────╯*

*╔═══「 🧸 𝙼𝙴𝙽𝚄 」═══╗*
*║*
*║  ❖ ${prefix}𝙼𝙴𝙽𝚄*
*║  ❖ ${prefix}𝙰𝙻𝙸𝚅𝙴*
*║  ❖ ${prefix}𝙿𝚁𝙸𝚅𝙰𝚃𝙴*
*║  ❖ ${prefix}𝚁𝚄𝙽𝚃𝙸𝙼𝙴*
*║*
*╚═══════════════════╝*

*╔═══「 🛠️ 𝚃𝙾𝙾𝙻𝚂 」═══╗*
*║*
*║  ◇ ${prefix}𝙿𝙸𝙽𝙶*
*║  ◇ ${prefix}𝙶𝙴𝚃𝙸𝙳*
*║  ◇ ${prefix}𝚂𝚄𝙳𝙾*
*║  ◇ ${prefix}𝚃𝙾𝚄𝚁𝙻*
*║  ◇ ${prefix}𝙾𝚆𝙽𝙴𝚁*
*║  ◇ ${prefix}𝙵𝙰𝙽𝙲𝚈*
*║  ◇ ${prefix}𝚄𝙿𝙳𝙰𝚃𝙴*
*║  ◇ ${prefix}𝙳𝙴𝚅𝙸𝙲𝙴*
*║  ◇ ${prefix}𝙳𝙴𝙻𝚂𝚄𝙳𝙾*
*║  ◇ ${prefix}𝙶𝙴𝚃𝚂𝚄𝙳𝙾*
*║*
*╚═══════════════════╝*

*╔═══「 ⚙️ 𝙲𝙾𝙽𝙵𝙸𝙶 」═══╗*
*║*
*║  ◇ ${prefix}𝙾𝙽𝙻𝙸𝙽𝙴*
*║  ◇ ${prefix}𝚆𝙴𝙻𝙲𝙾𝙼𝙴*
*║  ◇ ${prefix}𝙰𝚄𝚃𝙾𝚃𝚈𝙿𝙴*
*║  ◇ ${prefix}𝙰𝚄𝚃𝙾𝚁𝙴𝙰𝙲𝚃*
*║  ◇ ${prefix}𝚂𝙴𝚃𝙿𝚁𝙴𝙵𝙸𝚇*
*║  ◇ ${prefix}𝙶𝙴𝚃𝙲𝙾𝙽𝙵𝙸𝙶*
*║  ◇ ${prefix}𝚂𝚃𝙰𝚃𝚄𝚂𝙻𝙸𝙺𝙴*
*║  ◇ ${prefix}𝙰𝚄𝚃𝙾𝚁𝙴𝙲𝙾𝚁𝙳*
*║*
*╚═══════════════════╝*

*╔═══「 👥 𝙶𝚁𝙾𝚄𝙿 」═══╗*
*║*
*║  ◇ ${prefix}𝙱𝚈𝙴*
*║  ◇ ${prefix}𝙺𝙸𝙲𝙺*
*║  ◇ ${prefix}𝙿𝚄𝚁𝙶𝙴*
*║  ◇ ${prefix}𝙼𝚄𝚃𝙴*
*║  ◇ ${prefix}𝚄𝙽𝙼𝚄𝚃𝙴*
*║  ◇ ${prefix}𝙿𝚁𝙾𝙼𝙾𝚃𝙴*
*║  ◇ ${prefix}𝙳𝙴𝙼𝙾𝚃𝙴*
*║  ◇ ${prefix}𝙶𝙲𝙻𝙸𝙽𝙺*
*║  ◇ ${prefix}𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺*
*║  ◇ ${prefix}𝙺𝙸𝙲𝙺𝙰𝙻𝙻*
*║  ◇ ${prefix}𝙿𝚁𝙾𝙼𝙾𝚃𝙴𝙰𝙻𝙻*
*║  ◇ ${prefix}𝙳𝙴𝙼𝙾𝚃𝙴𝙰𝙻𝙻*
*║*
*╚═══════════════════╝*

*╔═══「 🎥 𝙼𝙴𝙳𝙸𝙰 」═══╗*
*║*
*║  ◇ ${prefix}𝚅𝚅*
*║  ◇ ${prefix}𝚃𝙰𝙺𝙴*
*║  ◇ ${prefix}𝚂𝙰𝚅𝙴*
*║  ◇ ${prefix}𝙿𝙷𝙾𝚃𝙾*
*║  ◇ ${prefix}𝚂𝙴𝚃𝙿𝙿*
*║  ◇ ${prefix}𝙶𝚁𝚃𝙿𝙿*
*║  ◇ ${prefix}𝚃𝙾𝙰𝚄𝙳𝙸𝙾*
*║  ◇ ${prefix}𝚂𝚃𝙸𝙲𝙺𝙴𝚁*
*║*
*╚═══════════════════╝*

*╔═══「 🔍 𝚂𝙴𝙰𝚁𝙲𝙷 」═══╗*
*║*
*║  ◇ ${prefix}KAIRO ZYNEX <𝚀𝚄𝙴𝚂𝚃𝙸𝙾𝙽>*
*║  ◇ ${prefix}𝚆𝙸𝙺𝙸-𝙴𝙽 <𝚃𝙾𝙿𝙸𝙲>*
*║  ◇ ${prefix}𝚆𝙸𝙺𝙸-𝙵𝚁 <𝚃𝙾𝙿𝙸𝙲>*
*║*
*╚═══════════════════╝*

*╔═══「 📥 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 」═══╗*
*║*
*║  ◇ ${prefix}𝙸𝙼𝙶*
*║  ◇ ${prefix}𝚃𝙸𝙺𝚃𝙾𝙺*
*║  ◇ ${prefix}ᴀᴘᴋ*
*║  ◇ ${prefix}sᴏɴɢ*
*║  ◇ ${prefix}xxxᴠɪᴅᴇᴏ*
*║*
*╚═══════════════════╝*

*╔═══「 🎨 𝙼𝙾𝚁𝙴 」═══╗*
*║*
*║  ◇ ${prefix}𝙻𝙾𝙶𝙾*
*║*
*╚═══════════════════╝*

*╔═══「 📺 𝚂𝙾𝙲𝙸𝙰𝙻 」═══╗*
*║*
*║  ◇ ${prefix}𝚅𝙸𝙳𝙴𝙾*
*║  ◇ ${prefix}𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺*
*║  ◇ ${prefix}𝙿𝚄𝙱𝙻𝙸𝙲*
*║  ◇ ${prefix}ᴛᴇʟᴇɢʀᴀᴍsᴛɪᴄᴋᴇʀ*
*║*
*╚═══════════════════╝*

*╔═══「 🆕 𝙽𝙴𝚆 」═══╗*
*║*
*║  ◇ ${prefix}𝙹𝙸𝙳*
*║  ◇ ${prefix}𝙶𝚁𝙾𝚄𝙿𝙸𝙽𝙵𝙾*
*║  ◇ ${prefix}𝙰𝙳𝙼𝙸𝙽𝚂*
*║  ◇ ${prefix}𝙼𝙴𝙼𝙱𝙴𝚁𝚂*
*║  ◇ ${prefix}𝙱𝙾𝚃𝙸𝙽𝙵𝙾*
*║  ◇ ${prefix}𝙲𝙰𝙻𝙲*
*║  ◇ ${prefix}𝚀𝚄𝙾𝚃𝙴*
*║  ◇ ${prefix}𝙷𝙴𝙻𝙿*
*║*
*╚═══════════════════╝*

*╔═══「 🏷️ 𝚃𝙰𝙶𝚂 」═══╗*
*║*
*║  ◇ ${prefix}𝚃𝙰𝙶*
*║  ◇ ${prefix}𝚃𝙰𝙶𝙰𝙳𝙼𝙸𝙽*
*║  ◇ ${prefix}𝚃𝙰𝙶𝙰𝙻𝙻*
*║  ◇ ${prefix}𝚂𝙴𝚃𝚃𝙰𝙶*
*║  ◇ ${prefix}𝚁𝙴𝚂𝙿𝙾𝙽𝚂*
*║*
*╚═══════════════════╝*

*⟪ 🗿 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 KAIRO DEV 🗿⟫*
    `
;

    await client.sendMessage(remoteJid, {

        image: fs.readFileSync(path.join(process.cwd(), 'menu.jpg')),

        caption: t,

        quoted: message

    });

    await client.sendMessage(remoteJid, {

            audio: { url: "menu.mp3" }, 

            mimetype: 'audio/mpeg',

            ptt: false,

            quoted: message
        });
}   

export default info;
