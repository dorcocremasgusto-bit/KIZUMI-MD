/**
 * web/server.js
 * Serveur du site de pairing PERFECT CORE N.C.
 *
 * Routes :
 *   GET  /                -> page d'accueil (web/public/index.html)
 *   POST /api/pair        -> { number?, method: "code"|"qr" } -> { code } | { qr:true } | { alreadyConnected }
 *   GET  /api/status      -> { status, number, qrDataUrl }
 *   GET  /api/stats       -> { connected, disconnected, capacity }
 *   POST /api/delpair     -> déconnecte la session du visiteur courant
 *
 * Identification du visiteur : un cookie "sn_sid" (UUID) est posé au
 * premier appel et sert de clé de session.
 */
const express = require("express");
const cookieParser = require("cookie-parser");
const { randomUUID } = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../env/.env") });

// Même correctif anti-crash que index.js : une erreur dans une session
// web ne doit jamais tuer le serveur entier (donc toutes les autres
// sessions connectées via le site).
process.on("uncaughtException", (err) => {
    console.error("⚠️ Exception non interceptée (le serveur continue de tourner) :", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("⚠️ Rejet de promesse non intercepté (le serveur continue de tourner) :", reason);
});

const config = require("./utils/config");
const sessionManager = require("./utils/webSessionManager");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(config.PUBLIC_DIR));

function ensureSid(req, res) {
    let sid = req.cookies[config.COOKIE_NAME];
    if (!sid) {
        sid = randomUUID();
        res.cookie(config.COOKIE_NAME, sid, {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            httpOnly: true,
            sameSite: "lax"
        });
    }
    return sid;
}

app.get("/", (req, res) => {
    ensureSid(req, res);
    res.sendFile(path.join(config.PUBLIC_DIR, "index.html"));
});

app.get("/api/stats", (req, res) => {
    res.json(sessionManager.stats());
});

app.get("/api/status", (req, res) => {
    const sid = ensureSid(req, res);
    const entry = sessionManager.get(sid);
    if (!entry) return res.json({ status: "idle" });
    res.json({
        status: entry.status,
        number: entry.number || null,
        method: entry.method || null,
        qrDataUrl: entry.qrDataUrl || null
    });
});

app.post("/api/pair", async (req, res) => {
    const sid = ensureSid(req, res);
    const method = req.body.method === "qr" ? "qr" : "code";
    const number = String(req.body.number || "").replace(/[^0-9]/g, "");

    if (method === "code" && number.length < 8) {
        return res.status(400).json({ error: "Numéro invalide." });
    }

    if (sessionManager.has(sid)) {
        const entry = sessionManager.get(sid);
        if (entry.status === "connected") {
            return res.json({ alreadyConnected: true, number: entry.number });
        }
        return res.status(409).json({ error: "Une connexion est déjà en cours pour vous." });
    }

    if (!sessionManager.canCreate()) {
        return res.status(503).json({ error: `Limite de ${config.MAX_SESSIONS} sessions atteinte, réessayez plus tard.` });
    }

    try {
        const code = await sessionManager.createSession(sid, method === "code" ? number : null, method);
        if (method === "qr") return res.json({ qr: true });
        if (!code) return res.json({ alreadyConnected: true });
        res.json({ code });
    } catch (e) {
        let error = "Échec du jumelage, réessayez.";
        if (e.message === "LIMIT_REACHED") error = `Limite de ${config.MAX_SESSIONS} sessions atteinte.`;
        res.status(500).json({ error });
    }
});

app.post("/api/delpair", (req, res) => {
    const sid = ensureSid(req, res);
    if (!sessionManager.has(sid)) {
        return res.status(404).json({ error: "Aucune session active." });
    }
    sessionManager.destroySession(sid, { deleteFiles: true });
    res.json({ ok: true });
});

function startWebServer() {
    app.listen(config.PORT, () => {
        console.log(`🌐 Site PERFECT CORE N.C en ligne sur http://localhost:${config.PORT} (limite : ${config.MAX_SESSIONS} sessions)`);
    });

    sessionManager.restoreAll().catch(() => {});
}

module.exports = { app, startWebServer };

if (require.main === module) {
    startWebServer();
}
