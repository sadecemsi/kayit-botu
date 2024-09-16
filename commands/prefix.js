const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Sunucu için özel prefix ayarlar.')
        .addStringOption(option => option.setName('yeni-prefix').setDescription('Yeni prefix').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const newPrefix = interaction.options.getString('yeni-prefix');
        await prefixAyarla(interaction, newPrefix);
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return sendErrorEmbed(message, 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
        }
        if (args.length < 1) {
            return sendErrorEmbed(message, 'Yeni bir prefix belirtin!');
        }
        const newPrefix = args[0];
        await prefixAyarla(message, newPrefix);
    }
};

async function prefixAyarla(context, newPrefix) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    if (!data[context.guildId]) data[context.guildId] = {};
    data[context.guildId].prefix = newPrefix;

    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    context.client.prefixes.set(context.guildId, newPrefix);

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Prefix Ayarlandı')
        .setDescription(`Sunucu prefixi "${newPrefix}" olarak ayarlandı.`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const currentPrefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${currentPrefix}prefix yeni-prefix`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}