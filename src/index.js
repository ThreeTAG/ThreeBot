const discord = require('discord.js');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

var client = new discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}`);
});

client.login(config.token);