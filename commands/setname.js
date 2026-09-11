module.exports = {
    name: 'setname',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        const newName = args.join(' ');
        if (!newName) return sock.sendCustom(from, { text: "Veuillez fournir un nouveau nom pour le groupe." });
        
        try {
            await sock.groupUpdateSubject(from, newName);
            sock.sendCustom(from, { text: "Nom du groupe mis à jour avec succès." });
        } catch (e) {
            sock.sendCustom(from, { text: "Erreur lors du changement de nom." });
        }
    }
};
