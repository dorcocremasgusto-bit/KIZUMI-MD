/**
 * telegram/handlers/commandHandler.js
 * Charge dynamiquement TOUS les fichiers de telegram/commands/ et les
 * branche sur bot.onText(). Ajouter une commande = ajouter un fichier
 * dans commands/, rien d'autre à modifier.
 */
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

function registerCommands(bot) {
    const commandsDir = path.join(__dirname, "../commands");
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"));

    const commands = new Map();

    for (const file of files) {
        const cmd = require(path.join(commandsDir, file));
        if (!cmd || !cmd.pattern || typeof cmd.execute !== "function") {
            logger.warn(`Commande ignorée (format invalide) : ${file}`);
            continue;
        }

        commands.set(cmd.name || file.replace(".js", ""), cmd);

        bot.onText(cmd.pattern, async (msg, match) => {
            try {
                await cmd.execute(bot, msg, match);
            } catch (err) {
                logger.error(`Erreur dans la commande /${cmd.name}: ${err.message}`);
                bot.sendMessage(msg.chat.id, "❌ Une erreur est survenue lors de l'exécution de cette commande.").catch(() => {});
            }
        });
    }

    logger.info(`✅ ${commands.size} commandes Telegram chargées`);
    return commands;
}

module.exports = { registerCommands };
