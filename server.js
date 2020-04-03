
const crypto = require('crypto');
const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const localizationIndex = require('./localization/index');
const dbconnection = require('./server/dbconnection');
const sessionMgmt = require('./server/sessionMgmt');
const sessionRoutes = require('./server/sessionRoutes');
const clientSocket = require('./server/clientSocket');

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
  const logfile = logdir + '/' + (new Date()).toISOString().substr(0,10);
  global.logger = createLogger({
    format: myFormat2,
    transports: [
      new transports.File({ stream: fs.createWriteStream(logfile, {flags: 'a'}), handleExceptions: true })
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
logger.info('');
logger.info('');
logger.info('===== New process =====');
logger.info('before https check. protocol='+protocol+', port='+port);
let credentials;
if (protocol === 'https') {
  logger.info('https');
  try {
    credentials = { key: fs.readFileSync(global.config.SSL_KEY), cert: fs.readFileSync(global.config.SSL_CERT) };
    logger.info('credentials='+JSON.stringify(credentials));
  } catch(e) {
    logger.info('fs read file failure for https');
    protocol = 'http'; // revert to http server, which at Eyevocalize.com will actually use https under hood
    port = '80';
  }
}
logger.info('after https check. protocol='+protocol+', port='+port);

logger.info('localizationIndex='+JSON.stringify(localizationIndex));
let localizationLanguages = localizationIndex.map(item => {
  for (let language in item) {
    return language; // should be only one property, and the name of the property is the language identifier
  }
});
logger.info('localizationLanguages='+JSON.stringify(localizationLanguages));
let localizationFilenames = localizationIndex.map(item => {
  for (let language in item) {
    return item[language]; // should be only one property, and we return the value of the property, which is folder name
  }
});
logger.info('localizationFilenames='+JSON.stringify(localizationFilenames));

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
let io = require('socket.io')(httpServer, global.config.SOCKETIO_OPTIONS);
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
    let langIndex = req.query.lang ? localizationLanguages.indexOf(req.query.lang) : -1;
    logger.info('1 langIndex='+langIndex);
    if (langIndex === -1) {
      let lang = req.acceptsLanguages(localizationLanguages) || 'en';
      logger.info('app lang='+lang);
      langIndex = localizationLanguages.indexOf(lang);
      logger.info('2 langIndex='+langIndex);
    }
    let langFileName = rootDir+'/localization/'+localizationFilenames[langIndex]+'.js';
    logger.info('langFileName='+langFileName);
    let langJs = fs.readFileSync(langFileName);
    if (!langJs) {
      let msg = 'could not read file '+langFileName;
      logSendSE(res, msg, msg);
      return;
    }
    fs.readFile(rootDir+'/app.html', (err, data) => {
      if (err) { logSendSE(res, err, 'app.html'); }
      else {
        let email = (req.session && req.session.user && req.session.user.email) || '';
        const encryptedPW = (req.session && req.session.user && req.session.user.password) || '';
        logger.info('/app before doLoginValidate. email='+email+', encryptedPW='+encryptedPW);
        sessionRoutes.doLoginValidate(req, res, email, encryptedPW, validLogin => {
          logger.info('/app after doLoginValidate. validLogin='+validLogin);
          let checksum;
          if (validLogin) {
            let pwKey = crypto.createCipher('aes-128-cbc', global.config.HASH_SECRET2);
            checksum = pwKey.update(encryptedPW, 'utf8', 'hex')
            checksum += pwKey.final('hex');
          } else {
            email = checksum = '';
          }
          const s = data.toString().replace('((EVUSER))', email)
            .replace('((EVCHECKSUM))', checksum)
            .replace('((EvcLocalization))', langJs);
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
  app.post('/api/closeaccount', sessionRoutes.closeAccount);
  app.get('/*', (req, res) => res.redirect(301, '/'));

  logger.info('before calling listen on port');
  httpServer.listen(port, () => logger.info(`App listening on port ${port}!`));
  logger.info('after calling listen on port');

  io.on('connection', function(socket){
    logger.info('user connected');
    clientSocket.onConnect(socket);
    socket.on('disconnect', function(){
      logger.info('user disconnected');
      clientSocket.onDisconnect(socket);
    });
  });

}, () => {
  logger.error('serverjs sessionMgmt.init promise reject.');
  process.exit(1);
}).catch(e => {
  logger.error('serverjs sessionMgmt.init promise error');
  logger.error('e='+JSON.stringify(e));
  process.exit(1);
});
