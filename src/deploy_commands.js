const {REST, SlashCommandBuilder, Routes} = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder().setName('palladium').setDescription('Gets download link for most recent Palladium dev-build'),
].map(command => command.toJSON());

const rest = new REST({version: '10'}).setToken(process.env.DISCORD_BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), {body: commands})
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);