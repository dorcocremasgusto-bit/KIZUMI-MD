const lyricsFinder = require('lyrics-finder');

module.exports = {
    name: 'lyrics',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const query = args.join(' ');
        if (!query) return sock.sendCustom(from, { text: "Veuillez fournir le nom d'une chanson." });

        await sock.sendCustom(from, { text: `🔍 Recherche des paroles pour : *${query}*...` });

        try {
            let lyrics = await lyricsFinder('', query) || "❌ Paroles non trouvées.";
            
            let responseText = `🎶 *PAROLES :* ${query.toUpperCase()}\n\n${lyrics}`;
            
            if (responseText.length > 4000) {
                responseText = responseText.substring(0, 3900) + "\n\n...(Tronqué car trop long)";
            }

            await sock.sendCustom(from, { text: responseText });
        } catch (e) {
            console.error(e);
            sock.sendCustom(from, { text: "❌ Une erreur est survenue lors de la recherche des paroles." });
        }
    }
};
