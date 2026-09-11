/**
 * telegram/commands/support.js
 */
const config = require("../utils/config");

module.exports = {
    name: "support",
    pattern: /^\/support$/,
    description: "Lien d'assistance",
    execute: async (bot, msg) => {
        await bot.sendMessage(msg.chat.id, `🆘 *Support* : ${config.SUPPORT_LINK}`, { parse_mode: "Markdown" });
    }
};
