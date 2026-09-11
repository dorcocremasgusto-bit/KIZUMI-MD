const axios = require('axios');
const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(' ');
        if (!text) {
            return sock.sendCustom(from, {
                text: reply("🧠 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗔𝗜", ["Pose ta question.Pale vit jeneral", "Exemple : .ai Bonjour"])
            });
        }
        try {
            const response = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=fr`);
            const answer = response.data.success || "Je ne sais pas quoi répondre à cela.Ki mòd kesyon sa kk?";
            sock.sendCustom(from, { text: reply("🧠 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗔𝗜", [answer]) });
        } catch (e) {
            sock.sendCustom(from, {
                text: reply("🧠 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗔𝗜", ["M fout fatigué, réessaie plus tard."])
            });
        }
    }
};
