/**
 * telegram/commands/start.js
 * /start -> envoie l'image SKARA NICE + le menu principal.
 */
const fs = require("fs-extra");
const config = require("../utils/config");
const sessionManager = require("../utils/sessionManager");
const { mainMenuKeyboard } = require("../keyboards/inline");

function buildMenuText(firstName) {
    const status = sessionManager ? "🟢 En ligne" : "🔴 Hors ligne";
    return `┌─────────────
│ ꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳
└─────────────
│ 👋 Bienvenue ${firstName} sur
│  ꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗 𖣔⃟ ⚔︎ ᬼ⃟─►꙳
│ 📡 Statut :${status}
│ ⚡ Version : ${config.VERSION}
┌─────────────
│ 🔗 𝐏𝐀𝐈𝐑𝐈𝐍𝐆
└─────────────
│ ➤ /pair
│ ➤ /session
│ ➤ /delpair
┌─────────────
│ 📊 𝐒𝐘𝐒𝐓𝐄𝐌
└─────────────
│ ➤ /ping
│ ➤ /runtime
│ ➤ /status
┌─────────────
│ 👤 𝐔𝐒𝐄𝐑
└─────────────
│ ➤ /me
│ ➤ /id
│ ➤ /owner
┌─────────────
│ ⚙️ 𝐎𝐓𝐇𝐄𝐑
└─────────────
│ ➤ /help
│ ➤ /about
│ ➤ /support
┌─────────────
│ ꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳
└─────────────`;
}

module.exports = {
    name: "start",
    pattern: /^\/start$/,
    description: "Affiche le menu principal",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || "utilisateur";
        const caption = buildMenuText(firstName);

        if (fs.existsSync(config.START_IMAGE)) {
            await bot.sendPhoto(chatId, config.START_IMAGE, {
                caption,
                reply_markup: mainMenuKeyboard()
            });
        } else {
            await bot.sendMessage(chatId, caption, {
                reply_markup: mainMenuKeyboard()
            });
        }
    },
    buildMenuText
};
