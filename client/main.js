

import { startupChecks } from './startupChecks.js';
import { helpShowing } from './help.js';
import { popupShowing } from './popup.js';
import { updateTextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { initializeSettings, editSettings, mainAppPercentWhenSmall, getAppFontSize, getSyncMyData } from './Settings.js';
import { updatePhrases } from './Phrases.js';
import { initializeStash, stash, editStash } from './Stash.js';
import { initializeHistory, HistoryGetPending, HistorySync, playLastHistoryItem } from './History.js';
import { initializeFavorites, editFavorites } from './MyPhrases.js';
import { initializeBuiltins, editBuiltins } from './MyPhrases.js';
import { fromRight, fromLeft } from './animSlide.js';
import { speak, playAudio } from './vocalize.js';
import { html, render } from './lib/lit-html/lit-html.js';
import { styleMap } from './lib/lit-html/directives/style-map.js';

let css = `@import 'app.css';`;

let mainShowing = true;

export function isChrome() {
	return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
};

export function search(text) {
	text = (typeof text === 'string') ? text : TextEntryRowGetText();
	updateMain(text);
};

// The text area control has been cleared
export function clear() {
	updateMain();
}

let appMinOrMax = 'Min'; // either 'Min' or 'Max', controls whether bottom of screen is blocked off for onscreen keyboard
export function getAppMinOrMax() {
	return appMinOrMax;
}
export function setAppMinOrMax(minOrMax) {
	appMinOrMax = minOrMax;
	let appinitiallyblankpercent = minOrMax === 'Min' ? (100-mainAppPercentWhenSmall())+'%' : '0%';
	document.querySelector('.appinitiallyblank').style.height = appinitiallyblankpercent;
	document.querySelector('.appinitiallyblank').style.display = minOrMax === 'Min' ? 'flex' : 'none';
	updateMain();
}

/*
 * Returns a block of lit-html nodes that can be used to render
 * the title row of a screen that slides in from the right.
 * @param {string} title Title that will appear at the top
 * @param {function} [returnFunc] Optional function that
 *   is called when user clicks on back arrow that will appear at top/left.
 *   If this param isn't provided, the arrow won't appear.
 * @returns {lit-html html`` return object} renderable object for the title
 */
export function buildSlideRightTitle(title, returnFunc) {
  let onClickReturn = e => {
    e.preventDefault();
    returnFunc();
  }
  return html`<div class=SlideRightTitle>
    ${returnFunc ? html`<a href="" @click=${onClickReturn} class=SlideRightBackArrow></a>` : '' }
    <span class=SlideRightTitleText>${title}</span>
  </div>`;
}

function slideInScreenShow(leftContentDiv, rightContentDiv, rightRenderDiv,  params) {
  let { renderFunc, renderFuncParams } = params;
  renderFunc(rightRenderDiv, renderFuncParams);
  let animParams = {
		leftContentDiv,
		rightContentDiv,
    animClassName: 'slideFromRightAnim',
		endAnimClassName: 'endFromRightAnim',
  };
  fromRight(animParams);
}

function slideInScreenHide(leftContentDiv, rightContentDiv) {
  let animParams = {
		leftContentDiv,
		rightContentDiv,
    origAnimClassName: 'endFromRightAnim',
    undoAnimClassName: 'undoSlideFromRightAnim'
  };
  fromLeft(animParams);
}

export function secondLevelScreenShow(params) {
	mainShowing = false;
  slideInScreenShow(document.querySelector('.mainleft'), document.querySelector('.mainright'),
    document.querySelector('.secondlevelleft'), params);
}

export function secondLevelScreenHide() {
  slideInScreenHide(document.querySelector('.mainleft'), document.querySelector('.mainright'));
	mainShowing = true;
	updateMain();
}

export function thirdLevelScreenShow(params) {
  slideInScreenShow(document.querySelector('.secondlevelleft'), document.querySelector('.secondlevelright'),
    document.querySelector('.secondlevelright'), params);
}

export function thirdLevelScreenHide() {
  slideInScreenHide(document.querySelector('.secondlevelleft'), document.querySelector('.secondlevelright'));
}

let updateMainInProcess = false;
export function updateMain(searchString) {
	if (updateMainInProcess) return;
	updateMainInProcess = true;
	let appFontSize = getAppFontSize();
	let TextEntryRowProps = { initialText: '' };
	let PhrasesProps = { searchString };
	let onMinOrMax = e => {
		e.preventDefault();
		setAppMinOrMax('Max');
	};
	let trial = window.eyevocalizeUserEmail ? '' :
		html`<div class=TrialVersion>You are using the Trial Version.
		To remove this message, sign up and log in. (The app is free) </div>`;
	render(html`
		<style>${css}</style>
		<div class=appfullheight style=${styleMap({fontSize: appFontSize+'%'})}>
			${trial}
			<div class=appmaincontent>
				<div class=main>
		      <div class=mainleft>
		        <div class=mainleftcontent>
		          <div id=TextEntryRowContainer></div>
		          <div id=PhrasesContainer></div>
		        </div>
		      </div>
		      <div class=mainright>
		        <div class=secondlevelleft></div>
		        <div class=secondlevelright></div>
		      </div>
					<div class=Help style=${styleMap({display: helpShowing() ? 'block' : 'none'})}></div>
		    </div>
			</div>
			<div class=appinitiallyblank>
			<p>This area is intentionally blank to provide room for an onscreen keyboard.</p>
			<p>To use this area instead for the application's user interface, press the
				<span @click=${onMinOrMax} class=icon></span> toggle icon at the top-right of the application.</p>
			</div>
		</div>
	`, document.body);
	setAppMinOrMax(appMinOrMax);
  updateTextEntryRow(document.getElementById('TextEntryRowContainer'), TextEntryRowProps);
  updatePhrases(document.getElementById('PhrasesContainer'), PhrasesProps);
	if (mainShowing) TextEntryRowSetFocus();
	updateMainInProcess = false;
};

let socket;

function main() {
	console.log(window.eyevocalizeUserEmail+'/'+window.eyevocalizeUserChecksum);
	window.eyevocalizeClientId = localStorage.getItem('clientId');
	if (window.eyevocalizeClientId) {
		window.eyevocalizeLastSync = parseInt(localStorage.getItem('lastSync'));
		if (isNaN(window.eyevocalizeLastSync)) {
			window.eyevocalizeLastSync = 0;
			localStorage.setItem('lastSync', window.eyevocalizeLastSync.toString());
		}
	} else {
		window.eyevocalizeClientId = Date.now().toString();
		localStorage.setItem('clientId', window.eyevocalizeClientId);
		window.eyevocalizeLastSync = 0;
		localStorage.setItem('lastSync', window.eyevocalizeLastSync.toString());
	}

  let currentVersion = 4;
  let initializationProps = { currentVersion };
  initializeSettings(initializationProps);
  initializeStash(initializationProps);
  initializeHistory(initializationProps);
	initializeFavorites(initializationProps);
	initializeBuiltins(initializationProps);

	updateMain();
	let autoLoginPromise = new Promise((resolve, reject) => {
		if (window.eyevocalizeUserEmail && window.eyevocalizeUserChecksum) {
			localStorage.setItem('userEmail', window.eyevocalizeUserEmail);
			localStorage.setItem('userChecksum', window.eyevocalizeUserChecksum);
			resolve();
		} else {
			let lsEmail = localStorage.getItem('userEmail');
			let lsChecksum = localStorage.getItem('userChecksum');
			if (lsEmail && lsChecksum) {
				let fetchPostOptions = {
					method: 'POST',
					mode: 'same-origin',
					headers: { "Content-type": "application/json" },
					credentials: 'include',
				};
				let credentials = {
					email: lsEmail,
					checksum: lsChecksum,
				};
				fetchPostOptions.body = JSON.stringify(credentials);
				fetch('/api/autologin', fetchPostOptions).then(resp => {
					console.log('status='+resp.status);
					if (resp.status === 200) {
						resp.json().then(data => {
							console.log('autologin fetch success return data=');
							console.dir(data);
							window.eyevocalizeUserEmail = lsEmail;
							window.eyevocalizeUserChecksum = lsChecksum;
							localStorage.setItem('userEmail', window.eyevocalizeUserEmail);
							localStorage.setItem('userChecksum', window.eyevocalizeUserChecksum);
							updateMain();
							resolve();
						});
					} else if (resp.status === 401) {
						resp.json().then(data => {
							console.log('autologin fetch 401 return data=');
							console.dir(data);
							let errorMessage;
							if (data.error === 'EMAIL_NOT_REGISTERED') {
								errorMessage = `*** Error: '${lsEmail}' not registered ***`;
							} else if (data.error === 'EMAIL_NOT_VERIFIED') {
								errorMessage = `*** Error: '${lsEmail}' not verified ***`;
							} else if (data.error === 'INCORRECT_PASSWORD') {
								errorMessage = `*** Error: incorrect password for '${lsEmail}' ***`;
							} else {
								errorMessage = `Very sorry. Something unexpected went wrong(autologin 401-1). `;
							}
							console.error(errorMessage);
							reject();
						}).catch(e => {
							console.error(`Very sorry. Something unexpected went wrong (autologin 401-2). `);
							reject();
						});
					} else {
						console.error('autologin fetch bad status='+resp.status);
						reject();
					}
				}).catch(e => {
					console.error('autologin fetch error e='+e);
					reject();
				});
			}
		}
	});
	autoLoginPromise.then(() => {
		try {
			socket = io();
			socket.on('disconnect', msg => {
				console.log ('socket.io disconnect. msg='+msg);
			});
			socket.on('reconnect', msg => {
				console.log ('socket.io reconnect. msg='+msg);
				let o = { clientId: window.eyevocalizeClientId, lastSync: window.eyevocalizeLastSync };
			});
			socket.on('ServerInitiatedSync', (serverSyncDataJson, fn) => {
				console.log('ServerInitiatedSync serverSyncDataJson='+serverSyncDataJson);
				try {
					let serverSyncData = JSON.parse(serverSyncDataJson);
					let { thisSyncServerTimestamp, updates } = serverSyncData;
					HistorySync(thisSyncServerTimestamp, updates.History);
					window.eyevocalizeLastSync = Date.now();
					localStorage.setItem('lastSync', window.eyevocalizeLastSync.toString());
				} catch(e) {
					console.error('sync exception, possibly bad JSON. e=');
					console.dir(e);
				} finally {
					if (typeof fn === 'function') {
						fn(JSON.stringify({ success: false, error: 'not yet implemented' }));
					}
				}
			});
		} catch(e) {
			console.error('socket.io initialization failed. ');
		}
	}, () => {
	  console.error('autoLoginPromise reject.');
		window.eyevocalizeUserEmail = null;
		window.eyevocalizeUserChecksum = null;
	}).catch(e => {
	  console.error('autoLoginPromise error'+e);
		window.eyevocalizeUserEmail = null;
		window.eyevocalizeUserChecksum = null;
	});
	/*FIXME change to quick tutorial
	if (window.eyevocalizeUserEmail === '') {
		setTimeout(() => {
			let props = { refNodeSelector: '.main' };
			showLoginSignupPopup(props);
		}, 0);
	}
	*/

	document.addEventListener('keydown', e => {
		let shift = e.getModifierState("Shift");
    let control = e.getModifierState("Control");
    let meta = e.getModifierState("Meta");
    if (e.key === 'Enter') {
      if (shift && !control && !meta) {
        // just pass through to default processing, which will add a newline
      } else if (!shift && (control || meta)) {
        e.preventDefault();
        stash();
      } else {
        e.preventDefault();
        speak();
      }
    } else if (e.key === 's' && !shift && (control || meta)) {
      e.preventDefault();
      search();
		} else if (e.key === '.' && !shift && (control || meta)) {
			// Control+period speaks the most recent entry in the History
			e.preventDefault();
			playLastHistoryItem();
    } else {
      // just pass through to default processing, which will add the character
    }
	}, false);

	document.addEventListener('focusout', e => {
		if (mainShowing && !popupShowing() && !e.relatedTarget) {
			event.preventDefault();
			TextEntryRowSetFocus();
		}
	}, false);
	document.addEventListener('visibilitychange', e => {
		if (!document.hidden) {
			if (mainShowing && !popupShowing()) {
				TextEntryRowSetFocus();
			}
		}
	}, false);
};

export function sync() {
	let syncData = {
		email: window.eyevocalizeUserEmail,
		clientId: window.eyevocalizeClientId,
		lastSync: window.eyevocalizeLastSync,
		thisSyncClientTimestamp: Date.now(),
		updates: {
			History: HistoryGetPending()
		}
	};
	console.log('sync entered. syncData=');
	console.dir(syncData);
	if (socket) {
		console.log('socket.connected=');
		console.dir(socket.connected);
	}
	if (socket && socket.connected && window.eyevocalizeUserEmail && getSyncMyData()) {
		socket.emit('ClientInitiatedSync', JSON.stringify(syncData), msg => {
			console.log('server says: '+msg);
		});
	}
}

startupChecks(() => {
	main();
}, () => {});
