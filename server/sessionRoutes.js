
const crypto = require('crypto');
const dbconnection = require('./dbconnection');
const sendMail = require('./sendMail')

const logSend = require('./logSend')
const logSendOK = logSend.logSendOK
const logSendCE = logSend.logSendCE
const logSendSE = logSend.logSendSE

const USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS'
const USER_ALREADY_LOGGED_IN = 'USER_ALREADY_LOGGED_IN'
const EMAIL_NOT_REGISTERED = 'EMAIL_NOT_REGISTERED'
const NOT_LOGGED_IN = 'NOT_LOGGED_IN'
const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED'
const EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED'
const INCORRECT_PASSWORD = 'INCORRECT_PASSWORD'
const TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND'
const TOKEN_EXPIRED = 'TOKEN_EXPIRED'
const UNSPECIFIED_CLIENT_ERROR = 'UNSPECIFIED_CLIENT_ERROR'
const UNSPECIFIED_SYSTEM_ERROR = 'UNSPECIFIED_SYSTEM_ERROR'

//FIXME don't put credentials into log files
exports.signup = function(req, res, next) {
  const logger = global.logger;
  logger.info('signup req.session='+req.session);
  logger.info('signup req.body='+req.body);
  try {
    logger.info(JSON.stringify(req.body));
  } catch(e) {
    logSendSE(res, e, 'signup body stringify error');
    return;
  }
  if (!req.body.email || !req.body.password) {
    logSendCE(res, 400, UNSPECIFIED_CLIENT_ERROR, "signup missing required data");
    return;
  }
  dbconnection.dbReady().then(connectionPool => {
    const accountTable = global.accountTable;
    let now = new Date();
    let pwKey = crypto.createCipher('aes-128-cbc', global.config.HASH_SECRET1);
    let encryptedPW = pwKey.update(req.body.password, 'utf8', 'hex');
    encryptedPW += pwKey.final('hex');
    logger.info('signup encryptedPW='+encryptedPW);
    let account = {
       email: req.body.email,
       password: encryptedPW,
       emailValidateToken: null,
       emailValidateTokenDateTime: now,
       created: now,
       modified: now
     }
     const token = makeToken(account)
     account.emailValidateToken = token;
     function verify(account) {
       sendAccountVerificationEmailToUser(account, function(error) {
         if (error) {
           logger.error("Insert new account email send failure for email '" + account.email + "', error= ", error);
           connectionPool.query(`DELETE FROM ${accountTable} WHERE email = ?`, [account.email], function (error, results, fields) {
             if (error) {
               logger.error('DELETE failed after sendMail failure. error='+error)
             }
             res.send(500, { msg: 'Send email verification error', error: UNSPECIFIED_SYSTEM_ERROR })
           });
         } else {
            let payload = { account: { email: account.email, modified: account.modified }};
            logSendOK(res, payload, "Insert new account success for email '" + account.email + "'");
         }
       });
     }
     connectionPool.query(`SELECT * FROM ${accountTable} WHERE email = ?`, [account.email], function (error, results, fields) {
       if (error) {
         logSendSE(res, error, "signup select account database failure for email '" + account.email + "'");
       } else {
         logger.info('signup: login exists. results='+JSON.stringify(results));
         if (results.length > 1) {
           logSendSE(res, null, "signup select account database failure for email '" + account.email + "', multiple entries");
         } else if (results.length === 1) {
           let existing = results[0];
           logger.info('signup: login exists. existing='+JSON.stringify(existing));
           if (existing.emailValidated && !existing.accountClosedDateTime) {
             logSendCE(res, 401, USER_ALREADY_EXISTS, "signup account already exists: '" + account.email + "'");
           } else {
             logger.info('signup: login exists. account='+JSON.stringify(account));
             connectionPool.query(`UPDATE ${accountTable} SET password = ?, modified = ?, accountClosedDateTime = ? WHERE email = ?`, [account.password, now, null, account.email], function (error, results, fields) {
               if (error) {
                 logSendSE(res, error, "Insert new account update database failure for email '" + account.email + "'");
               } else {
                 verify(existing);
               }
             });
           }
         } else {
           connectionPool.query(`INSERT INTO ${accountTable} SET ?`, account, function (error, results, fields) {
             if (error) {
               logSendSE(res, error, "Insert new account insert database failure for email '" + account.email + "'");
             } else {
               account.id = results.insertId;
               verify(account);
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
  const logger = global.logger;
  logger.info('login req.session='+req.session);
  logger.info('login req.body='+req.body);
  try {
    logger.info(JSON.stringify(req.body));
  } catch(e) {
    logSendSE(res, e, 'login body stringify error');
    return;
  }
  if (!req.body.email || !req.body.password) {
    logSendCE(res, 400, UNSPECIFIED_CLIENT_ERROR, "login missing required data");
    return;
  }
  const password = req.body.password;
  let pwKey = crypto.createCipher('aes-128-cbc', global.config.HASH_SECRET1);
  let encryptedPW = pwKey.update(password, 'utf8', 'hex');
  encryptedPW += pwKey.final('hex');
  logger.info('login encryptedPW='+encryptedPW);
  doLoginLogSend(req, res, req.body.email, encryptedPW);
}

exports.autologin = function(req, res, next) {
  const logger = global.logger;
  logger.info('autologin req.session='+req.session);
  logger.info('autologin req.body='+req.body);
  try {
    logger.info(JSON.stringify(req.body));
  } catch(e) {
    logSendSE(res, e, 'autologin body stringify error');
    return;
  }
  if (!req.body.email || !req.body.checksum) {
    logSendCE(res, 400, UNSPECIFIED_CLIENT_ERROR, "autologin missing required data");
    return;
  }
  const checksum = req.body.checksum;
  let pwKey = crypto.createDecipher('aes-128-cbc', global.config.HASH_SECRET2);
  let encryptedPW = pwKey.update(checksum, 'hex', 'utf8')
  encryptedPW += pwKey.final('utf8');
  logger.info('autologin encryptedPW='+encryptedPW);
  doLoginLogSend(req, res, req.body.email, encryptedPW);
}

exports.doLoginValidate = function(req, res, email, encryptedPW, cb) {
  doLogin(req, res, email, encryptedPW, (res, clientData, clientMsg) => {
    cb(true);
  }, (res, status, clientErrorString, clientMessage, clientData) => {
    cb(false);
  }, (res, error, clientMessage) => {
    cb(false);
  });
}

let doLoginLogSend = function(req, res, email, encryptedPW) {
  doLogin(req, res, email, encryptedPW, (res, clientData, clientMsg) => {
    logSendOK(res, clientData, clientMsg);
  }, (res, status, clientErrorString, clientMessage, clientData) => {
    logSendCE(res, status, clientErrorString, clientMessage, clientData);
  }, (res, error, clientMessage) => {
    logSendSE(res, error, clientMessage);
  });
}

let doLogin = function(req, res, email, encryptedPW, callbackOK, callbackCE, callbackSE) {
  const logger = global.logger;
  logger.info('doLogin email='+email+', encryptedPW='+encryptedPW);
  dbconnection.dbReady().then(connectionPool => {
    const accountTable = global.accountTable;
    connectionPool.query(`SELECT * FROM ${accountTable} WHERE email = ?`, [email], function (error, results, fields) {
      if (error) {
        callbackSE(res, error, "Select account failure for email '" + email + "'");
      } else {
        let msg = "Select account success for email '" + email + "'";
        logger.info(msg + ", results= ", results);
        if (results.length < 1) {
          callbackCE(res, 401, EMAIL_NOT_REGISTERED, "No account for '" + email + "'");
        } else {
          let account = results[0]
          if (account.accountClosedDateTime) {
            callbackCE(res, 401, EMAIL_NOT_REGISTERED, "Account closed for '" + email + "'");
          } else if (!account.emailValidated) {
            callbackCE(res, 401, EMAIL_NOT_VERIFIED, "Account for '" + email + "' has not been verified yet via email");
          } else {
            if (account.password === encryptedPW && req.session) {
              logger.info('Before calling session login.  User='+account);
              logger.info(JSON.stringify(account));
              logger.info('req.session.id='+((req.session && req.session.id) || 'none'));
              req.session.user = account;
              logger.info('login after regenerate req.session.id='+req.session.id);
              let payload = { account: { email: account.email, modified: account.modified }};
              callbackOK(res, payload, "Login success for email '" + email + "'");
            } else {
              callbackCE(res, 401, INCORRECT_PASSWORD, "Login failure for email '" + email + "'");
            }
          }
        }
      }
    });
  }, () => {
    callbackSE(res, null, "login: no database connection");
  }).catch(e => {
    callbackSE(res, e, "login: promise error");
  });
}

exports.logout = function(req, res, next) {
  const logger = global.logger;
  logger.info('logout req.body='+req.body);
  logger.info(req.body);
  if (req.session) {
    logger.info('req.session.user='+req.session.user);
    req.session.user = null;
  }
  logSendOK(res, null, "Logout success");
}

/* not currently used
exports.loginexists = function(req, res, next) {
  dbconnection.dbReady().then(connectionPool => {
    const logger = global.logger;
    const accountTable = global.accountTable;
    logger.info('loginexists req.body=');
    try { logger.info(JSON.stringify(req.body)); } catch(e) { logger.error('stringify error'); }
    const email = req.body.email;
    logger.info('email='+email);
    connectionPool.query(`SELECT email FROM ${accountTable} WHERE email = ?`, [email], function (error, results, fields) {
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
*/

exports.resendVerificationEmail = function(req, res, next) {
  const logger = global.logger;
  dbconnection.dbReady().then(connectionPool => {
    logger.info('resendVerificationEmail req.body='+req.body);
    logger.info(req.body);
    const email = req.body.email;
    logger.info('email='+email);
    connectionPool.query(`SELECT * FROM ${accountTable} WHERE email = ?`, [email], function (error, results, fields) {
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
            connectionPool.query(`UPDATE ${accountTable} SET emailValidateToken = ?, emailValidateTokenDateTime = ?, modified = ? WHERE email = ?`, [token, now, now, email], function (error, results, fields) {
              if (error) {
                logSendSE(res, error, "resendVerificationEmail update database failure for email '" + account.email + "'");
              } else {
                account.emailValidateToken = token
                account.emailValidateTokenDateTime = now
                account.modified = now
                sendAccountVerificationEmailToUser(account, function(error) {
                  delete account.password
                  if (error) {
                    logSendSE(res, error, "resendVerificationEmail email send failure for email '" + account.email + "'");
                  } else {
                    let payload = { account: { email: account.email, modified: account.modified }};
                    logSendOK(res, payload, "resendVerificationEmail success for email '" + account.email + "'");
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
  }, () => {
    logSendSE(res, null, "resendverification: no database connection");
  }).catch(e => {
    logSendSE(res, e, "resendverification: promise error");
  });
}

exports.sendResetPasswordEmail = function(req, res, next) {
  const logger = global.logger;
  dbconnection.dbReady().then(connectionPool => {
    logger.info('sendResetPasswordEmail req.body='+req.body);
    logger.info(req.body);
    const email = req.body.email;
    logger.info('email='+email);
    connectionPool.query(`SELECT * FROM ${accountTable} WHERE email = ?`, [email], function (error, results, fields) {
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
          connectionPool.query(`UPDATE ${accountTable} SET resetPasswordToken = ?, resetPasswordTokenDateTime = ?, modified = ? WHERE email = ?`, [token, now, now, email], function (error, results, fields) {
            if (error) {
              logSendSE(res, error, "sendResetPasswordEmail update database failure for email '" + account.email + "'");
            } else {
              account.resetPasswordToken = token
              account.resetPasswordTokenDateTime = now
              account.modified = now
              sendResetPasswordEmailToUser(account, function(error) {
                delete account.password
                if (error) {
                  logSendSE(res, error, "sendResetPasswordEmail email send failure for email '" + account.email + "'");
                } else {
                  logger.info("results= ", results);
                  let payload = { account: { email: account.email, modified: account.modified }};
                  logSendOK(res, payload, "sendResetPasswordEmail success for email '" + account.email + "'");
                }
              });
            }
          });
        } else {
          logSendCE(res, 401, EMAIL_NOT_REGISTERED, "No account for '" + email + "'");
        }
      }
    });
  }, () => {
    logSendSE(res, null, "sendResetPasswordEmail: no database connection");
  }).catch(e => {
    logSendSE(res, e, "sendResetPasswordEmail: promise error");
  });
}

exports.verifyAccount = function(req, res, next) {
  const logger = global.logger;
  dbconnection.dbReady().then(connectionPool => {
    logger.info('verifyAccount req.params='+req.params);
    logger.info(req.params);
    let token = req.params.token
    res.type('html')
    let loginUrl = global.config.BASE_URL + '/login';
    connectionPool.query(`SELECT * FROM ${accountTable} WHERE emailValidateToken = ?`, [token], function (error, results, fields) {
      if (error || results.length !== 1) {
        let msg = "verifyAccount failure for token '" + token + "'";
        logger.info(msg + ", error= ", error, 'results=', JSON.stringify(results));
        let html = `<html><body>
    <h1>Account Verification Failure</h1>
    <p>This is most likely because you clicked on Activate My Account from an older account verification email.
      Only the most recent account verification email will work correctly.
      If you are unsure which email is the most recent,
      put all existing verification emails into the Trash,
      then go to <a href="${loginUrl}">${loginUrl}</a> and try to login. From there, you will be able to request a brand new account verification email.</p>
  </body></html>`
        res.send(html)
      } else {
        logger.info("results= ", JSON.stringify(results));
        let account = results[0];
        let { email, emailValidateTokenDateTime } = account;
        logger.info('typeof emailValidateTokenDateTime= ', typeof emailValidateTokenDateTime)
        let msg = "verifyAccount success for email '" + email + "'";
        let now = new Date();
        let twentyfourHoursAgo = (new Date().getTime() - (24 * 60 * 60 * 1000));
        let tokenTime = emailValidateTokenDateTime.getTime()
        logger.info('tokenTime='+tokenTime+', twentyfourHoursAgo='+twentyfourHoursAgo)
        if (tokenTime < twentyfourHoursAgo) {
          let html = `<html><body>
  <h1>Sorry! Verification expiration</h1>
  <p>Please go to <a href="${loginUrl}">${loginUrl}</a> and try to login. From there, you will be able to request a new account verification email.</p>
  </body></html>`
          res.send(html)
        } else {
          logger.info('now='+now+', email='+email)
          connectionPool.query(`UPDATE ${accountTable} SET emailValidated = ?, modified = ? WHERE email = ?`, [now, now, email], function (error, results, fields) {
            logger.info('error='+error+", results= ", JSON.stringify(results));
            if (error) {
              let msg = "verifyAccount update emailValidated database failure for email '" + account.email + "'";
              logger.info(msg + ", error= ", error);
              let html = `<html><body>
    <h1>Sorry! Unknown system error</h1>
    <p>Please send email to ${global.config.PROBLEM_EMAIL} to report the problem.</p>
  </body></html>`
  logger.info('html='+html) ;
              res.send(html)
            } else {
              logger.info('before setting html ')
              req.session.user = account;
              let html = `<html><body>
    <h1>Account verified!</h1>
    <p> Now you can go to <a href="${global.appUrl}">${global.appUrl}</a> to start using EyeVocalize.com.</p>
  </body></html>`
              res.send(html)
            }
          });
        }
      }
    });
  }, () => {
    logSendSE(res, null, "verifyAccount: no database connection");
  }).catch(e => {
    logSendSE(res, e, "verifyAccount: promise error");
  });
}

exports.closeAccount = function(req, res, next) {
  const logger = global.logger;
  dbconnection.dbReady().then(connectionPool => {
    logger.info('closeAccount');
    let now = new Date();
    let email = req.session && req.session.user && req.session.user.email;
    if (email) {
      connectionPool.query(`UPDATE ${accountTable} SET accountClosedDateTime = ?, modified = ? WHERE email = ?`, [now, now, email], function (error, results, fields) {
        logger.info('error='+error+", results= ", JSON.stringify(results));
        if (error) {
          logSendSE(res, error, "closeAccount database failure for email '" + email + "'");
        } else {
          let payload = { account: { email }};
          logSendOK(res, payload, "closeAccount success for email '" + email + "'");
        }
      });
    } else {
      logSendCE(res, 401, NOT_LOGGED_IN, "No account for '" + email + "'");
    }
  }, () => {
    logSendSE(res, null, "closeAccount: no database connection");
  }).catch(e => {
    logSendSE(res, e, "closeAccount: promise error");
  });
}

exports.gotoResetPasswordPage = function(req, res, next) {
  const logger = global.logger;
  dbconnection.dbReady().then(connectionPool => {
    logger.info('gotoResetPasswordPage req.params='+req.params);
    logger.info(req.params);
    let token = req.params.token
    res.type('html')
    let loginUrl = global.config.BASE_URL + '/login';
    connectionPool.query(`SELECT email, resetPasswordTokenDateTime FROM ${accountTable} WHERE resetPasswordToken = ?`, [token], function (error, results, fields) {
      if (error || results.length !== 1) {
        let msg = "gotoResetPasswordPage failure for token '" + token + "'";
        logger.info(msg + ", error= ", error, 'results=', JSON.stringify(results));
        let html = `<html><body>
    <h1>Reset Password Failure</h1>
    <p>This is most likely because you clicked on Reset My Password from an older password reset email.
      Only the most recent password reset email will work correctly.
      If you are unsure which email is the most recent,
      put all existing password reset emails into the Trash,
      then go to <a href="${loginUrl}">${loginUrl}</a> to request a brand new password reset email.</p>
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
  <p>Please go to <a href="${loginUrl}">${loginUrl}</a> to request a new password reset email.</p>
  </body></html>`
          res.send(html)
        } else {
          logger.info('before sending redirect')
          let resetPasswordUrl = global.config.BASE_URL + '/resetpassword';
          res.redirect(302, resetPasswordUrl+'?t='+token)
        }
      }
    });
  }, () => {
    logSendSE(res, null, "gotoResetPasswordPage: no database connection");
  }).catch(e => {
    logSendSE(res, e, "gotoResetPasswordPage: promise error");
  });
}

exports.resetPassword = function(req, res, next) {
  const logger = global.logger;
  dbconnection.dbReady().then(connectionPool => {
    logger.info('resetpassword req.body='+req.body);
    logger.info(req.body);
    const password = req.body.password;
    const token = req.body.token;
    let pwKey = crypto.createCipher('aes-128-cbc', global.config.HASH_SECRET1);
    let encryptedPW = pwKey.update(password, 'utf8', 'hex');
    encryptedPW += pwKey.final('hex');
    logger.info('req.session.id='+req.session.id);
    connectionPool.query(`SELECT email, resetPasswordTokenDateTime FROM ${accountTable} WHERE resetPasswordToken = ?`, [token], function (error, results, fields) {
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
          connectionPool.query(`UPDATE ${accountTable} SET password = ?, resetPasswordToken = NULL, resetPasswordTokenDateTime = NULL, modified = ? WHERE email = ?`, [encryptedPW, now, email], function (error, results, fields) {
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
  }, () => {
    logSendSE(res, null, "resetPassword: no database connection");
  }).catch(e => {
    logSendSE(res, e, "resetPassword: promise error");
  });
}

function sendAccountVerificationEmailToUser(account, callback) {
  const logger = global.logger;
  const url = global.config.BASE_URL + global.apiBasePath + '/verifyaccount/' + account.emailValidateToken
  const params = {
    html: `<p>Welcome to EyeVocalize.com!</p>
  <p>Please click on this link: </p>
  <p>&nbsp;&nbsp;&nbsp;&nbsp;<a href="${url}" style="font-size:110%;color:darkblue;font-weight:bold;">Activate My Account</a></p>
  <p>to complete the signup process.</p>`,
    text: 'Welcome to EyeVocalize.com!\n\nPlease go to the following URL in a Web browser to Activate Your Account and complete the signup process:\n\n'+url,
    subject: 'Please confirm your '+global.SITENAME+' account',
    email: account.email,
  };
  sendMail(params, function(err) {
    if (err) {
      logger.error('sendAccountVerificationEmailToUser sendMail failed! err='+JSON.stringify(err));
    } else {
      logger.info('sendAccountVerificationEmailToUser sendMail no errors.');
    }
    callback(err)
  });
}

function sendResetPasswordEmailToUser(account, callback) {
  const logger = global.logger;
  const url = global.config.BASE_URL + global.apiBasePath + '/gotoresetpasswordpage/' + account.resetPasswordToken
  const params = {
    html: `<p>Reset your ${global.SITENAME} password</p>
  <p>Please click on this link to reset your password: </p>
  <p>&nbsp;&nbsp;&nbsp;&nbsp;<a href="${url}" style="font-size:110%;color:darkblue;font-weight:bold;">Reset My Password</a></p>`,
    text: 'Please go to the following URL in a Web browser to reset your password:\n\n'+url,
    subject: 'Reset your '+global.SITENAME+' password',
    email: account.email
  };
  sendMail(params, function(err) {
    if (err) {
      logger.error('sendResetPasswordEmailToUser sendMail failed! err='+JSON.stringify(err));
    } else {
      logger.info('sendResetPasswordEmailToUser sendMail no errors.');
    }
    callback(err)
  });
}

function makeToken(account) {
  const buf = crypto.randomBytes(8);
  let token = buf.toString('hex')
  return token
}

exports.initSocketMessages = function(socket) {
  /* FIXME remove this function
  const logger = global.logger;
  socket.on('AutoLogin', (msg, fn) => {
    logger.info('AutoLogin message was: '+msg+' at '+(new Date()).toISOString());
    let o;
    try {
      o = JSON.parse(msg);
      let { email, checksum } = o;
      if (!email || !checksum) {
        fn(JSON.stringify({ success: false, error: 'incomplete data'}));
        return;
      }
      let pwKey = crypto.createDecipher('aes-128-cbc', global.config.HASH_SECRET2);
      let encryptedPW = pwKey.update(checksum, 'hex', 'utf8')
      encryptedPW += pwKey.final('utf8');
      logger.info('AutoLogin encryptedPW='+encryptedPW);
      doLogin(email, encryptedPW, (clientData, clientMsg) => {
        fn(JSON.stringify({ success: true }));
      }, (status, clientErrorString, clientMessage, clientData) => {
        fn(JSON.stringify({ success: false, error: clientMessage}));
      }, (error, clientMessage) => {
        fn(JSON.stringify({ success: false, error: clientMessage}));
      });
    } catch(e) {
      logger.error('AutoLogin exception. e='+e);
      fn(JSON.stringify({ success: false, error: 'unexpected server exception'}));
    }
  });
  */
}
