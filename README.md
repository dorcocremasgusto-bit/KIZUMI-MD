# SKARA NICE â€” Pairing WhatsApp via Telegram (multi-session)

## Ce qui a changÃ©

- **Aucune commande WhatsApp n'a Ã©tÃ© supprimÃ©e** : `commandes/` est intact (100+ fichiers).
- La connexion WhatsApp **ne se fait plus via `env/.env` au dÃ©marrage du serveur**.
- Elle se fait maintenant **depuis Telegram**, avec `/pair <numÃ©ro>`.
- **Chaque utilisateur Telegram = sa propre session WhatsApp**, isolÃ©e des autres (1 chatId Telegram â†’ 1 connexion WhatsApp maximum).
- Jusqu'Ã  **1500 sessions WhatsApp simultanÃ©es** (rÃ©glable via `MAX_SESSIONS` dans `telegram/.env`).
- Toutes les sessions dÃ©jÃ  appairÃ©es sont **restaurÃ©es automatiquement** au redÃ©marrage du serveur.

## Installation

```bash
npm install
```

(toutes les dÃ©pendances nÃ©cessaires â€” Telegram et WhatsApp â€” sont dÃ©jÃ  dans le `package.json` racine).

## Configuration

1. `telegram/.env` :
   - `TG_TOKEN` â€” le token de votre bot Telegram (@BotFather)
   - `OWNER_TG_IDS` â€” vos ID(s) Telegram (rÃ©cupÃ©rables avec `/id`)
   - `MAX_SESSIONS` â€” 1500 par dÃ©faut
2. `env/.env` : inchangÃ©, sert toujours pour `OWNER_NUMBER` (admin global) et `PREFIX` des commandes WhatsApp.

## DÃ©marrage

```bash
node index.js
```

Cela dÃ©marre **uniquement le bot Telegram**. Aucune connexion WhatsApp n'est lancÃ©e tant qu'un utilisateur n'a pas fait `/pair`.

## Utilisation (cÃ´tÃ© Telegram)

- `/start` â†’ menu principal (image SKARA NICE + sections Pairing / System / User / Other)
- `/pair 22896985431` â†’ gÃ©nÃ¨re un code de jumelage WhatsApp
- `/session` â†’ statut de votre session
- `/delpair` â†’ dÃ©connecte et supprime votre session
- `/ping`, `/runtime`, `/status` â†’ infos systÃ¨me
- `/me`, `/id`, `/owner` â†’ infos utilisateur
- `/help`, `/about`, `/support` â†’ aide

## Architecture

```
racine/
â”œâ”€â”€ commandes/            â† vos commandes WhatsApp (INCHANGÃ‰ES)
â”œâ”€â”€ env/                  â† .env + config.json existants (INCHANGÃ‰S)
â”œâ”€â”€ images/                + skara_start.jpg (image du /start Telegram)
â”œâ”€â”€ utils/sendWithContext.js  â† INCHANGÃ‰
â”œâ”€â”€ wa/messageHandler.js  â† logique WhatsApp extraite de l'ancien index.js,
â”‚                            rÃ©utilisable pour CHAQUE session (NOUVEAU)
â”œâ”€â”€ telegram/              â† couche Telegram demandÃ©e (NOUVEAU)
â”‚   â”œâ”€â”€ commands/          (start, help, pair, session, delpair, ping,
â”‚   â”‚                        runtime, status, owner + me, id, about, support)
â”‚   â”œâ”€â”€ handlers/           (commandHandler.js, callbackHandler.js)
â”‚   â”œâ”€â”€ keyboards/          (inline.js, reply.js)
â”‚   â”œâ”€â”€ utils/               config.js, logger.js, functions.js
â”‚   â”‚                        + sessionManager.js (gestionnaire multi-session,
â”‚   â”‚                          ajoutÃ© car indispensable au-delÃ  d'1 session)
â”‚   â”œâ”€â”€ .env
â”‚   â”œâ”€â”€ index.js
â”‚   â””â”€â”€ package.json       (informatif â€” l'install rÃ©elle est Ã  la racine)
â”œâ”€â”€ index.js               â† NOUVEAU point d'entrÃ©e (dÃ©marre Telegram uniquement)
â””â”€â”€ index.old.js.bak       â† ancien index.js conservÃ© pour rÃ©fÃ©rence
```

## Note technique

