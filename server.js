const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);
require('./socket.js')(io);

const port = process.env.MINDGAME_PORT || 3010;

server.listen(port);