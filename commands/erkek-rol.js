const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('erkek-rol')
        .setDescription('Erkek üye rolünü ayarlar.')
        .addRoleOption(option => option.setName('rol').setDescription('Erkek üye rolü').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const rol = interaction.options.getRole('rol');
        await erkekRolAyarla(interaction, rol);
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return sendErrorEmbed(message, 'Bu komutu kullanmak için Rolleri Yönet yetkisine sahip olmalısınız.');
        }
        const rol = message.mentions.roles.first();
        if (!rol) {
            return sendErrorEmbed(message, 'Lütfen bir rol etiketleyin.');
        }
        await erkekRolAyarla(message, rol);
    }
};

async function erkekRolAyarla(context, rol) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    if (!data[context.guildId]) data[context.guildId] = {};
    data[context.guildId].erkekRolü = rol.id;

    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Erkek Rolü Ayarlandı')
        .setDescription(`Erkek üye rolü ${rol} olarak ayarlandı.`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}erkek-rol @rol`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}