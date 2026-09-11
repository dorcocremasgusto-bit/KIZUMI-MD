const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'audio',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendCustom(from, { text: "Veuillez fournir un nom de chanson ou un lien YouTube." });

        await sock.sendCustom(from, { text: `🔍 Recherche de *${query}* sur YouTube...` });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendCustom(from, { text: "❌ Aucun résultat trouvé." });

            const infoText = `🎵 *Titre:* ${video.title}\n👤 *Chaîne:* ${video.author.name}\n⏳ *Durée:* ${video.timestamp}\n🔗 *Lien:* ${video.url}\n\n*Chargement de l'audio en cours...*`;
            await sock.sendCustom(from, { text: infoText });

            const filePath = path.join(__dirname, `../temp_${Date.now()}.mp3`);
            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
            
            const writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream);

            writeStream.on('finish', async () => {
                await sock.sendMessage(from, { 
                    audio: fs.readFileSync(filePath), 
                    mimetype: 'audio/mp4', 
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: video.title,
                            body: video.author.name,
                            thumbnailUrl: video.thumbnail,
                            sourceUrl: video.url,
                            mediaType: 1,
                            showAdAttribution: true,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
                fs.unlinkSync(filePath);
            });

            writeStream.on('error', (err) => {
                console.error(err);
                sock.sendCustom(from, { text: "❌ Erreur lors du téléchargement de l'audio." });
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });

        } catch (e) {
            console.error(e);
            sock.sendCustom(from, { text: "❌ Une erreur est survenue : " + e.message });
        }
    }
};
