/**
     * telegram/commands/pair.js
     * /pair <numéro>
     * Ouvre une session WhatsApp DÉDIÉE à cet utilisateur Telegram et
     * renvoie le code de jumelage à entrer dans WhatsApp
     * (Paramètres > Appareils connectés > Connecter avec un numéro de téléphone).
     */
    
    const config = require("../utils/config");
    const sessionManager = require("../utils/sessionManager");
    const { cleanNumber } = require("../utils/functions");
    
    module.exports = {
        name: "pair",
        pattern: /^\/pair(?:\s+(.+))?$/,
        description: "Connecte un compte WhatsApp à votre session",
    
        execute: async (bot, msg, match) => {
            const chatId = msg.chat.id;
            const rawNumber = match && match[1];
    
            if (!rawNumber) {
                return bot.sendMessage(
                    chatId,
                    `┌──『 ꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗 𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳ 』
    │
    ├── ⚡ Utilisation :
    │   /pair <numéro_whatsapp>
    │
    ├── 📌 Exemple :
    │   /pair 22896985431
    │
    └── Entrez l'indicatif pays sans "+" ni espaces.`,
                    { parse_mode: "Markdown" }
                );
            }
    
            const phoneNumber = cleanNumber(rawNumber);
    
            if (phoneNumber.length < 8) {
                return bot.sendMessage(
                    chatId,
                    `┌──『 ꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳ 』
    │
    ├── Numéro invalide.
    │
    ├── Exemple :
    │   228XXXXXXXX
    │
    └── Réessayez avec un numéro valide.`
                );
            }
    
            if (sessionManager.has(chatId)) {
                return bot.sendMessage(
                    chatId,
                    `┌──『 ꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳ 』
    │
    ├── Une session existe déjà.
    │
    ├── /session → Voir le statut
    │
    └── /delpair → Supprimer la session`
                );
            }
    
            if (!sessionManager.canCreate()) {
                return bot.sendMessage(
                    chatId,
                    `┌──『꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳』
    │
    ├── Limite atteinte :
    │   ${config.MAX_SESSIONS} sessions actives.
    │
    └── Réessayez plus tard.`
                );
            }
    
            const waitMsg = await bot.sendMessage(
                chatId,
                `┌──『꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗 𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳』
    │
    ├── Génération du code pairing...
    │
    └── Numéro : ${phoneNumber}`,
                { parse_mode: "Markdown" }
            );
    
            try {
                const code = await sessionManager.createSession(
                    chatId,
                    phoneNumber,
                    bot
                );
    
                if (code) {
                    await bot.editMessageText(
                        `┌──『꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳』
    │
    ├── 🔐 CODE PAIRING :
    │   *${code}*
    │
    ├── 📱 WhatsApp :
    │   Paramètres → Appareils connectés
    │   → Connecter un appareil
    │   → Numéro de téléphone
    │
    ├── ⏱️ Le code expire rapidement.
    │
    └── ⚡ Connexion en cours...`,
                        {
                            chat_id: chatId,
                            message_id: waitMsg.message_id,
                            parse_mode: "Markdown"
                        }
                    );
                } else {
                    await bot.editMessageText(
                        `┌──『꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳』
    │
    ├── Session déjà appairée.
    │
    └── Reconnexion en cours...`,
                        {
                            chat_id: chatId,
                            message_id: waitMsg.message_id
                        }
                    );
                }
    
            } catch (e) {
    
                let reason = "Erreur inconnue.";
    
                if (e.message === "SESSION_EXISTS") {
                    reason = "Une session existe déjà pour vous.";
                } 
                else if (e.message === "LIMIT_REACHED") {
                    reason = `Limite de ${config.MAX_SESSIONS} sessions atteinte.`;
                } 
                else {
                    reason = e.message;
                }
    
                await bot.editMessageText(
                    `┌──『꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗  𖣔⃟ ⚔︎ ᬼ⃟─►꙳꙳』
    │
    ├── Échec du jumelage :
    │   ${reason}
    │
    └── Réessayez plus tard.`,
                    {
                        chat_id: chatId,
                        message_id: waitMsg.message_id
                    }
                );
            }
        }
    };
