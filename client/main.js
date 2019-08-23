
import { updateTextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { initializeSettings, editSettings, mainAppPercentWhenSmall, getAppFontSize } from './Settings.js';
import { updatePhrases } from './Phrases.js';
import { initializeStash, stash, editStash } from './Stash.js';
import { initializeHistory, addToHistory, editHistory, playLastHistoryItem } from './History.js';
import { initializeFavorites, editFavorites } from './Favorites.js';
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
	let appmaincontentpercent = minOrMax === 'Min' ? mainAppPercentWhenSmall()+'%' : '100%';
	let appinitiallyblankpercent = minOrMax === 'Min' ? (100-mainAppPercentWhenSmall())+'%' : '0%';
	document.querySelector('.appmaincontent').style.height = appmaincontentpercent;
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
	render(html`
		<style>${css}</style>
		<div class=appfullheight style=${styleMap({fontSize: appFontSize+'px'})}>
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

export function main() {
  let currentVersion = 3;
  let initializationProps = { currentVersion };
  initializeSettings(initializationProps);
  initializeStash(initializationProps);
  initializeHistory(initializationProps);
  initializeFavorites(initializationProps);

	updateMain();

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

};
