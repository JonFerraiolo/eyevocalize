
const crypto = require('crypto');
const dbconnection = require('./dbconnection');
/*
const sendMail = require('./sendMail')
const getUserObject = require('./getUserObject')
*/
const getUserObject = ((email, alreadyHave) => { //FIXME temp
  return new Promise((resolve, reject) => {
    resolve(alreadyHave);
  });
});
const logSend = require('./logSend')
const logSendOK = logSend.logSendOK
const logSendCE = logSend.logSendCE
const logSendSE = logSend.logSendSE

const SITENAME = global.SITENAME;
/*
const BASE_URL = global.config.BASE_URL
const API_RELATIVE_PATH = global.config.API_RELATIVE_PATH
const UI_RELATIVE_PATH = global.config.UI_RELATIVE_PATH
*/
/*
const apiUrl = BASE_URL + API_RELATIVE_PATH
const teamUrl = BASE_URL + UI_RELATIVE_PATH
const resendVerificationUrl = teamUrl + '/resendverification'
const forgotPasswordUrl = teamUrl + '/forgot'
const resetPasswordUrl = teamUrl + '/resetpassword'
*/
const USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS'
const USER_ALREADY_LOGGED_IN = 'USER_ALREADY_LOGGED_IN'
const EMAIL_NOT_REGISTERED = 'EMAIL_NOT_REGISTERED'
const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED'
const EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED'
const INCORRECT_PASSWORD = 'INCORRECT_PASSWORD'
const TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND'
const TOKEN_EXPIRED = 'TOKEN_EXPIRED'
const UNSPECIFIED_SYSTEM_ERROR = 'UNSPECIFIED_SYSTEM_ERROR'

//FIXME don't put credentials into log files
exports.signup = function(req, res, next) {
  logger.info('signup req.session='+req.session);
  dbconnection.dbReady().then(connectionPool => {
    const logger = global.logger;
    const accountTable = global.accountTable;
    logger.info('signup req.body='+req.body);
    try { logger.info(JSON.stringify(req.body)); } catch(e) { logger.error('stringify error'); }
    let now = new Date();
    let account = {
       email: req.body.email,
       password: req.body.password,
       emailValidateToken: null,
       emailValidateTokenDateTime: now,
       created: now,
       modified: now
     }
     const token = makeToken(account)
     account.emailValidateToken = token
     connectionPool.query(`SELECT email FROM ${accountTable} WHERE email = ?`, [account.email], function (error, results, fields) {
       if (error) {
         logSendSE(res, error, "signup select account database failure for email '" + account.email + "'");
       } else {
         if (results.length >= 1) {
           logSendCE(res, 401, USER_ALREADY_EXISTS, "signup account already exists: '" + account.email + "'");
         } else {
           connectionPool.query(`INSERT INTO ${accountTable} SET ?`, account, function (error, results, fields) {
             if (error) {
               logSendSE(res, error, "Insert new account insert database failure for email '" + account.email + "'");
             } else {
               account.id = results.insertId;
               sendAccountVerificationEmailToUser(account, function(error, result) {
                 if (error) {
                   logger.error("Insert new account email send failure for email '" + account.email + "', error= ", error);
                   connectionPool.query(`DELETE FROM ${accountTable} WHERE email = ?`, [account.email], function (error, results, fields) {
                     if (error) {
                       logger.error('DELETE failed after sendMail failure. error='+error)
                     }
                     res.send(500, { msg, error: UNSPECIFIED_SYSTEM_ERROR })
                   });
                 } else {
                   getUserObject(account.email, {account}).then(userObject => {
                     logSendOK(res, userObject, "Insert new account success for email '" + account.email + "'");
                   }).catch(error => {
                     logSendSE(res, error, 'getUserObjectError');
                   });
                 }
               });
             }
           });
         }
       }
     });
  }, () => {
    logSendSE(res, null, "signup: no database connection");
  }).catch(e => {
    logSendSE(res, e, "signup: promise error");
  });
}

