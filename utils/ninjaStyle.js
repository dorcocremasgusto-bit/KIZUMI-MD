/**
 * utils/ninjaStyle.js
 * Style visuel unique "PERFECT CORE N.C" (thème Ninjago / Spinjitzu),
 * utilisé par TOUTES les commandes pour remplacer l'ancien style
 * MCKINGER XMD / X VOID.
 *
 * CORRECTIF ALIGNEMENT : WhatsApp affiche le texte normal dans une
 * police à chasse variable (proportionnelle), donc des caractères de
 * dessin de boîte (┌│└─) ne s'alignent JAMAIS correctement en dehors
 * d'un bloc monospace. La solution native WhatsApp est le format
 * "```monospace```" (comme Discord/Slack) : tout le texte encadré par
 * trois backticks est rendu à chasse fixe, donc les barres tombent
 * enfin exactement les unes sous les autres, quel que soit le
 * téléphone ou la taille de police de la personne qui lit.
 */

const BOT_NAME = "𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗";
const DEV_NAME = "Arthur Dev";

const TOP_BAR = "┌⊳꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗 𖣔⃟ ⚔︎ ᬼ⃟─►꙳─►꙳";
const TOP_SUB  = "└⊳ ⚔︎ ᴋɪᴢᴜᴍɪ ᴍᴅ ʙᴇꜱᴛ ʙᴏᴛ ᴏꜰ ʙᴇʟ ʙᴏᴜʙᴏᴜɴ";
const BOTTOM_BAR = "꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗 𖣔⃟ ⚔︎ ᬼ⃟─►꙳─►꙳";
const RULE_LONG = "━━━━━━━━━━━━━━━━━━━━━━";

/** Enveloppe un bloc de texte en monospace WhatsApp pour un alignement garanti */
function mono(text) {
    return "```" + text + "```";
}

/**
 * Boîte de section réutilisée par TOUTES les commandes (remplace
 * l'ancien style MCKINGER / X VOID). Exemple de sortie :
 *
 * ┌──〔 🥷 TITRE 〕
 * │ ⊳ ligne 1
 * │ ⊳ ligne 2
 * └────────────────⊳
 */
function box(title, lines = []) {
    const body = lines.map(l => `│ ⊳ ${l}`).join("\n");
    return `┌──〔 ${title} 〕\n${body}\n└────────────────⊳`;
}

/**
 * Réponse standard courte pour la majorité des commandes : une boîte
 * unique avec titre + lignes, encadrée par le bandeau PERFECT CORE.
 * Le tout est enveloppé en monospace pour un alignement parfait.
 */
function reply(title, lines = []) {
    const content = Array.isArray(lines) ? lines : [lines];
    const text = `${TOP_BAR}\n${TOP_SUB}\n\n${box(title, content)}\n\n${RULE_LONG}\n${BOTTOM_BAR}\n⚔︎ Dev : ${Arthur Dev}\n└───────────⊳`;
    return mono(text);
}

/** Bandeau d'ouverture du menu principal (non enveloppé : combiné dans buildMenuText) */
function bigHeader() {
    return `${TOP_BAR}\n${TOP_SUB}\n\n✦ ᴋɪᴢᴜᴍɪ ᴍᴅ ʙᴇꜱᴛ ʙᴏᴛ ᴏꜰ ʙᴇʟ ʙᴏᴜʙᴏᴜɴ`;
}

/** Pied de page du menu principal */
function bigFooter() {
    return `⚔︎ ᴋɪᴢᴜᴍɪ ᴍᴅ ʙᴇꜱᴛ ʙᴏᴛ ᴏꜰ ʙᴇʟ ʙᴏᴜʙᴏᴜɴ\n🐉 ᴛʜᴇ ᴋɪᴢᴜᴍɪ ᴍᴅ  ɴᴇᴠᴇʀ ꜱʟᴇᴇᴘꜱ.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${BOTTOM_BAR}\n⚔︎ Dev : ${Arthur Dev}\n└────────────────────────⊳`;
}

module.exports = { box, reply, bigHeader, bigFooter, mono, BOT_NAME, DEV_NAME };
