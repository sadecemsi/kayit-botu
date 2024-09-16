const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıtsız')
        .setDescription('Bir kullanıcıyı kayıtsıza atar.')
        .addUserOption(option => option.setName('kullanıcı').setDescription('Kayıtsıza atılacak kullanıcı').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        await kayıtsızaAt(interaction, user);
    },
    async executeMessage(message, args) {
        if (args.length < 1) {
            return sendErrorEmbed(message, 'Bir kullanıcı belirtmelisiniz.');
        }
        const user = message.mentions.users.first() || message.client.users.cache.get(args[0]);
        if (!user) {
            return sendErrorEmbed(message, 'Geçerli bir kullanıcı belirtmelisiniz.');
        }
        await kayıtsızaAt(message, user);
    }
};

async function kayıtsızaAt(context, user) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};

    if (!guildData.kayıtYetkiliRolü && !context.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return sendErrorEmbed(context, 'Bu komutu kullanmak için kayıt yetkilisi olmalısınız veya Rolleri Yönet yetkisine sahip olmalısınız.');
    }

    if (guildData.kayıtYetkiliRolü && !context.member.roles.cache.has(guildData.kayıtYetkiliRolü) && !context.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return sendErrorEmbed(context, 'Bu komutu kullanmak için kayıt yetkilisi olmalısınız.');
    }

    if (!guildData.kayıtsızRolü) {
        return sendErrorEmbed(context, 'Kayıtsız rolü ayarlanmamış.');
    }

    const member = await context.guild.members.fetch(user.id);
    const kayıtsızRol = context.guild.roles.cache.get(guildData.kayıtsızRolü);

    if (!kayıtsızRol) {
        return sendErrorEmbed(context, 'Kayıtsız rolü bulunamadı.');
    }

    try {
        await member.roles.set([kayıtsızRol.id]);
        await member.setNickname(null);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Kullanıcı Kayıtsıza Atıldı')
            .setDescription(`${user} kullanıcısı başarıyla kayıtsıza atıldı.`)
            .setTimestamp();

        await context.reply({ embeds: [embed], ephemeral: true });

        
        if (guildData.kayıtlar) {
            guildData.kayıtlar = guildData.kayıtlar.filter(k => k.userId !== user.id);
            data[context.guildId] = guildData;
            fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error(error);
        return sendErrorEmbed(context, 'Kullanıcı kayıtsıza atılırken bir hata oluştu.');
    }
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}kayıtsız @kullanıcı`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}