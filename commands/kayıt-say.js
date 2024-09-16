const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-say')
        .setDescription('Sunucudaki kayıtlı ve kayıtsız üye sayısını gösterir.'),
    async execute(interaction) {
        await kayıtSayGöster(interaction);
    },
    async executeMessage(message, args) {
        await kayıtSayGöster(message);
    }
};

async function kayıtSayGöster(context) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};

    if (!guildData.kayıtlıRolü || !guildData.kayıtsızRolü) {
        return sendErrorEmbed(context, 'Kayıtlı veya kayıtsız rolü ayarlanmamış.');
    }

    const guild = context.guild;
    const totalMembers = guild.members.cache.filter(member => !member.user.bot).size;
    const kayıtlıRole = guild.roles.cache.get(guildData.kayıtlıRolü);
    const kayıtsızRole = guild.roles.cache.get(guildData.kayıtsızRolü);

    let kayıtlıCount = 0;
    let kayıtsızCount = 0;

    if (kayıtlıRole) {
        kayıtlıCount = kayıtlıRole.members.filter(member => !member.user.bot).size;
    }

    if (kayıtsızRole) {
        kayıtsızCount = kayıtsızRole.members.filter(member => !member.user.bot).size;
    }

    const diğerCount = totalMembers - (kayıtlıCount + kayıtsızCount);

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('👥 Üye Sayıları')
        .addFields(
            { name: 'Toplam Üye (Botlar Hariç)', value: totalMembers.toString(), inline: false },
            { name: 'Kayıtlı Üye', value: kayıtlıCount.toString(), inline: true },
            { name: 'Kayıtsız Üye', value: kayıtsızCount.toString(), inline: true },
            { name: 'Diğer Üyeler', value: diğerCount.toString(), inline: true }
        )
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}kayıt-say`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}