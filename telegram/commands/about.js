/**
 * telegram/commands/about.js
 */
const config = require("../utils/config");

module.exports = {
    name: "about",
    pattern: /^\/about$/,
    description: "À propos du bot",
    execute: async (bot, msg) => {
        const text = `🖤 *${config.BOT_NAME}* ${config.VERSION}\n\nBot WhatsApp piloté depuis Telegram, avec support multi-session (jusqu'à ${config.MAX_SESSIONS} connexions simultanées).\n\nChaque utilisateur Telegram connecte son propre numéro WhatsApp via /pair, sans jamais toucher au serveur.`;
        await bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    }
};
