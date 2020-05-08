
const dbconnection = require('./dbconnection');

const regex_email= /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

// cross references between email, clientId and socket info
let connectionsByEmail = {};
let connectionsBySocket = {};
let socketById = {};

exports.onConnect = function(socket) {
  const logger = global.logger;
  let changeActive = (msg, fn, visible) => {
    try {
      let clientData = JSON.parse(msg);
      let { email, clientId, lastSync } = clientData;
      email = email.toLowerCase();
      let clientIdInt = parseInt(clientId);
      if (typeof email !=='string' || !regex_email.test(email) || isNaN(clientIdInt) || isNaN(lastSync)) {
        if (fn) {
          fn(JSON.stringify({ success: false, error: 'invalid email, clientId or lastSync' }));
        }
      } else {
        if (!connectionsByEmail[email]) {
          connectionsByEmail[email] = {};
        }
        socketById[socket.id] = socket;
        if (!connectionsByEmail[email][clientId]) {
          connectionsByEmail[email][clientId] = {};
        }
        connectionsByEmail[email][clientId][socket.id] = { lastSync, active: visible };
        connectionsBySocket[socket.id] = { email, clientId };
        if (fn) {
          fn(JSON.stringify({ success: true }));
        }
      }
    } catch(e) {
      if (fn) {
        fn(JSON.stringify({ success: false, error: 'server exception, e='+e }));
      }
    }
  };
  socket.on('ClientHidden', (msg, fn) => {
    changeActive(msg, fn, false);
  });
  socket.on('ClientVisible', (msg, fn) => {
    changeActive(msg, fn, true);
  });
  socket.on('ClientInitiatedSync', (msg, fn) => {
    //logger.info('ClientInitiatedSync socket.id='+socket.id+', message was: '+msg);
    try {
      let clientInitiatedSyncData = JSON.parse(msg);
      let { email, clientId, lastSync, thisSyncClientTimestamp } = clientInitiatedSyncData;
      email = email.toLowerCase();
      let clientIdInt = parseInt(clientId);
      if (typeof email !=='string' || !regex_email.test(email) || isNaN(clientIdInt) || isNaN(lastSync)) {
        if (fn) {
          fn(JSON.stringify({ success: false, error: 'invalid email, clientId or lastSync' }));
        }
      } else {
        let refresh = false;
        if (!connectionsByEmail[email]) {
          connectionsByEmail[email] = {};
          refresh = true;
        }
        socketById[socket.id] = socket;
        if (!connectionsByEmail[email][clientId]) {
          connectionsByEmail[email][clientId] = {};
          refresh = true;
        }
        connectionsByEmail[email][clientId][socket.id] = { lastSync, active: true };
        connectionsBySocket[socket.id] = { email, clientId };
        //logger.info('toward end of ClientInitiatedSync onDisconnect  connectionsByEmail='+JSON.stringify(connectionsByEmail));
        //logger.info('toward end of ClientInitiatedSync connectionsBySocket='+JSON.stringify(connectionsBySocket));
        //logger.info('refresh='+refresh);
        if (refresh) {
          // If this is first handshake with client for this server execution, force client to pull latest client code
          socket.emit('ServerInitiatedRefresh', '{}');
        } else {
          updateTopicTables(socket, clientInitiatedSyncData, fn);
        }
      }
    } catch(e) {
      if (fn) {
        fn(JSON.stringify({ success: false, error: 'server exception, e='+e }));
      }
    }
  });
}

exports.onDisconnect = function(socket) {
  const logger = global.logger;
  //logger.info('onDisconnect socket.id='+socket.id);
  //logger.info('at start of onDisconnect  connectionsByEmail='+JSON.stringify(connectionsByEmail));
  //logger.info('at end of onDisconnect  connectionsBySocket='+JSON.stringify(connectionsBySocket));
  let o = connectionsBySocket[socket.id];
  if (o && o.email && o.clientId && connectionsByEmail[o.email] && connectionsByEmail[o.email][o.clientId] && connectionsByEmail[o.email][o.clientId][socket.id]) {
    delete connectionsByEmail[o.email][o.clientId][socket.id];
    delete socketById[socket.id];
  }
  delete connectionsBySocket[socket.id];
  //logger.info('at end of onDisconnect  connectionsByEmail='+JSON.stringify(connectionsByEmail));
  //logger.info('at end of onDisconnect  connectionsBySocket='+JSON.stringify(connectionsBySocket));
}

