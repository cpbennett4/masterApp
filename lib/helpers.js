// Helpers for various tasks

// dependencies
const crypto = require('crypto');
const config = require('../config');

// container for all of the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function(string) {
    if (typeof string === 'string' && string.length > 0) {
        return crypto.createHmac('sha256', config.hashingSecret)
                .update(string)
                .digest('hex');
    }
    return false;
}

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = function(string) {
    try {
        if(string && typeof string === 'string') {
            return JSON.parse(string);
        }
        return {};
    } catch(error) {
        console.error(error);
        return {};
    }
}

// Create string of random alpha-numberic characters of a given length
helpers.createRandomString = function(stringLength) {
    const checkedStringLength = typeof stringLength === 'number' && stringLength > 0 ? stringLength : false;
    if(checkedStringLength) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let string = '';
        for(let i = 0; i < stringLength; i++) {
            // get random character from possible characters string;
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // append this character to work in progress string
            string += randomCharacter;
        }
        return string;
    }
    return false;
};

// Export the module
module.exports = helpers;
