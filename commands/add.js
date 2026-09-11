module.exports = {
    name: 'add',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        const metadata = await sock.groupMetadata(from);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = metadata.participants.find(p => p.id === botId)?.admin;
        
        if (!isBotAdmin) return sock.sendCustom(from, { text: "Je dois être administrateur pour ajouter quelqu'un." });

        const phoneNumber = args[0]?.replace(/[^0-9]/g, '');
        if (!phoneNumber) return sock.sendCustom(from, { text: "Veuillez fournir un numéro à ajouter (ex: .add 22896985431)." });
        
        try {
            const jid = phoneNumber + "@s.whatsapp.net";
            await sock.groupParticipantsUpdate(from, [jid], "add");
            sock.sendCustom(from, { text: "Utilisateur ajouté avec succès." });
        } catch (e) {
            sock.sendCustom(from, { text: "Erreur lors de l'ajout. Vérifiez si le numéro est valide ou si le bot est admin." });
        }
    }
};