let updateTopicTables = (socket, clientInitiatedSyncData, fn) => {
  const logger = global.logger;
  //logger.info('updateTopicTables Entered');
  let { email, clientId, lastSync, thisSyncClientTimestamp } = clientInitiatedSyncData;
  email = email.toLowerCase();
  let minLastSyncConnected = lastSync; // what this client says is the last time it sync'd
  //logger.info('updateTopicTables  connectionsByEmail='+JSON.stringify(connectionsByEmail));
  for (const clientId in connectionsByEmail[email]) {
    let client = connectionsByEmail[email][clientId];
    for (let socketId in client) {
      let o = client[socketId];
      if (o.active && o.lastSync < minLastSyncConnected) minLastSyncConnected = o.lastSync;
    }
  }
  let thisSyncServerTimestamp = Date.now();
  let NotesPromise = syncMiscDataSync(email, 'Notes', connectionsByEmail[email], lastSync,
    clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.Notes);
  let HistoryPromise = syncHistory(email, connectionsByEmail[email], minLastSyncConnected,
    thisSyncClientTimestamp, thisSyncServerTimestamp, clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.History);
  let FavoritesPromise = syncMiscDataSync(email, 'Favorites', connectionsByEmail[email], lastSync,
    clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.Favorites);
  let SettingsPromise = syncMiscDataSync(email, 'Settings', connectionsByEmail[email], lastSync,
    clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.Settings);
  Promise.all([NotesPromise, HistoryPromise, FavoritesPromise, SettingsPromise]).then(values => {
    updateClients(socket, email, thisSyncServerTimestamp, values, fn);
  }, () => {
    logger.error('updateTopicTables Promise.all topic promises rejected');
    if (fn) {
      fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync topic promises server error' }));
    }
  }).catch(e => {
    logger.error('updateTopicTables Promise.all. topic promises e='+JSON.stringify(e));
    if (fn) {
      fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync topic promises server exception' }));
    }
  });
};

