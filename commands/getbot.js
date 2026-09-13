const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'getbot',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const info = reply("🥷 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗣𝗥𝗢𝗙𝗜𝗟𝗘", [
            "ɴᴀᴍᴇ  : KIZUMI MD",
            "ᴠᴇʀ   : v1.0",
            "ᴅᴇᴠ   : Arthur Dev",
            "ʟᴀɴɢ  : Node.js (Baileys)",
            "sᴛᴀᴛ  : Opérationnel ✅",
            "Tape .repo pour obtenir le bot."
        ]);
        await sock.sendCustom(from, { text: info });
    }
};
