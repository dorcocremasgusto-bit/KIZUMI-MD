/**
 * web/utils/webSessionManager.js
 *
 * Équivalent web de telegram/utils/sessionManager.js : chaque visiteur
 * du site (identifié par un cookie "sn_sid", pas par un chatId Telegram)
 * obtient sa propre session WhatsApp, avec TOUTES les commandes
 * existantes de commandes/ déjà branchées dessus via
 * wa/messageHandler.js -> registerWAHandlers().
 *
 * Supporte deux méthodes de connexion :
 *   - "code" : code de jumelage à 8 caractères (nécessite un numéro)
 *   - "qr"   : QR code à scanner (aucun numéro requis)
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
const QRCode = require("qrcode");
const { EventEmitter } = require("events");

const config = require("./config");
const { registerWAHandlers } = require("../../wa/messageHandler");

const waLogger = pino({ level: "silent" });

class WebSessionManager extends EventEmitter {
    constructor() {
        super();
        // sid (string, cookie) -> { sock, status, number, method, qrDataUrl, saveCreds, createdAt }
        this.sessions = new Map();
        fs.ensureDirSync(config.SESSIONS_DIR);
    }

    has(sid) {
        return this.sessions.has(sid);
    }

    get(sid) {
        return this.sessions.get(sid);
    }

    canCreate() {
        return this.sessions.size < config.MAX_SESSIONS;
    }

    sessionPath(sid) {
        return path.join(config.SESSIONS_DIR, sid);
    }

    stats() {
        let connected = 0;
        for (const entry of this.sessions.values()) {
            if (entry.status === "connected") connected += 1;
        }
        const total = this.sessions.size;
        return {
            connected,
            disconnected: total - connected,
            capacity: config.MAX_SESSIONS
        };
    }

    /**
     * Crée (ou restaure) la session WhatsApp d'un visiteur du site.
     * method: "code" (retourne le code de jumelage) ou "qr" (le QR est
     * ensuite disponible via entry.qrDataUrl, mis à jour à chaque
     * rotation automatique de WhatsApp).
     */
    async createSession(sid, phoneNumber, method = "code") {
        if (this.has(sid)) throw new Error("SESSION_EXISTS");
        if (!this.canCreate()) throw new Error("LIMIT_REACHED");

        const sessDir = this.sessionPath(sid);
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
            method,
            qrDataUrl: null,
            sid,
            saveCreds,
            createdAt: Date.now()
        };
        this.sessions.set(sid, entry);

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr && entry.method === "qr") {
                try {
                    entry.qrDataUrl = await QRCode.toDataURL(qr, { margin: 1, scale: 6 });
                } catch (e) { /* ignore, on retentera au prochain tick */ }
            }

            if (connection === "close") {
                const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
                entry.status = "disconnected";
                this.emit("status", sid, entry.status);

                if (statusCode === DisconnectReason.loggedOut) {
                    this.destroySession(sid, { deleteFiles: true });
                } else {
                    this.sessions.delete(sid);
                    try {
                        await this.createSession(sid, entry.number, entry.method);
                    } catch (e) {
                        // reconnexion impossible, l'utilisateur devra relancer le pairing
                    }
                }
            } else if (connection === "open") {
                entry.status = "connected";
                entry.qrDataUrl = null;
                entry.number = sock.user?.id?.split(":")[0] || entry.number;
                try { await sock.sendPresenceUpdate('available'); } catch (e) {}
                this.emit("status", sid, entry.status);
            }
        });

        // Branche TOUTES les commandes WhatsApp existantes sur cette session
        registerWAHandlers(sock, { sid, phoneNumber });

        if (!sock.authState.creds.registered) {
            if (method === "qr") {
                // Le QR arrivera via connection.update ci-dessus
                return null;
            }
            if (!phoneNumber) return null;
            await delay(2000);
            try {
                const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
                const code = await sock.requestPairingCode(cleanNumber);
                return code;
            } catch (e) {
                this.destroySession(sid, { deleteFiles: true });
                throw e;
            }
        }

        return null; // session déjà enregistrée, restauration silencieuse
    }

    destroySession(sid, { deleteFiles = false } = {}) {
        const entry = this.sessions.get(sid);
        if (entry) {
            try {
                entry.sock.ev.removeAllListeners();
                entry.sock.end(undefined);
            } catch (e) {
                // ignore
            }
            this.sessions.delete(sid);
        }
        if (deleteFiles) {
            fs.removeSync(this.sessionPath(sid));
        }
    }

    /** Redémarre automatiquement toutes les sessions déjà appairées au boot */
    async restoreAll() {
        if (!fs.existsSync(config.SESSIONS_DIR)) return;
        const dirs = fs.readdirSync(config.SESSIONS_DIR);
        for (const sid of dirs) {
            const credsPath = path.join(config.SESSIONS_DIR, sid, "creds.json");
            if (fs.existsSync(credsPath)) {
                try {
                    await this.createSession(sid, null, "code");
                } catch (e) {
                    // restauration échouée pour ce sid, on passe au suivant
                }
            }
        }
    }
}

module.exports = new WebSessionManager();