let updateClients = (socket, email, thisSyncServerTimestamp, values, fn) => {
  const logger = global.logger;
  //logger.info('updateClients entered');
  //logger.info('updateClients values='+JSON.stringify(values));
  let returnNotes = values[0];
  let returnHistory = values[1];
  let returnFavorites = values[2];
  let returnSettings = values[3];
  let socketPromises = [];
  //logger.info('updateClients before for in ');
  for (let clientId in connectionsByEmail[email]) {
    //logger.info('updateClients clientId='+clientId);
    let client = connectionsByEmail[email][clientId];
    //logger.info('updateClients client='+JSON.stringify(client));
    for (let socketId in client) {
      let o = client[socketId];
      if (!o.active) {
        continue;
      }
      let socketPromise = new Promise((socketResolve, socketReject) => {
        //logger.info('updateClients promise function entered');
        let { lastSync } = o;
        let skt = socketById[socketId];
        //logger.info('updateClients typeof skt='+typeof skt);
        if (skt) {
          //logger.info('updateClients before emit for socketId='+socketId+', lastSync='+lastSync);
          let serverInitiatedSyncDataJson = JSON.stringify({
            thisSyncServerTimestamp,
            updates: {
              Notes: returnNotes[clientId] || null,
              History: returnHistory[clientId] || null,
              Favorites: returnFavorites[clientId] || null,
              Settings: returnSettings[clientId] || null,
            }
          });
          //logger.info('updateClients before emit serverInitiatedSyncDataJson='+serverInitiatedSyncDataJson);
          let ServerInitiatedSyncAck = false;
          skt.emit('ServerInitiatedSync', serverInitiatedSyncDataJson, msg => {
            //logger.info('updateClients return from emit, msg='+msg+' for socketId='+socketId+', clientId='+clientId);
            //logger.info('updateClients before calling updateClientTableLastSync ');
            updateClientTableLastSync(email, clientId, thisSyncServerTimestamp).then(() => {
              //logger.info('updateClients updateClientTableLastSync promise resolved. Just before socketResolve ');
            }, () => {
              logger.error('updateClients updateClientTableLastSync rejected');
            }).catch(e => {
              logger.error('updateClients updateClientTableLastSync Error e='+JSON.stringify(e));
            }).finally(() => {
              ServerInitiatedSyncAck = true;
              socketResolve();
            });
          });
          setTimeout(() => {
            if (!ServerInitiatedSyncAck) {
              socketResolve();
            }
          }, 1000);
        } else {
          logger.error('updateClients no socket for socketId='+socketId+', clientId='+clientId);
          socketResolve();
        }
      });
      //logger.info('updateClients before socketPromise push');
      socketPromises.push(socketPromise);
    }
  }
  //logger.info('updateClients before Promise.all. socketPromises.length='+socketPromises.length);
  Promise.all(socketPromises).then(values => {
    //logger.info('updateClients Promise.all socketPromises resolved');
    if (fn) {
      fn(JSON.stringify({ success: true }));
    }
  }, () => {
    logger.error('updateClients Promise.all socketPromises rejected');
    if (fn) {
      fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync server error' }));
    }
  }).catch(e => {
    logger.error('updateClients Promise.all. socketPromises e='+JSON.stringify(e));
    if (fn) {
      fn(JSON.stringify({ success: false, error: 'ClientInitiatedSync server exception' }));
    }
  });
};