`telegram/utils/sessionManager.js` n'Ã©tait pas dans l'arborescence demandÃ©e, mais
c'est le fichier qui rend le multi-session possible : il garde en mÃ©moire une
`Map(chatId â†’ session WhatsApp)`, applique la limite de 1500, gÃ¨re les
reconnexions automatiques et branche `wa/messageHandler.js` (donc toutes vos
commandes WhatsApp existantes) sur chaque session dÃ¨s sa crÃ©ation.

---

## ðŸŒ Site de pairing web (thÃ¨me Lloyd)

Un deuxiÃ¨me point d'entrÃ©e totalement indÃ©pendant : un site oÃ¹ chaque visiteur
tape son numÃ©ro et reÃ§oit son code de jumelage, sans passer par Telegram.

```
web/
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ index.html        â† page stylÃ©e thÃ¨me Lloyd (SKARA NICE)
â”‚   â””â”€â”€ lloyd-bg.jpg       â† image de fond
â”œâ”€â”€ utils/
â”‚   â”œâ”€â”€ config.js
â”‚   â””â”€â”€ webSessionManager.js   â† Ã©quivalent web de telegram/utils/sessionManager.js
â”œâ”€â”€ .env
â””â”€â”€ server.js
```

### Comment Ã§a marche

- Chaque visiteur reÃ§oit un cookie `sn_sid` (UUID) au premier chargement : c'est
  sa clÃ© de session, exactement comme le `chatId` pour Telegram.
- `POST /api/pair { number }` crÃ©e sa session WhatsApp et renvoie le code de
  jumelage Ã  afficher.
- `GET /api/status` renvoie l'Ã©tat de sa session (`idle` / `connecting` /
  `connected` / `disconnected`) â€” la page fait un polling automatique aprÃ¨s
  avoir affichÃ© le code, pour afficher "âœ” ConnectÃ©" dÃ¨s que c'est bon.
- `GET /api/stats` renvoie `{ connected, disconnected, capacity }`, affichÃ© en
  haut de la page.
- Toutes les commandes WhatsApp existantes (`commandes/`) sont branchÃ©es sur
  chaque session via `wa/messageHandler.js`, exactement comme cÃ´tÃ© Telegram.
- Les sessions web sont stockÃ©es dans `web_sessions/` (sÃ©parÃ© de
  `telegram_sessions/`) â€” les deux couches tournent en parallÃ¨le sans conflit,
  un mÃªme bot peut donc accepter des connexions depuis Telegram **et** depuis
  le site en mÃªme temps.

### DÃ©marrage

```bash
npm install
node web/server.js
# ou : npm run start:web
```

Le site tourne alors sur `http://localhost:3000` (port rÃ©glable via
`WEB_PORT` dans `web/.env`).

Pour lancer Telegram **et** le site en mÃªme temps :

```bash
npm run start:all
```

### Configuration (`web/.env`)

- `WEB_PORT` â€” port d'Ã©coute (3000 par dÃ©faut)
- `MAX_SESSIONS` â€” capacitÃ© max de sessions WhatsApp sur le site (1500 par dÃ©faut)
- `COOKIE_SECRET` â€” Ã  changer en production

### DÃ©ploiement

Le site est un serveur Express classique : dÃ©ployable sur n'importe quel
hÃ©bergeur Node (VPS, Railway, Render...). Pensez Ã  :
- Mettre le site derriÃ¨re HTTPS (obligatoire pour que le cookie de session
  soit fiable en production)
- Ajuster `COOKIE_SECRET` dans `web/.env`
- Garder `web_sessions/` sur un disque persistant, sinon toutes les connexions
  sont perdues Ã  chaque redÃ©ploiement

---

## ðŸ¥· Reskin Ninjago "PERFECT CORE N.C"

Toutes les commandes utilisent maintenant un style visuel unique, cohÃ©rent,
dÃ©fini dans `utils/ninjaStyle.js` :

```js
const { reply } = require('../utils/ninjaStyle');
sock.sendCustom(from, { text: reply("TITRE", ["ligne 1", "ligne 2"]) });
```

- `.menu` envoie la vidÃ©o du dojo en boucle (gifPlayback) + le menu complet,
  organisÃ© par sections (Spinjitzu Core, Dojo Control, Shadow Actions, Dragon
  Shield, Ninja Fun, Dragon Media, Master AI, Training Arena, System Force).
- Les 23 anciennes commandes au style "MCKINGER XMD / X VOID" ont Ã©tÃ©
  rÃ©Ã©crites avec la nouvelle charte, logique mÃ©tier inchangÃ©e.
