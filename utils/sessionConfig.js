/**
 * utils/sessionConfig.js
 *
 * CORRECTIF MULTI-SESSION IMPORTANT :
 * Avant, TOUTES les commandes qui modifient la config (setprefix,
 * setfont, sprefix, antilink, antibot, antifake, antispam, antiadd,
 * welcome, goodbye, warn...) lisaient/écrivaient un seul et même
 * fichier `env/config.json`, partagé par TOUTES les sessions WhatsApp
 * connectées (Telegram + site web confondus). Résultat : un
 * utilisateur qui changeait son prefix changeait celui de tout le
 * monde.
 *
 * Ce module donne à CHAQUE session WhatsApp son propre fichier de
 * config, isolé des autres : env/sessions/<sessionId>.json
 * <sessionId> = le chatId Telegram ou le sid web de cette session
 * précise (voir wa/messageHandler.js, qui pose sock.sessionId dès la
 * création de la session).
 *
 * Toutes les commandes qui touchent à la config doivent utiliser
 * readConfig(sock) / writeConfig(sock, config) au lieu de lire/écrire
 * un chemin en dur.
 */
const fs = require("fs-extra");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SESSIONS_CONFIG_DIR = path.join(ROOT, "env/sessions");
fs.ensureDirSync(SESSIONS_CONFIG_DIR);

/** Chemin du fichier de config propre à CETTE session */
function configPathFor(sock) {
    const sessionId = (sock && sock.sessionId) ? String(sock.sessionId) : "default";
    // sécurité : évite qu'un id bizarre sorte du dossier sessions/
    const safeId = sessionId.replace(/[^a-zA-Z0-9_\-.:]/g, "_");
    return path.join(SESSIONS_CONFIG_DIR, `${safeId}.json`);
}

function readConfig(sock) {
    const p = configPathFor(sock);
    if (!fs.existsSync(p)) return {};
    try {
        return fs.readJsonSync(p);
    } catch (e) {
        return {};
    }
}

function writeConfig(sock, config) {
    const p = configPathFor(sock);
    fs.ensureDirSync(path.dirname(p));
    fs.writeJsonSync(p, config, { spaces: 2 });
    return config;
}

/** Lit la config avec des valeurs par défaut déjà fusionnées */
function readConfigWithDefaults(sock, defaults = {}) {
    return { ...defaults, ...readConfig(sock) };
}

module.exports = { configPathFor, readConfig, writeConfig, readConfigWithDefaults };
