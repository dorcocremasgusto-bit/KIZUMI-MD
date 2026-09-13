const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'repo',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const repoInfo = reply("🔗 𝗖𝗢𝗡𝗡𝗘𝗖𝗧", [
            "Telegram : t.me/desriredev",
            "Développeur : Arthur Dev",
            "Kizumi — the best of Bèl Bouboun."
        ]);
        await sock.sendCustom(from, { text: repoInfo });
    }
};