/**
  @param connectedClients {object} associative array of all currently connected clients
      for the given email, whichere each entry is clientId:{socketId, clientId}
*/
let syncMiscDataSync = (email, type, connectedClients, thisClientLastSync, clientInitiatedSyncData) => {
  const logger = global.logger;
  //logger.info('at start of syncMiscDataSync  email='+email);
  //logger.info('at start of syncMiscDataSync  type='+type);
  //logger.info('at start of syncMiscDataSync  connectedClients='+JSON.stringify(connectedClients));
  //logger.info('at start of syncMiscDataSync  clientInitiatedSyncData='+JSON.stringify(clientInitiatedSyncData));
  return new Promise(function(email, type, connectedClients, clientInitiatedSyncData, outerResolve, outerReject) {
    //logger.info('syncMiscDataSync promise function entered for email='+ email + ' and type=' + type);
    if (clientInitiatedSyncData !== null && typeof clientInitiatedSyncData !== 'object') {
      //logger.info('syncMiscDataSync invalid clientInitiatedSyncData for email='+ email + ' and type=' + type);
      outerReject();
      return;
    }
    let timestamp, data;
    if (clientInitiatedSyncData) {
      timestamp = clientInitiatedSyncData.timestamp;
      data = JSON.stringify(clientInitiatedSyncData);
      if (isNaN(timestamp)) {
        //logger.info('syncMiscDataSync invalid or missing timestamp for email='+ email + ' and type=' + type);
        outerReject();
        return;
      }
    }
    dbconnection.dbReady().then(function(connectionPool) {
      //logger.info('syncMiscDataSync got connection');
      const miscsyncdataTable = global.miscsyncdataTable;
      //logger.info('syncMiscDataSync before select. email='+email+', miscsyncdataTable='+miscsyncdataTable);
      connectionPool.query(`SELECT * FROM ${miscsyncdataTable} WHERE email = ? and type = ?`, [email, type], function (error, results, fields) {
        //logger.info('syncMiscDataSync select return function start ');
        if (error) {
          logger.error("syncMiscDataSync select failure for email=" + email + " and type=" + type);
          outerReject();
        } else {
          //logger.info('syncMiscDataSync after select, results='+JSON.stringify(results));
          let currentRows = results;
          let innerPromise = new Promise(function(innerResolve, innerReject) {
            let rowToUse = 0;
            if (currentRows.length >= 1) {
              let deletePromise = new Promise(function(deleteResolve, deleteReject) {
                if (currentRows.length  > 1) {
                  logger.error("syncMiscDataSync select found more than one entry for email=" + email + " and type=" + type);
                  let biggestTimestamp = 0;
                  currentRows.forEach((row, rowIndex) => {
                    if (row.timestamp > biggestTimestamp) {
                      biggestTimestamp = row.timestamp;
                      rowToUse = rowIndex;
                    }
                  });
                  connectionPool.query(`DELETE FROM ${miscsyncdataTable} WHERE email = ? and type = ? and timestamp != ?`, [email, type, biggestTimestamp], function (error, results, fields) {
                    if (error) {
                      logger.error("miscsyncdataTable delete database failure for email=" + email + " and type=" + type);
                      deleteReject();
                    } else {
                      deleteResolve();
                    }
                  });
                } else {
                  deleteResolve();
                }
              });
              deletePromise.then(function() {
                let dbRecord = currentRows[rowToUse];
                try {
                  let o = JSON.parse(dbRecord.data);
                  // If client did not change and last time the client sync'd was earlier than the time of the record in db,
                  // leave db alone and update all clients to the db record
                  if (clientInitiatedSyncData === null && thisClientLastSync < o.timestamp) {
                    innerResolve(o);
                  // else if client did not change, leave db and all clients alone
                  } else if (clientInitiatedSyncData === null) {
                    innerResolve(null);
                  } else {
                    connectionPool.query(`UPDATE ${miscsyncdataTable} SET timestamp = ?, data = ? WHERE email = ? and type = ?`, [timestamp, data, email, type], function (error, results, fields) {
                      if (error) {
                        logger.error("miscsyncdataTable update database failure for email=" + email + " and type=" + type);
                        innerReject();
                      } else {
                        innerResolve(clientInitiatedSyncData);
                      }
                    });
                  }
                } catch(e) {
                  logger.error("syncMiscDataSync JSON parse error for dbRecord.data for email=" + email + " and type=" + type);
                  innerResolve(null);
                }
              }, () => {
                logger.error("syncMiscDataSync deletePromise reject email=" + email + " and type=" + type);
                outerReject();
              }).catch(e => {
                logger.error("syncMiscDataSync deletePromise exception for email=" + email + " and type=" + type);
                outerReject();
              });
            } else {
              if (clientInitiatedSyncData === null) {
                //logger.info("miscsyncdataTable no new data, no old data for email=" + email + " and type=" + type);
                innerResolve(null);
              } else {
                let dataObj = { email, type, timestamp, data };
                connectionPool.query(`INSERT INTO ${miscsyncdataTable} SET ?`, dataObj, function (error, results, fields) {
                  if (error) {
                    logger.error("miscsyncdataTable insert database failure for email=" + email + " and type=" + type);
                    innerReject();
                  } else {
                    innerResolve(clientInitiatedSyncData);
                  }
                });
              }
            }
          });
          innerPromise.then(function(retval) {
            //logger.info("syncMiscDataSync innerPromise resolved for email=" + email + " and type=" + type);
            let returnObj = {};
            for (let clientId in connectedClients) {
              let client = connectedClients[clientId];
              for (let socketId in client) {
                if (client[socketId].active) {
                  // If multiple active sockets for this clientId, following assignment will happen multiple times, which is ok
                  returnObj[clientId] = retval;
                }
              }
            };
            //logger.info('syncMiscDataSync, returnObj='+JSON.stringify(returnObj));
            outerResolve(returnObj);
          }, () => {
            logger.error("syncMiscDataSync innerPromise reject email=" + email + " and type=" + type);
            outerReject();
          }).catch(e => {
            logger.error("syncMiscDataSync innerPromise exception for email=" + email + " and type=" + type);
            outerReject();
          });
        }
      });
    }, () => {
      logger.error("syncMiscDataSync: no database connection");
      outerReject();
    }).catch(e => {
      logger.error("syncMiscDataSync: promise exception");
      outerReject();
    });
  }.bind(null, email, type, connectedClients, clientInitiatedSyncData));
}




