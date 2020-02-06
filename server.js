
const crypto = require('crypto');
const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const dbconnection = require('./server/dbconnection');
const sessionMgmt = require('./server/sessionMgmt');
const sessionRoutes = require('./server/sessionRoutes');

global.SITENAME = 'EyeVocalize';

// read site-specific configuration options and put into global.config
const rootDir = process.cwd();
let configFile = process.env.EVC_CONFIG;
if (!configFile) {
  console.error('no config file specified');
  process.exit(1);
}
if (configFile[0] != '/') {
  configFile = path.normalize(rootDir + '/' + configFile);
}
try {
  const configString = fs.readFileSync(configFile, 'utf8');
  global.config = JSON.parse(configString);
} catch(e) {
  console.error('config file read/parse error');
  console.dir(e);
  process.exit(1);
}

// set up global.logger
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const myFormat1 = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
const myFormat2 = combine(
    timestamp(),
    myFormat1
  );
let logdir = global.config.LOGDIR;
if (typeof logdir === 'string' && logdir.length > 0) {
  function ensureDirSync (dirpath) {
    try {
      fs.mkdirSync(dirpath, { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }
  if (logdir[0] != '/') {
    logdir = path.normalize(rootDir + '/' + logdir);
  }
  try {
    ensureDirSync(logdir);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
  const logfile = logdir + '/' + (new Date()).toISOString();
  global.logger = createLogger({
    format: myFormat2,
    transports: [
      new transports.File({ filename: logfile, handleExceptions: true })
    ],
    exitOnError: false
  });
} else {
  global.logger = createLogger({
    format: myFormat2,
    transports: [
      new transports.Console()
    ]
  });
}
const logger = global.logger;
let port = global.config.PORT;
let protocol = global.config.PROTOCOL;
const hostname = global.config.HOSTNAME;
logger.info('before https check. protocol='+protocol+', port='+port);
let credentials;
if (hostname === 'zeyevocalize.com' && protocol === 'https') {
  // special shenanigans for eyevocalize.com on A2 hosting because certs change every 90 days
  logger.info('https with eyevocalize.com');
  const ssldb = global.config.SSL_DB; // this file contains pointers to keys and certs
  const ssldir = global.config.SSL_DIR; // keys and certs are in this folder
  logger.info('ssldb='+ssldb+', ssldir='+ssldir);
  if (!fs.existsSync(ssldb)) {
    protocol = 'http'; // revert to http server, which will actually use https under hood
    port = '80';
  } else {
    logger.info('ssldb exists');
    let ssldbcontent;
    try {
      ssldbcontent = fs.readFileSync(ssldb).toString();
      logger.info('ssldb successful read');
      let prefix = 'eyevocalize_com_';
      let index1 = ssldbcontent.indexOf(prefix);
      let index2 = index1 + prefix.length;
      let index3 = ssldbcontent.substr(index2).indexOf(':');
      logger.info('index1='+index1+', index2='+index2+', index3='+index3);
      let id = ssldbcontent.Substr(index2, index3 - index2);
      logger.info('id='+id);
      let sslkey = ssldir + '/keys/' + id + '.key';
      let sslcert = ssldir + '/certs/' + prefix + id + '.crt';
      logger.info('ssldb='+ssldb+', ssldir='+ssldir);
      if (!fs.existsSync(sslkey) || !fs.existsSync(sslcert)) {
        protocol = 'http'; // revert to http server, which will actually use https under hood
        port = '80';
      } else {
        credentials = { key: sslkey, cert: sslcert };
        logger.info('credentials='+JSON.stringify(credentials));
      }
    } catch(e) {
      protocol = 'http'; // revert to http server, which will actually use https under hood
      port = '80';
    }
  }
} else if (protocol === 'https') {
  logger.info('https without eyevocalize.com');
  try {
    credentials = { key: fs.readFileSync(global.config.SSL_KEY), cert: fs.readFileSync(global.config.SSL_CERT) };
    logger.info('credentials='+JSON.stringify(credentials));
  } catch(e) {
    logger.info('fs read file failure for https');
    protocol = 'http'; // revert to http server, which will actually use https under hood
    port = '80';
  }
}
logger.info('after https check. protocol='+protocol+', port='+port);

dbconnection.initialize(); // kick off the connection to the db and any needed db inits
const app = express();
let httpServer;
logger.info('before calling createServer');
try {
  httpServer = protocol === 'https' ? https.createServer(credentials, app) : http.createServer(app);
} catch(e) {
  logger.info('exception when calling createServer. e='+e);
  protocol = 'http'; // revert to http server, which will actually use https under hood
  port = '80';
  httpServer = http.createServer(app);
}
logger.info('after calling createServer');
let io = require('socket.io')(httpServer);
logger.info('after creating io');

const authMiddleware = sessionMgmt.auth;
// this call results in app.use with session middleware, which needs to be first in line
sessionMgmt.init(app).then(() => {

  logger.info('server.js sessionMgmt.init successful return');
  app.use(express.static('client'));
  app.use(bodyParser.urlencoded({ extended: true })); // for uploading files
  app.use(bodyParser.json());
  app.use(function(req, res, next) { // strip trailing slash from path and redirect
    if (req.path.substr(-1) == '/' && req.path.length > 1) {
      let query = req.url.slice(req.path.length);
      res.redirect(301, req.path.slice(0, -1) + query);
    } else {
      next();
    }
  });
  app.get('/', (req, res) => res.sendFile(rootDir+'/index.html'));
  app.get(['/signup','/login', '/resetpassword', '/accountclosed'], (req, res) => res.sendFile(rootDir+'/session.html'));
  app.get(['/TermsOfUse','/PrivacyPolicy','/Cookies'], (req, res) => {
    fs.readFile(rootDir+'/legal.html', (err, html) => {
      if (err) { logSendSE(res, err, 'could not load '+req.path+' (html)'); }
      else {
        fs.readFile(rootDir+'/md'+req.path+'.md', (err, markdown) => {
          if (err) { logSendSE(res, err, 'could not load '+req.path+' (md)'); }
          else {
            const s = html.toString().replace('((EVMARKDOWN))', markdown.toString());
            res.send(s);
          }
        });
      }
    });
  });
  app.get('/app', (req, res) => {
    fs.readFile(rootDir+'/app.html', (err, data) => {
      if (err) { logSendSE(res, err, 'app.html'); }
      else {
        let email = (req.session && req.session.user && req.session.user.email) || '';
        const encryptedPW = (req.session && req.session.user && req.session.user.password) || '';
        sessionRoutes.doLoginValidate(req, res, email, encryptedPW, validLogin => {
          let checksum;
          if (validLogin) {
            let pwKey = crypto.createCipher('aes-128-cbc', global.config.HASH_SECRET2);
            checksum = pwKey.update(encryptedPW, 'utf8', 'hex')
            checksum += pwKey.final('hex');
          } else {
            email = checksum = '';
          }
          const s = data.toString().replace('((EVUSER))', email).replace('((EVCHECKSUM))', checksum);
          res.send(s);
        });
      }
    });
  });
  logger.info('server.js before setting up /api');
  global.apiBasePath = '/api';
  global.appUrl = global.config.BASE_URL + '/app';
  logger.info('server.js before setting up /signup');
  app.post('/api/signup', sessionRoutes.signup)
  app.post('/api/login', sessionRoutes.login)
  app.post('/api/autologin', sessionRoutes.autologin)
  app.post('/api/logout', sessionRoutes.logout)
  app.post('/api/resendverification', sessionRoutes.resendVerificationEmail)
  app.post('/api/sendresetpassword', sessionRoutes.sendResetPasswordEmail)
  app.get('/api/gotoresetpasswordpage/:token', sessionRoutes.gotoResetPasswordPage)
  app.post('/api/resetpassword', sessionRoutes.resetPassword)
  logger.info('server.js before setting up /api/verifyaccount');
  app.get('/api/verifyaccount/:token', sessionRoutes.verifyAccount)
  app.post('/api/closeaccount', sessionRoutes.closeAccount)
  app.get('/*', (req, res) => res.redirect(301, '/'));

  io.on('connection', function(socket){
    logger.info('user connected socket.id='+socket.id);
    socket.on('disconnect', function(){
      logger.info('user disconnected socket.id='+socket.id);
    });
    socket.on('ClientStartup', (msg, fn) => {
      logger.info('ClientStartup message was: '+msg);
      fn('server echoing '+msg);
    });
    sessionRoutes.initSocketMessages(socket);
  });

  logger.info('before calling listen on port');
  httpServer.listen(port, () => logger.info(`App listening on port ${port}!`));
  logger.info('after calling listen on port');

}, () => {
  logger.error('serverjs sessionMgmt.init promise reject.');
  process.exit(1);
}).catch(e => {
  logger.error('serverjs sessionMgmt.init promise error');
  logger.error('e='+JSON.stringify(e));
  process.exit(1);
});

/*
const envvars = require('./server/envvars');
envvars.check(); // exits if any env vars not set
const express = require("express");
const bodyParser = require('body-parser');
const dbconnection = require('./server/dbconnection');
const sessionMgmt = require('./server/sessionMgmt');
const sessionRoutes = require('./server/sessionRoutes');
const dataRoutes = require('./server/dataRoutes');
const hostname = global.config.HOSTNAME || 'localhost';
const port = global.config.PORT || 3000;
const rootDir = process.cwd();
const connection = dbconnection.getConnection();
const app = express();
// use something else, maybe debug. Look at package.json
//app.use(function(req, res, next) {
  //console.log('req.path='+req.path)
  //next()
//});
const authMiddleware = sessionMgmt.auth;
sessionMgmt.init(app, connection); // calls app.use with session middleware
app.use(bodyParser.urlencoded({ extended: true })); // for uploading files
app.use(bodyParser.json());
app.use(function(req, res, next) {
// need to study this. Don't need CORS. Maybe all is for CORS
  res.header("Access-Control-Allow-Origin", TEAM_CORS_ALLOWED_DOMAIN);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cookie");
  next();
});
app.use(express.static('client'));
app.get('/', (req, res) => res.sendFile(rootDir+'/client/app.html'));
const apiRouter = express.Router();
apiRouter.post('/signup', sessionRoutes.signup)
apiRouter.post('/login', sessionRoutes.login)
apiRouter.post('/logout', sessionRoutes.logout)
apiRouter.post('/loginexists', sessionRoutes.loginexists)
apiRouter.post('/resendverification', sessionRoutes.resendVerificationEmail)
apiRouter.get('/verifyaccount/:token', sessionRoutes.verifyAccount)
apiRouter.post('/sendresetpassword', sessionRoutes.sendResetPasswordEmail)
apiRouter.get('/gotoresetpasswordpage/:token', sessionRoutes.gotoResetPasswordPage)
apiRouter.post('/resetpassword', sessionRoutes.resetPassword)
apiRouter.post('/updatedata', authMiddleware, dataRoutes.updatedata)
app.use(apiRouter);
app.listen(port);
*/
