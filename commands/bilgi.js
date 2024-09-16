const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bilgi')
        .setDescription('Bir kullanıcının kayıt bilgilerini gösterir.')
        .addUserOption(option => option.setName('kullanıcı').setDescription('Bilgileri gösterilecek kullanıcı').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        await bilgiGöster(interaction, user);
    },
    async executeMessage(message, args) {
        if (args.length < 1) {
            return sendErrorEmbed(message, 'Bir kullanıcı belirtmelisiniz.');
        }
        const user = message.mentions.users.first() || message.client.users.cache.get(args[0]);
        if (!user) {
            return sendErrorEmbed(message, 'Geçerli bir kullanıcı belirtmelisiniz.');
        }
        await bilgiGöster(message, user);
    }
};

async function bilgiGöster(context, user) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};

    if (!guildData.kayıtlar) {
        return sendErrorEmbed(context, 'Bu sunucuda hiç kayıt yapılmamış.');
    }

    const kayıt = guildData.kayıtlar.find(k => k.userId === user.id);

    if (!kayıt) {
        return sendErrorEmbed(context, 'Bu kullanıcı için kayıt bilgisi bulunamadı.');
    }

    const kayıtEden = await context.client.users.fetch(kayıt.registeredBy);
    const kayıtTarihi = new Date(kayıt.date).toLocaleString('tr-TR');

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Kullanıcı Bilgileri')
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            { name: 'İsim', value: kayıt.name, inline: true },
            { name: 'Yaş', value: kayıt.age.toString(), inline: true },
            { name: 'Cinsiyet', value: kayıt.gender || 'Belirtilmemiş', inline: true },
            { name: 'Kayıt Eden', value: kayıtEden.tag, inline: true },
            { name: 'Kayıt Tarihi', value: kayıtTarihi, inline: true }
        )
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}bilgi @kullanıcı`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}