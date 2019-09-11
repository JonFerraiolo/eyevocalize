
const mysql = require('mysql');

let connection;

exports.connect = function() {
  const logger = global.logger;

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
    } else {
        logger.error("Database connection error");
        logger.error(JSON.stringify(error));
        process.exit(1);
    }
  });
};

exports.getConnection = function() {
  return connection;
};
