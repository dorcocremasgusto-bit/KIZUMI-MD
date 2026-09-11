module.exports = {
    name: 'speed',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const start = Date.now();
        const { key } = await sock.sendMessage(from, { text: 'Calcul de la vitesse...' }, { quoted: m });
        const end = Date.now();
        await sock.sendMessage(from, { text: `⚡ *Vitesse de réponse* : ${end - start}ms`, edit: key });
    }
};
