/**
 * telegram/commands/help.js
 */
const config = require("../utils/config");

module.exports = {
    name: "help",
    pattern: /^\/help$/,
    description: "Liste toutes les commandes disponibles",
    execute: async (bot, msg) => {
        const text = `🖤 *${config.BOT_NAME} — AIDE* 🖤

*🔗 Pairing*
/pair <numéro> — Connecter un compte WhatsApp
/session — Voir l'état de votre session
/delpair — Déconnecter votre session

*📊 System*
/ping — Latence du bot
/runtime — Temps de fonctionnement
/status — Statut global du bot

*👤 User*
/me — Vos informations Telegram
/id — Votre ID Telegram
/owner — Contacter le propriétaire

*⚙️ Other*
/help — Cette aide
/about — À propos du bot
/support — Lien d'assistance

_Une fois votre WhatsApp connecté via /pair, toutes les commandes de votre bot WhatsApp restent disponibles normalement, directement sur WhatsApp._`;

        await bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    }
};
