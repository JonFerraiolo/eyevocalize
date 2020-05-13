
const crypto = require('crypto');
const express = require('express');
const http = require('http');
const https = require('https');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const localizationIndex = require('./localization/index');
const dbconnection = require('./server/dbconnection');
const sessionMgmt = require('./server/sessionMgmt');
const sessionRoutes = require('./server/sessionRoutes');
const miscRoutes = require('./server/miscRoutes');
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
    protocol = 'http'; // revert to http server, which at EyeVocalize.com will actually use https under hood
    port = '80';
  }
}
logger.info('after https check. protocol='+protocol+', port='+port);

let localizationLanguages = localizationIndex.map(item => {
  for (let language in item) {
    return language; // should be only one property, and the name of the property is the language identifier
  }
});
let localizationFilenames = localizationIndex.map(item => {
  for (let language in item) {
    return item[language]; // should be only one property, and we return the value of the property, which is folder name
  }
});

dbconnection.initialize(); // kick off the connection to the db and any needed db inits
const app = express();
let httpServer;
logger.info('before calling createServer');
try {
  httpServer = protocol === 'https' ? https.createServer(credentials, app) : http.createServer(app);
} catch(e) {
  logger.error('exception when calling createServer. e='+e);
  protocol = 'http'; // revert to http server, which will actually use https under hood
  port = '80';
  httpServer = http.createServer(app);
}
logger.info('after calling createServer');
let io = require('socket.io')(httpServer, global.config.SOCKETIO_OPTIONS);
logger.info('after creating io');

// Merge user language localization object into default language localization object
// to ensure each possible localization key has a value
// this routine assumes localization objects have only one level of subobjects
// and every string is within a subobject
let deepMergeLang = (dft, user) => {
  let returnObj = {};
  Object.keys(dft).forEach(key => {
    if (Array.isArray(dft[key]) && Array.isArray(user[key])) {
      returnObj[key] = JSON.parse(JSON.stringify(user[key]));
    } else if (typeof dft[key] === 'object' && typeof user[key] === 'object') {
      returnObj[key] = {};
      Object.assign(returnObj[key], dft[key], user[key]);
    }
  });
  return returnObj;
};
let getLangJson = req => {
  let langIndex = req.query.lang ? localizationLanguages.indexOf(req.query.lang) : -1;
  if (langIndex === -1) {
    let lang = req.acceptsLanguages(localizationLanguages) || 'en';
    langIndex = localizationLanguages.indexOf(lang);
  }
  let userLangFileName = './localization/'+localizationFilenames[langIndex];
  let defaultLangFileName = './localization/en-us';
  let defaultLangObj = require(defaultLangFileName);
  let userLangObj = require(userLangFileName);
  let langObj = deepMergeLang(defaultLangObj, userLangObj);
  return JSON.stringify(langObj, '\t');
};

const authMiddleware = sessionMgmt.auth;
// this call results in app.use with session middleware, which needs to be first in line
sessionMgmt.init(app).then(() => {

  logger.info('server.js sessionMgmt.init successful return');
  app.use(compression());
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
  app.get(['/', '/About', '/TermsOfUse','/PrivacyPolicy','/Cookies','/Contact'], (req, res) => {
    let langJson = getLangJson(req);
    if (!langJson) {
      let msg = 'could not get localization file ';
      logSendSE(res, msg, msg);
      return;
    }
    fs.readFile(rootDir+'/index.html', (err, data) => {
      if (err) { logSendSE(res, err, 'index.html'); }
      else {
        const s = data.toString().replace('((EvcLocalization))', langJson);
        res.send(s);
      }
    });
  });
  app.get(['/signup','/login', '/resetpassword', '/accountclosed'], (req, res) => {
    let langJson = getLangJson(req);
    if (!langJson) {
      let msg = 'could not get localization file ';
      logSendSE(res, msg, msg);
      return;
    }
    fs.readFile(rootDir+'/session.html', (err, data) => {
      if (err) { logSendSE(res, err, 'session.html'); }
      else {
        const s = data.toString().replace('((EvcLocalization))', langJson);
        res.send(s);
      }
    });
  });
  app.get('/app', (req, res) => {
    let langJson = getLangJson(req);
    if (!langJson) {
      let msg = 'could not get localization file ';
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
            .replace('((EvcLocalization))', langJson);
          res.send(s);
        });
      }
    });
  });
  global.apiBasePath = '/api';
  global.appUrl = global.config.BASE_URL + '/app';
  let authMiddleware = sessionMgmt.auth;
  app.post('/api/signup', sessionRoutes.signup)
  app.post('/api/login', sessionRoutes.login)
  app.post('/api/autologin', sessionRoutes.autologin)
  app.post('/api/logout', sessionRoutes.logout)
  app.post('/api/resendverification', sessionRoutes.resendVerificationEmail)
  app.post('/api/sendresetpassword', sessionRoutes.sendResetPasswordEmail)
  app.get('/api/gotoresetpasswordpage/:token', sessionRoutes.gotoResetPasswordPage)
  app.post('/api/resetpassword', sessionRoutes.resetPassword)
  app.get('/api/verifyaccount/:token', sessionRoutes.verifyAccount)
  app.post('/api/closeaccount', sessionRoutes.closeAccount);
  app.post('/api/getFavoritesFromURL', authMiddleware, miscRoutes.getFavoritesFromURL);
  app.get('/*', (req, res) => {
    res.redirect(301, '/');
  });

  logger.info('before calling listen on port');
  httpServer.listen(port, () => logger.info(`App listening on port ${port}!`));
  logger.info('after calling listen on port');

  io.on('connection', function(socket){
    clientSocket.onConnect(socket);
    socket.on('disconnect', function(){
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
