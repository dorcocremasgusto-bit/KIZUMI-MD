const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'demote',

    async execute(sock, m, args) {
        const from = m.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return sock.sendCustom(from, {
                text: reply("⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥", ["Cette commande est réservée aux groupes."])
            });
        }

        let users = [];

        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned && mentioned.length) users.push(...mentioned);

        const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
        if (quoted) users.push(quoted);

        users = [...new Set(users)];

        if (users.length === 0) {
            return sock.sendCustom(from, {
                text: reply("🐉 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗖𝗢𝗡𝗧𝗥𝗢𝗟", ["Mentionne ou réponds à un admin à destituer."])
            });
        }

        try {
            await sock.groupParticipantsUpdate(from, users, "demote");

            return sock.sendCustom(from, {
                text: reply("⚔︎ 𝗗𝗘𝗠𝗢𝗧𝗜𝗢𝗡 𝗥𝗘́𝗨𝗦𝗦𝗜𝗘", [
                    "ᴀᴅᴍɪɴ ➜ ᴍᴇᴍʙʀᴇ",
                    "Action exécutée avec succès."
                ])
            });

        } catch (e) {
            console.log(e);
            return sock.sendCustom(from, {
                text: reply("❌ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗗𝗘 𝗗𝗘𝗠𝗢𝗧𝗜𝗢𝗡", ["Action impossible."])
            });
        }
    }
};
