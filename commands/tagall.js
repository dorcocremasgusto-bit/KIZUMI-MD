const fs = require("fs");
const path = require("path");
const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'tagall',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;

        try {
            if (!from.endsWith("@g.us")) {
                return sock.sendCustom(from, { text: reply("⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥", ["Cette commande est réservée aux groupes."]) });
            }

            const metadata = await sock.groupMetadata(from).catch(() => null);
            if (!metadata) {
                return sock.sendCustom(from, { text: reply("❌ 𝗘𝗥𝗥𝗘𝗨𝗥", ["Impossible de récupérer les infos du groupe."]) });
            }

            const participants = metadata.participants || [];
            if (!participants.length) {
                return sock.sendCustom(from, { text: reply("❌ 𝗥𝗔𝗦", ["Aucun membre trouvé."]) });
            }

            const message = args.join(" ") || "📢 Appel général !";
            let mentions = [];
            let list = [];

            for (let p of participants) {
                if (!p?.id) continue;
                mentions.push(p.id);
                list.push(`@${p.id.split("@")[0]}`);
            }

            const imgPath = path.join(__dirname, "../images/thumb.jpg");
            const caption = reply("📢 𝗧𝗔𝗚𝗔𝗟𝗟", [
                `Groupe : ${metadata.subject}`,
                `Message : ${message}`,
                `Membres : ${participants.length}`,
                ...list
            ]);

            if (fs.existsSync(imgPath)) {
                await sock.sendMessage(from, { image: fs.readFileSync(imgPath), caption, mentions }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: caption, mentions }, { quoted: m });
            }

        } catch (e) {
            console.log("TAGALL ERROR:", e);
            await sock.sendCustom(from, { text: reply("❌ 𝗘𝗥𝗥𝗘𝗨𝗥", ["Erreur tagall."]) });
        }
    }
};
