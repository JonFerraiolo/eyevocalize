
var UNSPECIFIED_SYSTEM_ERROR = 'UNSPECIFIED_SYSTEM_ERROR'


module.exports = {
  /**
   * Utility to call res.send(payload) but merge msg into payload
   * and log the action in the process. (successful request)
   * @param {object} res  response object
   * @param [{object}] clientData  Optional object holding client data - don't use prop msg
   * @param [{string}] clientMsg  message sent to client
   */
  logSendOK: function(res, clientData, clientMsg) {
    const logger = global.logger;
    var retobj = Object.assign({}, clientData || {}, { msg:clientMsg });
    //logger.info(clientMsg);
    res.send(retobj);
  },

  /**
   * Utility to call res.status(status).send({ msg:msg, error:clientErrorString })
   * and log the action in the process. (CE=client error)
   * @param {object} res  response object
   * @param {number} status  http status code for the response
   * @param {string} clientErrorString  error string constant to send to client
   * @param [{string}] clientMsg  message sent to client
   * @param [{object}] clientData  Optional object holding client data - don't use props msg or error
   */
  logSendCE: function(res, status, clientErrorString, clientMessage, clientData) {
    const logger = global.logger;
    var retobj = Object.assign({}, clientData || {}, { msg:clientMessage, error:clientErrorString });
    logger.error(clientMessage);
    res.status(status).send(retobj);
  },

  /**
   * Utility to call res.status(500).send({ msg:msg, error:UNSPECIFIED_SYSTEM_ERROR })
   * and log the action in the process. (SE=server error)
   * @param {object} res  response object
   * @param {Error} error  Error object
   * @param {string} clientMessage  message sent to client
   */
  logSendSE: function(res, error, clientMessage) {
    const logger = global.logger;
    var retobj = Object.assign({}, { msg: clientMessage });
    logger.error(clientMessage + ', error=' + error);
    res.status(500).send(retobj);
  }
};
