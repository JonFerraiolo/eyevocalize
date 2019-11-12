
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

  if ('speechSynthesis' in window) {
    successCB();

  } else {
  	render(html`
  		<div class=nospeechsupport>
  			Sorry, your browser does not support speech synthesis,
  			which is required by this application.
  			Please try a different browser.
  		</div>`, document.body);
    failureCB();
  }

}
