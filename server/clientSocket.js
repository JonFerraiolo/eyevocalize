
const dbconnection = require('./dbconnection');

const regex_email= /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

// cross references between email, clientId and socket info
let connectionsByEmail = {};
let connectionsBySocket = {};
let socketById = {};

exports.onConnect = function(socket) {
  const logger = global.logger;
  // called when client notifies server when the browser window becomes active/visible or inactive/hidden
  // the server only sends immediate sync messages to active browser windows
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
    // only log the new state as visible.
    // it is assumed that client will initiate a sync whenever it becomes visible
    changeActive(msg, fn, true);
  });
  // it is assumed that the browser window will initiate a sync whenever data changes,
  // whenever it goes from hidden to visible and at start of a new browser session, such as after a reload.
  // Note that the server will tell the client to reload whenever the server restarts and the client reconnects
  // (see ServerInitiatedRefresh).
  socket.on('ClientInitiatedSync', (msg, fn) => {
    //logger.info('ClientInitiatedSync socket.id='+socket.id+', message was: '+msg);
    try {
      let clientInitiatedSyncData = JSON.parse(msg);
      // at this point, lastSync is the time of the last time that client (ie, a given browser on a given computer)
      // finished completion of a ServerInitiatedSync.
      // thisSyncClientTimestamp holds time when client sent this ClientInitiatedSync.
      // Note that clientId is unique to each browser on a particular device for a particular email,
      // whereas socket.id is unique to each browser window.
      // That distinction only comes into play when a user has multiple EyeVocalize browser windows in the same browser.
      let { email, clientId, lastSync, thisSyncClientTimestamp, thisSyncServerInstance } = clientInitiatedSyncData;
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
          refresh = true; // tell browser to reload if this is first encounter with this email this server session
        }
        socketById[socket.id] = socket;
        if (!connectionsByEmail[email][clientId]) {
          connectionsByEmail[email][clientId] = {};
          refresh = true; // tell browser to reload if this is first encounter with this email+browser+device this server session
        }
        if (!connectionsByEmail[email][clientId][socket.id]) {
          refresh = true; // tell browser to reload if this is first encounter with this browser window this server session
        }
        if (thisSyncServerInstance === global.serverInstance.toString()) {
          //logger.info('server instance match, refresh set to false')
          refresh = false;
        }
        connectionsByEmail[email][clientId][socket.id] = { lastSync, active: true };
        connectionsBySocket[socket.id] = { email, clientId };
        //logger.info('toward end of ClientInitiatedSync onDisconnect  connectionsByEmail='+JSON.stringify(connectionsByEmail));
        //logger.info('toward end of ClientInitiatedSync connectionsBySocket='+JSON.stringify(connectionsBySocket));
        //logger.info('refresh='+refresh);
        if (refresh) {
          //logger.info('tell client to refresh')
          // If this is first handshake with client for this server execution, force client to pull latest client code
          // the reloaded browser window will initiate another ClientInitiatedSync
          socket.emit('ServerInitiatedRefresh', JSON.stringify({ serverInstance: global.serverInstance }));
        } else {
          // otherwise, update database
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

// update database tables and call updateClients
let updateTopicTables = (socket, clientInitiatedSyncData, fn) => {
  const logger = global.logger;
  //logger.info('updateTopicTables Entered');
  let { email, clientId, lastSync, thisSyncClientTimestamp } = clientInitiatedSyncData;
  email = email.toLowerCase();

  // minLastSyncConnected will be set to the minimum lastSync of all clients for this email that are connected to server
  // regardless if active or not, where lastSync is the last time it finished a serverInitiatedSync
  // it is used by the by the logic for the History table to restrict how far back in time to check for differences
  let minLastSyncConnected = lastSync;
  //logger.info('updateTopicTables  connectionsByEmail='+JSON.stringify(connectionsByEmail));
  for (const clientId in connectionsByEmail[email]) {
    let client = connectionsByEmail[email][clientId];
    for (let socketId in client) {
      let o = client[socketId];
      if (o.lastSync < minLastSyncConnected) minLastSyncConnected = o.lastSync;
    }
  }
  let thisSyncServerTimestamp = Date.now();
  // update database tables
  let NotesPromise = syncMiscDataSync(email, 'Notes', connectionsByEmail[email], lastSync,
    clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.Notes);
  let HistoryPromise = syncHistory(email, connectionsByEmail[email], minLastSyncConnected,
    thisSyncClientTimestamp, thisSyncServerTimestamp, clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.History);
  let FavoritesPromise = syncMiscDataSync(email, 'Favorites', connectionsByEmail[email], lastSync,
    clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.Favorites);
  let SettingsPromise = syncMiscDataSync(email, 'Settings', connectionsByEmail[email], lastSync,
    clientInitiatedSyncData.updates && clientInitiatedSyncData.updates.Settings);
  Promise.all([NotesPromise, HistoryPromise, FavoritesPromise, SettingsPromise]).then(values => {
    // after database tables have been updated, send ServerInitiatedSync to all active sockets for this email
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

// send ServerInitiatedSync to all active browser windows for this email
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

          // send ServerInitiatedSync message. If client acknowledges, resolve promise immediately;
          // otherwise, resolve after one second.
          // you see, socket.io is not reliable about acknowledgments, and there are always possible race conditions
          // also, update client database table with timestamp of this ServerInitiatedSync
          let ServerInitiatedSyncAck = false;
          skt.emit('ServerInitiatedSync', serverInitiatedSyncDataJson, msg => {
            //logger.info('updateClients return from emit, msg='+msg+' for socketId='+socketId+', clientId='+clientId);
            if (!ServerInitiatedSyncAck) {
              ServerInitiatedSyncAck = true;
              socketResolve();
            }
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

  // at this point, all active browser windows have been sent ServerInitiatedSync and either acknowledged or timed out
  // acknowledge completion to the browser window that sent the ClientInitiatedSync
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
 * This routine is called three times for each ClientInitiatedSync, once each for Notes, Favorites and Settings
 * It updates the entry for (email, type), where type is one of Notes, Favorites or Settings
 * The update occurs only if the timestamp on the new data is greater than the timestamp on the record in the db
 * @param {string} user email for the browser window that initiated the ClientInitiatedSync
 * @param {string} type one of Notes, Favorites or Settings
 * @param {object} connectedClients associative array of all currently connected clients
 *     for the given email, where each entry is clientId:{socketId: {active, lastSync}, ... }
 * @param {number} thisClientLastSync for when client says it last completed a ServerInitiatedSync
 * @param {null|object} clientInitiatedSyncData the specific update data for this type of data.
 *    either null or an object of the form { version: {number}, timestamp: {number}, ... }
 *    if null, client data has not been changed
 * @returns {object} a promise
*/
let syncMiscDataSync = (email, type, connectedClients, thisClientLastSync, clientInitiatedSyncData) => {
  const logger = global.logger;
  //logger.info('at start of syncMiscDataSync  email='+email);
  //logger.info('at start of syncMiscDataSync  type='+type);
  //logger.info('at start of syncMiscDataSync  connectedClients='+JSON.stringify(connectedClients));
  //logger.info('at start of syncMiscDataSync  clientInitiatedSyncData='+JSON.stringify(clientInitiatedSyncData));
  return new Promise(function(email, type, connectedClients, clientInitiatedSyncData, outerResolve, outerReject) {
    //logger.info('syncMiscDataSync promise function entered for email='+ email + ' and type=' + type);

    // a couple of error checks for highly unlikely errors
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
                // If there are more than one db record, we probably had simultaneous inserts
                // from two separate browser windows, so delete all but the most recent
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
                  // else update db and all active clients to the new data from ClientInitiatedSync
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
              // If no existing db record and no data from ClientInitiatedSync, neither update the db or send updates to clients
              if (clientInitiatedSyncData === null) {
                //logger.info("miscsyncdataTable no new data, no old data for email=" + email + " and type=" + type);
                innerResolve(null);
              // otherwise, no db record but new data from ClientInitiatedSync, so insert a new record in db
              // and send data from ClientInitiatedSync to all active browser windows
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
          // send either null, the new data from ClientInitiatedSync or the record from the db
          // to all active browser windows for this email
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
  // need to bind to instance data because the same function object is called in a loop
  // and otherwise the subsequent call data would clobber data from earlier call.
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
  }.bind(null, email, type, connectedClients, clientInitiatedSyncData));
}

/**
 * This routine is once for each ClientInitiatedSyncto update the History table for this email
 * It adds history entries that are new according to ClientInitiatedSync and not yet in db and
 * deletes all db records that match deletion entries from ClientInitiatedSync.
 * @param {string} user email for the browser window that initiated the ClientInitiatedSync
 * @param {object} connectedClients associative array of all currently connected clients
 *     for the given email, where each entry is clientId:{socketId: {active, lastSync}, ... }
 * @param {number} minLastSyncConnected minimum timestamp for lastSync for all connected browser windows for this email
 * @param {number} thisSyncClientTimestamp timestamp when the initiating browser window sent clientI
 * @param {number} thisSyncServerTimestamp the timestamp of this server, basically now
 * @param {null|object} clientInitiatedSyncData the specific update data for this type of data.
 *    either null or an object of the form { additions: [phrases], deletions: [phrases] }
 *    if null, client data has not been changed
 * @returns {object} a promise
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

      // mintime is the minimum of the following, minus a minor fudge factor
      //   lowest timestamp of all concerned connected browser windows whether active or not
      //   the lastSync timestamp of the browser window that initiated this clientInitiatedSync
      //   the timestamp of this server, basically now
      // should always be minLastSyncConnected minus fudge factor
      let mintime = calcMinTime([minLastSyncConnected, thisSyncClientTimestamp, thisSyncServerTimestamp]);
      //logger.info('syncHistory before select. mintime='+mintime+', email='+email+', historyTable='+historyTable);
      let { HistoryPendingDeletions, HistoryPendingAdditions } = clientInitiatedSyncData;
      let additionTimestamps = HistoryPendingAdditions.map(item => item.timestamp);
      if (!Array.isArray(additionTimestamps) || additionTimestamps.length === 0) additionTimestamps = [1]; // query fails with empty array. Time=1 is 1ms into 1970
      //logger.info('syncHistory before select, additionTimestamps='+JSON.stringify(additionTimestamps));

      // query the db for all history records for this email whose timestamp is after mintime Or matches timestamp of any of the additions
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

          // filteredDeletions holds list of row items from the select command that are flagged for deletion
          let filteredDeletions = HistoryPendingDeletions.filter(item => currentRowsIndex[item.timestamp]);
          //logger.info('syncHistory after select, filteredDeletions='+JSON.stringify(filteredDeletions));

          // tableDeletions holds the list of timestamps of db records flagged for deletion
          let tableDeletions = filteredDeletions.map(item => item.timestamp);
          //logger.info('syncHistory after select, tableDeletions='+JSON.stringify(tableDeletions));

          // filteredAdditions holds the list of db additions from pending additions that are not already in db
          let filteredAdditions = HistoryPendingAdditions.filter(item => !currentRowsIndex[item.timestamp]);
          //logger.info('syncHistory after select, filteredAdditions='+JSON.stringify(filteredAdditions));

          // tableAdditions holds an array of arrays for the pending additions not already in database
          // the array of arrays is the format required by MySQL for batch insertion
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

            // dbrows holds all phrases from the earlier select command.
            // we add them to the list of additions sent to the active browser windows
            // in case those entries might have slipped through the cracks.
            // note that this list of additions might include items we just deleted.
            // that is okay because the client logic for ServerInitiatedSync does deletions after additions
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
              // minLastSync is the minimum lastSync for all active sockets for this email
              // only active sockets get sent a serverInitiatedSync
              let minLastSync = Number.MAX_SAFE_INTEGER;
              for (let socketId in client) {
                let o = client[socketId];
                if (!o.active) {
                  continue;
                }
                let { lastSync } = o;
                minLastSync = Math.min(minLastSync, lastSync);
              }
              // send each browser window for this email a list of additions and deletions to merge
              // to save processing time and network bandwidth, only send updates after client lastSync, minus fudge factor
              // but for safety, we send all filtered additions and deletions plus db rows since minLastSync
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

let calcMinTime = arr => {
  let fifteenminutes = 1000*60*15;
  return Math.max(Math.min(...arr) - fifteenminutes,  0);









}
