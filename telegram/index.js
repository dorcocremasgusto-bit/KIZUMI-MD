/**
 * telegram/index.js
 * Point d'entrée de la couche Telegram : démarre le bot, charge les
 * commandes/handlers, et restaure les sessions WhatsApp déjà appairées.
 */
const TelegramBot = require("node-telegram-bot-api");

const config = require("./utils/config");
const logger = require("./utils/logger");
const sessionManager = require("./utils/sessionManager");
const { registerCommands } = require("./handlers/commandHandler");
const { registerCallbackHandler } = require("./handlers/callbackHandler");

function startTelegramBot() {
    if (!config.TG_TOKEN) {
        logger.error("❌ TG_TOKEN manquant dans telegram/.env — impossible de démarrer le bot Telegram.");
        process.exit(1);
    }

    const bot = new TelegramBot(config.TG_TOKEN, { polling: true });

    bot.on("polling_error", (err) => logger.error(`Polling error: ${err.message}`));

    registerCommands(bot);
    registerCallbackHandler(bot);

    logger.info(`🤖 ${config.BOT_NAME} démarré sur Telegram (limite : ${config.MAX_SESSIONS} sessions WhatsApp).`);

    // Reconnecte automatiquement toutes les sessions WhatsApp déjà appairées
    sessionManager.restoreAll(bot).catch(e => logger.error(`Erreur restauration sessions: ${e.message}`));

    return bot;
}

module.exports = { startTelegramBot };

if (require.main === module) {
    startTelegramBot();
}
