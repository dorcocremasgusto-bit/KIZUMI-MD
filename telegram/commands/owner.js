/**
 * telegram/commands/owner.js
 */
const config = require("../utils/config");

module.exports = {
    name: "owner",
    pattern: /^\/owner$/,
    description: "Contact du propriétaire",
    execute: async (bot, msg) => {
        await bot.sendMessage(
            msg.chat.id,
            `👑 *Propriétaire* : ${config.OWNER_NAME}\n📞 Contact : ${config.OWNER_CONTACT}`,
            { parse_mode: "Markdown" }
        );
    }
};
