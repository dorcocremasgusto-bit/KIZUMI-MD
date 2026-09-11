module.exports = {
    name: 'setdesc',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        const newDesc = args.join(' ');
        if (!newDesc) return sock.sendCustom(from, { text: "Veuillez fournir une nouvelle description pour le groupe." });
        
        try {
            await sock.groupUpdateDescription(from, newDesc);
            sock.sendCustom(from, { text: "Description du groupe mise à jour avec succès." });
        } catch (e) {
            sock.sendCustom(from, { text: "Erreur lors du changement de description." });
        }
    }
};
