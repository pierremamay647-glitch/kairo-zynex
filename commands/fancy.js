const map = {
a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',
n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'
};
export async function fancy(message, client, text) {
    if (!text) return client.sendMessage(message.key.remoteJid, { text: '*𝚄𝚂𝙰𝙶𝙴: .fancy <text>*' }, { quoted: message });
    const result = [...text].map(ch => map[ch.toLowerCase()] || ch).join('');
    await client.sendMessage(message.key.remoteJid, { text: result }, { quoted: message });
}
export default fancy;
