

let connections = {};

exports.onConnect = function(socket) {
  const logger = global.logger;
  logger.info('onConnect socket.id='+socket.id);
  connections[socket.id] = null;
  socket.on('ClientId', (msg, fn) => {
    logger.info('ClientId socket.id='+socket.id+', message was: '+msg);
    try {
      let o = JSON.parse(msg);
      let clientId = parseInt(o.clientId);
      if (isNaN(clientId)) {
        fn(JSON.stringify({ success: false, error: 'invalid clientId' }));
      } else {
        connections[socket.id] = clientId;
        fn(JSON.stringify({ success: true }));
      }
    } catch(e) {
      fn(JSON.stringify({ success: false, error: 'server exception, perhaps unparseable  JSON' }));
    }
  });
}

exports.onDisconnect = function(socket) {
  const logger = global.logger;
  logger.info('onDisconnect socket.id='+socket.id);
  delete connections[socket.id];
}
