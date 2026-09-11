/**
 * telegram/commands/delpair.js
 */
const sessionManager = require("../utils/sessionManager");
const { confirmDelpairKeyboard } = require("../keyboards/inline");

module.exports = {
    name: "delpair",
    pattern: /^\/delpair$/,
    description: "Déconnecte votre session WhatsApp",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        if (!sessionManager.has(chatId)) {
            return bot.sendMessage(chatId, "❌ Vous n'avez aucune session active à supprimer.");
        }

        await bot.sendMessage(chatId, "⚠️ Voulez-vous vraiment déconnecter votre session WhatsApp ?", {
            reply_markup: confirmDelpairKeyboard()
        });
    }
};
