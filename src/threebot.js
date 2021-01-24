require('dotenv').config();

const {Client, MessageEmbed} = require('discord.js');
const curseforge = require("mc-curseforge-api");
const fs = require("fs");
const changelogGetter = require('./changelogGetter.js');
const mods = require('./mods.js');
const TurndownService = require('turndown')
const turndownService = new TurndownService()

let cache = {};
let cacheChanged = false;

const client = new Client();
client.login(process.env.DISCORD_BOT_TOKEN);

client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
    const interval = parseInt(process.env.UPDATE_INTERVAL);

    loadCache(() => {
        // Mod Update Broadcasts
        setInterval(() => {
            mods.mods.forEach((modConfig) => {
                broadcastModUpdate(modConfig);
            });
        }, interval);

        setTimeout(() => {
            setInterval(() => {
                saveCache();
            }, interval);
        }, interval / 2);
    });
});

/**
 *
 * @param {Mod} mod
 * @return ModFile
 */
function getLatestFile(mod) {
    let latestFile = null;

    for (let i = 0; i < mod.latestFiles.length; i++) {
        if (!latestFile || latestFile.timestamp < mod.latestFiles[i].timestamp) {
            latestFile = mod.latestFiles[i];
        }
    }

    return latestFile;
}

function saveCache() {
    if (cacheChanged) {
        cacheChanged = false;
        fs.writeFile('modCache.json', JSON.stringify(cache), (err => {
            if (err) {
                console.log(err);
                cacheChanged = true;
            } else {
                console.log('Cache saved!');
            }
        }));
    }
}

function loadCache(callback) {
    fs.exists('modCache.json', (exists => {
        if (exists) {
            fs.readFile('modCache.json', ((err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    cache = JSON.parse(data);
                    callback();
                }
            }));
        } else {
            cache = {};
            callback();
        }
    }));
}

/**
 * @param {Object} modConfig
 */
function broadcastModUpdate(modConfig) {
    curseforge.getMod(modConfig.id).then((mod) => {
        let authors = '';
        for (let i = 0; i < mod.authors.length; i++) {
            authors += mod.authors[i].name + (i < mod.authors.length - 1 ? ', ' : '');
        }
        client.channels.fetch(process.env.UPDATE_CHANNEL_ID).then(channel => {
            if (channel.isText()) {
                const file = getLatestFile(mod);
                if (file.id !== cache[modConfig.name]) {
                    changelogGetter.getChangelog(mod, file).then((changelog) => {
                        let version = '';
                        for (let i = 0; i < file.minecraft_versions.length; i++) {
                            version += file.minecraft_versions[i] + (i < file.minecraft_versions.length - 1 ? ', ' : '');
                        }
                        const embed = new MessageEmbed()
                            .setTitle(mod.name + ' Update!')
                            .setDescription(turndownService.turndown(changelog))
                            .setURL(mod.url + "/files/" + file.id)
                            .setAuthor(authors)
                            .setThumbnail(modConfig.thumbnail)
                            .setColor(modConfig.color)
                            .addField('Game Version', version);
                        channel.send(embed);
                        cache[modConfig.name] = file.id;
                        cacheChanged = true;
                        console.log('Broadcasted mod update for ' + modConfig.name);
                    }).catch(console.error);
                }
            }
        }).catch(console.error);
    }).catch(console.error);
}