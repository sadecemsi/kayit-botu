const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('otorol')
        .setDescription('Otorol sistemini açar veya kapatır.')
        .addBooleanOption(option => option.setName('durum').setDescription('Otorol sisteminin durumu').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const durum = interaction.options.getBoolean('durum');
        await otorolAyarla(interaction, durum);
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return sendErrorEmbed(message, 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
        }
        if (args.length < 1) {
            return sendErrorEmbed(message, 'Lütfen bir durum belirtin (aç/kapat).');
        }
        const durum = args[0].toLowerCase() === 'aç';
        await otorolAyarla(message, durum);
    }
};

async function otorolAyarla(context, durum) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    if (!data[context.guildId]) data[context.guildId] = {};
    data[context.guildId].otorolAktif = durum;

    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Otorol Sistemi Ayarlandı')
        .setDescription(`Otorol sistemi ${durum ? 'açıldı' : 'kapatıldı'}. ${durum ? 'Yeni üyelere otomatik olarak kayıtsız rolü verilecek.' : ''}`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}otorol <aç/kapat>`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}