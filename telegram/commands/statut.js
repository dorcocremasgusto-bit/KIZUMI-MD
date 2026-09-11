/**
 * telegram/commands/status.js
 */
const config = require("../utils/config");
const sessionManager = require("../utils/sessionManager");

module.exports = {
    name: "status",
    pattern: /^\/status$/,
    description: "Statut global du bot",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const entry = sessionManager.get(chatId);
        const myStatus = !entry ? "❌ Non connecté" : entry.status === "connected" ? "🟢 Connecté" : "🟡 En cours";

        const text = `📊 *Statut de ${config.BOT_NAME}*

🌐 Sessions actives : ${sessionManager.count()} / ${config.MAX_SESSIONS}
📱 Votre session : ${myStatus}
⚡ Version : ${config.VERSION}`;

        await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }
};
