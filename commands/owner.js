module.exports = {
    name: 'owner',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n'
            + 'FN:Miss Hans\n'
            + 'ORG:𝖳𝖧𝖤 𝖳𝖸𝖫𝖠;\n'
            + 'TEL;type=CELL;type=VOICE;waid=243962085406:+243962 085 406\n'
            + 'END:VCARD';
        await sock.sendMessage(from, {
            contacts: {
                displayName: 'Lust Dev',
                contacts: [{ vcard }]
            }
        }, { quoted: m });
    }
};
