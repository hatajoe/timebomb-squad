var http     = require('http')
  , socketio = require('socket.io')
  , config   = require('./config');

module.exports = (function () {

  var observed = false;

  return {
    observe: function (app) {

      if (observed === true) {
        return;
      }
      if (app === undefined) {
        throw new Error('requires app');
      }

      var front = http.createServer(app);
      front.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
      });
      var ioFront = socketio.listen(front, {
        'log level': config.logLevel
      });
      ioFront.sockets.on('connection', function(client) {
        client.on('disconnect', function(){
        });
      });

      var back = http.createServer(app);
      back.listen(1983, function () {
        console.log('Express server listening on port 1983');
      });
      var ioBack = socketio.listen(back, {
        'log level': config.logLevel
      });
      ioBack.sockets.on('connection', function(client) {
        client.on('message', function(data) {
          ioFront.sockets.emit('message', {
            message: data
          });
        });
        client.on('disconnect', function(){
        });
      });

      observed = true;
    }
  };

}());

