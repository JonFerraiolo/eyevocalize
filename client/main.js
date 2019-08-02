
import { updateTextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { initializeSettings, editSettings } from './Settings.js';
import { updatePhrases } from './Phrases.js';
import { initializeStash, stash, editStash } from './Stash.js';
import { initializeHistory, addToHistory, editHistory } from './History.js';
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

/**
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

export function updateMain(searchString) {
	let TextEntryRowProps = { initialText: '' };
	let PhrasesProps = { searchString };
	render(html`
		<style>${css}</style>
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
	`, document.body);
  updateTextEntryRow(document.getElementById('TextEntryRowContainer'), TextEntryRowProps);
  updatePhrases(document.getElementById('PhrasesContainer'), PhrasesProps);
	TextEntryRowSetFocus();
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
    /* FIXME
		} else if (e.key === '.' && !shift && (control || meta)) {
			// Control+period speaks the most recent entry in the History
			let text = History.length > 0 ? History[0].text : '';
			if (text.length > 0) {
				e.preventDefault();
				speak(text);
			}
      */
    } else {
      // just pass through to default processing, which will add the character
    }
	}, false);
};
