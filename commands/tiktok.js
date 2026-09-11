const axios = require('axios');

module.exports = {
    name: 'tiktok',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const url = args[0];
        if (!url || !url.includes('tiktok.com')) return sock.sendCustom(from, { text: "Veuillez fournir un lien TikTok valide." });

        await sock.sendCustom(from, { text: "⏳ Téléchargement de la vidéo TikTok..." });

        try {
            // Utilisation d'une API publique pour le téléchargement TikTok
            const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${url}`);
            const data = res.data;

            if (data && data.video && data.video.noWatermark) {
                await sock.sendMessage(from, { 
                    video: { url: data.video.noWatermark }, 
                    caption: `✅ *TikTok:* ${data.title || ''}`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            } else {
                sock.sendCustom(from, { text: "❌ Impossible de récupérer la vidéo. Vérifiez le lien." });
            }
        } catch (e) {
            console.error(e);
            sock.sendCustom(from, { text: "❌ Une erreur est survenue lors du téléchargement TikTok." });
        }
    }
};
