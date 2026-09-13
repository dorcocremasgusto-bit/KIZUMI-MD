/**
 * telegram/utils/logger.js
 * Petit wrapper autour de pino pour avoir des logs propres et uniformes
 * partout dans la couche Telegram.
 */
const pino = require("pino");

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
});

module.exports = logger;
