module.exports = {
    name: 'mute',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        try {
            await sock.groupSettingUpdate(from, 'announcement');
            sock.sendCustom(from, { text: "Groupe fermé. Seuls les admins peuvent envoyer des messages.Fèmen dan nou mèsi😭" });
        } catch (e) {
            sock.sendCustom(from, { text: "Erreur. Vérifiez mes permissions." });
        }
    }
};
