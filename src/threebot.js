require('dotenv').config();

// Require the necessary discord.js classes
const {Client, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEV_CHANNEL_ID = process.env.DEV_CHANNEL_ID;
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

    if(interaction.channelId === DEV_CHANNEL_ID) {
        if (commandName === 'palladium') {
            await getData('forge', 'Palladium', (version, forgeLink) => {
                getData('fabric', 'Palladium', (version_, fabricLink) => {
                    interaction.reply('**Recent Version:** ' + version + '\n**Forge:** <' + forgeLink + '>\n**Fabric:** <' + fabricLink + '>')
                });
            });
        }

        if (commandName === 'pantheonsent') {
            await getData('forge', 'PantheonSent', (version, forgeLink) => {
                getData('fabric', 'PantheonSent', (version_, fabricLink) => {
                    interaction.reply('**Recent Version:** ' + version + '\n**Forge:** <' + forgeLink + '>\n**Fabric:** <' + fabricLink + '>')
                });
            });
        }
    }
});

// Login to Discord with your client's token
client.login(DISCORD_TOKEN);

function getData(type, modId, callback) {
    https.get('https://repo.repsy.io/mvn/lucraft/threetag/net/threetag/' + modId + '-' + type + '/maven-metadata.xml', response => {
        let body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            let jObj = parser.parse(body);
            callback(jObj.metadata.versioning.latest, 'https://repo.repsy.io/mvn/lucraft/threetag/net/threetag/' + modId + '-' + type + '/' + jObj.metadata.versioning.latest + '/' + modId + '-' + type + '-' + jObj.metadata.versioning.latest + '-' + type + '.jar');
        });
    });
}