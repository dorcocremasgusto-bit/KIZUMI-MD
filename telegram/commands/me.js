/**
 * telegram/commands/me.js
 */
module.exports = {
    name: "me",
    pattern: /^\/me$/,
    description: "Affiche vos informations Telegram",
    execute: async (bot, msg) => {
        const { id, first_name, last_name, username } = msg.from;
        const text = `👤 *Vos informations*\n\n🆔 ID : ${id}\n📛 Nom : ${first_name || ""} ${last_name || ""}\n🔗 Username : ${username ? "@" + username : "N/A"}`;
        await bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    }
};
