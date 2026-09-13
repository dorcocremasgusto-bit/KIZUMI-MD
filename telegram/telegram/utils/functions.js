/**
 * telegram/utils/functions.js
 * Fonctions utilitaires réutilisées par plusieurs commandes/handlers.
 */
const config = require("./config");

/** Convertit une durée en millisecondes en "1j 2h 3m 4s" */
function formatDuration(ms) {
    let seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    seconds -= days * 86400;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    const parts = [];
    if (days) parts.push(`${days}j`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
}

/** Nettoie un numéro de téléphone (garde uniquement les chiffres) */
function cleanNumber(number) {
    return String(number || "").replace(/[^0-9]/g, "");
}

/** Vérifie si un chatId Telegram appartient au(x) propriétaire(s) du bot */
function isOwner(chatId) {
    return config.OWNER_TG_IDS.includes(String(chatId));
}

/** Petite pause asynchrone */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Échappe les caractères spéciaux Markdown (v1) de Telegram */
function escapeMd(text = "") {
    return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

module.exports = {
    formatDuration,
    cleanNumber,
    isOwner,
    sleep,
    escapeMd
};
