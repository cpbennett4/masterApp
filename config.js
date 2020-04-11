// Create and export configuration variables

// Container for all of the environments
var environments = {};

// Staging (default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort:3001,
    envName: 'staging',
    hashingSecret: 'this is a staging secret'
};

// Production environment
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'this is a production a secret'
};

// Determine which enviornment was passed in as a command line argument
const currentEnvironment = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment exists, otherwise default to staging
const environmentToExport = environments[currentEnvironment] ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
