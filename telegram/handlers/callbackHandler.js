/**
 * telegram/handlers/callbackHandler.js
 * Gère les clics sur les boutons inline (callback_query) : navigation
 * dans le menu /start et confirmation de /delpair.
 */
const { mainMenuKeyboard, backKeyboard } = require("../keyboards/inline");
const sessionManager = require("../utils/sessionManager");
const logger = require("../utils/logger");

const SECTIONS = {
    menu_pairing: "🔗 *PAIRING*\n\n/pair <numéro> — Connecter WhatsApp\n/session — Voir votre session\n/delpair — Déconnecter",
    menu_system: "📊 *SYSTEM*\n\n/ping — Latence\n/runtime — Uptime\n/status — Statut global",
    menu_user: "👤 *USER*\n\n/me — Vos infos\n/id — Votre ID\n/owner — Contact propriétaire",
    menu_other: "⚙️ *OTHER*\n\n/help — Aide\n/about — À propos\n/support — Assistance"
};

function registerCallbackHandler(bot) {
    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const data = query.data;

        try {
            if (SECTIONS[data]) {
                await bot.editMessageCaption(SECTIONS[data], {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: "Markdown",
                    reply_markup: backKeyboard()
                }).catch(() =>
                    bot.editMessageText(SECTIONS[data], {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: "Markdown",
                        reply_markup: backKeyboard()
                    })
                );
            } else if (data === "menu_back" || data === "menu_refresh") {
                const start = require("../commands/start.js");
                const firstName = query.from.first_name || "utilisateur";
                const text = start.buildMenuText(firstName);
                await bot.editMessageCaption(text, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: mainMenuKeyboard()
                }).catch(() =>
                    bot.editMessageText(text, {
                        chat_id: chatId,
                        message_id: messageId,
                        reply_markup: mainMenuKeyboard()
                    })
                );
            } else if (data === "delpair_confirm") {
                if (sessionManager.has(chatId)) {
                    sessionManager.destroySession(chatId, { deleteFiles: true });
                    await bot.editMessageText("✅ Session WhatsApp déconnectée et supprimée.", {
                        chat_id: chatId,
                        message_id: messageId
                    });
                } else {
                    await bot.editMessageText("❌ Aucune session à supprimer.", { chat_id: chatId, message_id: messageId });
                }
            } else if (data === "delpair_cancel") {
                await bot.editMessageText("↩️ Annulé, votre session reste active.", { chat_id: chatId, message_id: messageId });
            }

            await bot.answerCallbackQuery(query.id);
        } catch (err) {
            logger.error(`Erreur callback_query: ${err.message}`);
            bot.answerCallbackQuery(query.id, { text: "❌ Erreur", show_alert: false }).catch(() => {});
        }
    });
}

module.exports = { registerCallbackHandler };
