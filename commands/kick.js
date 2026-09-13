const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'kick',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;

        try {
            if (!from.endsWith('@g.us')) {
                return sock.sendCustom(from, { text: reply("⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥", ["Groupe uniquement."]) });
            }

            let users = [];
            const ctx = m.message?.extendedTextMessage?.contextInfo;

            if (ctx?.mentionedJid) users.push(...ctx.mentionedJid);
            if (ctx?.participant) users.push(ctx.participant);

            if (users.length === 0) {
                return sock.sendCustom(from, {
                    text: reply("⚠️ 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗜𝗢𝗡", ["Mentionne ou réponds à un utilisateur."])
                });
            }

            await sock.groupParticipantsUpdate(from, users, "remove");

            await sock.sendMessage(from, {
                text: reply("💀 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗘𝗨𝗥 𝗘𝗫𝗖𝗟𝗨(p'tit banben)", users.map(u => "@" + u.split("@")[0])),
                mentions: users
            }, { quoted: m });

        } catch (e) {
            console.log("KICK ERROR:", e);
            await sock.sendCustom(from, { text: reply("❌ 𝗘́𝗖𝗛𝗘𝗖", [e.message]) });
        }
    }
};
