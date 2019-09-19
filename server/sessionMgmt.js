
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dbconnection = require('./dbconnection');

const SESSION_SECRET = global.config.SESSION_SECRET;

module.exports = {
  init: function(app) {

    dbconnection.dbReady().then(connection => {
      const options = {};
      const sessionStore = new MySQLStore(options, connection);

      app.use(session({
          cookie: { secure: false , maxAge:5*60*1000  }, // FIXME secure:true once https
          proxy: true,
          secret: SESSION_SECRET,
          store: sessionStore,
          resave: true,
          rolling: true,
          saveUninitialized: false
      }));
    })
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
