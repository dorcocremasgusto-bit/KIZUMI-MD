/**
 * index.js (racine)
 *
 * Nouveau point d'entrée du bot.
 * La connexion WhatsApp ne se lance plus automatiquement au démarrage
 * via OWNER_NUMBER dans env/.env : elle se fait maintenant UNIQUEMENT
 * depuis Telegram, via la commande /pair de chaque utilisateur.
 *
 * -> npm start lance uniquement le bot Telegram (telegram/index.js).
 * -> Chaque utilisateur Telegram qui fait /pair <numéro> obtient sa
 *    propre session WhatsApp, avec TOUTES les commandes existantes de
 *    commandes/ (rien n'a été supprimé ni modifié côté WhatsApp).
 * -> Jusqu'à 1500 sessions WhatsApp peuvent tourner en même temps
 *    (configurable via MAX_SESSIONS dans telegram/.env).
 *
 * L'ancien index.js (connexion directe via env/.env) est conservé tel
 * quel dans index.old.js.bak, à titre de référence.
 */
const dotenv = require("dotenv");
const path = require("path");

// Variables globales partagées par commandes/ (OWNER_NUMBER, PREFIX...)
dotenv.config({ path: path.join(__dirname, "env/.env") });

/**
 * CORRECTIF ANTI-CRASH (important en multi-session) :
 * Avant, une erreur non interceptée dans UNE session (ex: ENOSPC disque
 * plein pendant l'envoi d'un média, erreur réseau Baileys...) faisait
 * planter TOUT le process Node — donc TOUTES les sessions connectées
 * en même temps, Telegram + WhatsApp confondus.
 * On journalise l'erreur et on continue, au lieu de laisser le
 * process mourir.
 */
process.on("uncaughtException", (err) => {
    console.error("⚠️ Exception non interceptée (le bot continue de tourner) :", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Rejet de promesse non intercepté (le bot continue de tourner) :", reason);
});

const { startTelegramBot } = require("./telegram/index.js");

startTelegramBot();
