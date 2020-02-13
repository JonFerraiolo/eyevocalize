

const regex_email= /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

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
      let { email, clientId, lastSync } = o;
      let clientIdInt = parseInt(clientId);
      if (typeof email !=='string' || !regex_email.test(email) || isNaN(clientIdInt) || isNaN(lastSync)) {
        fn(JSON.stringify({ success: false, error: 'invalid email, clientId or lastSync' }));
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
      let { email, clientId, lastSync } = clientInitiatedSyncData;
      let clientIdInt = parseInt(clientId);
      if (typeof email !=='string' || !regex_email.test(email) || isNaN(clientIdInt) || isNaN(lastSync)) {
        fn(JSON.stringify({ success: false, error: 'invalid email, clientId or lastSync' }));
      } else {
        //  missing logic
        let HistoryPromise = syncHistory(connectedClients, minLastSyncConnected, thisSyncTimestamp, clientInitiatedSyncData);
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

/**
history table delete: delete from table where created in (?), array
additions: INSERT INTO tbl_name (a,b,c) VALUES ?, array of arrays, where inner are phrases
return history since minLastSyncConnected
connectedClients[{clientId, lastSync}],
*/
let syncHistory = (connectedClients, minLastSyncConnected, thisSyncTimestamp, clientInitiatedSyncData) => {
  return new Promise((resolve, reject) => {
    resolve();
  });
  // get all records where timestamp >= minLastSyncConnected
  // Make list of records to delete from table and to add to table
  // for each connectedClient, make list of deletions and additions since lastSync
  // delete and add records from and to table
  // return array of serverInitiatedSyncData, which is [{clientId, updates}] Where updates should have same data










}