- Les 41 commandes qui n'Ã©taient que des placeholders ("commande activÃ©e et
  prÃªte Ã  Ãªtre configurÃ©e...") ont toutes Ã©tÃ© codÃ©es avec une vraie logique
  fonctionnelle (voir dÃ©tail plus bas).
- **`.tg <lien_pack_telegram> [numÃ©ro]`** â€” nouvelle commande : convertit un
  sticker d'un pack Telegram public en sticker WhatsApp, en rÃ©utilisant le
  `TG_TOKEN` dÃ©jÃ  configurÃ© dans `telegram/.env`.
- Un doublon `.antilink` / `.antillink` (bug de frappe qui rendait `.antilink`
  inutilisable) a Ã©tÃ© fusionnÃ© en un seul fichier fonctionnel.
- `sendWithContext.js` injectait encore l'ancienne pub "MCKINGER X VOID" dans
  CHAQUE message envoyÃ© (y compris les nouveaux styles) â€” corrigÃ© pour
  reflÃ©ter PERFECT CORE N.C.

### Commandes dÃ©sormais rÃ©ellement implÃ©mentÃ©es (au lieu de placeholders)

- **Fun/statique** : joke, fact, quote, dare, truth, dice, roll, ship, meme
  (API publique meme-api.com)
- **Jeux/points** : daily, quiz, guess, tictactoe, game, leaderboard â€” tous
  branchÃ©s sur `utils/pointsStore.js` (fichier JSON persistant)
