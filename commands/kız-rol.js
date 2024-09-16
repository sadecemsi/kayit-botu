const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kız-rol')
        .setDescription('Kız üye rolünü ayarlar.')
        .addRoleOption(option => option.setName('rol').setDescription('Kız üye rolü').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const rol = interaction.options.getRole('rol');
        await kızRolAyarla(interaction, rol);
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return sendErrorEmbed(message, 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
        }
        const rol = message.mentions.roles.first();
        if (!rol) {
            return sendErrorEmbed(message, 'Lütfen bir rol etiketleyin.');
        }
        await kızRolAyarla(message, rol);
    }
};

async function kızRolAyarla(context, rol) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    if (!data[context.guildId]) data[context.guildId] = {};
    data[context.guildId].kızRolü = rol.id;

    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Kız Rolü Ayarlandı')
        .setDescription(`Kız üye rolü ${rol} olarak ayarlandı.`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}kız-rol @rol`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}