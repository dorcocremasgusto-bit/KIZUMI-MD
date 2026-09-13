const os = require("os");
const { reply } = require('../utils/ninjaStyle');

module.exports = {
    name: 'ping',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;

        try {
            const start = Date.now();
            const latency = Date.now() - start;

            const uptime = process.uptime();
            const h = Math.floor(uptime / 3600);
            const mnt = Math.floor((uptime % 3600) / 60);
            const s = Math.floor(uptime % 60);

            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            const total = os.totalmem() / 1024 / 1024;
            const cpu = os.loadavg()[0].toFixed(2);

            const caption = reply("⚡ 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗙𝗢𝗥𝗖𝗘", [
                `Latence : ${latency} ms`,
                `Uptime : ${h}h ${mnt}m ${s}s`,
                `RAM : ${used.toFixed(2)} / ${total.toFixed(0)} MB`,
                `CPU : ${cpu} %`
            ]);

            await sock.sendMessage(from, { text: caption }, { quoted: m });

        } catch (e) {
            console.log("PING ERROR:", e);
            await sock.sendCustom(from, { text: reply("❌ 𝗘𝗥𝗥𝗘𝗨𝗥", ["Erreur système."]) });
        }
    }
};