- **Groupe** : alladmin, everyone, mentionall
- **Diffusion** : broadcast, bcgroup, bcpm, sendall, forward, copy
- **IA / texte** : ask, chat, gpt, rephrase (via `utils/aiClient.js`, Ã 
  configurer avec `AI_API_KEY` dans `env/.env` â€” sans clÃ©, message clair au
  lieu d'une fausse rÃ©ponse) ; translate (API gratuite MyMemory, aucune clÃ©) ;
  define (dictionaryapi.dev, anglais, gratuit) ; summarize (rÃ©sumÃ© extractif
  local, aucune IA/clÃ© nÃ©cessaire)
- **SystÃ¨me** : backup/restore (sauvegarde rÃ©elle de la config de session en
  fichier .json), clearchat (supprime les derniers messages du bot), exec
  (shell + `js:` eval, dÃ©jÃ  rÃ©servÃ© au propriÃ©taire), update (git pull rÃ©el),
  uptime, math (Ã©valuateur sÃ©curisÃ©), pp (photo de profil)

### âš ï¸ Bug critique corrigÃ© : `.shutdown` / `.restart` tuaient TOUT le process

Avant, ces deux commandes faisaient `process.exit(0)` â€” sur un serveur qui
hÃ©berge 1500 sessions en mÃªme temps, Ã§a arrÃªtait le bot de **tout le monde**,
pas seulement celui qui tapait la commande. Elles ferment dÃ©sormais
uniquement la connexion de la session courante (`sock.end()`), qui se
reconnecte automatiquement via le gestionnaire de session (Telegram/web).

---

## ðŸ”’ Correctif majeur : config isolÃ©e par session

**Avant :** `setprefix`, `setfont`, `sprefix`, `antilink`, `antibot`,
`antifake`, `antispam`, `antiadd`, `welcome`, `goodbye`, `warn` lisaient et
Ã©crivaient TOUS le mÃªme fichier `env/config.json`, partagÃ© par toutes les
sessions WhatsApp connectÃ©es (Telegram + site confondus). Un utilisateur qui
changeait son prefix changeait celui de tout le monde.

**Maintenant :** chaque session a son propre fichier de config, isolÃ© :

```
env/sessions/<sessionId>.json
```

`<sessionId>` = le chatId Telegram ou le sid web de cette session prÃ©cise.
`wa/messageHandler.js` pose `sock.sessionId` dÃ¨s la crÃ©ation de la session
(voir `registerWAHandlers`), et **toutes** les commandes qui touchent Ã  la
config utilisent dÃ©sormais `utils/sessionConfig.js` :

```js
const { readConfig, writeConfig } = require('../utils/sessionConfig');
const config = readConfig(sock);
config.prefix = '!';
writeConfig(sock, config);
```

RÃ©sultat : prefix, antilink, antibot, antifake, antispam, antiadd, welcome,
goodbye, warns â€” tout est dÃ©sormais propre Ã  CHAQUE session. Rien n'est
partagÃ© entre utilisateurs, sauf ce qui est explicitement global (comme
`OWNER_NUMBER` dans `env/.env`, qui dÃ©finit l'administrateur du bot).

Un bonus de sÃ©curitÃ© : `.antiadd` appelle maintenant la vraie API WhatsApp
(`groupMemberAddMode`) pour restreint qui peut ajouter des membres, et
`.antispam` a une dÃ©tection rÃ©elle de flood intÃ©grÃ©e dans
`wa/messageHandler.js` (au lieu d'Ãªtre un simple interrupteur sans effet).

## ðŸ©¹ Correctifs (crash disque, alignement, visibilitÃ©, rÃ©actions, idch)

Plusieurs bugs remontÃ©s en usage rÃ©el, corrigÃ©s :

1. **Crash `ENOSPC` (disque plein) qui tuait tout le bot.**
   - Cause racine : `.pair` crÃ©ait un dossier `temp_sessions/session_<timestamp>`
     et une connexion WebSocket Ã  CHAQUE utilisation, sans jamais les
     nettoyer ni les fermer â†’ fuite disque + mÃ©moire qui grossit Ã 
     l'infini. CorrigÃ© : nettoyage automatique aprÃ¨s chaque `.pair`.
   - Cause aggravante : `sendWithContext.js` transformait **chaque**
     rÃ©ponse texte en image (upload + encodage Ã  chaque commande) â†’
     beaucoup plus lourd que nÃ©cessaire. CorrigÃ© : les rÃ©ponses restent
     du texte normal.
   - Ajout d'un filet de sÃ©curitÃ© global (`uncaughtException` /
     `unhandledRejection` dans `index.js` et `web/server.js`) : une
     erreur dans une session ne fait plus jamais planter tout le
     serveur (donc toutes les autres sessions) d'un coup.

2. **Barres/bordures dÃ©calÃ©es.** Le texte WhatsApp normal n'est pas
   monospace, donc les caractÃ¨res de dessin de boÃ®te (â”Œâ”‚â””â”€) ne
   s'alignaient jamais correctement. `utils/ninjaStyle.js` et
   `commandes/menu.js` enveloppent maintenant tout le rendu en
   monospace WhatsApp (```texte```), ce qui garantit un alignement
   identique sur tous les tÃ©lÃ©phones.

3. **ExÃ©cution invisible pour les autres.** Le faux "forward depuis une
   chaÃ®ne" (`isForwarded:true`, `forwardingScore:99`) combinÃ© Ã  la
   conversion systÃ©matique en image est le genre de signature que les
   systÃ¨mes anti-spam de WhatsApp peuvent restreindre cÃ´tÃ© destinataire,
   tout en restant visible sur l'appareil de l'expÃ©diteur (sync
   multi-appareil). Ce forward forcÃ© a Ã©tÃ© retirÃ© ; les messages sont
   maintenant du texte normal, fiable pour tout le monde â€” en DM,
   groupes, chaÃ®nes et communautÃ©s (Ã  condition, pour les chaÃ®nes et
   les groupes d'annonce des communautÃ©s, que le compte connectÃ© soit
   bien admin/propriÃ©taire, ce qui est une restriction WhatsApp
   elle-mÃªme, pas un bug du bot).

4. **RÃ©action emoji automatique.** DÃ¨s qu'une commande valide est
   reconnue, le bot rÃ©agit avec âš”ï¸ sur le message, avant mÃªme que la
   rÃ©ponse complÃ¨te arrive â€” utile pour les commandes plus longues
   (media, IA...).

5. **`.idch` accepte maintenant un lien de chaÃ®ne.** `.idch
   https://whatsapp.com/channel/xxxxx` fonctionne directement, sans
   avoir besoin d'exÃ©cuter la commande depuis l'intÃ©rieur de la chaÃ®ne.
   L'ancien comportement (dans la chaÃ®ne, ou en rÃ©ponse Ã  un message de
   chaÃ®ne) reste disponible aussi.

## ðŸ§¹ Nettoyage des dÃ©pendances (tÃ©lÃ©chargement Chrome bloquant)

`instagram-url-direct`, `tiktok-scraper-ts`, `qrcode-terminal`,
`node-id3` et `@adiwajshing/keyed-db` ont Ã©tÃ© retirÃ©s de `package.json`
â€” **aucun n'Ã©tait utilisÃ© nulle part dans le code** (`.instagram` et
`.tiktok` utilisent dÃ©jÃ  des API publiques lÃ©gÃ¨res via `axios`).

