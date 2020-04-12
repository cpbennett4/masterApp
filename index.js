// Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


// The server should respond to all requests with a string

// Instantiate the HTTP server
const httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function() {
    console.log(`the http server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPs server
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// Start the HTTP server
httpsServer.listen(config.httpsPort, function() {
    console.log(`the https server is listening on port ${config.httpsPort}`);
});

// All the sever logic for both the http and https server
const unifiedServer = function(req, res) {
    // get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    // get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get querystring as an object
    const queryStringObject = parsedUrl.query;

    // get the HTTP method
    const method = req.method.toLowerCase();

    // get the headers as an object
    const headers = req.headers;

    // get the payload, if there is any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        // chooose the handler that this request should go to
        const chosenHandler = router[trimmedPath] ? router[trimmedPath] : handlers.notFound;

        // construct data object to send to handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // route the request to the handler specified in the router
        chosenHandler(data, function(statusCode = 200, payload = {}) {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);

            // send the response
            res.end(JSON.stringify(payload));

            // log the request path
            console.log(`returning this response: ${statusCode} ${JSON.stringify(payload, null, 2)}`);
        });
    });
};

// define a request router
const router ={
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens
};