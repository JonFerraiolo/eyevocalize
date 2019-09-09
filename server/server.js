const express = require('express');
const path = require('path');
const app = express();
const appserver = process.env.EVC_APPSERVER || 'localhost';
const port = process.env.EVC_PORT || 3000;
const rootDir = process.cwd();

app.use(express.static(path.normalize(rootDir+'/../client')));
app.get('/', (req, res) => res.sendFile(path.normalize(rootDir+'/../client/app.html')));

app.listen(port, () => console.log(`App listening on port ${port}!`));

/*
const envvars = require('./server/envvars');
envvars.check(); // exits if any env vars not set

const express = require("express");
const bodyParser = require('body-parser');
const dbconnection = require('./server/dbconnection');
const sessionMgmt = require('./server/sessionMgmt');
const sessionRoutes = require('./server/sessionRoutes');
const dataRoutes = require('./server/dataRoutes');

const hostname = process.env.EVC_HOSTNAME || 'localhost';
const port = process.env.EVC_PORT || 3000;
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
