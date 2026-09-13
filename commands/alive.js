const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'alive',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const msg = reply("🥷 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗔𝗟𝗜𝗩𝗘", [
            "KIZUMI MD est en ligne 🟢",
            "Prêt à servir les gwo bouboun'.",
            "Tape .menu pour voir mes pouvoirs."
        ]);
        await sock.sendMessage(from, { text: msg }, { quoted: m });
    }
};
