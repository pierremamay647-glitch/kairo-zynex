
export async function pingCommand(message, client) {

    const remoteJid = message.key.remoteJid;

    // Record the start time
    const startTime = Date.now();

    // Send a ping message
    const sentMessage = await client.sendMessage(remoteJid, { text: '_𝙿𝙾𝙽𝙶!_' });

    // Calculate the latency
    const endTime = Date.now();
    
    const latency = endTime - startTime;

    // Send the latency result back to the user
    await client.sendMessage(remoteJid, {

        text: `*𝚂𝙿𝙴𝙴𝙳: ${latency} 𝙼𝚂*\n`,

    });
}

//237689360833@s.whatsapp.net

export default pingCommand;
