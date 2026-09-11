/**
 * telegram/commands/session.js
 */
const { formatDuration } = require("../utils/functions");
const sessionManager = require("../utils/sessionManager");

module.exports = {
    name: "session",
    pattern: /^\/session$/,
    description: "Affiche l'état de votre session WhatsApp",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const entry = sessionManager.get(chatId);

        if (!entry) {
            return bot.sendMessage(chatId, "❌ Aucune session active.\nUtilisez /pair <numéro> pour vous connecter.");
        }

        const statusEmoji = entry.status === "connected" ? "🟢 Connecté" : entry.status === "connecting" ? "🟡 Connexion en cours" : "🔴 Déconnecté";
        const uptime = formatDuration(Date.now() - entry.createdAt);

        await bot.sendMessage(
            chatId,
            `📂 *Votre session*\n\n📱 Numéro : ${entry.number || "N/A"}\n📡 Statut : ${statusEmoji}\n⏱️ Depuis : ${uptime}`,
            { parse_mode: "Markdown" }
        );
    }
};
