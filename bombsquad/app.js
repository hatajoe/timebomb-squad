
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http');

http.globalAgent.maxSockets = 1024;

var app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , path = require('path');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var port = process.env.PORT || 3000;
server.listen(port);
console.log('Server running port at ' + port);

io.sockets.on('connection', function(client) {
    console.log('connection');

	client.on('message', function(msg) {

		client.broadcast.emit('message', msg);
	});
});
