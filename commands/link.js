module.exports = {
    name: 'link',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        try {
            const code = await sock.groupInviteCode(from);
            sock.sendCustom(from, { text: "Lien du groupe : https://chat.whatsapp.com/" + code });
        } catch (e) {
            sock.sendCustom(from, { text: "Erreur. Assurez-vous que le bot est administrateur." });
        }
    }
};
