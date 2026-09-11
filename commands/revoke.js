module.exports = {
    name: 'revoke',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        try {
            await sock.groupRevokeInvite(from);
            sock.sendCustom(from, { text: "Le lien d'invitation du groupe a été révoqué." });
        } catch (e) {
            sock.sendCustom(from, { text: "Erreur. Assurez-vous que le bot est administrateur." });
        }
    }
};
