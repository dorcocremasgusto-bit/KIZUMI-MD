module.exports = {
    name: 'runtime',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const seconds = process.uptime();
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m_ = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        const runtime = `${d}j ${h}h ${m_}m ${s}s`;
        sock.sendMessage(from, { text: `🕒 *Temps de fonctionnement* : ${runtime}` }, { quoted: m });
    }
};
