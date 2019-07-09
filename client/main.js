
import { updateTextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { initializeSettings, editSettings } from './Settings.js';
import { updatePhrases } from './Phrases.js';
import { initializeStash, stash, editStash } from './Stash.js';
import { initializeHistory, addToHistory, editHistory } from './History.js';
import { initializeFavorites, editFavorites } from './Favorites.js';
import { fromRight, fromLeft } from './animSlide.js';
import { initializeVocalize, speak, playAudio } from './vocalize.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

export function main() {
  let css = `@import 'app.css';`;

  function triggerUpdate() {
    updateMain();
  }

  let currentVersion = 2;
  let initializationProps = { currentVersion, triggerUpdate };
  initializeSettings(initializationProps);
  initializeVocalize(initializationProps);
  initializeStash(initializationProps);
  initializeHistory(initializationProps);
  let Favorites = initializeFavorites(initializationProps);

	let showSettings = () => {
		// Don't show Settings for the time being.
		// Will make into a popup
		const props = Object.assign({}, Settings);
		render(editSettings(props), document.getElementById('root'));
	}

	let search = text => {
		text = (typeof text === 'string') ? text : TextEntryRowGetText();
		updateMain(text);
	}

	// The text area control has been cleared
	function clear() {
		updateMain();
	}

  function buildSlideRightTitle(title, returnFunc) {
    let onClickReturn = e => {
      e.preventDefault();
      returnFunc();
    }
    return html`<div class=SlideRightTitle>
      <a href="" @click=${onClickReturn} class=SlideRightBackArrow></a><span class=SlideRightTitleText>${title}</span>
    </div>`;
  }

  function onEditStash() {
    let props = { onEditStashReturn, buildSlideRightTitle, speak };
    editStash(document.querySelector('.mainright'), props);
    let animParams = {
      leftContentDiv: document.querySelector('.mainleft'),
      animClassName: 'slideFromRightAnim'
    };
    fromRight(animParams);
  }

  function onEditStashReturn() {
    updateMain();
    let animParams = {
      leftContentDiv: document.querySelector('.mainleft'),
      origAnimClassName: 'slideFromRightAnim',
      undoAnimClassName: 'undoSlideFromRightAnim'
    };
    fromLeft(animParams);
  }

	let updateMain = searchString => {
		let TextEntryRowProps = { initialText: '', speak, stash, search, clear };
		let PhrasesProps = { Favorites, speak, playAudio,
      onEditStash, triggerUpdate,
      searchString, TextEntryRowSetText, TextEntryRowSetFocus };
		render(html`
			<style>${css}</style>
      <div class=main>
        <div class=mainleft>
          <div class=mainleftcontent>
            <div id=TextEntryRowContainer></div>
            <div id=PhrasesContainer></div>
          </div>
        </div>
        <div class=mainright></div>
      </div>
		`, document.body);
    updateTextEntryRow(document.getElementById('TextEntryRowContainer'), TextEntryRowProps);
    updatePhrases(document.getElementById('PhrasesContainer'), PhrasesProps);
		TextEntryRowSetFocus();
	};
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

}
