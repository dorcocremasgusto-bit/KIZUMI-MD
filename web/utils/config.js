/**
 * web/utils/config.js
 * Configuration de la couche web (site de pairing).
 * Modifiez web/.env pour changer ces valeurs.
 */
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const ROOT = path.join(__dirname, "../..");

module.exports = {
    // La plupart des panneaux d'hébergement (Spaceify, Pterodactyl...)
    // injectent le port alloué via SERVER_PORT ou PORT — on les utilise
    // en repli si WEB_PORT n'est pas défini, pour que le site soit
    // automatiquement accessible sur le bon port sans configuration
    // manuelle.
    PORT: parseInt(process.env.WEB_PORT || process.env.SERVER_PORT || process.env.PORT || "3000", 10),
    MAX_SESSIONS: parseInt(process.env.MAX_SESSIONS || "1500", 10),
    COOKIE_NAME: "sn_sid",
    COOKIE_SECRET: process.env.COOKIE_SECRET || "skara-nice-change-me",

    ROOT,
    SESSIONS_DIR: path.join(ROOT, "web_sessions"),
    PUBLIC_DIR: path.join(__dirname, "../public")
};
