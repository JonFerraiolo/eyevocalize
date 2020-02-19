
const dbconnection = require('./dbconnection');

const regex_email= /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

let connectionsByEmail = {};
let connectionsBySocket = {};
let socketById = {};

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
        socketById[socket.id] = socket;
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
      let { email, clientId, lastSync, thisSyncClientTimestamp } = clientInitiatedSyncData;
      let clientIdInt = parseInt(clientId);
      if (typeof email !=='string' || !regex_email.test(email) || isNaN(clientIdInt) || isNaN(lastSync)) {
        fn(JSON.stringify({ success: false, error: 'invalid email, clientId or lastSync' }));
      } else {
        updateTopicTables(socket, clientInitiatedSyncData, fn);
      }
    } catch(e) {
      fn(JSON.stringify({ success: false, error: 'server exception, e='+e }));
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
    delete socketById[o.socketId];
  }
  delete connectionsBySocket[socket.id];
  logger.info('at end of onDisconnect  connectionsByEmail='+JSON.stringify(connectionsByEmail));
  logger.info('at end of onDisconnect  connectionsBySocket='+JSON.stringify(connectionsBySocket));
}

let updateTopicTables = (socket, clientInitiatedSyncData, fn) => {
  const logger = global.logger;
  logger.info('updateTopicTables Entered');
  let { email, clientId, lastSync, thisSyncClientTimestamp } = clientInitiatedSyncData;
  let minLastSyncConnected = Number.MAX_SAFE_INTEGER;
  for (const client in connectionsByEmail[email]) {
    if (client.lastSync < minLastSyncConnected) minLastSyncConnected = client.lastSync;
  }
  let thisSyncServerTimestamp = Date.now();
  let HistoryPromise = syncHistory(connectionsByEmail[email], minLastSyncConnected,
    thisSyncClientTimestamp, thisSyncServerTimestamp, clientInitiatedSyncData.updates.History);
  Promise.all([HistoryPromise]).then(values => {
    updateClients(socket, values, fn);
  }, () => {
    logger.error('updateTopicTables Promise.all topic promises rejected');
    fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync topic promises server error' }));
  }).catch(e => {
    logger.error('updateTopicTables Promise.all. topic promises e='+JSON.stringify(e));
    fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync topic promises server exception' }));
  });
};

let updateClients = (socket, values, fn) => {
  const logger = global.logger;
  logger.info('updateClients entered');
  let returnHistory = values[0];
  let clientPromises = [];
  for (let client in connectionsByEmail[email]) {
    let clientPromise = new Promise((clientResolve, clientReject) => {
      let { clientId, socketId } = client;
      let skt = socketById[socketId];
      if (skt) {
        logger.info('updateClients before emit for socketId='+socketId+', clientId='+clientId);
        let serverInitiatedSyncDataJson = JSON.stringify({
          History: returnHistory[clientId] || null,
        });
        logger.info('updateClients before emit serverInitiatedSyncDataJson='+serverInitiatedSyncDataJson);
        skt.emit('ServerInitiatedSync', serverInitiatedSyncDataJson, msg => {
          logger.info('updateClients return from emit, msg='+msg+' for socketId='+socketId+', clientId='+clientId);
          updateClientTableLastSync(email, clientId, thisSyncServerTimestamp).then(() => {
            clientResolve();
          }, () => {
            logger.error('updateClients updateClientTableLastSync rejected');
            clientResolve();
          }).catch(e => {
            logger.error('updateClients updateClientTableLastSync Error e='+JSON.stringify(e));
            clientResolve();
          });
        }, () => {
          logger.error('updateClients Promise.all rejected');
          clientResolve();
        }).catch(e => {
          logger.error('updateClients Promise.all. e='+JSON.stringify(e));
          clientResolve();
        });
      } else {
        logger.error('updateClients no socket for socketId='+socketId+', clientId='+clientId);
        clientResolve();
      }
    });
    clientPromises.push(clientPromise);
  }
  Promise.all(clientPromises).then(values => {
    logger.info('updateClients Promise.all clientPromises resolved');
    fn(JSON.stringify({ success: true }));
  }, () => {
    logger.error('updateClients Promise.all clientPromises rejected');
    fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync server error' }));
  }).catch(e => {
    logger.error('updateClients Promise.all. clientPromises e='+JSON.stringify(e));
    fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync server exception' }));
  });
};

