module.exports = {
    name: 'unmute',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            sock.sendCustom(from, { text: "Groupe ouvert. Tout le monde peut envoyer des messages.Nou met jape" });
        } catch (e) {
            sock.sendCustom(from, { text: "Erreur. Vérifiez mes permissions." });
        }
    }
};
