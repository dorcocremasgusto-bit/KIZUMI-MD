const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'kickall',

    async execute(sock, m, args) {
        const from = m.key.remoteJid;

        try {
            if (!from.endsWith("@g.us")) {
                return sock.sendCustom(from, { text: reply("❌ 𝗘𝗥𝗥𝗘𝗨𝗥", ["Groupe seulement."]) });
            }

            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants || [];

            const sender = m.key.participant || m.key.remoteJid;
            const botNumber = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";

            const targets = participants
                .filter(p => p.id !== sender && p.id !== botNumber && !p.admin)
                .map(p => p.id);

            if (targets.length === 0) {
                return sock.sendCustom(from, { text: reply("⚠️ 𝗥𝗔𝗦", ["Aucun membre à expulser."]) });
            }

            await sock.groupParticipantsUpdate(from, targets, "remove");

            await sock.sendCustom(from, {
                text: reply("💀 𝗞𝗜𝗖𝗞𝗔𝗟𝗟 𝗧𝗘𝗥𝗠𝗜𝗡𝗘́", [`${targets.length} membres supprimés`])
            });

        } catch (e) {
            console.log("KICKALL ERROR:", e);
            await sock.sendCustom(from, {
                text: reply("❌ 𝗘𝗥𝗥𝗘𝗨𝗥", ["WhatsApp a bloqué ou le bot n'est pas admin."])
            });
        }
    }
};
