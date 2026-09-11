const axios = require('axios');

module.exports = {
    name: 'instagram',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const url = args[0];
        if (!url || !url.includes('instagram.com')) return sock.sendCustom(from, { text: "Veuillez fournir un lien Instagram valide." });

        await sock.sendCustom(from, { text: "⏳ Téléchargement du contenu Instagram..." });

        try {
            // Utilisation d'une API publique pour le téléchargement Instagram
            const res = await axios.get(`https://api.vreden.my.id/api/igdl?url=${url}`);
            const data = res.data;

            if (data && data.result && data.result.length > 0) {
                const media = data.result[0];
                if (media.url.includes('.mp4')) {
                    await sock.sendMessage(from, { 
                        video: { url: media.url }, 
                        caption: `✅ *Instagram Content*`,
                        mimetype: 'video/mp4'
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(from, { 
                        image: { url: media.url }, 
                        caption: `✅ *Instagram Content*`
                    }, { quoted: m });
                }
            } else {
                sock.sendCustom(from, { text: "❌ Impossible de récupérer le contenu. Vérifiez le lien." });
            }
        } catch (e) {
            console.error(e);
            sock.sendCustom(from, { text: "❌ Une erreur est survenue lors du téléchargement Instagram." });
        }
    }
};
