
import configManager from '../utils/manageConfigs.js';

import channelSender from '../commands/channelSender.js'

export async function auto(message, client, cond, emoji="🤖"){

    const remoteJid = message.key.remoteJid;

    if(cond){

        await client.sendMessage(remoteJid, 

            {
                react: {
                    text: `${emoji}`,

                    key: message.key
                }
            }
    )

    } else {

        return
    }
}

// Simple emoji regex (works for most cases)
function isEmoji(str) {

    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})$/u;

    return emojiRegex.test(str);
}

export async function autoreact(message, client) {

    const number = client.user.id.split(':')[0];

    try {

        const remoteJid = message.key?.remoteJid;

        if (!remoteJid) {

            throw new Error("𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝙹𝙸𝙳 𝙸𝚂 𝚄𝙽𝙳𝙴𝙵𝙸𝙽𝙴𝙳.*");
        }

        const messageBody =

            message.message?.extendedTextMessage?.text ||

            message.message?.conversation ||

            '';

        const commandAndArgs = messageBody.slice(1).trim();

        const parts = commandAndArgs.split(/\s+/);

        const args = parts.slice(1);

        if (args.length === 0) {

            throw new Error("𝙿𝙻𝙴𝙰𝚂𝙴 𝙿𝚁𝙾𝚅𝙸𝙳𝙴 'on', 'off'.*");
        }

        const input = args[0].toLowerCase();

        if (!configManager.config.users[number]) {

            configManager.config.users[number] = {};
        }

        const userConfig = configManager.config.users[number];

        if (input === 'on') {

            userConfig.autoreact = true;

            configManager.save();

            await channelSender(

                message,

                client,

                `𝙰𝚄𝚃𝙾-𝚁𝙴𝙰𝙲𝚃 𝙷𝙰𝚂 𝙱𝙴𝙴𝙽 𝚃𝚄𝚁𝙽𝙴𝙳 ${input.toUpperCase()}*`,
                3
            );
        
        } else if (input === "off"){

             userConfig.autoreact = false;

            configManager.save();

            await channelSender(

                message,

                client,

                `𝙰𝚄𝚃𝙾-𝚁𝙴𝙰𝙲𝚃 𝙷𝙰𝚂 𝙱𝙴𝙴𝙽 𝚃𝚄𝚁𝙽𝙴𝙳 ${input.toUpperCase()}*`,
                3
            );

        } else{

            await client.sendMessage(remoteJid, { text: "*𝚂𝙴𝙻𝙴𝙲𝚃 𝙰𝙽 𝙾𝙿𝚃𝙸𝙾: 𝙾𝙽 / 𝙾𝙵𝙵*" });
        }

    } catch (error) {

        await client.sendMessage(message.key.remoteJid, {

            text: `*❌ 𝙴𝚁𝚁𝙾𝚁 𝚆𝙷𝙸𝙻𝙴 𝚄𝙿𝙳𝙰𝚃𝙸𝙽𝙶 𝙰𝚄𝚃𝙾𝚁𝙴𝙰𝙲𝚃 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂: ${error.message}*`,
        });
    }
}

export default { auto, autoreact };