let updateClientTableLastSync = (email, clientId, thisSyncServerTimestamp) => {
  const logger = global.logger;
  logger.info('updateClientTableLastSync entered. email='+email+', clientId='+clientId+', thisSyncServerTimestamp='+thisSyncServerTimestamp);
  return new Promise((resolve, reject) => {
    resolve();
    return;
    dbconnection.dbReady().then(connectionPool => {
      logger.info('updateClientTableLastSync got connection');
      const clientTable = global.clientTable;
      connectionPool.query(`SELECT * FROM ${clientTable} WHERE email = ? and clientId = ?`, [email, clientId], function (error, results, fields) {
        if (error) {
          logger.error("updateClientTableLastSync select client database failure for email '" + email + "'");
          reject();
        } else {
          if (results.length > 1) {
            logger.error("updateClientTableLastSync select client database error for email '" + email + "', multiple entries");
            reject();
          } else if (results.length === 1) {
            logger.info('updateClientTableLastSync before update');
            connectionPool.query(`UPDATE ${clientTable} SET lastSync = ? WHERE email = ? and clientId = ?`, [thisSyncServerTimestamp, email, clientId], function (error, results, fields) {
              if (error) {
                logger.error("Update new client update database failure for email '" + email + "'");
                reject();
              } else {
                logger.info('updateClientTableLastSync update success');
                resolve();
              }
            });
          } else {
            logger.info('updateClientTableLastSync before insert');
            let o = { email, clientId, lastSync: thisSyncServerTimestamp };
            connectionPool.query(`INSERT INTO ${clientTable} SET ?`, o, function (error, results, fields) {
              if (error) {
                logger.error("insert new client update database failure for email '" + email + "'");
                reject();
              } else {
                logger.info('updateClientTableLastSync insert success');
                resolve();
              }
            });
          }
        }
      });
    }, () => {
      logger.error("updateClientTableLastSync: no database connection");
      reject();
    }).catch(e => {
      logger.error("updateClientTableLastSync: promise exception");
      reject();
    });
  });
};

