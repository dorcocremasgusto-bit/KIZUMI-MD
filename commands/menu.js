/**
 * commandes/menu.js
 * Menu principal KIZUMI MD
 * L'image est envoyée avec le menu en caption.
 */

const MENU_IMAGE_URL = "https://files.catbox.moe/tynxsy.png";

function buildMenuText(pushName) {
    const body = `┌⊳꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗꙰꙰ 𖣔⃟ ⚔︎ ᬼ⃟─►꙳
└⊳ ⚔︎ ᴋɪᴢᴜᴍɪ ᴍᴅ ʙᴇꜱᴛ ʙᴏᴛ ᴏꜰ ʙᴇʟ ʙᴏᴜʙᴏᴜɴ

✦ ᴋɪᴢᴜᴍɪ ᴍᴅ ʙᴇꜱᴛ ʙᴏᴛ ᴏꜰ ʙᴇʟ ʙᴏᴜʙᴏᴜɴ

┌──〔 🥷 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 〕
│ ⊳ ɴᴀᴍᴇ     : ${pushName}
│ ⊳ ʙᴏᴛ      : 𝐊𝐈𝐙𝐔𝐌𝐈 𝗠𝗗
│ ⊳ sᴛᴀᴛᴜs   : 🟢 ONLINE
│ ⊳ ᴠᴇʀsɪᴏɴ  : v1.0
│ ⊳ ᴍᴏᴅᴇ     : PUBLIC
│ ⊳ ᴅᴇᴠ      : 𝗔𝗥𝗧𝗛𝗨𝗥 𝗗𝗘𝗩
│ ⊳ ᴀᴜʀᴀ     : ██████████
└────────────────────────⊳

┌──〔 ⚙️ 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗖𝗢𝗥𝗘 〕
│ ⊳ .menu      .help      .alive
│ ⊳ .ping      .runtime   .botinfo
│ ⊳ .owner     .speed     .uptime
│ ⊳ .status    .repo      .getbot
└────────────────────────⊳

┌──〔 🐉 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 〕
│ ⊳ .kick      .kickall   .add
│ ⊳ .promote   .demote    .tagall
│ ⊳ .hidetag   .group     .mute
│ ⊳ .unmute    .link      .revoke
│ ⊳ .welcome   .goodbye   .setname
│ ⊳ .setdesc
└────────────────────────⊳

┌──〔 🌍 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗔𝗖𝗧𝗈𝗡𝗦 〕
│ ⊳ .broadcast .bcgroup   .bcpm
│ ⊳ .mentionall .forward  .copy
│ ⊳ .quote     .sendall   .alladmin
│ ⊳ .everyone
└────────────────────────⊳

┌──〔 🛡️ 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗦𝗛𝗜𝗘𝗟𝗗 〕
│ ⊳ .antilink  .antispam  .antibot
│ ⊳ .antiadd   .antifake  .warn
│ ⊳ .warnings  .resetwarn .lock
│ ⊳ .unlock
└────────────────────────⊳

┌──〔 🎭 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗙𝗨𝗡 〕
│ ⊳ .joke      .quote     .fact
│ ⊳ .meme      .dice      .roll
│ ⊳ .ship      .pp        .truth
│ ⊳ .dare
└────────────────────────⊳

┌──〔 🎬 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗠𝗘𝗗𝗜𝗔 〕
│ ⊳ .sticker   .toimg     .play
│ ⊳ .yt        .lyrics    .audio
│ ⊳ .video     .tiktok    .instagram
│ ⊳ .song      .vv        .tg
└────────────────────────⊳

┌──〔 🧠 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗔𝗜 〕
│ ⊳ .ai        .chat      .gpt
│ ⊳ .ask       .define    .translate
│ ⊳ .summarize .rephrase  .otp
└────────────────────────⊳

┌──〔 🎮 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗘𝗧𝗘𝗥𝗡𝗔𝗟 〕
│ ⊳ .game      .quiz      .math
│ ⊳ .tictactoe .guess     .leaderboard
│ ⊳ .daily
└────────────────────────⊳

┌──〔 ⚡ 𝐊𝐈𝐙𝐔𝐌𝐈 • 𝗙𝗢𝗥𝗖𝗘 〕
│ ⊳ .restart   .shutdown  .backup
│ ⊳ .restore   .clearchat .update
│ ⊳ .exec      .setprefix .setfont
└────────────────────────⊳

⚔︎ ᴋɪᴢᴜᴍɪ ᴍᴅ ʙᴇꜱᴛ ʙᴏᴛ ᴏꜰ ʙᴇʟ ʙᴏᴜʙᴏᴜɴ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
꙳◄─©ᬼ⃟ ☠︎︎ 𖠿 𝗧𝗛𝗘 𝐊𝐈𝐙𝐔𝐌𝐈 𖣔⃟ ⚔︎ ᬼ⃟─►꙳
⚔︎ 𝗗𝗲𝘃 : 𝗔𝗥𝗧𝗛𝗨𝗥 𝗗𝗘𝗩
└────────────────────────⊳`;

    return "```" + body + "```";
}

/**
 * Download image depuis MENU_IMAGE_URL
 */
async function getMenuImageBuffer() {
    const axios = require("axios");

    const res = await axios.get(MENU_IMAGE_URL, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    return Buffer.from(res.data);
}

module.exports = {
    name: "menu",

    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const pushName = m.pushName || "ninja";

        const menuText = buildMenuText(pushName);

        try {
            // Télécharger l'image
            const imageBuffer = await getMenuImageBuffer();

            // Envoyer IMAGE + MENU comme caption
            await sock.sendCustom(from, {
                image: imageBuffer,
                caption: menuText
            });

            console.log(`✅ MENU envoyé à ${pushName}`);

        } catch (e) {
            console.log("❌ MENU IMAGE ERROR:", e.message);

            // Fallback : si l'image ne fonctionne pas,
            // le menu texte sera quand même envoyé.
            try {
                await sock.sendCustom(from, {
                    text: menuText
                });

                console.log("✅ MENU texte envoyé en fallback");

            } catch (err) {
                console.log("❌ MENU SEND ERROR:", err.message);
            }
        }
    },

    buildMenuText
};