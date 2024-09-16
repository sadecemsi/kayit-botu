const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Tüm komutları listeler.'),
    async execute(interaction) {
        await sendHelpEmbed(interaction);
    },
    async executeMessage(message, args) {
        await sendHelpEmbed(message);
    }
};

async function sendHelpEmbed(context) {
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    const guildData = data[context.guildId] || {};
    const prefix = guildData.prefix || '!';
    
    const commands = [
        { name: 'kayıt', description: 'Bir kullanıcıyı kayıt eder.' },
        { name: 'bilgi', description: 'Bir kullanıcının kayıt bilgilerini gösterir.' },
        { name: 'top-kayıt', description: 'En çok kayıt yapan yetkilileri listeler.' },
        { name: 'kayıt-ayarla', description: 'Kayıt sistemini açar veya kapatır.' },
        { name: 'kayıt-log', description: 'Kayıt log kanalını ayarlar.' },
        { name: 'kayıt-yetkili', description: 'Kayıt yetkilisi rolünü ayarlar.' },
        { name: 'kayıt-rol', description: 'Kayıtlı üyelere verilecek rolü ayarlar.' },
        { name: 'kayıtsız-rol', description: 'Kayıtsız üyelere verilecek rolü ayarlar.' },
        { name: 'kayıt-istatistik', description: 'Sunucunun genel kayıt istatistiklerini gösterir.' },
        { name: 'kayıt-say', description: 'Sunucudaki kayıtlı ve kayıtsız üye sayısını gösterir.' },
        { name: 'isim-değiştir', description: 'Bir kullanıcının ismini değiştirir.' },
        { name: 'prefix', description: 'Sunucu için özel prefix ayarlar.' },
        { name: 'otorol', description: 'Otorol sistemini açar veya kapatır.' },
        { name: 'kayıt-kanal', description: 'Yeni üyelerin karşılanacağı kayıt kanalını ayarlar.' },
        { name: 'erkek-rol', description: 'Erkek üye rolünü ayarlar.' },
        { name: 'kız-rol', description: 'Kız üye rolünü ayarlar.' },
        { name: 'kayıtsız', description: 'Bir kullanıcıyı kayıtsıza atar.' },
    ];

    const pages = [];
    for (let i = 0; i < commands.length; i += 10) {
        const pageCommands = commands.slice(i, i + 10);
        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('Kayıt Sistemi Komutları')
            .setDescription('Aşağıdaki komutları kullanarak kayıt sistemini yönetebilirsiniz:')
            .addFields(
                pageCommands.map(cmd => ({
                    name: `${prefix}${cmd.name}`,
                    value: cmd.description,
                    inline: false
                }))
            )
            .setTimestamp()
            .setFooter({ text: `Sayfa ${pages.length + 1}/${Math.ceil(commands.length / 10)}` });
        pages.push(embed);
    }

    let currentPage = 0;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Önceki')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Sonraki')
                .setStyle(ButtonStyle.Secondary)
        );

    const initialMessage = await context.reply({ embeds: [pages[currentPage]], components: [row], ephemeral: true });

    const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === (context.user ? context.user.id : context.author.id);
    const collector = initialMessage.createMessageComponentCollector({ filter, time: 300000 });

    collector.on('collect', async i => {
        if (i.customId === 'previous') {
            currentPage = currentPage > 0 ? --currentPage : pages.length - 1;
        } else if (i.customId === 'next') {
            currentPage = currentPage + 1 < pages.length ? ++currentPage : 0;
        }
        
        await i.update({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on('end', async () => {
        const timeoutEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Süre Doldu')
            .setDescription('Yardım menüsünün kullanım süresi doldu. Lütfen komutu tekrar kullanın.')
            .setTimestamp();

        await initialMessage.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
    });
}