/**
history table delete: delete from table where created in (?), array
additions: INSERT INTO tbl_name (a,b,c) VALUES ?, array of arrays, where inner are phrases
return history since minLastSyncConnected
connectedClients[{clientId, lastSync}],
  @param connectedClients {object} associative array of all currently connected clients
      for the given email, whichere each entry is clientId:{socketId, clientId}
*/
let syncHistory = (connectedClients, minLastSyncConnected, thisSyncClientTimestamp, thisSyncServerTimestamp, clientInitiatedSyncData) => {
  const logger = global.logger;
  logger.info('at start of syncHistory  connectedClients='+JSON.stringify(connectedClients));
  logger.info('at start of syncHistory  minLastSyncConnected='+minLastSyncConnected);
  logger.info('at start of syncHistory  thisSyncServerTimestamp='+thisSyncServerTimestamp);
  logger.info('at start of syncHistory  clientInitiatedSyncData='+JSON.stringify(clientInitiatedSyncData));
  return new Promise((outerResolve, outerReject) => {
    let cid = connectedClients[0].clientId;
    let robj = {} ;
    robj[cid] = { deletions: [], additions: []  };
    outerResolve(robj);
    return;
    dbconnection.dbReady().then(connectionPool => {
      logger.info('syncHistory got connection');
      const historyTable = global.historyTable;
      let mintime = calcMinTime([minLastSyncConnected, thisSyncClientTimestamp, thisSyncServerTimestamp]);
      connectionPool.query(`SELECT * FROM ${historyTable} WHERE email = ? and timestamp > ?`, [email, mintime], function (error, results, fields) {
        if (error) {
          logger.error("syncHistory select history database failure for email '" + email + "'");
          reject();
        } else {
          logger.info('syncHistory after select, results='+JSON.stringify(results));
          let currentRows = results;
          let { deletions, additions } = clientInitiatedSyncData;
          logger.info('syncHistory after select, deletions='+JSON.stringify(deletions));
          logger.info('syncHistory after select, additions='+JSON.stringify(additions));
          let currentRowsObj = {};
          currentRows.forEach(row => {
            currentRowsObj[row.timestamp] = row;
          });
          logger.info('syncHistory after select, currentRowsObj='+JSON.stringify(currentRowsObj));
          let filteredDeletions = deletions.filter(item => currentRows[item.timestamp]);
          logger.info('syncHistory after select, filteredDeletions='+JSON.stringify(filteredDeletions));
          let tableDeletions = filteredDeletions.map(item => item.timestamp);
          logger.info('syncHistory after select, tableDeletions='+JSON.stringify(tableDeletions));
          let filteredAdditions = additions.filter(item => !currentRows[item.timestamp]);
          logger.info('syncHistory after select, filteredAdditions='+JSON.stringify(filteredAdditions));
          let tableAdditions = filteredAdditions.map(item => Object.assign({}, item, { email, clientId }));
          logger.info('syncHistory after select, tableAdditions='+JSON.stringify(tableAdditions));
          let deletePromise = new Promise((resolve, reject) => {
            connectionPool.query(`DELETE FROM ${historyTable} WHERE timestamp IN (?)`, tableDeletions, function (error, results, fields) {
              if (error) {
                logger.error('DELETE failed syncHistory. error='+error);
                reject();
              } else {
                logger.info('syncHistory delete success');
                resolve();
              }
            });
          });
          let insertPromise = new Promise((resolve, reject) => {
            connectionPool.query(`INSERT INTO ${historyTable} SET ?`, tableAdditions, function (error, results, fields) {
              if (error) {
                logger.error("insert syncHistory database failure for email '" + email + "'");
                reject();
              } else {
                logger.info('syncHistory insert success');
                resolve();
              }
            });
          });
          Promise.all([deletePromise, insertPromise]).then(values => {
            logger.info('syncHistory promise all before outerResolve');
            let returnObj = {};
            connectedClients.forEach(client => {
              let { clientId, lastSync } = client;
              let mintime = calcMinTime([lastSync]);
              returnObj[clientId] = {
                deletions: filteredDeletions.filter(item => item.timestamp > mintime),
                additions: filteredAdditions.filter(item => item.timestamp > mintime),
              };
            });
            logger.info('syncHistory, returnObj='+JSON.stringify(returnObj));
            outerResolve(returnObj);
            /*
            updateClientTableLastSync(email, clientId, thisSyncServerTimestamp).then(() => {
              fn(JSON.stringify({ success: true }));
              // for each connected client, push data, and
              // acknowledge function updates lastSync for that client,
              // and sends update message with new last sync
            }, () => {
              logger.error('updateClientTableLastSync Promise.all rejected');
              fn(JSON.stringify({ success: false, error: 'updateClientTableLastSync server error' }));
            }).catch(e => {
              logger.error('updateClientTableLastSync Promise.all. e='+JSON.stringify(e));
              fn(JSON.stringify({ success: false, error: 'updateClientTableLastSync server exception' }));
            });
            */
          }, () => {
            logger.error('syncHistory Promise.all rejected');
            outerReject();
          }).catch(e => {
            logger.error('ClientInitiatedSync Promise.all. e='+JSON.stringify(e));
            outerReject();
          });
        }
      });
    }, () => {
      logger.error("syncHistory: no database connection");
      outerReject();
    }).catch(e => {
      logger.error("syncHistory: promise exception");
      outerReject();
    });
  });
  // get all records where timestamp >= minLastSyncConnected
  // Make list of records to delete from table and to add to table
  // for each connectedClient, make list of deletions and additions since lastSync
  // delete and add records from and to table
  // return array of serverInitiatedSyncData, which is [{clientId, updates}] Where updates should have same data
}

let calcMinTime = arr => {
  let onehour = 1000*60*60;
  return Math.max(Math.min(...arr) - onehour,  0);









}
