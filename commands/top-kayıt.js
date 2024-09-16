const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top-kayıt')
        .setDescription('En çok kayıt yapan yetkilileri listeler.'),
    async execute(interaction) {
        await topKayıtGöster(interaction);
    },
    async executeMessage(message, args) {
        await topKayıtGöster(message);
    }
};

async function topKayıtGöster(context) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};

    if (!guildData.kayıtlar || guildData.kayıtlar.length === 0) {
        return sendErrorEmbed(context, 'Bu sunucuda hiç kayıt yapılmamış.');
    }

    const kayıtSayıları = {};
    guildData.kayıtlar.forEach(kayıt => {
        kayıtSayıları[kayıt.registeredBy] = (kayıtSayıları[kayıt.registeredBy] || 0) + 1;
    });

    const sıralama = Object.entries(kayıtSayıları)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🏆 En Çok Kayıt Yapan Yetkililer')
        .setDescription('İşte sunucunun en çok kayıt yapan 10 yetkilisi:')
        .setTimestamp();

    for (let i = 0; i < sıralama.length; i++) {
        const [userId, count] = sıralama[i];
        const user = await context.client.users.fetch(userId);
        embed.addFields({ name: `${i + 1}. ${user.tag}`, value: `${count} kayıt`, inline: false });
    }

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}top-kayıt`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}