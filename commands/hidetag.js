module.exports = {
    name: 'hidetag',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendCustom(from, { text: "Cette commande est réservée aux groupes." });
        
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        
        let message = args.join(' ');
        if (!message && m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            message = m.message.extendedTextMessage.contextInfo.quotedMessage.conversation || "";
        }
        
        if (!message) return sock.sendCustom(from, { text: "Veuillez fournir un message." });
        
        sock.sendMessage(from, { text: message, mentions: participants.map(a => a.id) });
    }
};
