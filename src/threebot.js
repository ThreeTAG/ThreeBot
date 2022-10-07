require('dotenv').config();

// Require the necessary discord.js classes
const {Client, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const {XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const parser = new XMLParser();
const https = require("https");

// Create a new client instance
const client = new Client({intents: [GatewayIntentBits.Guilds]});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

// Command Listener
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const {commandName} = interaction;

    if (commandName === 'palladium') {
        await getData('forge', (version, forgeLink) => {
            getData('fabric', (version_, fabricLink) => {
                interaction.reply('**Recent Version:** ' + version + '\n**Forge:** <' + forgeLink + '>\n**Fabric:** <' + fabricLink + '>')
            });
        });
    }
});

// Login to Discord with your client's token
client.login(DISCORD_TOKEN);

function getData(type, callback) {
    https.get('https://repo.repsy.io/mvn/lucraft/threetag/net/threetag/Palladium-' + type + '/maven-metadata.xml', response => {
        let body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            let jObj = parser.parse(body);
            callback(jObj.metadata.versioning.latest, 'https://repo.repsy.io/mvn/lucraft/threetag/net/threetag/Palladium-' + type + '/' + jObj.metadata.versioning.latest + '/Palladium-' + type + '-' + jObj.metadata.versioning.latest + '-' + type + '.jar');
        });
    });
}