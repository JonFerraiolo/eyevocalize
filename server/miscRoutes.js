
const fetch = require('node-fetch');
const logSend = require('./logSend')
const logSendOK = logSend.logSendOK
const logSendCE = logSend.logSendCE
const logSendSE = logSend.logSendSE

const UNSPECIFIED_CLIENT_ERROR = 'UNSPECIFIED_CLIENT_ERROR'

exports.getFavoritesFromURL = function(req, res, next) {
  const logger = global.logger;
  logger.info('getFavoritesFromURL req.session='+req.session);
  logger.info('getFavoritesFromURL req.body='+req.body);
  try {
    logger.info(JSON.stringify(req.body));
  } catch(e) {
    logSendSE(res, e, 'getFavoritesFromURL body stringify error');
    return;
  }
  if (!req.body.url) {
    logSendCE(res, 400, UNSPECIFIED_CLIENT_ERROR, "getFavoritesFromURL missing required data");
    return;
  }
  let url = req.body.url;
  logger.info('getFavoritesFromURL url='+url);
  let email = (req.session && req.session.user && req.session.user.email) || '';
  fetch(url).then(resp => {
    logger.info('getFavoritesFromURL fetch status='+resp.status);
    if (resp.status === 200) {
      resp.json().then(data => {
        logger.info('getFavoritesFromURL fetch success return data='+data);
        // quick validity check
        if (Array.isArray(data) && data.length > 0 && typeof data[0].label === 'string' && Array.isArray(data[0].items)) {
          let payload = { success: true, collections: data };
          logSendOK(res, payload, "getFavoritesFromURL success for email '" + email + "'");
        } else {
          logSendCE(res, 401, null, "getFavoritesFromURL invalid file format for email '" + email + "'", null);
        }
      }).catch(e => {
        logSendCE(res, 401, null, "getFavoritesFromURL json parse error for email '" + email + "'", null);
      });
    } else {
      logSendCE(res, 400, null, "getFavoritesFromURL fetch bad status="+resp.status+", email '" + email + "'", null);
    }
  }).catch(e => {
    logSendSE(res, e, "getFavoritesFromURL fetch error for email '" + email + "'");
  });
}