/**
history table delete: delete from table where created in (?), array
additions: INSERT INTO tbl_name (a,b,c) VALUES ?, array of arrays, where inner are phrases
return history since minLastSyncConnected
connectedClients[{clientId, lastSync}],
  @param connectedClients {object} associative array of all currently connected clients
      for the given email, whichere each entry is clientId:{socketId, clientId}
*/
let syncHistory = (email, connectedClients, minLastSyncConnected, thisSyncClientTimestamp, thisSyncServerTimestamp, clientInitiatedSyncData) => {
  const logger = global.logger;
  //logger.info('at start of syncHistory  connectedClients='+JSON.stringify(connectedClients));
  //logger.info('at start of syncHistory  minLastSyncConnected='+minLastSyncConnected);
  //logger.info('at start of syncHistory  thisSyncServerTimestamp='+thisSyncServerTimestamp);
  //logger.info('at start of syncHistory  clientInitiatedSyncData='+JSON.stringify(clientInitiatedSyncData));
  return new Promise((outerResolve, outerReject) => {
    //logger.info('syncHistory promise function entered ');
    dbconnection.dbReady().then(connectionPool => {
      //logger.info('syncHistory got connection');
      const historyTable = global.historyTable;
      //logger.info('syncHistory before calcMinTime. minLastSyncConnected='+minLastSyncConnected+', thisSyncClientTimestamp='+thisSyncClientTimestamp+', thisSyncServerTimestamp='+thisSyncServerTimestamp);
      let mintime = calcMinTime([minLastSyncConnected, thisSyncClientTimestamp, thisSyncServerTimestamp]);
      //logger.info('syncHistory before select. mintime='+mintime+', email='+email+', historyTable='+historyTable);
      let { HistoryPendingDeletions, HistoryPendingAdditions } = clientInitiatedSyncData;
      let additionTimestamps = HistoryPendingAdditions.map(item => item.timestamp);
      if (!Array.isArray(additionTimestamps) || additionTimestamps.length === 0) additionTimestamps = [1]; // query fails with empty array. Time=1 is 1ms into 1970
      //logger.info('syncHistory before select, additionTimestamps='+JSON.stringify(additionTimestamps));
      connectionPool.query(`SELECT * FROM ${historyTable} WHERE (email = ? and timestamp > ?) or timestamp IN (?)`, [email, mintime, additionTimestamps], function (error, results, fields) {
        //logger.info('syncHistory select return function start ');
        if (error) {
          logger.error("syncHistory select history database failure for email '" + email + "'");
          outerReject();
        } else {
          //logger.info('syncHistory after select, results='+JSON.stringify(results));
          let currentRows = results;
          //logger.info('syncHistory after select, HistoryPendingDeletions='+JSON.stringify(HistoryPendingDeletions));
          //logger.info('syncHistory after select, HistoryPendingAdditions='+JSON.stringify(HistoryPendingAdditions));
          let currentRowsIndex = {};
          currentRows.forEach(row => {
            currentRowsIndex[row.timestamp] = row;
          });
          //logger.info('syncHistory after select, currentRowsIndex='+JSON.stringify(currentRowsIndex));
          let filteredDeletions = HistoryPendingDeletions.filter(item => currentRowsIndex[item.timestamp]);
          //logger.info('syncHistory after select, filteredDeletions='+JSON.stringify(filteredDeletions));
          let tableDeletions = filteredDeletions.map(item => item.timestamp);
          //logger.info('syncHistory after select, tableDeletions='+JSON.stringify(tableDeletions));
          let filteredAdditions = HistoryPendingAdditions.filter(item => !currentRowsIndex[item.timestamp]);
          //logger.info('syncHistory after select, filteredAdditions='+JSON.stringify(filteredAdditions));
          let tableAdditions = filteredAdditions.map(item => [email, item.timestamp, JSON.stringify(item)] );
          //logger.info('syncHistory after select, tableAdditions='+JSON.stringify(tableAdditions));
          let deletePromise = new Promise((resolve, reject) => {
            if (tableDeletions.length === 0) {
              resolve();
            } else {
              connectionPool.query(`DELETE FROM ${historyTable} WHERE timestamp IN (?)`, tableDeletions, function (error, results, fields) {
                if (error) {
                  logger.error('DELETE failed syncHistory. error='+error);
                  reject();
                } else {
                  //logger.info('syncHistory delete success');
                  resolve();
                }
              });
            }
          });
          let insertPromise = new Promise((resolve, reject) => {
            if (tableAdditions.length === 0) {
              resolve();
            } else {
              connectionPool.query(`INSERT INTO ${historyTable} (email, timestamp, phrase) VALUES ?`, [tableAdditions], function (error, results, fields) {
                if (error) {
                  logger.error("insert syncHistory database failure for email '" + email + "'");
                  reject();
                } else {
                  //logger.info('syncHistory insert success');
                  resolve();
                }
              });
            }
          });
          Promise.all([deletePromise, insertPromise]).then(values => {
            //logger.info('syncHistory promise all entered');
            let dbrows;
            try {
              dbrows = currentRows.map(row => JSON.parse(row.phrase));
            } catch(e) {
              logger.error('historySync build dbrows error. currentRows='+JSON.stringify(currentRows));
              dbrows = [];
            }
            let returnObj = {};
            for (let clientId in connectedClients) {
              let client = connectedClients[clientId];
              let minLastSync = Number.MAX_SAFE_INTEGER;
              for (let socketId in client) {
                let o = client[socketId];
                if (!o.active) {
                  continue;
                }
                let { lastSync } = o;
                minLastSync = Math.min(minLastSync, lastSync);
              }
              let mintime = calcMinTime([minLastSync]);
              returnObj[clientId] = {
                deletions: filteredDeletions.filter(item => item.timestamp > mintime).concat(HistoryPendingDeletions),
                additions: filteredAdditions.filter(item => item.timestamp > mintime).concat(HistoryPendingAdditions).concat(dbrows),
              };
            };
            //logger.info('syncHistory, returnObj='+JSON.stringify(returnObj));
            outerResolve(returnObj);
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
}

let updateClientTableLastSync = (email, clientId, thisSyncServerTimestamp) => {
  const logger = global.logger;
  //logger.info('updateClientTableLastSync entered. email='+email+', clientId='+clientId+', thisSyncServerTimestamp='+thisSyncServerTimestamp);
  return new Promise((resolve, reject) => {
    //logger.info('updateClientTableLastSync start of promise function ');
    dbconnection.dbReady().then(connectionPool => {
      //logger.info('updateClientTableLastSync got connection');
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
            //logger.info('updateClientTableLastSync before update');
            connectionPool.query(`UPDATE ${clientTable} SET lastSync = ? WHERE email = ? and clientId = ?`, [thisSyncServerTimestamp, email, clientId], function (error, results, fields) {
              if (error) {
                logger.error("Update new client update database failure for email '" + email + "'");
                reject();
              } else {
                //logger.info('updateClientTableLastSync update success');
                resolve();
              }
            });
          } else {
            //logger.info('updateClientTableLastSync before insert');
            let o = { email, clientId, lastSync: thisSyncServerTimestamp };
            connectionPool.query(`INSERT INTO ${clientTable} SET ?`, o, function (error, results, fields) {
              if (error) {
                logger.error("insert new client update database failure for email '" + email + "'");
                reject();
              } else {
                //logger.info('updateClientTableLastSync insert success');
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

let calcMinTime = arr => {
  let fifteenminutes = 1000*60*15;
  return Math.max(Math.min(...arr) - fifteenminutes,  0);









}
