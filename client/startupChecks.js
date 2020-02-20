
import { html, render } from './lib/lit-html/lit-html.js';

let css = `
`;

export const markedLoadedPromise = new Promise((resolve, reject) => {
  let elem = document.createElement('script');
  elem.setAttribute('src', 'lib/marked.js');
  elem.addEventListener('load', e => {
    resolve();
  }, false);
  document.head.appendChild(elem);
});

/**
 * Called at the very beginning of each distinct HTML endpoint
 * to do redirect to https if necessary and to
 * check that the browser has the features that the application needs.
 * @param {function} successCB gets called if everything is OK
 * @param {function} failureCB gets called if something is wrong
 **/
export function startupChecks(successCB, failureCB) {
  if (window.location.hostname === 'eyevocalize.com' && window.location.protocol === 'http:') {
  	window.location = 'https://eyevocalize.com' + window.location.pathname;
  }

  let badBrowser = () => {
    render(html`
  		<div class=nospeechsupport>
  			Sorry, your browser does not support speech synthesis,
  			which is required by this application.
  			Please try a different browser.
  		</div>`, document.body);
    failureCB();
  };

  if ('speechSynthesis' in window) {
    let voicesPromise = new Promise((resolve, reject) => {
      window.evc_voices = speechSynthesis.getVoices();
      if (Array.isArray(window.evc_voices) && window.evc_voices.length > 0) {
        resolve();
      } else {
        // Chrome loads voices asynchronously.
        window.speechSynthesis.onvoiceschanged = function(e) {
          window.evc_voices = speechSynthesis.getVoices();
          if (Array.isArray(window.evc_voices) && window.evc_voices.length > 0) {
            resolve();
          } else {
            reject();
          }
        };
      }
    });
    voicesPromise.then(() => {
      successCB();
    }, () => {
      badBrowser();
    }).catch(e => {
      console.error('startupChecks promise error, e='+e);
      badBrowser();
    });

  } else {
    badBrowser();
  }

}
