// Dependencies

const http = require('http');
const url = require('url');
const querystring = require('querystring');

// The server should respond to all requests with a string

// Start the server, have it listen on port 3000

const server = http.createServer(function(req, res) {
  // get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // get querystring as an object
  const queryStringObject = parsedUrl.query;

  // get the HTTP method
  const method = req.method.toLowerCase();

  // send the response
  res.end('Hello World again\n');

  // log the request path
  console.log(`Request received:\npath: ${trimmedPath}\nmethod: ${method}\nquery: ${JSON.stringify(queryStringObject)}`);

});

server.listen(3000, function() {
  console.log('the server is listening on port 3000 now');
});