exports.login = function(req, res, next) {
  dbconnection.dbReady().then(connectionPool => {
    const logger = global.logger;
    const accountTable = global.accountTable;
    logger.info('login req.body='+req.body);
    try { logger.info(JSON.stringify(req.body)); } catch(e) { logger.error('stringify error'); }
    const email = req.body.email;
    const password = req.body.password;
    logger.info('email='+email);
    connectionPool.query('SELECT * FROM ${accountTable} WHERE email = ?', [email], function (error, results, fields) {
      if (error) {
        logSendSE(res, error, "Select account failure for email '" + email + "'");
      } else {
        let msg = "Select account success for email '" + email + "'";
        logger.info(msg + ", results= ", results);
        if (results.length < 1) {
          logSendCE(res, 401, EMAIL_NOT_REGISTERED, "No account for '" + email + "'");
        } else {
          let account = results[0]
          if (!account.emailValidated) {
            logSendCE(res, 401, EMAIL_NOT_VERIFIED, "Account for '" + email + "' has not been verified yet via email");
          } else {
            if (account.password === password) {
              logger.info('Before calling session login.  User='+account);
              logger.info(account);
              logger.info('req.session.id='+req.session.id);
              req.session.user = account;
              logger.info('login after regenerate req.session.id='+req.session.id);
              getUserObject(account.email, { account }).then(userObject => {
                logSendOK(res, userObject, "Login success for email '" + email + "'");
              }).catch(error => {
                logSendSE(res, error, 'login getUserObject');
              });
            } else {
              logSendCE(res, 401, INCORRECT_PASSWORD, "Login failure for email '" + email + "'");
            }
          }
        }
      }
    });
  }, () => {
    logSendSE(res, null, "login: no database connection");
  }).catch(e => {
    logSendSE(res, e, "login: promise error");
  });
}

exports.logout = function(req, res, next) {
  logger.info('logout req.body='+req.body);
  logger.info(req.body);
  logger.info('req.session.id='+req.session.id);
  if (req.session) {
    req.session.user = null;
  }
  logSendOK(res, null, "Logout success");
}

