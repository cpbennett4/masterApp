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
        return JSON.parse(string);
    } catch {
        return {};
    }
}

// Export the module
module.exports = helpers;
