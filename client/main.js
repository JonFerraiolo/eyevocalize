
import { updateTextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { initializeSettings, editSettings, mainAppSizeWhenSmall } from './Settings.js';
import { updatePhrases } from './Phrases.js';
import { initializeStash, stash, editStash } from './Stash.js';
import { initializeHistory, addToHistory, editHistory, playLastHistoryItem } from './History.js';
import { initializeFavorites, editFavorites } from './Favorites.js';
import { fromRight, fromLeft } from './animSlide.js';
import { speak, playAudio } from './vocalize.js';
import { html, render } from './lib/lit-html/lit-html.js';

let css = `@import 'app.css';`;

let showSettings = () => {
	// Don't show Settings for the time being.
	// Will make into a popup
	const props = Object.assign({}, Settings);
	render(editSettings(props), document.getElementById('root'));
}

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
	let appmaincontentpercent = minOrMax === 'Min' ? (mainAppSizeWhenSmall()*100)+'%' : '100%';
	let appinitiallyblankpercent = minOrMax === 'Min' ? ((1-mainAppSizeWhenSmall())*100)+'%' : '0%';
	document.querySelector('.appmaincontent').style.height = appmaincontentpercent;
	document.querySelector('.appinitiallyblank').style.height = appinitiallyblankpercent;
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

function slideInScreenShow(leftContentDiv, rightContentDiv, params) {
  let { renderFunc, renderFuncParams } = params;
  renderFunc(rightContentDiv, renderFuncParams);
  let animParams = {
    leftContentDiv,
    animClassName: 'slideFromRightAnim'
  };
  fromRight(animParams);
}

function slideInScreenHide(leftContentDiv) {
  let animParams = {
    leftContentDiv,
    origAnimClassName: 'slideFromRightAnim',
    undoAnimClassName: 'undoSlideFromRightAnim'
  };
  fromLeft(animParams);
}

export function secondLevelScreenShow(params) {
  slideInScreenShow(document.querySelector('.mainleft'),
    document.querySelector('.secondlevelleft'), params);
}

export function secondLevelScreenHide() {
  slideInScreenHide(document.querySelector('.mainleft'));
}

export function thirdLevelScreenShow(params) {
  slideInScreenShow(document.querySelector('.secondlevelleft'),
    document.querySelector('.secondlevelright'), params);
}

export function thirdLevelScreenHide() {
  slideInScreenHide(document.querySelector('.secondlevelleft'));
}

let updateMainInProcess = false;
export function updateMain(searchString) {
	if (updateMainInProcess) return;
	updateMainInProcess = true;
	let TextEntryRowProps = { initialText: '' };
	let PhrasesProps = { searchString };
	render(html`
		<style>${css}</style>
		<div class=appfullheight>
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
			<p>To use this area for the application's user interface, press the
				<span class=icon></span> icon at the top-right of the application.</p>
			</div>
		</div>
	`, document.body);
	setAppMinOrMax(appMinOrMax);
  updateTextEntryRow(document.getElementById('TextEntryRowContainer'), TextEntryRowProps);
  updatePhrases(document.getElementById('PhrasesContainer'), PhrasesProps);
	TextEntryRowSetFocus();
	updateMainInProcess = false;
};

export function main() {
  let currentVersion = 2;
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
