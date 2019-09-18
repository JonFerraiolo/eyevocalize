
let mysql = require('mysql');

/*
FIXME Include explanation about how mysql on hosting provider
goes away after five minutes, so we need to verify the connection
before, each operation.
Also, how db initialization works
*/

let connection = null;
let dbInitialized = false;

const dbReady = function() {
  const logger = global.logger;
  return new Promise((outerResolve, outerReject) =>  {
    let connectionPromise = getConnection();
    let initializePromise = new Promise((resolve, reject) => {
      let initializeCounter = 0;
      let check = (() => {
        if (dbInitialized) {
          resolve();
        } else {
          if (initializeCounter >= 5) {
            reject();
          } else {
            initializeCounter++;
            setTimeout(() => {
              check();
            }, 3000);
          }
        }
      });
      check();
    });
    return Promise.all([connectionPromise, initializePromise]).then(function(values) {
      outerResolve(connection);
    }, () => {
      outerReject();
    });
  });
};
exports.dbReady = dbReady;

const getConnection = function() {
  const logger = global.logger;
  logger.info("enter getConnection");
  return new Promise((resolve, reject) => {
    if (connection) {
      logger.info("getConnection Immediate return, we have an active connection");
      resolve(connection);
    } else {
      logger.info("getConnection no active connection. Calling reconnect");
      reconnect().then(() => {
        logger.info("getConnection reconnect has returned a new connection");
        resolve(connection);
      }, () => {
        logger.error("getConnection reconnect failed");
        reject();
      });
    }
  });
};

//FIXME no reason to kill application if we cannot connect to database
let reconnectCounter;
function reconnect() {
  const logger = global.logger;
  logger.info("enter reconnect");
  reconnectCounter = 0;
  return new Promise((outerResolve, outerReject) => {
    function inner() {
      logger.info("enter reconnect/inner");
      return new Promise((innerResolve, innerReject) => {
        logger.info("before createConnection");
        try {
          connection = mysql.createConnection({
            host: global.config.DB_HOST,
            user: global.config.DB_USER,
            password: global.config.DB_PASSWORD,
            database: global.config.DB_DATABASE,
            debug: global.config.DB_DEBUG === 'true' ? true : false,
          });
        } catch(e) {
          logger.error('mysql createConnection error');
          logger.error('error: '+e.toString());
        }
        logger.info("after createConnection. connection="+connection);

        connection.on('error', function(err) {
          logger.error('mysql error: '+err.code);
          logger.error(JSON.stringify(err));
          // if(err.code === 'PROTOCOL_CONNECTION_LOST') {
          connection = null;
        });

        logger.info("before connect");
        connection.connect(function(error){
          if (!error) {
            logger.info("Database connected");
            innerResolve(connection);
          } else {
            logger.error("Database connection error");
            logger.error(JSON.stringify(error));
            connection = null;
            logger.info("checking reconnectCounter. reconnectCounter="+reconnectCounter);
            if (reconnectCounter >= 5) {
              innerReject(true) ; // too many retries, give up
            } else {
              reconnectCounter++;
              innerReject(false); // don't finish the outer promise yet, we will try again
              setTimeout(() => {
                inner().then(() => {
                  outerResolve(connection);
                }, finishOuter => {
                  if (finishOuter) {
                    outerReject();
                  }
                });
              }, 3000);
            }
          }
        });
      });
    }
    inner().then(() => {
      outerResolve(connection);
    }, finishOuter => {
      if (finishOuter) {
        outerReject();
      }
    });
  });
}

exports.initialize = function() {
  const logger = global.logger;
  logger.info("dbconnection.initialize entered");

  // sql commands to check if database is empty
  // and to create tables if necessary.
  const accountTable = global.accountTable = global.config.DB_TABLE_PREFIX + 'account';
  const showTables = `show tables;`;
  const dropAccount = `DROP TABLE  IF EXISTS ${accountTable};`;
  const createAccount = `CREATE TABLE ${accountTable} (
    id int(11) unsigned NOT NULL AUTO_INCREMENT,
    email varchar(100) COLLATE utf8_unicode_ci UNIQUE NOT NULL,
    password varchar(255) COLLATE utf8_unicode_ci NOT NULL,
    isAdmin TINYINT unsigned DEFAULT 0,
    created datetime NOT NULL,
    emailValidateToken varchar(20) NOT NULL,
    emailValidateTokenDateTime datetime NOT NULL,
    emailValidated datetime DEFAULT NULL,
    resetPasswordToken varchar(20) DEFAULT NULL,
    resetPasswordTokenDateTime datetime DEFAULT NULL,
    modified datetime NOT NULL,
    PRIMARY KEY (id),
    INDEX(email(100),emailValidateToken)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;`;
  const adminInsert = `insert into ${accountTable}
    (email, password, isAdmin, created, emailValidateToken, emailValidateTokenDateTime, emailValidated, modified)
    VALUES('JONEMAIL', 'JONPASSWORD', 1, now(), 'x', now(), now(), now());`;

  getConnection().then(connection => {
    logger.info("dbconnection.initialize we have a connection");
    checkForTables();
  }, () => {
    logger.error("dbconnection.initialize failed to get a connection");
  });

  let checkForTables = (() => {
    logger.info("checkForTables entered");
    connection.query(showTables, function (error, results, fields) {
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
    connection.query(dropAccount, function (error, results, fields) {
      if (error) {
        logger.error("drop account table error");
        logger.error(JSON.stringify(error));
      } else {
        logger.info("drop account table success");
        logger.info(JSON.stringify(results));
        makeTables();
      }
    });
  });

  let makeTables = (() => {
    logger.info("makeTables entered");
    connection.query(createAccount, function (error, results, fields) {
      if (error) {
        logger.error("create account table error");
        logger.error(JSON.stringify(error));
      } else {
        logger.info("create account table success");
        logger.info(JSON.stringify(results));
        dbInitialized = true; //FIXME probably don't need addAdmin
        addAdmin();
      }
    });
  });

  let addAdmin = (() => {
    logger.info("addAdmin entered");
    connection.query(adminInsert, function (error, results, fields) {
      if (error) {
        logger.error("insert admin account table error");
        logger.error(JSON.stringify(error));
      } else {
        logger.info("insert admin account table success");
        logger.info(JSON.stringify(results));
      }
    });
  });
};
