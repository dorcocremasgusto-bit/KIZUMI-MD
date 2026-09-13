/**
 * telegram/utils/config.js
 * Centralise toute la configuration du bot Telegram.
 * Modifiez telegram/.env pour changer ces valeurs (aucun redéploiement
 * du code n'est nécessaire).
 */
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const ROOT = path.join(__dirname, "../.."); // racine du projet (au dessus de telegram/)

module.exports = {
    // --- Telegram ---
    TG_TOKEN: process.env.TG_TOKEN || "8853637476:AAFB5dhR2FYZQFbS2en6ZI50PsVuMUjBFv8",
    // Un ou plusieurs IDs Telegram séparés par des virgules, ex: "111,222"
    OWNER_TG_IDS: (process.env.OWNER_TG_IDS || "8853637476")
        .split(",")
        .map(id => id.trim())
        .filter(Boolean),

    // --- Bot / branding ---
    BOT_NAME: process.env.BOT_NAME || "𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗",
    VERSION: process.env.BOT_VERSION || "v1.0",
    SUPPORT_LINK: process.env.SUPPORT_LINK || "https://wa.me/50943841601",
    OWNER_NAME: process.env.OWNER_NAME || "𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗",
    OWNER_CONTACT: process.env.OWNER_CONTACT || "https://wa.me/50943841601",

    // --- Multi-session WhatsApp ---
    // Nombre maximum de sessions WhatsApp actives EN MÊME TEMPS,
    // chaque utilisateur Telegram ne pouvant ouvrir qu'UNE SEULE session.
    MAX_SESSIONS: parseInt(process.env.MAX_SESSIONS || "1500", 10),

    // --- Chemins ---
    ROOT,
    SESSIONS_DIR: path.join(ROOT, "telegram_sessions"),
    START_IMAGE: path.join(__dirname, "../../images/skara_start.jpg"),

    // --- Divers ---
    PREFIX: process.env.PREFIX || "."
};
