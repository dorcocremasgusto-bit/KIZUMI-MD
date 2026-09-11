/**
 * telegram/commands/runtime.js
 */
const { formatDuration } = require("../utils/functions");

module.exports = {
    name: "runtime",
    pattern: /^\/runtime$/,
    description: "Affiche le temps de fonctionnement du bot",
    execute: async (bot, msg) => {
        const uptime = formatDuration(process.uptime() * 1000);
        await bot.sendMessage(msg.chat.id, `⏱️ *Runtime* : ${uptime}`, { parse_mode: "Markdown" });
    }
};
