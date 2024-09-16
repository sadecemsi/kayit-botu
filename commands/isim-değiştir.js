const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('isim-değiştir')
        .setDescription('Bir kullanıcının ismini değiştirir.')
        .addUserOption(option => option.setName('kullanıcı').setDescription('İsmi değiştirilecek kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('yeni-isim').setDescription('Yeni isim').setRequired(true))
        .addIntegerOption(option => option.setName('yaş').setDescription('Yeni yaş').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const newName = interaction.options.getString('yeni-isim');
        const newAge = interaction.options.getInteger('yaş');
        await isimDeğiştir(interaction, user, newName, newAge);
    },
    async executeMessage(message, args) {
        if (args.length < 3) {
            return sendErrorEmbed(message, 'Eksik bilgi! Kullanım: !isim-değiştir @kullanıcı yeni-isim yaş');
        }
        const user = message.mentions.users.first();
        const newName = args[1];
        const newAge = parseInt(args[2]);
        if (!user || isNaN(newAge)) {
            return sendErrorEmbed(message, 'Geçersiz kullanıcı veya yaş!');
        }
        await isimDeğiştir(message, user, newName, newAge);
    }
};

async function isimDeğiştir(context, user, newName, newAge) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};

    if (!guildData.kayıtYetkiliRolü && !context.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        return sendErrorEmbed(context, 'Bu komutu kullanmak için kayıt yetkilisi olmalısınız veya Kullanıcı Adlarını Yönet yetkisine sahip olmalısınız.');
    }

    if (guildData.kayıtYetkiliRolü && !context.member.roles.cache.has(guildData.kayıtYetkiliRolü) && !context.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
        return sendErrorEmbed(context, 'Bu komutu kullanmak için kayıt yetkilisi olmalısınız.');
    }

    const member = await context.guild.members.fetch(user.id);
    await member.setNickname(`${newName} | ${newAge}`);

    const kayıtIndex = guildData.kayıtlar ? guildData.kayıtlar.findIndex(k => k.userId === user.id) : -1;
    if (kayıtIndex !== -1) {
        guildData.kayıtlar[kayıtIndex].name = newName;
        guildData.kayıtlar[kayıtIndex].age = newAge;
        data[context.guildId] = guildData;
        fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));
    }

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('İsim Değiştirildi')
        .setDescription(`${user.tag} kullanıcısının ismi "${newName} | ${newAge}" olarak değiştirildi.`)
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}isim-değiştir @kullanıcı Yeni İsim Yaş`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}