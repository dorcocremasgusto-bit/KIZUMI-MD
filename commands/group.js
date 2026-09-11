module.exports = {
    name: 'group',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        if (args[0] === 'open') {
            await sock.groupSettingUpdate(from, 'not_announcement');
            sock.sendCustom(from, { text: "Groupe ouvert. Tout le monde peut envoyer des messages." });
        } else if (args[0] === 'close') {
            await sock.groupSettingUpdate(from, 'announcement');
            sock.sendCustom(from, { text: "Groupe fermé. Seuls les administrateurs peuvent envoyer des messages." });
        } else {
            sock.sendCustom(from, { text: "Utilisation: .group open/close" });
        }
    }
};
