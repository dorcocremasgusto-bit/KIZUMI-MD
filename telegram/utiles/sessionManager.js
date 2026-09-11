/**
 * telegram/utils/sessionManager.js
 *
 * C'est le coeur du système multi-session : chaque utilisateur Telegram
 * qui fait /pair obtient SA PROPRE session WhatsApp (son propre dossier
 * d'authentification Baileys), totalement indépendante des autres.
 *
 * -> Jusqu'à config.MAX_SESSIONS (1500 par défaut) sessions WhatsApp
 *    peuvent tourner EN MÊME TEMPS dans le même processus Node.
 * -> Un chatId Telegram = une session WhatsApp maximum ("un télégram,
 *    une connexion possible").
 * -> Toutes les commandes WhatsApp existantes (commandes/) sont
 *    automatiquement branchées sur chaque session via
 *    wa/messageHandler.js -> registerWAHandlers().
 *
 * NB : ce fichier n'était pas dans l'arborescence demandée mais est
 * indispensable pour gérer plus d'une session en parallèle proprement
 * (sinon toute la logique de connexion finit éparpillée dans les
 * commandes). Il vit dans telegram/utils/ pour rester dans l'esprit de
 * la structure fournie.
 */
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    delay
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");

const config = require("./config");
const logger = require("./logger");
const { registerWAHandlers } = require("../../wa/messageHandler");

const waLogger = pino({ level: "silent" });

class SessionManager {
    constructor() {
        // chatId (string) -> { sock, status, number, saveCreds, createdAt }
        this.sessions = new Map();
        fs.ensureDirSync(config.SESSIONS_DIR);
    }

    count() {
        return this.sessions.size;
    }

    has(chatId) {
        return this.sessions.has(String(chatId));
    }

    get(chatId) {
        return this.sessions.get(String(chatId));
    }

    canCreate() {
        return this.sessions.size < config.MAX_SESSIONS;
    }

    sessionPath(chatId) {
        return path.join(config.SESSIONS_DIR, String(chatId));
    }

    /**
     * Crée (ou restaure) la session WhatsApp d'un utilisateur Telegram.
     * Retourne le code de jumelage si un nouveau numéro doit être appairé,
     * ou null si une session existante a simplement été restaurée.
     */
    async createSession(chatId, phoneNumber, bot) {
        chatId = String(chatId);
        if (this.has(chatId)) throw new Error("SESSION_EXISTS");
        if (!this.canCreate()) throw new Error("LIMIT_REACHED");

        const sessDir = this.sessionPath(chatId);
        fs.ensureDirSync(sessDir);
        const { state, saveCreds } = await useMultiFileAuthState(sessDir);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger: waLogger,
            printQRInTerminal: false,
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        const entry = {
            sock,
            status: "connecting",
            number: phoneNumber || null,
            chatId,
            saveCreds,
            createdAt: Date.now()
        };
        this.sessions.set(chatId, entry);

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "close") {
                const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
                entry.status = "disconnected";

                if (statusCode === DisconnectReason.loggedOut) {
                    this.destroySession(chatId, { deleteFiles: true });
                    this._notify(bot, chatId,
                        "❌ Session WhatsApp déconnectée (déconnexion depuis le téléphone).\nUtilisez /pair pour vous reconnecter."
                    );
                } else {
                    // Coupure réseau/serveur : on retente une reconnexion automatique
                    this.sessions.delete(chatId);
                    try {
                        await this.createSession(chatId, entry.number, bot);
                    } catch (e) {
                        logger.error(`Reconnexion échouée (${chatId}): ${e.message}`);
                    }
                }
            } else if (connection === "open") {
                entry.status = "connected";
                entry.number = sock.user?.id?.split(":")[0] || entry.number;

                // Marque la session comme "en ligne" auprès des serveurs
                // WhatsApp. Sans ça, la distribution des clés de chiffrement
                // vers les autres participants d'un groupe peut être
                // incomplète : le message part bien, s'affiche chez
                // l'expéditeur (synchro multi-appareil), mais n'est jamais
                // déchiffré correctement chez certains destinataires.
                try { await sock.sendPresenceUpdate('available'); } catch (e) {}

                this._notify(bot, chatId,
                    `✅ *Connexion réussie !*\n\n📱 Numéro : ${entry.number}\n🔐 Statut : Connecté\n\nVotre bot WhatsApp est maintenant actif avec toutes les commandes.`,
                    { parse_mode: "Markdown" }
                );
            }
        });

        // Branche TOUTES les commandes WhatsApp existantes sur cette session
        registerWAHandlers(sock, { chatId, phoneNumber });

        if (!sock.authState.creds.registered) {
            if (!phoneNumber) {
                // Pas de creds ET pas de numéro fourni -> rien à faire de plus
                return null;
            }
            await delay(2000);
            try {
                const code = await sock.requestPairingCode(config.cleanNumber ? config.cleanNumber(phoneNumber) : phoneNumber.replace(/[^0-9]/g, ""));
                return code;
            } catch (e) {
                this.destroySession(chatId, { deleteFiles: true });
                throw e;
            }
        }

        return null; // session déjà enregistrée, restauration silencieuse
    }

    destroySession(chatId, { deleteFiles = false } = {}) {
        chatId = String(chatId);
        const entry = this.sessions.get(chatId);
        if (entry) {
            try {
                entry.sock.ev.removeAllListeners();
                entry.sock.end(undefined);
            } catch (e) {
                // ignore
            }
            this.sessions.delete(chatId);
        }
        if (deleteFiles) {
            fs.removeSync(this.sessionPath(chatId));
        }
    }

    /** Redémarre automatiquement toutes les sessions déjà appairées au boot */
    async restoreAll(bot) {
        if (!fs.existsSync(config.SESSIONS_DIR)) return;
        const dirs = fs.readdirSync(config.SESSIONS_DIR);
        for (const chatId of dirs) {
            const credsPath = path.join(config.SESSIONS_DIR, chatId, "creds.json");
            if (fs.existsSync(credsPath)) {
                try {
                    await this.createSession(chatId, null, bot);
                    logger.info(`Session restaurée pour ${chatId}`);
                } catch (e) {
                    logger.error(`Restauration échouée (${chatId}): ${e.message}`);
                }
            }
        }
    }

    _notify(bot, chatId, text, opts = {}) {
        bot.sendMessage(chatId, text, opts).catch(() => {});
    }
}

module.exports = new SessionManager();
