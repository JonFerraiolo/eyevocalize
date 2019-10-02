/**
 * Sends a one-off email
 */

 const sgMail = require('@sendgrid/mail');

/**
 * Sends a one-off email using Mandrill (part of mailchimp)
 *
 * @param {object} params Various parameters
 * @params {string} params.html HTML version of mail body
 * @params {string} params.text Plain text version of mail body
 * @params {string} params.subject Mail subject
 * @params {string} params.email Email for recipient
 * @params {function} callback  Parameters(err)
 */
module.exports = function(params, callback) {
  //FIXME: uncomment when on an airplane
  /*
  callback(null);
  return;
  */
  sgMail.setApiKey(global.config.SENDGRID_API_KEY);
  const msg = {
    to: params.email,
    from: 'EyeVocalize@eyevocalize.com',
    subject: params.subject,
    text: params.text,
    html: params.html,
  };
  sgMail.send(msg).then(() => {
    callback(null);
  }).catch(error => {
    callback(error);
  });
};
