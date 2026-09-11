const yts = require('yt-search');

module.exports = {
    name: 'yt',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendCustom(from, { text: "Veuillez fournir un nom de vidéo ou un lien YouTube." });

        await sock.sendCustom(from, { text: `🔍 Recherche de *${query}* sur YouTube...` });

        try {
            const search = await yts(query);
            const videos = search.videos.slice(0, 5);
            if (videos.length === 0) return sock.sendCustom(from, { text: "❌ Aucun résultat trouvé." });

            let responseText = `📺 *RÉSULTATS YOUTUBE POUR :* ${query.toUpperCase()}\n\n`;
            videos.forEach((video, index) => {
                responseText += `*${index + 1}.* ${video.title}\n👤 *Chaîne:* ${video.author.name}\n⏳ *Durée:* ${video.timestamp}\n🔗 *Lien:* ${video.url}\n\n`;
            });

            responseText += `💡 *Astuce:* Utilisez .play [nom] pour télécharger l'audio ou .video [nom] pour la vidéo.`;

            await sock.sendCustom(from, { text: responseText });

        } catch (e) {
            console.error(e);
            sock.sendCustom(from, { text: "❌ Une erreur est survenue lors de la recherche." });
        }
    }
};
