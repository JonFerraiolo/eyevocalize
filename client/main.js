

import { startupChecks } from './startupChecks.js';
import { helpShowing, toggleHelp, showHelp } from './help.js';
import { popupShowing } from './popup.js';
import { updateTextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { initializeSettings, editSettings, mainAppPercentWhenSmall, getAppFontSize, getSyncMyData, SettingsGetPending, SettingsSync } from './Settings.js';
import { updatePhrases } from './Phrases.js';
import { initializeNotes, NotesGetPending, NotesSync, AddTextToNotes, editNotes } from './Notes.js';
import { initializeHistory, HistoryGetPending, HistorySync, playLastHistoryItem } from './History.js';
import { initializeFavorites, FavoritesGetPending, FavoritesSync,  editFavorites } from './MyPhrases.js';
import { fromRight, fromLeft } from './animSlide.js';
import { speak } from './vocalize.js';
import { html, render } from './lib/lit-html/lit-html.js';
import { styleMap } from './lib/lit-html/directives/style-map.js';

let css = `@import 'app.css';`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

export let localization;

let mainShowing = true;

// Chrome gets messed up if user changes voice pitch, this API allows hiding pitch option for Chrome
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
	setTimeout(() => {
		let event = new CustomEvent("AppLayoutChanged", { detail: null } );
    window.dispatchEvent(event);
	}, 0);
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
		<div class=appfullheight style=${styleMap({fontSize: (appFontSize*1.1)+'%'})}>
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
			<div class=footer>
				<a href="/">Home</a>
				<a href="/About">About</a>
				<a href="/TermsOfUse">Terms of Use</a>
				<a href="/PrivacyPolicy">Privacy Policy</a>
				<a href="/Cookies">Cookies</a>
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
	localization = window.EvcLocalization;
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
  initializeNotes(initializationProps);
  initializeHistory(initializationProps);
	initializeFavorites(initializationProps);

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
					if (resp.status === 200) {
						resp.json().then(data => {
							window.eyevocalizeUserEmail = lsEmail;
							window.eyevocalizeUserChecksum = lsChecksum;
							localStorage.setItem('userEmail', window.eyevocalizeUserEmail);
							localStorage.setItem('userChecksum', window.eyevocalizeUserChecksum);
							updateMain();
							resolve();
						});
					} else if (resp.status === 401) {
						resp.json().then(data => {
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
				sync();
			});
			socket.on('ServerInitiatedRefresh', (serverSyncDataJson, fn) => {
				// after every server restart, pull down the latest client code
				window.location.reload();
			});
			socket.on('ServerInitiatedSync', (serverSyncDataJson, fn) => {
				console.log('ServerInitiatedSync serverSyncDataJson='+serverSyncDataJson);
				try {
					let serverSyncData = JSON.parse(serverSyncDataJson);
					let { thisSyncServerTimestamp, updates } = serverSyncData;
					NotesSync(thisSyncServerTimestamp, updates && updates.Notes);
					HistorySync(thisSyncServerTimestamp, updates && updates.History);
					FavoritesSync(thisSyncServerTimestamp, updates && updates.Favorites);
					SettingsSync(thisSyncServerTimestamp, updates && updates.Settings);
					window.eyevocalizeLastSync = Date.now();
					localStorage.setItem('lastSync', window.eyevocalizeLastSync.toString());
					if (typeof fn === 'function') {
						fn(JSON.stringify({ success: true }));
					}
					updateMain();
				} catch(e) {
					console.error('sync exception, possibly bad JSON. e=');
					console.dir(e);
					if (typeof fn === 'function') {
						fn(JSON.stringify({ success: false, error: 'client side exception' }));
					}
				}
			});
			sync();
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
	}).finally(() => {
		if (window.eyevocalizeUserEmail === '' || !localStorage.getItem('LoginHelpClosed')) {
			setTimeout(() => {
				showHelp('Starting', 'tall-wide');
			}, 0);
		}
	});

	document.addEventListener('keydown', e => {
		let shift = e.getModifierState("Shift");
    let control = e.getModifierState("Control");
    let meta = e.getModifierState("Meta");
    if (e.key === 'Enter') {
      if (shift && !control && !meta) {
        // just pass through to default processing, which will add a newline
      } else if (!shift && (control || meta)) {
        e.preventDefault();
        AddTextToNotes();
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
		} else if (e.key === 'h' && !shift && (control || meta)) {
			// Control+h toggles visibility of the Help popup
			e.preventDefault();
			toggleHelp();
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
		if (socket /*&& socket.connected*/ && window.eyevocalizeUserEmail && getSyncMyData()) {
			let lastSync = window.eyevocalizeLastSync;
			let clientData = {
				email: window.eyevocalizeUserEmail,
				clientId: window.eyevocalizeClientId,
				lastSync,
			};
			socket.emit(document.hidden ? 'ClientHidden' : 'ClientVisible', JSON.stringify(clientData), msg => {
			});
			if (!document.hidden) {
				sync();
			}
		}
	}, false);
	window.addEventListener('resize', e => {
		setTimeout(() => {
			let event = new CustomEvent("AppLayoutChanged", { detail: null } );
			window.dispatchEvent(event);
		}, 0);
	}, false);
};

export function sync() {
	let lastSync = window.eyevocalizeLastSync;
	let syncData = {
		email: window.eyevocalizeUserEmail,
		clientId: window.eyevocalizeClientId,
		lastSync,
		thisSyncClientTimestamp: Date.now(),
		updates: {
			Notes: NotesGetPending(lastSync),
			History: HistoryGetPending(lastSync),
			Favorites: FavoritesGetPending(lastSync),
			Settings: SettingsGetPending(lastSync),
		}
	};
	console.log('sync entered. syncData=');
	console.dir(syncData);
	if (socket /*&& socket.connected*/ && window.eyevocalizeUserEmail && getSyncMyData()) {
		socket.emit('ClientInitiatedSync', JSON.stringify(syncData), msg => {
		});
	}
}

startupChecks(() => {
	main();
}, () => {});
