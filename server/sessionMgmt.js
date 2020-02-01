
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dbconnection = require('./dbconnection');

module.exports = {
  init: function(app) {
    const logger = global.logger;
    logger.info('sessionMgmt.init entered');
    return new Promise((resolve, reject) => {
      logger.info('sessionMgmt.init before calling dbReady');
      dbconnection.dbReady().then(connectionPool => {
        logger.info('sessionMgmt.init dbReady then return ok');
        let options = {
          checkExpirationInterval: 60*60*1000,// How frequently expired sessions will be cleared; milliseconds.
          expiration: 24*60*60*1000,// The maximum age of a valid session; milliseconds.
          useConnectionPooling: true,// Whether or not to use connection pooling.
          keepAlive: true,// Whether or not to send keep-alive pings on the database connectionPool.
          keepAliveInterval: 60*60*1000,// How frequently keep-alive pings will be sent; milliseconds
        };
        try {
          logger.info('sessionMgmt.init before getting sessionStore');
          let sessionStore = new MySQLStore(options, connectionPool);
          logger.info('sessionMgmt.init after getting sessionStore');
          app.use(session({
              cookie: { secure: false , maxAge:24*60*60*1000 }, // FIXME secure:true once https
              proxy: true,
              secret: global.config.HASH_SECRET1,
              store: sessionStore,
              resave: false,
              saveUninitialized: false
          }));
          logger.info('sessionMgmt.init after app.use');
          resolve();
        } catch(e) {
          logger.error('setting store error');
          reject();
        }
      }, err => {
        logger.error('sessionMgmt.init dbReady failed');
        reject();
      }).catch(e => {
        logger.error('sessionMgmt.init promise error');
        logger.error('e='+JSON.stringify(e));
        reject();
      });
    });
  },

  // Authentication and Authorization Middleware
  auth: function(req, res, next) {
    console.log('auth typeof req='+typeof req);
    console.log('auth typeof req.session='+typeof req.session);
    console.log('req.session.id='+req.session.id);
    console.log('auth typeof req.session.user='+typeof req.session.user);
    if (req.session && req.session.user)
      return next();
    else
      return res.sendStatus(401);
  }

}
