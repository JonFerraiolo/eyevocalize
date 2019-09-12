
const mysql = require('mysql');

let connection;

exports.connect = function() {
  const logger = global.logger;
  const DB_FORCE_CREATION = global.config.DB_FORCE_CREATION;

  // sql commands to check if database is empty
  // and to create tables if necessary.
  const DB_TABLE_PREFIX = global.config.DB_TABLE_PREFIX;
  const accountTable = global.accountTable = DB_TABLE_PREFIX + 'account';
  const showTables = `show tables;`;
  const dropAccount = `DROP TABLE  IF EXISTS ${accountTable};`;
  const createAccount = `CREATE TABLE ${accountTable} (
    id int(11) unsigned NOT NULL AUTO_INCREMENT,
    firstName varchar(100) COLLATE utf8_unicode_ci NOT NULL,
    lastName varchar(100) COLLATE utf8_unicode_ci NOT NULL,
    email varchar(100) COLLATE utf8_unicode_ci UNIQUE NOT NULL,
    password varchar(255) COLLATE utf8_unicode_ci NOT NULL,
    agreement TINYINT unsigned DEFAULT 0,
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
    /*
  const adminInsert = `insert into ${accountTable}
    (firstName, lastName, email, password, agreement, isAdmin, created, emailValidateToken, emailValidateTokenDateTime, emailValidated, modified)
    VALUES('Jon', 'Ferraiolo', 'JONEMAIL', 'JONPASSWORD', 1, 1, now(), 'x', now(), now(), now());`;
    */

  connection = mysql.createConnection({
    host: global.config.DB_HOST,
    user: global.config.DB_USER,
    password: global.config.DB_PASSWORD,
    database: global.config.DB_DATABASE,
    debug: global.config.DB_DEBUG === 'true' ? true : false,
  });

  //FIXME what to do if connection is dropped?
  // err.code = 'PROTOCOL_CONNECTION_LOST'.
  // reconnecting a connection is done by establishing a new connection.
  connection.on('error', function(err) {
    logger.error('mysql error: '+err.code);
    logger.error(JSON.stringify(err));
  });

  connection.connect(function(error){
    if (!error) {
        logger.info("Database connected");
        dbinit();
    } else {
        logger.error("Database connection error");
        logger.error(JSON.stringify(error));
        process.exit(1);
    }
  });

  let dbinit = (() => {
    connection.query(showTables, function (error, results, fields) {
      if (error) {
        logger.error("show tables error");
        logger.error(JSON.stringify(error));
        process.exit(1);
      } else {
        logger.info("show tables success");
        logger.info(JSON.stringify(results));
        let s;
        try {
          s = JSON.stringify(results);
        } catch(e) {
          logger.error("show tables results stringify error");
          process.exit(1);
        }
        if (s.indexOf(accountTable)  === -1 || DB_FORCE_CREATION) {
          dropAndMakeTables();
        }
      }
    });
  });

  let dropAndMakeTables  = (() => {
    connection.query(dropAccount, function (error, results, fields) {
      if (error) {
        logger.error("drop account table error");
        logger.error(JSON.stringify(error));
        process.exit(1);
      } else {
        logger.info("drop account table success");
        logger.info(JSON.stringify(results));
        makeTables();
      }
    });
  });

  let makeTables  = (() => {
    connection.query(createAccount, function (error, results, fields) {
      if (error) {
        logger.error("create account table error");
        logger.error(JSON.stringify(error));
        process.exit(1);
      } else {
        logger.info("create account table success");
        logger.info(JSON.stringify(results));
      }
    });
  });
};

exports.getConnection = function() {
  return connection;
};
