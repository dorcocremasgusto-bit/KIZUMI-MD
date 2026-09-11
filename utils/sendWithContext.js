const fs = require("fs");
const path = require("path");

const WA_CHANNEL = process.env.WA_CHANNEL || "https://wa.me/18294786326";

let thumbBuffer = null;
try {
    // Le chemin doit être résolu à partir de la racine du projet, pas __dirname
    const imagePath = path.resolve("images/thumb.jpg");
    if (fs.existsSync(imagePath)) {
        thumbBuffer = fs.readFileSync(imagePath);
    } else {
        const imagePathPng = path.resolve("images/thumb.png");
        if (fs.existsSync(imagePathPng)) {
            thumbBuffer = fs.readFileSync(imagePathPng);
        }
    }
} catch (err) {
    console.error("❌ Erreur chargement thumbnail :", err.message);
}

function getContextInfo() {
    return {
        forwardingScore: 1,
        isForwarded: false,
        externalAdReply: {
            title: "𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗",
            body: "⚔︎ KIZUMI BEST BOT GYET MANMAN NOU",
            mediaType: 1,
            thumbnail: thumbBuffer,
            renderLargerThumbnail: false,
            mediaUrl: WA_CHANNEL,
            sourceUrl: WA_CHANNEL,
            thumbnailUrl: WA_CHANNEL,
        },
    };
}

/**
 * CORRECTIF IMPORTANT :
 * Avant, TOUT message texte était transformé en IMAGE (thumbBuffer +
 * caption), avec un faux "forward" depuis une chaîne (isForwarded:true,
 * forwardingScore:99). Trois conséquences directes :
 *   1. Chaque commande réencodait une image -> écritures disque répétées
 *      -> ENOSPC (plus d'espace disque) sur les hébergeurs à stockage
 *      limité.
 *   2. Les captions d'image ne s'alignent pas comme du texte normal
 *      -> les barres ASCII paraissaient décalées.
 *   3. Un message marqué comme "beaucoup transféré" + lien publicitaire
 *      externe est un profil que WhatsApp peut restreindre/masquer côté
 *      destinataire -> le message semblait "s'exécuter" côté expéditeur
 *      mais ne s'affichait pas correctement chez les autres.
 *
 * Maintenant : les réponses restent du VRAI texte WhatsApp (rendu
 * identique et fiable pour tout le monde), avec juste un petit aperçu
 * de lien (externalAdReply) discret, sans conversion en image ni faux
 * forward.
 */
async function sendWithContext(client, remoteJid, content, options = {}) {
    const contextInfo = getContextInfo();

    // Appliquer la police si nécessaire (la fonction applyFont sera dans index.js)
    if (typeof options.applyFont === "function" && options.fontIndex) {
        if (content.text) {
            content.text = options.applyFont(content.text, options.fontIndex);
        }
        if (content.caption) {
            content.caption = options.applyFont(content.caption, options.fontIndex);
        }
    }

    const message = {
        ...content,
        contextInfo: { ...contextInfo, ...(content.contextInfo || {}) },
    };

    return await client.sendMessage(remoteJid, message, options);
}

module.exports = { sendWithContext, getContextInfo };
