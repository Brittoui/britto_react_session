const http = require('http');
const app = require('../src/main/app');

const port = 8080;
var server = http.createServer(app);
server.listen(port);