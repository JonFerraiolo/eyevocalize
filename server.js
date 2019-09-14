const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const dbconnection = require('./server/dbconnection');
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
      new transports.File({ filename: logfile })
    ]
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
const port = global.config.PORT;

dbconnection.connect();
const app = express();
app.use(express.static('client'));
app.use(bodyParser.urlencoded({ extended: true })); // for uploading files
app.use(bodyParser.json());
app.get('/', (req, res) => res.sendFile(rootDir+'/client/app.html'));
app.post('/api/signup', sessionRoutes.signup)

app.listen(port, () => logger.info(`App listening on port ${port}!`));

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
