module.exports = {
    name: 'otp',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const otp = Math.floor(100000 + Math.random() * 900000);
        await sock.sendCustom(from, { text: `🔐 Votre code OTP temporaire est : *${otp}*\n\nCe code expire dans 5 minutes.` });
    }
};
