/**
 * telegram/commands/ping.js
 */
module.exports = {
    name: "ping",
    pattern: /^\/ping$/,
    description: "Mesure la latence du bot",
    execute: async (bot, msg) => {
        const start = Date.now();
        const sent = await bot.sendMessage(msg.chat.id, "🏓 Ping...");
        const latency = Date.now() - start;
        await bot.editMessageText(`🏓 *Pong !* ${latency}ms`, {
            chat_id: msg.chat.id,
            message_id: sent.message_id,
            parse_mode: "Markdown"
        });
    }
};
