
let mysql = require('mysql');

/*
FIXME Include explanation about how db initialization works
*/

let pool  = null;
let dbInitialized = false;

const dbReady = function() {
  const logger = global.logger;
  return new Promise((outerResolve, outerReject) =>  {
    let connectionPromise = getConnection();
    let initializePromise = new Promise((resolve, reject) => {
      let initializeCounter = 0;
      let check = (() => {
        if (dbInitialized) {
          logger.info('dbconnection.init initialize promise resolved');
          resolve();
        } else {
          if (initializeCounter >= 10) {
            logger.error('dbconnection.init initialize promise rejected after 10 tries');
            reject();
          } else {
            logger.info('dbconnection.init initialize promise incrementing counter');
            initializeCounter++;
            setTimeout(() => {
              check();
            }, initializeCounter* 500);
          }
        }
      });
      check();
    });
    return Promise.all([connectionPromise, initializePromise]).then(function(values) {
      logger.info('dbconnection.init outer promise resolved');
      outerResolve(pool);
    }, () => {
      logger.error('dbconnection.init outer promise rejected');
      outerReject();
    }).catch(e => {
      logger.error('dbconnection.init outer promise catch. e='+JSON.stringify(e));
      outerReject();
    });
  });
};
exports.dbReady = dbReady;

const getConnection = function() {
  const logger = global.logger;
  logger.info("enter getConnection");
  return new Promise((resolve, reject) => {
    if (pool ) {
      logger.info("getConnection Immediate return, we have an active connection");
      resolve(pool);
    } else {
      logger.info("getConnection no active connection. Calling reconnect");
      reconnect().then(() => {
        logger.info("getConnection reconnect has returned a new connection");
        resolve(pool);
      }, () => {
        logger.error("getConnection reconnect rejected");
        reject();
      }).catch(e => {
        logger.error("getConnection reconnect catch e="+JSON.stringify(e));
        reject();
      });
    }
  });
};

//FIXME no reason to kill application if we cannot connect to database
function reconnect() {
  const logger = global.logger;
  logger.info("enter reconnect");
  return new Promise((outerResolve, outerReject) => {
    function inner() {
      logger.info("enter reconnect/inner");
      return new Promise((innerResolve, innerReject) => {
        logger.info("before createPool ");
        try {
          pool  = mysql.createPool({
            connectionLimit : 5,
            host: global.config.DB_HOST,
            user: global.config.DB_USER,
            password: global.config.DB_PASSWORD,
            database: global.config.DB_DATABASE,
            debug: global.config.DB_DEBUG === 'true' ? true : false,
          });
        } catch(e) {
          logger.error('mysql createPool  error');
          logger.error('error: '+e.toString());
          innerReject(true);
        }
        logger.info("after createPool . pool="+pool);
        pool.on('acquire', function (connection) {
          //logger.info('Connection %d acquired', connection.threadId);
        });
        pool.on('connection', function (connection) {
          logger.info('Connection %d connected', connection.threadId);
        });
        pool.on('enqueue', function () {
          //logger.info('Waiting for connection');
        });
        pool.on('release', function (connection) {
          //logger.info('Connection %d released', connection.threadId);
        });
        innerResolve(pool);
      });
    }
    inner().then(() => {
      logger.info('reconnect inner promise resolved');
      outerResolve(pool);
    }, finishOuter => {
      logger.info('reconnect inner promise rejected. finishOuter='+finishOuter);
      if (finishOuter) {
        outerReject();
      }
    }).catch(e => {
      logger.error('reconnect inner promise catch e='+JSON.stringify(e));
      outerReject();
    });
  });
}

