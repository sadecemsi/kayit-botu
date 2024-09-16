const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt-yetkili')
        .setDescription('Kayıt yetkilisi rolünü ayarlar.')
        .addRoleOption(option => option.setName('rol').setDescription('Kayıt yetkilisi rolü').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const rol = interaction.options.getRole('rol');
        await kayıtYetkiliAyarla(interaction, rol);
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return sendErrorEmbed(message, 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
        }
        const rol = message.mentions.roles.first();
        if (!rol) {
            return sendErrorEmbed(message, 'Lütfen bir rol etiketleyin.');
        }
        await kayıtYetkiliAyarla(message, rol);
    }
};

async function kayıtYetkiliAyarla(context, rol) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    if (!data[context.guildId]) data[context.guildId] = {};
    data[context.guildId].kayıtYetkiliRolü = rol.id;

    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Kayıt Yetkilisi Rolü Ayarlandı')
        .setDescription(`Kayıt yetkilisi rolü ${rol} olarak ayarlandı.`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}kayıt-yetkili @rol`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}