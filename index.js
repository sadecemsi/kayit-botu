const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
client.prefixes = new Collection();


const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Komut yüklendi: ${command.data.name}`);
    } else {
        console.log(`[UYARI] ${filePath} komut dosyasında gerekli özellikler eksik.`);
    }
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`Event yüklendi: ${event.name}`);
}


client.once('ready', () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    
    const data = JSON.parse(fs.readFileSync('./kayıt.json', 'utf8'));
    for (const guildId in data) {
        if (data[guildId].prefix) {
            client.prefixes.set(guildId, data[guildId].prefix);
        }
    }
    console.log('Prefixler yüklendi.');
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`${interaction.commandName} komutu bulunamadı.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Bu komutu çalıştırırken bir hata oluştu!', ephemeral: true });
    }
});


client.on('messageCreate', async message => {
    if (message.author.bot) return;

    let prefix = client.prefixes.get(message.guildId) || '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command || !command.executeMessage) return;

    try {
        await command.executeMessage(message, args);
    } catch (error) {
        console.error(error);
        await message.reply('Bu komutu çalıştırırken bir hata oluştu!');
    }
});

client.login(token);