/**
 * telegram/keyboards/reply.js
 * Clavier persistant (reply keyboard) optionnel, affiché en bas de
 * l'écran Telegram pour un accès rapide aux commandes les plus utiles.
 */

function mainReplyKeyboard() {
    return {
        keyboard: [
            [{ text: "/pair" }, { text: "/session" }],
            [{ text: "/status" }, { text: "/ping" }],
            [{ text: "/help" }]
        ],
        resize_keyboard: true,
        is_persistent: true
    };
}

function removeKeyboard() {
    return { remove_keyboard: true };
}

module.exports = {
    mainReplyKeyboard,
    removeKeyboard
};