exports.loginexists = function(req, res, next) {
  dbconnection.dbReady().then(connectionPool => {
    const logger = global.logger;
    const accountTable = global.accountTable;
    logger.info('loginexists req.body=');
    try { logger.info(JSON.stringify(req.body)); } catch(e) { logger.error('stringify error'); }
    const email = req.body.email;
    logger.info('email='+email);
    connectionPool.query('SELECT email FROM ${accountTable} WHERE email = ?', [email], function (error, results, fields) {
      if (error) {
        logSendSE(res, error, "loginexists failure for email '" + email + "'");
      } else {
        let exists = (results.length > 0)
        logSendOK(res, { email, exists }, "loginexists success for email '" + email + "'");
      }
    });
  }, () => {
    logSendSE(res, null, "loginexists: no database connection");
  }).catch(e => {
    logSendSE(res, e, "loginexists: promise error");
  });
}
/*
exports.resendVerificationEmail = function(req, res, next) {
  logger.info('resendVerificationEmail req.body='+req.body);
  logger.info(req.body);
  const email = req.body.email;
  logger.info('email='+email);
  connectionPool.query('SELECT * FROM ${accountTable} WHERE email = ?', [email], function (error, results, fields) {
    if (error) {
      logSendSE(res, error, "resendVerificationEmail database failure for email '" + email + "'");
    } else {
      let msg = "resendVerificationEmail database success for email '" + email + "'";
      logger.info(msg + ", results= ", results);
      let exists = (results.length > 0)
      if (exists) {
        const account = results[0]
        if (account.emailValidated) {
          logSendCE(res, 400, EMAIL_ALREADY_VERIFIED, "resendVerificationEmail account already verified for email '" + email + "'");
        } else {
          const token = makeToken(account)
          let now = new Date();
          connectionPool.query('UPDATE ${accountTable} SET emailValidateToken = ?, emailValidateTokenDateTime = ?, modified = ? WHERE email = ?', [token, now, now, email], function (error, results, fields) {
            if (error) {
              logSendSE(res, error, "resendVerificationEmail update database failure for email '" + account.email + "'");
            } else {
              account.emailValidateToken = token
              account.emailValidateTokenDateTime = now
              account.modified = now
              sendAccountVerificationEmailToUser(account, function(error, result) {
                delete account.password
                if (error) {
                  logSendSE(res, error, "resendVerificationEmail email send failure for email '" + account.email + "'");
                } else {
                  getUserObject(account.email, {account}).then(userObject => {
                    logSendOK(res, userObject, "resendVerificationEmail success for email '" + account.email + "'");
                  }).catch(error => {
                    logSendSE(res, error, 'getUserObjectError');
                  });
                }
              });
            }
          });
        }
      } else {
        let msg = "No account for '" + email + "'";
        logger.error(msg);
        res.send(401, { msg, error: EMAIL_NOT_REGISTERED })
      }
    }
  });
}

exports.sendResetPasswordEmail = function(req, res, next) {
  logger.info('sendResetPasswordEmail req.body='+req.body);
  logger.info(req.body);
  const email = req.body.email;
  logger.info('email='+email);
  connectionPool.query('SELECT * FROM ${accountTable} WHERE email = ?', [email], function (error, results, fields) {
    if (error) {
      logSendSE(res, error, "sendResetPasswordEmail database failure for email '" + email + "'");
    } else {
      let msg = "sendResetPasswordEmail database success for email '" + email + "'";
      logger.info(msg + ", results= ", results);
      let exists = (results.length > 0)
      if (exists) {
        const account = results[0]
        const token = makeToken(account)
        let now = new Date();
        connectionPool.query('UPDATE ${accountTable} SET resetPasswordToken = ?, resetPasswordTokenDateTime = ?, modified = ? WHERE email = ?', [token, now, now, email], function (error, results, fields) {
          if (error) {
            logSendSE(res, error, "sendResetPasswordEmail update database failure for email '" + account.email + "'");
          } else {
            account.resetPasswordToken = token
            account.resetPasswordTokenDateTime = now
            account.modified = now
            sendResetPasswordEmailToUser(account, function(error, result) {
              delete account.password
              if (error) {
                logSendSE(res, error, "sendResetPasswordEmail email send failure for email '" + account.email + "'");
              } else {
                logger.info("results= ", results);
                getUserObject(account.email, {account}).then(userObject => {
                  logSendOK(res, userObject, "sendResetPasswordEmail success for email '" + account.email + "'");
                }).catch(error => {
                  logSendSE(res, error, 'getUserObjectError');
                });
              }
            });
          }
        });
      } else {
        logSendCE(res, 401, EMAIL_NOT_REGISTERED, "No account for '" + email + "'");
      }
    }
  });
}

exports.verifyAccount = function(req, res, next) {
  logger.info('verifyAccount req.params='+req.params);
  logger.info(req.params);
  let token = req.params.token
  res.type('html')
  connectionPool.query('SELECT email, emailValidateTokenDateTime FROM ${accountTable} WHERE emailValidateToken = ?', [token], function (error, results, fields) {
    if (error || results.length !== 1) {
      let msg = "verifyAccount failure for token '" + token + "'";
      logger.info(msg + ", error= ", error, 'results=', JSON.stringify(results));
      let html = `<html><body>
  <h1>Account Verification Failure</h1>
  <p>This is most likely because you clicked on Activate My Account from an older account verification email.
    Only the most recent account verification email will work correctly.
    If you are unsure which email is the most recent,
    put all existing verification emails into the Trash,
    then go to <a href="${resendVerificationUrl}">${resendVerificationUrl}</a> to request a brand new account verification email.</p>
</body></html>`
      res.send(html)
    } else {
      logger.info("results= ", JSON.stringify(results));
      let { email, emailValidateTokenDateTime } = results[0]
      logger.info('typeof emailValidateTokenDateTime= ', typeof emailValidateTokenDateTime)
      let msg = "verifyAccount success for email '" + email + "'";
      let now = new Date();
      let twentyfourHoursAgo = (new Date().getTime() - (24 * 60 * 60 * 1000));
      let tokenTime = emailValidateTokenDateTime.getTime()
      logger.info('tokenTime='+tokenTime+', twentyfourHoursAgo='+twentyfourHoursAgo)
      if (tokenTime < twentyfourHoursAgo) {
        let html = `<html><body>
<h1>Sorry! Verification expiration</h1>
<p>Please go to <a href="${resendVerificationUrl}">${resendVerificationUrl}</a> to request a new account verification email.</p>
</body></html>`
        res.send(html)
      } else {
        logger.info('now='+now+', email='+email)
        connectionPool.query('UPDATE ${accountTable} SET emailValidated = ?, modified = ? WHERE email = ?', [now, now, email], function (error, results, fields) {
          logger.info('error='+error+", results= ", JSON.stringify(results));
          if (error) {
            let msg = "verifyAccount update emailValidated database failure for email '" + account.email + "'";
            logger.info(msg + ", error= ", error);
            let html = `<html><body>
  <h1>Sorry! Unknown system error</h1>
  <p>Please send email to info@${BASE_URL} to report the problem.</p>
</body></html>`
logger.info('html='+html) ;
            res.send(html)
          } else {
            logger.info('before setting html ')
            let html = `<html><body>
  <h1>Account verified!</h1>
  <p> Now you can go to <a href="${teamUrl}">${teamUrl}</a> to start contributing to ${SITENAME}.</p>
</body></html>`
            res.send(html)
          }
        });
      }
    }
  });
}

exports.gotoResetPasswordPage = function(req, res, next) {
  logger.info('gotoResetPasswordPage req.params='+req.params);
  logger.info(req.params);
  let token = req.params.token
  res.type('html')
  connectionPool.query('SELECT email, resetPasswordTokenDateTime FROM ${accountTable} WHERE resetPasswordToken = ?', [token], function (error, results, fields) {
    if (error || results.length !== 1) {
      let msg = "gotoResetPasswordPage failure for token '" + token + "'";
      logger.info(msg + ", error= ", error, 'results=', JSON.stringify(results));
      let html = `<html><body>
  <h1>Reset Password Failure</h1>
  <p>This is most likely because you clicked on Reset My Password from an older password reset email.
    Only the most recent password reset email will work correctly.
    If you are unsure which email is the most recent,
    put all existing password reset emails into the Trash,
    then go to <a href="${forgotPasswordUrl}">${forgotPasswordUrl}</a> to request a brand new password reset email.</p>
</body></html>`
      res.send(html)
    } else {
      logger.info("results= ", JSON.stringify(results));
      let { email, resetPasswordTokenDateTime } = results[0]
      logger.info('typeof resetPasswordTokenDateTime= ', typeof resetPasswordTokenDateTime)
      let msg = "gotoResetPasswordPage success for email '" + email + "'";
      let now = new Date();
      let twentyfourHoursAgo = (new Date().getTime() - (24 * 60 * 60 * 1000));
      let tokenTime = resetPasswordTokenDateTime.getTime()
      logger.info('tokenTime='+tokenTime+', twentyfourHoursAgo='+twentyfourHoursAgo)
      if (tokenTime < twentyfourHoursAgo) {
        let html = `<html><body>
<h1>Reset password expiration</h1>
<p>Please go to <a href="${forgotPasswordUrl}">${forgotPasswordUrl}</a> to request a new password reset email.</p>
</body></html>`
        res.send(html)
      } else {
        logger.info('before sending redirect')
        res.redirect(302, resetPasswordUrl+'?t='+token)
      }
    }
  });
}

exports.resetPassword = function(req, res, next) {
  logger.info('resetpassword req.body='+req.body);
  logger.info(req.body);
  const password = req.body.password;
  const token = req.body.token;
  logger.info('req.session.id='+req.session.id);
  connectionPool.query('SELECT email, resetPasswordTokenDateTime FROM ${accountTable} WHERE resetPasswordToken = ?', [token], function (error, results, fields) {
    if (error || results.length !== 1) {
      logSendCE(res, 400, TOKEN_NOT_FOUND, "resetPassword select failure for token '" + token + "'");
    } else {
      logger.info("results= ", JSON.stringify(results));
      let { email, resetPasswordTokenDateTime } = results[0]
      logger.info('typeof resetPasswordTokenDateTime= ', typeof resetPasswordTokenDateTime)
      let msg = "resetPassword success for email '" + email + "'";
      let now = new Date();
      let twentyfourHoursAgo = (new Date().getTime() - (24 * 60 * 60 * 1000));
      let tokenTime = resetPasswordTokenDateTime.getTime()
      logger.info('tokenTime='+tokenTime+', twentyfourHoursAgo='+twentyfourHoursAgo)
      if (tokenTime < twentyfourHoursAgo) {
        logSendCE(res, 400, TOKEN_EXPIRED, "resetPassword expired token for email '" + email + "'");
      } else {
        logger.info('now='+now+', email='+email)
        connectionPool.query('UPDATE ${accountTable} SET password = ?, resetPasswordToken = NULL, resetPasswordTokenDateTime = NULL, modified = ? WHERE email = ?', [password, now, email], function (error, results, fields) {
          logger.info('error='+error+", results= ", JSON.stringify(results));
          if (error) {
            logSendSE(res, error, "resetPassword update resetPasswordToken database failure for email '" + account.email + "'");
          } else {
            logSendOK(res, null, 'resetpassword success');
          }
        });
      }
    }
  });
}
*/
function sendAccountVerificationEmailToUser(account, callback) {
  callback(null, null)
  /*
  const url = apiUrl + '/verifyaccount/' + account.emailValidateToken
  const name = account.firstName+' '+account.lastName;
  const params = {
    html: `<p>Welcome to the ${SITENAME} team!</p>
  <p>Please click on this link: </p>
  <p>&nbsp;&nbsp;&nbsp;&nbsp;<a href="${url}" style="font-size:110%;color:darkblue;font-weight:bold;">Activate My Account</a></p>
  <p>to complete the signup process.</p>`,
    text: 'Welcome to the '+SITENAME+' team!\n\nPlease go to the following URL in a Web browser to Activate Your Account and complete the signup process:\n\n'+url,
    subject: 'Please confirm your '+SITENAME+' account',
    email: account.email,
    name: name
  };
  sendMail(params, function(err, result) {
    if (err) {
      logger.error('sendAccountVerificationEmailToUser sendMail failed! err='+JSON.stringify(err));
    } else {
      logger.info('sendAccountVerificationEmailToUser sendMail no errors.  result='+JSON.stringify(result));
    }
    callback(err, result)
  });
  */
}
/*
function sendResetPasswordEmailToUser(account, callback) {
  const url = apiUrl + '/gotoresetpasswordpage/' + account.resetPasswordToken
  const name = account.firstName+' '+account.lastName;
  const params = {
    html: `<p>Reset your ${SITENAME} password</p>
  <p>Please click on this link to reset your password: </p>
  <p>&nbsp;&nbsp;&nbsp;&nbsp;<a href="${url}" style="font-size:110%;color:darkblue;font-weight:bold;">Reset My Password</a></p>`,
    text: 'Please go to the following URL in a Web browser to reset your password:\n\n'+url,
    subject: 'Reset your '+SITENAME+' password',
    email: account.email,
    name: name
  };
  sendMail(params, function(err, result) {
    if (err) {
      logger.error('sendResetPasswordEmailToUser sendMail failed! err='+JSON.stringify(err));
    } else {
      logger.info('sendResetPasswordEmailToUser sendMail no errors.  result='+JSON.stringify(result));
    }
    callback(err, result)
  });
}
*/
function makeToken(account) {
  const buf = crypto.randomBytes(8);
  let token = buf.toString('hex')
  return token
}
