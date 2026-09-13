const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'botinfo',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const info = reply("🥷 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗣𝗥𝗢𝗙𝗜𝗟𝗘", [
            "ɴᴀᴍᴇ  : KIZUMI MD",
            "ᴠᴇʀ   : v1.0",
            "ᴄᴏʀᴇ  : Node.js + Baileys",
            "ᴍᴏᴅᴇ  : PUBLIC",
            "ᴅᴇᴠ   : Arthur Dev"
        ]);
        sock.sendMessage(from, { text: info }, { quoted: m });
    }
};
