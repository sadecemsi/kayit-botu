const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
        const guildData = data[member.guild.id] || {};

        if (guildData.kayıtKanalı) {
            const kayıtKanal = member.guild.channels.cache.get(guildData.kayıtKanalı);
            if (kayıtKanal) {
                const embed = new EmbedBuilder()
                    .setColor('#000000')
                    .setTitle(`Yeni Bir Kullanıcı Katıldı, 👋 ${member.user.username}!`)
                    .setDescription(`🎉 Sunucumuza hoş geldin ${member}`)
                    .addFields(
                        { name: '🧑‍🤝‍🧑 Seninle birlikte', value: `${member.guild.memberCount} kişiyiz.`, inline: true },
                        { name: '📅 Hesap oluşturulma tarihi', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                        { name: '🛡️ Güvenilirlik durumu', value: '✅ Güvenilir!', inline: true }
                    )
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }))
                    .setTimestamp();

                await kayıtKanal.send({ embeds: [embed] });
            }
        }

        
        if (guildData.otorolAktif && guildData.kayıtsızRolü) {
            const kayıtsızRol = member.guild.roles.cache.get(guildData.kayıtsızRolü);
            if (kayıtsızRol) {
                await member.roles.add(kayıtsızRol);
            }
        }
    },
};
