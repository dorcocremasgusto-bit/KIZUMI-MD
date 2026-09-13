const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: "getpp",
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        try {
            let target;
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (isGroup && mentioned && mentioned.length > 0) {
                target = mentioned[0];
            } else if (args[0]) {
                let number = args[0].replace(/[^0-9]/g, "");
                target = number + "@s.whatsapp.net";
            } else if (!isGroup) {
                target = from;
            }

            if (!target) {
                return await sock.sendCustom(from, {
                    text: reply("❌ 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡", [
                        "getpp @user",
                        "getpp 228XXXXXXXX",
                        "ou utilise en privé"
                    ])
                });
            }

            const ppUrl = await sock.profilePictureUrl(target, "image").catch(() => null);
            const username = target.split("@")[0];

            if (ppUrl) {
                await sock.sendCustom(from, {
                    image: { url: ppUrl },
                    caption: reply("👤 𝗣𝗛𝗢𝗧𝗢 𝗧𝗥𝗢𝗨𝗩𝗘́𝗘", [`Utilisateur : @${username}`, "Récupérée avec succès ✅"]),
                    mentions: [target]
                });
            } else {
                await sock.sendCustom(from, {
                    text: reply("⚠️ 𝗜𝗡𝗧𝗥𝗢𝗨𝗩𝗔𝗕𝗟𝗘", [`Utilisateur : @${username}`, "Photo privée ou inexistante"]),
                    mentions: [target]
                });
            }

        } catch (e) {
            console.error("Erreur getpp :", e);
            await sock.sendCustom(from, {
                text: reply("💀 𝗘𝗥𝗥𝗘𝗨𝗥", ["Une erreur est survenue, réessaie plus tard."])
            });
        }
    },
};
