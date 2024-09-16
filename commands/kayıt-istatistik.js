const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-istatistik')
        .setDescription('Sunucunun genel kayıt istatistiklerini gösterir.'),
    async execute(interaction) {
        await kayıtİstatistikGöster(interaction);
    },
    async executeMessage(message, args) {
        await kayıtİstatistikGöster(message);
    }
};

async function kayıtİstatistikGöster(context) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};

    if (!guildData.kayıtlar || guildData.kayıtlar.length === 0) {
        return sendErrorEmbed(context, 'Bu sunucuda hiç kayıt yapılmamış.');
    }

    const totalRegistrations = guildData.kayıtlar.length;
    const maleCount = guildData.kayıtlar.filter(k => k.gender === 'erkek').length;
    const femaleCount = guildData.kayıtlar.filter(k => k.gender === 'kız').length;
    const unspecifiedCount = totalRegistrations - maleCount - femaleCount;

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📊 Kayıt İstatistikleri')
        .addFields(
            { name: 'Toplam Kayıt', value: totalRegistrations.toString(), inline: true },
            { name: 'Erkek', value: maleCount.toString(), inline: true },
            { name: 'Kız', value: femaleCount.toString(), inline: true },
            { name: 'Belirtilmemiş', value: unspecifiedCount.toString(), inline: true }
        )
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}kayıt-istatistik`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}