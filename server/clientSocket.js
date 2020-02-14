

const regex_email= /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

let connectionsByEmail = {};
let connectionsBySocket = {};

/*
to get the socket from id
let namespace = null;
    let ns = _io.of(namespace || "/");
    let socket = ns.connected[socketId]
*/

exports.onConnect = function(socket) {
  const logger = global.logger;
  logger.info('onConnect socket.id='+socket.id);
  // change to ClientStartup, also pass in client lastSync
  // if client lastSync greater than server, client needs to send a sync
  // If client lastSync less than table value, generate ServerInitiatedSync
  socket.on('ClientId', (msg, fn) => {
    logger.info('ClientId socket.id='+socket.id+', message was: '+msg);
    try {
      logger.info('1');
      let o = JSON.parse(msg);
      logger.info('b');
      let { email, clientId, lastSync } = o;
      logger.info('c');
      let clientIdInt = parseInt(clientId);
      logger.info('d');
      if (typeof email !=='string' || !regex_email.test(email) || isNaN(clientIdInt) || isNaN(lastSync)) {
        logger.info('e');
        fn(JSON.stringify({ success: false, error: 'invalid email, clientId or lastSync' }));
      } else {
        logger.info('f');
        if (!connectionsByEmail[email]) connectionsByEmail[email] = {};
        logger.info('g');
        connectionsByEmail[email][clientId] = { socketId: socket.id, lastSync };
        logger.info('h');
        logger.info('socket='+socket);
        logger.info('socket.id='+socket.id);
        logger.info('email='+email);
        logger.info('clientId='+clientId);
        connectionsBySocket[socket.id] = { email, clientId };
        logger.info('i');
        logger.info('at end of ClientId  connectionsByEmail='+JSON.stringify(connectionsByEmail));
        logger.info('j');
        logger.info('at end of ClientId  connectionsBySocket='+JSON.stringify(connectionsBySocket));
        logger.info('k');
        fn(JSON.stringify({ success: true }));
        logger.info('l');
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
        let minLastSyncConnected = Number.MAX_SAFE_INTEGER;
        for (const client in connectionsByEmail[email]) {
          if (client.lastSync < minLastSyncConnected) minLastSyncConnected = client.lastSync;
        }
        let thisSyncTimestamp = Date.now();
        let HistoryPromise = syncHistory(connectionsByEmail[email], minLastSyncConnected, thisSyncTimestamp, clientInitiatedSyncData);
        Promise.all([HistoryPromise]).then(values => {
          // missing logic
          // where does the client table get updated 
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
  logger.info('at start of onDisconnect  connectionsByEmail='+JSON.stringify(connectionsByEmail));
  logger.info('at end of onDisconnect  connectionsBySocket='+JSON.stringify(connectionsBySocket));
  let o = connectionsBySocket[socket.id];
  logger.info('at start of onDisconnect  o='+JSON.stringify(o));
  if (o && o.email && o.clientId && connectionsByEmail[o.email] && connectionsByEmail[o.email][o.clientId]) {
    logger.info('onDisconnect connectionsByEmail[o.email][o.clientId]='+connectionsByEmail[o.email][o.clientId]);
    delete connectionsByEmail[o.email][o.clientId];
    if (Object.keys(connectionsByEmail[o.email]).length === 0) {
      delete connectionsByEmail[o.email];
    }
  }
  delete connectionsBySocket[socket.id];
  logger.info('at end of onDisconnect  connectionsByEmail='+JSON.stringify(connectionsByEmail));
  logger.info('at end of onDisconnect  connectionsBySocket='+JSON.stringify(connectionsBySocket));
}

/**
history table delete: delete from table where created in (?), array
additions: INSERT INTO tbl_name (a,b,c) VALUES ?, array of arrays, where inner are phrases
return history since minLastSyncConnected
connectedClients[{clientId, lastSync}],
  @param connectedClients {object} associative array of all currently connected clients
      for the given email, whichere each entry is clientId:{socketId, clientId}
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
