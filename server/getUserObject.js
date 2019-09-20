
const dbconnection = require('./dbconnection')
const getBaseName = require('./getBaseName')

/**
 * Queries the database for latest info on current user.
 * Returns a user object containing the info.
 * The calling routine might have partial info on hand already.
 *
 * @param {string} email  Email for current user
 * @param {object} alreadyHave The parts of the user object that the calling
 *        routine already has on hand. For example, if the calling routine already
 *        has the account info, it passes in {account:{...}}.
 *        If the calling routine has no info on hand, pass in undefined, null or {}
 * @return {Promise} payload is userObject
 */

 /* FIXME Promises look all screwed up */
module.exports = function(email, alreadyHave) {
  logger.info('getUserObject entered. Email='+email+', alreadyHave='+JSON. stringify(alreadyHave));
  const connection = dbconnection.getConnection();
  const logger = global.logger;
  const accountTable = global.accountTable;
  return new Promise((masterResolve, masterReject) => {
    let userObject = alreadyHave ? JSON.parse(JSON.stringify(alreadyHave)) : {};
    logger.info('getUserObject entered. userObject='+JSON. stringify(userObject));
    let accountPromise = new Promise(function (resolve, reject) {
      if (userObject.account) {
        delete userObject.account.password
        resolve(userObject.account);
      } else {
        connection.query(`SELECT * FROM ${accountTable} WHERE email = ?`, [email], function (error, results, fields) {
          if (error) {
            reject("getUserObject select account failure for email '" + email + "'. error="+error);
          } else {
            let msg = "getUserObject select account success for email '" + email + "'";
            logger.info(msg + ", results= ", JSON.stringify(results));
            if (results.length !== 1) {
              reject("getUserObject select account failure for email '" + email + "'. results.length="+results.length);
            } else {
              let account = results[0];
              delete account.password;
              resolve(account);
            }
          }
        });
      }
    });
    accountPromise.then(account => {
      userObject.account = account;
      connection.query(`SELECT * FROM ${accountTable} WHERE userId = ?`, [account.id], function (error, results, fields) {
        if (error) {
          masterReject("getUserObject database failure for query progress for email '" + account.email + "'");
        } else {
          let progressPromise = new Promise((progressResolve, progressReject) => {
            if (results.length === 1) {
              let currentDbProgress = results[0];
              logger.info('progressPromise currentDbProgress='+JSON.stringify(currentDbProgress));
              let updatedProgress = updateProgressToLatestVersion(results[0]);
              logger.info('progressPromise updatedProgress='+JSON.stringify(updatedProgress));
              logger.info('progressPromise latest='+JSON.stringify(latest));
              let { level, tasknum, step } = updatedProgress;
              if (latest.version !== currentDbProgress.version || level !== currentDbProgress.level ||
                  tasknum !== currentDbProgress.tasknum || step !== currentDbProgress.step) {
                logger.info('before updating progress table ');
                // Need to update progress table
                let now = new Date();
                connection.query('UPDATE ue_ztm_progress SET version = ?, level = ?, tasknum = ?, step = ?, modified = ? WHERE userId = ?',
                        [latest.version, level, tasknum, step, now, account.id], function (error, results, fields) {
                  if (error) {
                    progressReject(getBaseName(__filename)+" progress update database failure for email '" + account.email + "'");
                  } else {
                    updatedProgress.version = latest.version;
                    updatedProgress.modified = now;
                    progressResolve(updatedProgress);
                  }
                });
              } else {
                progressResolve(updatedProgress);
              }
            } else if (results.length === 0) {
              // Must be user's first login. Insert a row in progress table
              let now = new Date();
              //FIXME get version from latest tasks file
              let progress = { userId:account.id, version:1, level:1, tasknum:0, step:0, modified:now };
              connection.query('INSERT INTO ue_ztm_progress SET ?', progress, function (error, results, fields) {
                if (error) {
                  progressReject("getUserObject insert database failure for email '" + account.email + "'");
                } else {
                  progressResolve(progress);
                }
              });
            } else {
              progressReject('getUserObjectError query progress error. results.length');
            }
          });
          progressPromise.then(progress => {
            logger.info('progressPromise.then progress='+JSON.stringify(progress));
            userObject.progress = progress;
            userObject.tasks = latest;
            userObject.tasks.profileCategories = profileCategories;
            logger.info('userObject='+JSON.stringify(userObject));
            masterResolve(userObject);
          }).catch(error => {
            masterReject(error);
          });
        }
      });
    }, error => {
      masterReject(error);
    }).catch(error => {
      masterReject(error);
    });
  });
};

let updateProgressToLatestVersion = (currentDbProgress  => {
  // call mappingFunc to repeatedly map values from version i to i+1
  let { version, level, tasknum, step } = currentDbProgress;
  for (v=version+1; v<latest.version; v++) {
    // If we are to go to very first task and step, we don't need any further mapping
    if (level === 1 && tasknum === 0 && step === 0) {
      break
    }
    let { version } = currentDbProgress;
    try {
      let tasks = version < latest.version ? require('../Tasks/old/'+v) : latest;
      currentDbProgress = tasks.mappingFunc(currentDbProgress);
    } catch(e) {
      logger.error('taskRoutes require '+pathToOld+v+' failed or mappingFunc error. Error='+e);
      return Object.assign({}, currentDbProgress, {version:latest.version, level:1, tasknum:0, step:0} )
    }
  }
  return currentDbProgress
})
