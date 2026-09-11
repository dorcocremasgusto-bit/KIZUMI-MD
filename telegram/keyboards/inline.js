/**
 * telegram/keyboards/inline.js
 * Génère les claviers "inline" (boutons attachés sous un message).
 */

function mainMenuKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: "🔗 Pairing", callback_data: "menu_pairing" },
                { text: "📊 System", callback_data: "menu_system" }
            ],
            [
                { text: "👤 User", callback_data: "menu_user" },
                { text: "⚙️ Other", callback_data: "menu_other" }
            ],
            [
                { text: "🔄 Rafraîchir", callback_data: "menu_refresh" }
            ]
        ]
    };
}

function backKeyboard() {
    return {
        inline_keyboard: [[{ text: "⬅️ Retour au menu", callback_data: "menu_back" }]]
    };
}

function confirmDelpairKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: "✅ Oui, déconnecter", callback_data: "delpair_confirm" },
                { text: "❌ Annuler", callback_data: "delpair_cancel" }
            ]
        ]
    };
}

module.exports = {
    mainMenuKeyboard,
    backKeyboard,
    confirmDelpairKeyboard
};
