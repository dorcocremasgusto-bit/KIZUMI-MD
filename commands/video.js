const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'video',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendCustom(from, { text: "Veuillez fournir un nom de vidéo ou un lien YouTube." });

        await sock.sendCustom(from, { text: `🔍 Recherche de *${query}* sur YouTube...` });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendCustom(from, { text: "❌ Aucun résultat trouvé." });

            const infoText = `🎥 *Titre:* ${video.title}\n👤 *Chaîne:* ${video.author.name}\n⏳ *Durée:* ${video.timestamp}\n\n*Chargement de la vidéo en cours...*`;
            await sock.sendCustom(from, { text: infoText });

            const filePath = path.join(__dirname, `../temp_${Date.now()}.mp4`);
            const stream = ytdl(video.url, { filter: 'plugin', quality: '18' });
            
            const writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream);

            writeStream.on('finish', async () => {
                await sock.sendMessage(from, { 
                    video: fs.readFileSync(filePath), 
                    caption: `✅ *${video.title}*`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
                fs.unlinkSync(filePath);
            });

            writeStream.on('error', (err) => {
                console.error(err);
                sock.sendCustom(from, { text: "❌ Erreur lors du téléchargement de la vidéo." });
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });

        } catch (e) {
            console.error(e);
            sock.sendCustom(from, { text: "❌ Une erreur est survenue : " + e.message });
        }
    }
};
