/**
 * telegram/commands/id.js
 */
module.exports = {
    name: "id",
    pattern: /^\/id$/,
    description: "Affiche votre ID Telegram",
    execute: async (bot, msg) => {
        await bot.sendMessage(msg.chat.id, `🆔 Votre ID Telegram : \`${msg.chat.id}\``, { parse_mode: "Markdown" });
    }
};
