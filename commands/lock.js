module.exports = {
    name: 'lock',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        const sender = m.key.participant || m.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(v => v.admin !== null).map(v => v.id);
        const isAdmins = admins.includes(sender);
        if (!isAdmins) return sock.sendCustom(from, { text: "❌ Cette commande est réservée aux administrateurs." });

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            sock.sendCustom(from, { text: "🔒 *Groupe fermé.* Seuls les administrateurs peuvent envoyer des messages." });
        } catch (e) {
            sock.sendCustom(from, { text: "❌ Erreur. Vérifiez mes permissions." });
        }
    }
};
