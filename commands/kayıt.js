const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kayıt')
        .setDescription('Bir kullanıcıyı kayıt eder.')
        .addUserOption(option => option.setName('kullanıcı').setDescription('Kayıt edilecek kullanıcı').setRequired(true))
        .addStringOption(option => option.setName('isim').setDescription('Kullanıcının ismi').setRequired(true))
        .addIntegerOption(option => option.setName('yaş').setDescription('Kullanıcının yaşı').setRequired(true))
        .addStringOption(option => 
            option.setName('cinsiyet')
            .setDescription('Kullanıcının cinsiyeti')
            .addChoices(
                { name: 'Erkek', value: 'erkek' },
                { name: 'Kız', value: 'kız' }
            )
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const name = interaction.options.getString('isim');
        const age = interaction.options.getInteger('yaş');
        const gender = interaction.options.getString('cinsiyet');
        await kayıtİşlemi(interaction, user, name, age, gender);
    },
    async executeMessage(message, args) {
        if (args.length < 3) {
            return sendErrorEmbed(message, 'Eksik bilgi! Kullanım: !kayıt @kullanıcı isim yaş [cinsiyet]');
        }
        const user = message.mentions.users.first();
        const name = args[1];
        const age = parseInt(args[2]);
        const gender = args[3]?.toLowerCase();
        if (!user || isNaN(age)) {
            return sendErrorEmbed(message, 'Geçersiz kullanıcı veya yaş!');
        }
        await kayıtİşlemi(message, user, name, age, gender);
    }
};

async function kayıtİşlemi(context, user, name, age, gender) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};

    if (!guildData.kayıtYetkiliRolü && !context.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return sendErrorEmbed(context, 'Bu komutu kullanmak için kayıt yetkilisi olmalısınız veya Rolleri Yönet yetkisine sahip olmalısınız.');
    }

    if (guildData.kayıtYetkiliRolü && !context.member.roles.cache.has(guildData.kayıtYetkiliRolü) && !context.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return sendErrorEmbed(context, 'Bu komutu kullanmak için kayıt yetkilisi olmalısınız.');
    }

    const member = await context.guild.members.fetch(user.id);

    
    if (guildData.kayıtlıRolü) {
        const kayıtlıRol = context.guild.roles.cache.get(guildData.kayıtlıRolü);
        if (kayıtlıRol) {
            await member.roles.add(kayıtlıRol);
        }
    }

    
    if (gender) {
        const genderRoleId = gender === 'erkek' ? guildData.erkekRolü : guildData.kızRolü;
        if (genderRoleId) {
            const genderRole = context.guild.roles.cache.get(genderRoleId);
            if (genderRole) {
                await member.roles.add(genderRole);
            }
        }
    }

    
    if (guildData.kayıtsızRolü) {
        const kayıtsızRol = context.guild.roles.cache.get(guildData.kayıtsızRolü);
        if (kayıtsızRol) {
            await member.roles.remove(kayıtsızRol);
        }
    }

    await member.setNickname(`${name} | ${age}`);

    if (!guildData.kayıtlar) guildData.kayıtlar = [];
    guildData.kayıtlar.push({
        userId: user.id,
        name: name,
        age: age,
        gender: gender,
        registeredBy: context.user ? context.user.id : context.author.id,
        date: new Date().toISOString()
    });

    data[context.guildId] = guildData;
    fs.writeFileSync('./kayıt.json', JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Kayıt Başarılı')
        .setDescription(`${user} başarıyla kayıt edildi!`)
        .addFields(
            { name: 'İsim', value: name, inline: true },
            { name: 'Yaş', value: age.toString(), inline: true },
            { name: 'Cinsiyet', value: gender ? (gender === 'erkek' ? 'Erkek' : 'Kız') : 'Belirtilmedi', inline: true }
        )
        .setTimestamp();

    await context.reply({ embeds: [embed], ephemeral: true });
}

function sendErrorEmbed(context, errorMessage) {
    const prefix = context.client.prefixes.get(context.guildId) || '!';
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('HATA')
        .setDescription(`${errorMessage}\n\nKullanım: ${prefix}kayıt @kullanıcı İsim Yaş [Cinsiyet]`)
        .setTimestamp();

    return context.reply({ embeds: [errorEmbed], ephemeral: true });
}