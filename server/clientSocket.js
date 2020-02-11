

let connections = {};

exports.onConnect = function(socket) {
  const logger = global.logger;
  logger.info('onConnect socket.id='+socket.id);
  connections[socket.id] = null;
  // change to ClientStartup, also pass in client lastSync
  // if client lastSync greater than server, client needs to send a sync
  // If client lastSync less than table value, generate ServerInitiatedSync 
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
  socket.on('ClientInitiatedSync', (msg, fn) => {
    logger.info('ClientInitiatedSync socket.id='+socket.id+', message was: '+msg);
    try {
      let clientInitiatedSyncData = JSON.parse(msg);
      //  missing logic
      let HistoryPromise = syncHistory = (connectedClients, minLastSyncConnected, thisSyncTimestamp, clientInitiatedSyncData);
      Promise.all([HistoryPromise]).then(values => {
        // missing logic
        fn(JSON.stringify({ success: true }));
        // for each connected client, push data, and
        // acknowledge function updates lastSync for that client,
        // and sends update message with new last sync
      }, () => {
        logger.error('ClientInitiatedSync Promise.all rejected');
        fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync server error' }));
      }).catch(e => {
        logger.error('ClientInitiatedSync Promise.all. e='+JSON.stringify(e));
        fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync server exception' }));
      });
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

/**
history table delete: delete from table where created in (?), array
additions: INSERT INTO tbl_name (a,b,c) VALUES ?, array of arrays, where inner are phrases
return history since minLastSyncConnected
*/
let syncHistory = (connectedClients[{clientId, lastSync}], minLastSyncConnected, thisSyncTimestamp, clientInitiatedSyncData) => {
  return new Promise((resolve, reject) => {
    resolve();
  });
  // get all records where timestamp >= minLastSyncConnected
  // Make list of records to delete from table and to add to table
  // for each connectedClient, make list of deletions and additions since lastSync
  // delete and add records from and to table
  // return array of serverInitiatedSyncData, which is [{clientId, updates}] Where updates should have same data










}
