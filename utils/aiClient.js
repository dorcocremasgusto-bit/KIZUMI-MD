/**
 * utils/aiClient.js
 * Client générique compatible API "chat completions" style OpenAI,
 * utilisé par .ask / .chat / .gpt / .rephrase / .summarize (fallback IA).
 *
 * Configuration via env/.env :
 *   AI_API_KEY  - clé de ton fournisseur (OpenAI, Groq, OpenRouter...)
 *   AI_API_URL  - endpoint complet (par défaut OpenAI)
 *   AI_MODEL    - nom du modèle (par défaut gpt-4o-mini)
 *
 * Si AI_API_KEY n'est pas configurée, askAI() lève une erreur explicite
 * NEEDS_CONFIG que les commandes interceptent pour donner une réponse
 * honnête plutôt qu'un faux résultat.
 */
const axios = require('axios');

const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

async function askAI(prompt, systemPrompt = "Tu es un assistant utile, concis et amical.") {
    if (!AI_API_KEY) {
        const err = new Error("Clé API IA non configurée (AI_API_KEY manquant dans env/.env).");
        err.code = "NEEDS_CONFIG";
        throw err;
    }

    const res = await axios.post(
        AI_API_URL,
        {
            model: AI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 500
        },
        { headers: { Authorization: `Bearer ${AI_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    return res.data?.choices?.[0]?.message?.content?.trim() || "Pas de réponse générée.";
}

module.exports = { askAI };