exports.initialize = function() {
  const logger = global.logger;
  logger.info("dbconnection.initialize entered");

  // sql commands to check if database is empty
  // and to create tables if necessary.
  const accountTable = global.accountTable = global.config.DB_TABLE_PREFIX + 'account';
  const clientTable = global.clientTable = global.config.DB_TABLE_PREFIX + 'client';
  const historyTable = global.historyTable = global.config.DB_TABLE_PREFIX + 'history';
  const showTables = `show tables;`;
  const createAccount = `CREATE TABLE ${accountTable} (
    id int(11) unsigned NOT NULL AUTO_INCREMENT,
    email varchar(100) COLLATE utf8_unicode_ci UNIQUE NOT NULL,
    password varchar(255) COLLATE utf8_unicode_ci NOT NULL,
    isAdmin TINYINT unsigned DEFAULT 0,
    accountClosedDateTime datetime DEFAULT NULL,
    created datetime NOT NULL,
    emailValidateToken varchar(20) NOT NULL,
    emailValidateTokenDateTime datetime NOT NULL,
    emailValidated datetime DEFAULT NULL,
    resetPasswordToken varchar(20) DEFAULT NULL,
    resetPasswordTokenDateTime datetime DEFAULT NULL,
    modified datetime NOT NULL,
    PRIMARY KEY (id),
    INDEX(email(100))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`;
  const createClient = `CREATE TABLE ${clientTable} (
    clientId bigint unsigned UNIQUE NOT NULL,
    email varchar(100) COLLATE utf8_unicode_ci NOT NULL,
    lastSync bigint unsigned NOT NULL,
    PRIMARY KEY (clientId),
    INDEX(email(100))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`;
  const createHistory = `CREATE TABLE ${historyTable} (
    timestamp bigint unsigned UNIQUE NOT NULL,
    email varchar(100) COLLATE utf8_unicode_ci NOT NULL,
    phrase varchar(10000) COLLATE utf8_unicode_ci NOT NULL,
    PRIMARY KEY (timestamp),
    INDEX(email(100))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`;

  getConnection().then(pool  => {
    logger.info("dbconnection.initialize we have a connection");
    checkForTables();
  }, () => {
    logger.error("dbconnection.initialize failed to get a connection");
  });

  let checkForTables = (() => {
    logger.info("checkForTables entered");
    pool.query(showTables, function (error, results, fields) {
      if (error) {
        logger.error("show tables error");
        logger.error(JSON.stringify(error));
      } else {
        logger.info("show tables success");
        let s = null;
        try {
          s = JSON.stringify(results);
          logger.info('results='+s);
        } catch(e) {
          logger.error("show tables results stringify error");
        } finally {
          if (s != null) {
            if (s.indexOf(accountTable) === -1 || global.config.DB_FORCE_CREATION) {
              dropAndMakeTables();
            } else {
              dbInitialized = true;
            }
          }
        }
      }
    });
  });

  let dropAndMakeTables = (() => {
    logger.info("dropAndMakeTables entered");
    let dropAndMakeTable = (tableName, createTable) => {
      logger.info('dropAndMakeTable entered. tableName='+tableName);
      return new Promise((resolve, reject) => {
        logger.info('dropAndMakeTable promise function entered. tableName='+tableName);
        const dropTable = `DROP TABLE IF EXISTS ${tableName};`;
        logger.info('dropAndMakeTable before drop table. tableName='+tableName);
        pool.query(dropTable, function (error, results, fields) {
          logger.info('dropAndMakeTable return from drop table. tableName='+tableName);
          if (error) {
            logger.error(`drop ${tableName} table error`);
            logger.error(JSON.stringify(error));
            reject();
          } else {
            logger.info(`drop ${tableName} table success`);
            logger.info(JSON.stringify(results));
            logger.info('dropAndMakeTable before create table. tableName='+tableName);
            pool.query(createTable, function (error, results, fields) {
              logger.info('dropAndMakeTable before create table. tableName='+tableName);
              if (error) {
                logger.error(`create ${tableName} table error`);
                logger.error(JSON.stringify(error));
                reject();
              } else {
                logger.info(`create ${tableName} table success`);
                logger.info(JSON.stringify(results));
                resolve();
              }
            });
          }
        });
      });
    };
    let accountPromise = dropAndMakeTable(accountTable, createAccount);
    let clientPromise = dropAndMakeTable(clientTable, createClient);
    let historyPromise = dropAndMakeTable(historyTable, createHistory);
    Promise.all([accountPromise, clientPromise, historyPromise]).then(values => {
      logger.info('dropAndMakeTables all promises resolved');
      dbInitialized = true;
    }, () => {
      logger.error('dropAndMakeTables promise rejected');
    }).catch(e => {
      logger.error('dropAndMakeTables promise catch. e='+JSON.stringify(e));
    });
  });

  let makeTables = (() => {
    logger.info("makeTables entered");
    let accountPromise = new Promise((resolve, reject) =>{

    });
  });
};
