/**
 * start-all.js
 *
 * Sur un hébergeur qui ne gère qu'UN SEUL processus par serveur (comme
 * Spaceify, Pterodactyl...), on ne peut pas lancer `node index.js` et
 * `node web/server.js` séparément — le panneau ne suivrait que le
 * premier et tuerait le second au moindre redémarrage.
 *
 * Ce fichier lance les deux DANS LE MÊME processus Node : le bot
 * Telegram (donc tout le pairing WhatsApp) ET le site de pairing web,
 * en une seule commande de démarrage.
 *
 * Utilisation : mettez "start-all.js" comme fichier de démarrage dans
 * votre panneau (ou lancez `node start-all.js` / `npm run start:all`).
 */
require("./index.js"); // démarre le bot Telegram

const { startWebServer } = require("./web/server.js");
startWebServer(); // démarre le site web sur le port WEB_PORT (web/.env)
