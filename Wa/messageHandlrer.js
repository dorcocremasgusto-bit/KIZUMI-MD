/**
 * wa/messageHandler.js
 * Logique WhatsApp (dispatch des commandes, antilink/antibot/antifake,
 * welcome/goodbye, fonts...) extraite de l'ancien index.js et rendue
 * reutilisable pour CHAQUE session WhatsApp ouverte depuis Telegram.
 *
 * registerWAHandlers(sock, meta) est appele UNE FOIS juste apres la
 * creation du socket Baileys pour brancher toutes les commandes de
 * commandes/ sur ce socket precis. Aucune commande WhatsApp n'est
 * retiree ni modifiee : ce fichier reprend le code de l'ancien index.js
 * pour le rendre reutilisable par plusieurs sessions en parallele.
 */
const fs = require("fs-extra");
const path = require("path");
const { sendWithContext } = require("../utils/sendWithContext.js");
const { readConfig } = require("../utils/sessionConfig.js");

const ROOT = path.join(__dirname, "..");

function registerWAHandlers(sock, meta = {}) {
    const { chatId, sid, phoneNumber } = meta;

    // CORRECTIF MULTI-SESSION : chaque session obtient un identifiant
    // unique (chatId Telegram ou sid web) attaché directement au socket.
    // utils/sessionConfig.js s'en sert pour donner à CETTE session son
    // propre fichier de config, isolé de toutes les autres.
    sock.sessionId = chatId || sid || `session_${Date.now()}`;

    sock.ev.on("group-participants.update", async (anu) => {
        try {
            const { id, participants, action } = anu;
            const config = readConfig(sock);

            for (let num of participants) {
                let user = num.split("@")[0];

                if (action === "add" && config.welcome && config.welcome[id]) {
                    const metadata = await sock.groupMetadata(id);
                    const groupName = metadata.subject;
                    const desc = metadata.desc || "Aucune description";
                    const date = new Date();
                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

                    let pp;
                    try {
                        pp = await sock.profilePictureUrl(num, "image");
                    } catch {
                        pp = "https://files.catbox.moe/jarqlg.jpg";
                    }

                    const message = `\u256d\u2501\u2501\u2501\u3014 \ud835\udc0c\ud835\udc9c\ud835\udc0f\ud835\udc12 X \ud835\udc0dice \u3015\u2501\u2501\u2501\u2529\n\u2503 \ud83d\udc64 @${user}\n\u2503 \ud83d\udcc5 ${formattedDate}\n\u2503 \ud83c\udff7\ufe0f ${groupName}\n\u2503 \ud83d\udcdc ${desc}\n\u2570\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2529\n\n\u2728 Bienvenue dans le groupe !\n\ud83d\udd25 Respecte les regles et amuse-toi.`;

                    await sock.sendMessage(id, {
                        image: { url: pp },
                        caption: message,
                        mentions: [num]
                    });
                } else if (action === "remove" && config.goodbye && config.goodbye[id]) {
                    let ppUrl;
                    try {
                        ppUrl = await sock.profilePictureUrl(num, "image");
                    } catch {
                        ppUrl = "https://files.catbox.moe/jarqlg.jpg";
                    }
                    const goodbyeMsg = `\ud83d\udc4b Au revoir @${user}, tu vas nous manquer (ou pas) ! \ud83e\udd40`;
                    await sock.sendMessage(id, { image: { url: ppUrl }, caption: goodbyeMsg, mentions: [num] });
                }
            }
        } catch (err) {
            console.log("Erreur group-participants:", err.message);
        }
    });

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
            if (mek.key && mek.key.remoteJid === "status@broadcast") return;

            const m = mek;
            const from = m.key.remoteJid;
            const type = Object.keys(m.message)[0];
            const body =
                type === "conversation" ? m.message.conversation :
                type === "extendedTextMessage" ? m.message.extendedTextMessage.text :
                type === "imageMessage" ? m.message.imageMessage.caption :
                type === "videoMessage" ? m.message.videoMessage.caption : "";

            let config = { prefix: process.env.PREFIX || ".", selectedFont: null, sprefix: false };
            config = { ...config, ...readConfig(sock) };

            const prefix = config.prefix;
            const sprefixEnabled = config.sprefix === true;
            const isCmdWithPrefix = body.startsWith(prefix) && body.length > prefix.length;
            const isCmdWithoutPrefix = sprefixEnabled && /^[a-zA-Z0-9]+$/.test(body.split(" ")[0]);
            const isCmd = isCmdWithPrefix || isCmdWithoutPrefix;

            const command = isCmd ? (isCmdWithPrefix ? body.slice(prefix.length) : body).trim().split(/ +/).shift().toLowerCase() : "";
            const args = body.trim().split(/ +/).slice(1);

            const sender = m.key.participant || m.key.remoteJid;
            // Chaque session appartient a UN SEUL compte WhatsApp : le
            // "owner" de cette session est donc simplement le proprietaire
            // du compte connecte (m.key.fromMe), plus le OWNER_NUMBER
            // global defini dans env/.env pour l'administrateur du bot.
            const ownerRaw = process.env.OWNER_NUMBER || "";
            const ownerClean = ownerRaw.replace(/[^0-9]/g, "");
            const isOwner = m.key.fromMe || (ownerClean && sender.includes(ownerClean));

            sock.sendCustom = async (jid, content, options = {}) => {
                // Correctif visibilité (best-effort) : Baileys a parfois
                // besoin d'un fetch récent des métadonnées d'un groupe pour
                // bien distribuer les clés de chiffrement à TOUS les
                // participants avant d'envoyer un message. Sans ça, un
                // message peut sembler "envoyé" côté bot (et visible sur
                // les autres appareils du même compte) sans forcément être
                // déchiffrable par tous les membres du groupe. On ne le
                // fait qu'une fois par groupe et par session (pas à chaque
                // message, pour ne pas ralentir).
                if (jid.endsWith("@g.us")) {
                    if (!sock._warmedGroups) sock._warmedGroups = new Set();
                    if (!sock._warmedGroups.has(jid)) {
                        try {
                            await sock.groupMetadata(jid);
                            sock._warmedGroups.add(jid);
                        } catch (e) { /* on continue même si ça échoue */ }
                    }
                }

                const result = await sendWithContext(sock, jid, content, {
                    quoted: m,
                    ...options,
                    applyFont: applyFont,
                    fontIndex: config.selectedFont
                });
                // Garde une petite trace des derniers messages envoyés par
                // chat, utilisée par .clearchat pour nettoyer proprement.
                if (result?.key) {
                    if (!sock._sentKeys) sock._sentKeys = new Map();
                    const list = sock._sentKeys.get(jid) || [];
                    list.push(result.key);
                    if (list.length > 30) list.shift();
                    sock._sentKeys.set(jid, list);
                }
                return result;
            };

            if (from.endsWith("@g.us") && !isOwner) {
                const metadata = await sock.groupMetadata(from);
                const admins = metadata.participants.filter(v => v.admin !== null).map(v => v.id);
                const isBotAdmin = admins.includes(sock.user.id.split(":")[0] + "@s.whatsapp.net");
                const isSenderAdmin = admins.includes(sender);

                if (isBotAdmin && !isSenderAdmin) {
                    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi;

                    if (config.antilink && config.antilink[from] && linkRegex.test(body)) {
                        await sock.sendMessage(from, { delete: m.key });
                        return sock.sendCustom(from, { text: `\ud83d\udeab *Lien detecte !* @${sender.split("@")[0]} a ete averti.`, mentions: [sender] });
                    }
                    if (config.antibot && config.antibot[from] && (m.key.id.startsWith("BAE5") || m.key.id.length > 21)) {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        return sock.sendCustom(from, { text: `\ud83d\udeab *Bot detecte !* @${sender.split("@")[0]} a ete expulse.`, mentions: [sender] });
                    }
                    if (config.antifake && config.antifake[from] && !sender.startsWith("228")) {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        return sock.sendCustom(from, { text: `\ud83d\udeab *Numero suspect detecte !* @${sender.split("@")[0]} a ete expulse.`, mentions: [sender] });
                    }
                    if (config.antispam && config.antispam[from]) {
                        if (!sock._spamTracker) sock._spamTracker = new Map();
                        const now = Date.now();
                        const WINDOW_MS = 8000;
                        const MAX_MSG = 6;
                        const key = `${from}:${sender}`;
                        const entry = sock._spamTracker.get(key) || { count: 0, windowStart: now };
                        if (now - entry.windowStart > WINDOW_MS) {
                            entry.count = 0;
                            entry.windowStart = now;
                        }
                        entry.count += 1;
                        sock._spamTracker.set(key, entry);
                        if (entry.count > MAX_MSG) {
                            sock._spamTracker.delete(key);
                            await sock.sendMessage(from, { delete: m.key }).catch(() => {});
                            return sock.sendCustom(from, { text: `\ud83d\udeab *Spam detecte !* @${sender.split("@")[0]} envoie trop de messages.`, mentions: [sender] });
                        }
                    }
                }
            }

            if (isCmd) {
                const systemCommands = ["restart", "shutdown", "exec", "setprefix", "setfont", "sprefix"];
                if (systemCommands.includes(command) && !isOwner) {
                    return sock.sendCustom(from, { text: "\u26a0\ufe0f Cette commande est reservee a mon proprietaire." });
                }

                const cmdPath = path.join(ROOT, "commandes", `${command}.js`);
                const menuPath = path.join(ROOT, "commandes/menu.js");
                const targetPath = fs.existsSync(cmdPath) ? cmdPath : (command === "menu" || command === "help") ? menuPath : null;

                if (targetPath) {
                    // Réaction emoji immédiate sur le message de commande,
                    // pour que l'auteur (et tout le monde dans le chat) voie
                    // tout de suite que la commande a bien été reçue, même
                    // si l'exécution prend quelques secondes.
                    sock.sendMessage(from, { react: { text: "⚔️", key: m.key } }).catch(() => {});

                    const cmd = require(targetPath);
                    await cmd.execute(sock, m, args);
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
}

function applyFont(text, fontIndex) {
    const fonts = {
        1: {'a':'𝖆','b':'𝖇','c':'𝖈','d':'𝖉','e':'𝖊','f':'𝖋','g':'𝖌','h':'𝖍','i':'𝖎','j':'𝖏','k':'𝖐','l':'𝖑','m':'𝖒','n':'𝖓','o':'𝖔','p':'𝖕','q':'𝖖','r':'𝖗','s':'𝖘','t':'𝖙','u':'𝖚','v':'𝖛','w':'𝖜','x':'𝖝','y':'𝖞','z':'𝖟','A':'𝕬','B':'𝕭','C':'𝕮','D':'𝕯','E':'𝕰','F':'𝕱','G':'𝕲','H':'𝕳','I':'𝕴','J':'𝕵','K':'𝕶','L':'𝕷','M':'𝕸','N':'𝕹','O':'𝕺','P':'𝕻','Q':'𝕼','R':'𝕽','S':'𝕾','T':'𝕿','U':'𝖀','V':'𝖁','W':'𝖂','X':'𝖃','Y':'𝖄','Z':'𝖅'},
        2: {'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳','A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙'},
        3: {'a':'𝗮','b':'𝗯','c':'𝗰','d':'𝗱','e':'𝗲','f':'𝗳','g':'𝗴','h':'𝗵','i':'𝗶','j':'𝗷','k':'𝗸','l':'𝗹','m':'𝗺','n':'𝗻','o':'𝗼','p':'𝗽','q':'𝗾','r':'𝗿','s':'𝘀','t':'𝘁','u':'𝘂','v':'𝘃','w':'𝘄','x':'𝘅','y':'𝘆','z':'𝘇','A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝','K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧','U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭'},
        4: {'a':'𝘢','b':'𝘣','c':'𝘤','d':'𝘥','e':'𝘦','f':'𝘧','g':'𝘨','h':'𝘩','i':'𝘪','j':'𝘫','k':'𝘬','l':'𝘭','m':'𝘮','n':'𝘯','o':'𝘰','p':'𝘱','q':'𝘲','r':'𝘳','s':'𝘴','t':'𝘵','u':'𝘶','v':'𝘷','w':'𝘸','x':'𝘹','y':'𝘺','z':'𝘻','A':'𝘈','B':'𝘉','C':'𝘊','D':'𝘋','E':'𝘌','F':'𝘍','G':'𝘎','H':'𝘏','I':'𝘐','J':'𝘑','K':'𝘒','L':'𝘓','M':'𝘔','N':'𝘕','O':'𝘖','P':'𝘗','Q':'𝘘','R':'𝘙','S':'𝘚','T':'𝘛','U':'𝘜','V':'𝘝','W':'𝘞','X':'𝘟','Y':'𝘠','Z':'𝘡'},
        5: {'a':'𝙖','b':'𝙗','c':'𝙘','d':'𝙙','e':'𝙚','f':'𝙛','g':'𝙜','h':'𝙝','i':'𝙞','j':'𝙟','k':'𝙠','l':'𝙡','m':'𝙢','n':'𝙣','o':'𝙤','p':'𝙥','q':'𝙦','r':'𝙧','s':'𝙨','t':'𝙩','u':'𝙪','v':'𝙫','w':'𝙬','x':'𝙭','y':'𝙮','z':'𝙯','A':'𝘼','B':'𝘽','C':'𝘾','D':'𝘿','E':'𝙀','F':'𝙁','G':'𝙂','H':'𝙃','I':'𝙄','J':'𝙅','K':'𝙆','L':'𝙇','M':'𝙈','N':'𝙉','O':'𝙊','P':'𝙋','Q':'𝙌','R':'𝙍','S':'𝙎','T':'𝙏','U':'𝙐','V':'𝙑','W':'𝙒','X':'𝙓','Y':'𝙔','Z':'𝙕'},
        6: {'a':'𝑎','b':'𝑏','c':'𝑐','d':'𝑑','e':'𝑒','f':'𝑓','g':'𝑔','h':'ℎ','i':'𝑖','j':'𝑗','k':'𝑘','l':'𝑙','m':'𝑚','n':'𝑛','o':'𝑜','p':'𝑝','q':'𝑞','r':'𝑟','s':'𝑠','t':'𝑡','u':'𝑢','v':'𝑣','w':'𝑤','x':'𝑥','y':'𝑦','z':'𝑧','A':'𝐴','B':'𝐵','C':'𝐶','D':'𝐷','E':'𝐸','F':'𝐹','G':'𝐺','H':'𝐻','I':'𝐼','J':'𝐽','K':'𝐾','L':'𝐿','M':'𝑀','N':'𝑁','O':'𝑂','P':'𝑃','Q':'𝑄','R':'𝑅','S':'𝑆','T':'𝑇','U':'𝑈','V':'𝑉','W':'𝑊','X':'𝑋','Y':'𝑌','Z':'𝑍'},
        7: {'a':'𝓪','b':'𝓫','c':'𝓬','d':'𝓭','e':'𝓮','f':'𝓯','g':'𝓰','h':'𝓱','i':'𝓲','j':'𝓳','k':'𝓴','l':'𝓵','m':'𝓶','n':'𝓷','o':'𝓸','p':'𝓹','q':'𝓺','r':'𝓻','s':'𝓼','t':'𝓽','u':'𝓾','v':'𝓿','w':'𝔀','x':'𝔁','y':'𝔂','z':'𝔃','A':'𝓐','B':'𝓑','C':'𝓒','D':'𝓓','E':'𝓔','F':'𝓕','G':'𝓖','H':'𝓗','I':'𝓘','J':'𝓙','K':'𝓚','L':'𝓛','M':'𝓜','N':'𝓝','O':'𝓞','P':'𝓟','Q':'𝓠','R':'𝓡','S':'𝓢','T':'𝓣','U':'𝓤','V':'𝓥','W':'𝓦','X':'𝓧','Y':'𝓨','Z':'𝓩'},
        8: {'a':'𝔞','b':'𝔟','c':'𝔠','d':'𝔡','e':'𝔢','f':'𝔣','g':'𝔤','h':'𝔥','i':'𝔦','j':'𝔧','k':'𝔨','l':'𝔩','m':'𝔪','n':'𝔫','o':'𝔬','p':'𝔭','q':'𝔮','r':'𝔯','s':'𝔰','t':'𝔱','u':'𝔲','v':'𝔳','w':'𝔴','x':'𝔵','y':'𝔶','z':'𝔷','A':'𝔄','B':'𝔅','C':'ℭ','D':'𝔇','E':'𝔈','F':'𝔉','G':'𝔊','H':'ℌ','I':'ℑ','J':'𝔍','K':'𝔎','L':'𝔏','M':'𝔐','N':'𝔑','O':'𝔒','P':'𝔓','Q':'𝔔','R':'ℜ','S':'𝔖','T':'𝔗','U':'𝔘','V':'𝔙','W':'𝔚','X':'𝔛','Y':'𝔶','Z':'ℨ'},
        9: {'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ғ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ','A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ғ','G':'ɢ','H':'ʜ','I':'ɪ','J':'ᴊ','K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ','Q':'ǫ','R':'ʀ','S':'s','T':'ᴛ','U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x','Y':'ʏ','Z':'ᴢ'},
        10: {'a':'ａ','b':'ｂ','c':'ｃ','d':'ｄ','e':'ｅ','f':'ｆ','g':'ｇ','h':'ｈ','i':'ｉ','j':'ｊ','k':'ｋ','l':'ｌ','m':'ｍ','n':'ｎ','o':'ｏ','p':'ｐ','q':'ｑ','r':'ｒ','s':'ｓ','t':'ｔ','u':'ｕ','v':'ｖ','w':'ｗ','x':'ｘ','y':'ｙ','z':'ｚ','A':'Ａ','B':'Ｂ','C':'Ｃ','D':'Ｄ','E':'Ｅ','F':'Ｆ','G':'Ｇ','H':'Ｈ','I':'Ｉ','J':'Ｊ','K':'Ｋ','L':'Ｌ','M':'Ｍ','N':'Ｎ','O':'Ｏ','P':'Ｐ','Q':'Ｑ','R':'Ｒ','S':'Ｓ','T':'Ｔ','U':'Ｕ','V':'Ｖ','W':'Ｗ','X':'Ｘ','Y':'Ｙ','Z':'Ｚ'}
    };
    const map = fonts[fontIndex];
    if (!map) return text;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    let result = "";

    for (let i = 0; i < parts.length; i++) {
        if (parts[i].match(urlRegex)) {
            result += parts[i];
        } else {
            result += parts[i].split('').map(char => map[char] || char).join('');
        }
    }
    return result;
}

module.exports = { registerWAHandlers, applyFont };