`instagram-url-direct` en particulier embarque Playwright, qui tente de
tÃ©lÃ©charger un Chrome complet (187 Mo) Ã  chaque `npm install`. Sur un
hÃ©bergeur Ã  stockage limitÃ©, ce tÃ©lÃ©chargement Ã©choue en boucle et peut
mÃªme empÃªcher `dotenv` et les autres dÃ©pendances essentielles de
s'installer correctement (ce qui provoquait le crash `Cannot find
module 'dotenv'`). En le retirant, `npm install` n'essaie plus jamais
de tÃ©lÃ©charger de navigateur.

Si vous ajoutez un jour une dÃ©pendance qui refait ce genre de
tÃ©lÃ©chargement, la vraie solution est de dÃ©finir ces variables
d'environnement **de faÃ§on persistante dans le panneau d'hÃ©bergement**
(pas juste `export` dans la console, qui ne survit pas au redÃ©marrage
automatique) :
```
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
PUPPETEER_SKIP_DOWNLOAD=true
```

## ðŸŒ Lancer le site web sur un hÃ©bergeur mono-processus (Spaceify...)

Les panneaux type Spaceify/Pterodactyl ne suivent qu'**un seul
processus** par serveur. `node index.js` (Telegram) et
`node web/server.js` (site) sÃ©parÃ©ment ne fonctionnent donc pas sur ce
genre d'hÃ©bergeur : le panneau ne verrait que le premier lancÃ©.

**Solution : `start-all.js`** lance les deux dans le MÃŠME processus.

Dans votre panneau, changez le fichier de dÃ©marrage (souvent une
variable "Main File" / "JS_FILE" dans les paramÃ¨tres de dÃ©marrage) pour
`start-all.js` au lieu de `index.js`. Ou, si le panneau exÃ©cute une
commande complÃ¨te, utilisez :
```
npm run start:all
```

Le site Ã©coute automatiquement sur le port allouÃ© par votre hÃ©bergeur
(`SERVER_PORT` ou `PORT`, injectÃ©s automatiquement par la plupart des
panneaux), sinon sur `WEB_PORT` dÃ©fini dans `web/.env`, sinon 3000 par
dÃ©faut.

**Pour trouver le lien du site :** dans Spaceify, l'onglet rÃ©seau /
allocations du serveur affiche l'adresse et le port publics (visible
dans vos captures prÃ©cÃ©dentes : "Address: de29.spaceify.eu:25425" par
exemple). C'est cette adresse-lÃ  qu'il faut ouvrir dans un navigateur
une fois `start-all.js` lancÃ© â€” pas `localhost`.

## ðŸŽ¨ Refonte complÃ¨te du site (v2)

- Nouveau logo (crest LEGO Ninjago) + nouveau texte de marque exact
  demandÃ©, en dÃ©gradÃ© chrome.
- Texte rÃ©duit au strict minimum partout (fini les paragraphes
  explicatifs).
- **QR code en option**, en plus du code de jumelage classique â€” bascule
  Code/QR directement sur la page (`GET /api/status` renvoie maintenant
  aussi `qrDataUrl`, gÃ©nÃ©rÃ© cÃ´tÃ© serveur avec le paquet `qrcode`, jamais
  partagÃ© Ã  un service tiers).
- **Bouton copier** le code en un clic.
- **Bouton dÃ©connecter** directement sur le site une fois connectÃ©
  (utilise `/api/delpair`, dÃ©jÃ  existant cÃ´tÃ© serveur).

## ðŸ©¹ Autres correctifs de cette itÃ©ration

- `.menu` : la vidÃ©o est maintenant mise en cache aprÃ¨s le premier
  tÃ©lÃ©chargement (plus rapide, moins de dÃ©pendance rÃ©seau Ã  chaque
  appel), avec un timeout plus long et un vrai message d'erreur dans
  les logs si Ã§a Ã©choue.
- VisibilitÃ© chez les autres participants : ajout d'un rafraÃ®chissement
  des mÃ©tadonnÃ©es de groupe avant le premier envoi dans un groupe
  (aide Ã  la distribution des clÃ©s de chiffrement). **Point
  d'honnÃªtetÃ©** : ce problÃ¨me est un bug/limitation connu et documentÃ©
  de Baileys lui-mÃªme (voir issues GitHub #861, #1963, #1387 du dÃ©pÃ´t
  WhiskeySockets/Baileys) â€” intermittent et pas garanti Ã  100%
  rÃ©solu par ce correctif, la librairie elle-mÃªme a ce dÃ©faut par
  moments.