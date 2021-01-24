const curseforge = require("mc-curseforge-api");
const https = require("https");
const querystring = require("querystring");
const base_url = "https://addons-ecs.forgesvc.net/api/v2/addon/";

/**
 * @function getChangelog
 *
 * @description Get changelog from mod file
 * @param {Mod} mod - The mod
 * @param {ModFile} modFile - The mod file to get the changelog from
 * @returns {Promise.<string, Error>} A promise containing the changelog returned by the Curse API on successful 200 response.
 */
module.exports.getChangelog = function (mod, modFile) {
    return innerGet(base_url + mod.id + '/file/' + modFile.id + '/changelog', {}, function (obj) {
        return obj;
    });
}


function basic_conversion_function(object) {
    return object;
}

function innerGet(
    url,
    options = {},
    conversionFunction = basic_conversion_function,
    PARSE = false
) {
    return new Promise((resolve, reject) => {
        if (Object.keys(options).length)
            url += "&" + querystring.stringify(options);
        https.get(url, function (response) {
            if (response && response.statusCode === 200) {
                let data = "";
                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {
                    if (PARSE) resolve(conversionFunction(JSON.parse(data)));
                    else resolve(conversionFunction(data));
                });
            } else {
                reject(response.statusCode);
            }
        });
    });
}