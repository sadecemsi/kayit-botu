const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıtsız-rol')
        .setDescription('Kayıtsız üye rolünü ayarlar.')
        .addRoleOption(option => option.setName('rol').setDescription('Kayıtsız üye rolü').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const rol = interaction.options.getRole('rol');
        await kayıtsızRolAyarla(interaction, rol);
    },
    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return sendErrorEmbed(message, 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
        }
        const rol = message.mentions.roles.first();
        if (!rol) {
            return sendErrorEmbed(message, 'Lütfen bir rol etiketleyin.');
        }
        await kayıtsızRolAyarla(message, rol);
    }
};

async function kayıtsızRolAyarla(context, rol) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    if (!data[context.guildId]) data[context.guildId] = {};
    data[context.guildId].kayıtsızRolü = rol.id;

    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Kayıtsız Rolü Ayarlandı')
        .setDescription(`Kayıtsız üye rolü ${rol} olarak ayarlandı.`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(errorMessage)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}