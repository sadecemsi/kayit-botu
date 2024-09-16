const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-ayarla')
        .setDescription('Kayıt sistemini açar veya kapatır.')
        .addStringOption(option => 
            option.setName('durum')
                .setDescription('Kayıt sisteminin durumu')
                .setRequired(true)
                .addChoices(
                    { name: 'Aç', value: 'aç' },
                    { name: 'Kapat', value: 'kapat' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const durum = interaction.options.getString('durum');
        await kayıtAyarla(interaction, durum);
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return sendErrorEmbed(message, 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
        }
        if (args.length < 1 || (args[0].toLowerCase() !== 'aç' && args[0].toLowerCase() !== 'kapat')) {
            return sendErrorEmbed(message, 'Geçerli bir durum belirtmelisiniz. (aç/kapat)');
        }
        const durum = args[0].toLowerCase();
        await kayıtAyarla(message, durum);
    }
};

async function kayıtAyarla(context, durum) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    if (!data[context.guildId]) data[context.guildId] = {};
    data[context.guildId].kayıtSistemiAktif = durum === 'aç';

    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Kayıt Sistemi Ayarlandı')
        .setDescription(`Kayıt sistemi ${durum === 'aç' ? 'açıldı' : 'kapatıldı'}.`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}kayıt-ayarla aç/kapat`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}