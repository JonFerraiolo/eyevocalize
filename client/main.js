
import { updateTextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { Settings } from './Settings.js';
import { updatePhrases } from './Phrases.js';
import { editStash } from './Stash.js';
import { fromRight, fromLeft} from './animSlide.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

let css = `
:root {
  --shadowColor: #e4e4e4;
}
*, *:before, *:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
html, body {
	width: 100%;
	margin: 0;
	padding: 0;
}
html {
  font-family: Helvetica, Arial, sans-serif;
  background: #222;
	height: 100%;
}
body {
	height: 50%;
}
.main {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: #FFFFFF;
  /* for left/right slide animations. See animSlide.js */
  overflow: hidden;
  white-space: nowrap;
}
.mainleft, .mainright {
  width: 100%;
  height: 100%;
	display: inline-block;
  vertical-align: top;
  white-space: normal;
}
.mainleftcontent {
  width: 100%;
  height: 100%;
	display: flex;
	flex-direction: column;
  padding: 1em;
}
#PhrasesContainer {
  flex: 1;
  min-height: 0px;
}
.slideFromRightAnim {
  animation-name: slideFromRight; animation-duration: 1s; animation-timing-function: linear; animation-fill-mode: forwards;
}
@keyframes slideFromRight { from { margin-left: 0; } to { margin-left: -100%; } }
.undoSlideFromRightAnim {
  animation-name: undoSlideFromRight; animation-duration: 1s; animation-timing-function: linear; animation-fill-mode: forwards;
}
@keyframes undoSlideFromRight { from { margin-left: -100%; } to { margin-left: 0; } }
.nospeechsupport {
  font-size: 2em;
}
.SlideRightTitle {
  font-size: 110%;
  text-align: center;
  padding: 0.5em 0;
  line-height: 150%;
}
.SlideRightBackArrow {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  background-image: url(images/arrowback.svg);
  background-size: contain;
  background-repeat: no-peat;
  margin-left: 1em;
  float: left;
  vertical-align: middle;
}
.skinnyScreenParent {
  background: #666;
  width: 100%;
  height: 100%;
}
.skinnyScreenChild {
  max-width: 500px;
  height: 100%;
  margin: 0 auto;
  background: white;
}
.skinnyScreenChild .ScreenInstructions {
  padding: 0.5em 1.75em 1em;
  font-size: 90%;
}
.skinnyScreenChild .SelectLinksRow {
  padding: 0.5em 1.5em 0;
  display: flex;
  justify-content: space-around;
  font-size: 95%;
}
.SelectLinksRow a, .SelectLinksRow a:link, .SelectLinksRow a:visited {
  color: 25274d;
  text-decoration: underline;
  cursor: pointer;
}
.SelectLinksRow a:hover {
  color: blue;
}
.skinnyScreenChild .ButtonRow {
  padding: 1em 1.5em;
  display: flex;
  justify-content: space-around;
}
.skinnyScreenChild .ButtonRow button{
  display: inline-block;
  zoom: 1;
  padding: 2px 15px;
  margin: 0;
  cursor: pointer;
  border: 1px solid #bbb;
  overflow: visible;
  font: bold 13px arial, helvetica, sans-serif;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color .2s ease-out;
  background-clip: padding-box; /* Fix bleeding */
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, .3), 0 2px 2px -1px rgba(0, 0, 0, .5), 0 1px 0 rgba(255, 255, 255, .3) inset;
  text-shadow: 0 1px 0 rgba(255,255,255, .9);
  user-select: none;
  color: #003;
  text-shadow: 0 1px 0 rgba(0,0,0,.2);
  background-image: linear-gradient(top, rgba(255,255,255,.3), rgba(255,255,255,0));
  background-color: #2e9cca; /*23:https://visme.co/blog/website-color-schemes/,25274d,464866,aaabb8,29648a,*/
  border-color: #269CE9;
}
.skinnyScreenChild .ButtonRow button:hover{
  background: #29648a;
}
.skinnyScreenChild .ButtonRow button:active{
  background: #269CE9;
  position: relative;
  top: 1px;
  text-shadow: none;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .3) inset;
}
.skinnyScreenChild .ButtonRow button[disabled],
.skinnyScreenChild .ButtonRow button[disabled]:hover,
.skinnyScreenChild .ButtonRow button[disabled]:active{
  color: #ccc;
  opacity: 0.4;
}
.ButtonRow button .arrowButton {
  font-size: 200%;
  font-weight:bold
}
.PhraseRow button.selected {
  color: black;
  background-color: #ddd;
  border-color: #29648a;
}
.PhraseRow button.selected .checkmark {
  color: #25274d;
}
`;

let currentVersion = 2;

let initialStash = { version: currentVersion, expanded: true, items: [] };
let StashString = localStorage.getItem("Stash");
let Stash;
try {
  Stash = (typeof StashString === 'string') ? JSON.parse(StashString) : initialStash;
} catch(e) {
  Stash = initialStash;
}
if (typeof Stash.version != 'number'|| Stash.version < currentVersion) {
  Stash = initialStash;
}

let initialHistory = { version: currentVersion, expanded: true, items: [] };
let HistoryString = localStorage.getItem("History");
let History;
try {
  History = (typeof HistoryString === 'string') ? JSON.parse(HistoryString) : initialHistory;
} catch(e) {
  History = initialHistory;
}
if (typeof History.version != 'number'|| History.version < currentVersion) {
  History = initialHistory;
}

let Favorites = {
  version: currentVersion,
  categories: [
  	{ label: 'Basic', expanded: true, items: [
  		{ type: 'text', label: 'nevermind', text: 'Sorry. False alarm. Nevermind what I just said.'},
  		{ type: 'text', label: 'thanks', text: 'Thank you.'},
  		{ type: 'text', label: 'thanka', text: 'Thank you. You are an angel.'},
  		{ type: 'text', label: 'help', text: 'Please come and help me'},
  		{ type: 'text', label: 'testing', text: 'Please ignore what comes out of the computer for the next couple of minutes. I am just testing the software. '},
  	]},
  	{ label: 'Care Requests', expanded: true, items: [
  		{ type: 'text', label: 'air', text: 'Can I have air?'},
  		{ type: 'text', label: 'mask', text: 'Can you please fix my breathing mask?'},
  		{ type: 'text', label: 'nebulizer', text: 'Time for nebulizer and feeding'},
  		{ type: 'text', label: 'toilet', text: 'Take me to the toilet, please'},
  		{ type: 'text', label: 'urinal', text: 'can I please use the urinal'},
  		{ type: 'text', label: 'bed', text: 'Can I please go to my bed?'},
  		{ type: 'text', label: 'hurry', text: 'Please hurry!'},
  		{ type: 'text', label: 'no rush', text: 'Take your time. Not urgent'},
  		{ type: 'text', label: 'cold', text: 'I am a little cold. Could I please have something more over me?'},
  		{ type: 'text', label: 'warm', text: 'I am a little warm. Could you please take something off of me?'},
  		{ type: 'text', label: 'tubing', text: 'Please pull the blue tubing, you know, the tubing that goes from the breathing machine to my face mask, please pull it outside of the bed as much as possible. '},
  		{ type: 'text', label: 'face up', text: 'Please roll me a little so that my body is flat on the bed and my head is facing straight up. '},
  		{ type: 'text', label: 'head', text: 'Please straighten my head '},
  	]},
  	{ label: 'Adjustments', expanded: true, items: [
  		{ type: 'text', label: 'down', text: 'Please move it down. '},
  		{ type: 'text', label: 'up', text: 'Please move it up. '},
  		{ type: 'text', label: 'left', text: 'Please move it to my left. '},
  		{ type: 'text', label: 'right', text: 'Please move it to my right. '},
  		{ type: 'text', label: 'chair pos', text: 'Can you please fix the position of the wheelchair?'},
  		{ type: 'text', label: 'tilt fwd', text: 'Can you please tilt the wheelchair forward?'},
  		{ type: 'text', label: 'tilt back', text: 'Can you please tilt the wheelchair backward?'},
  	]},
  	{ label: 'Other', expanded: true, items: [
  		{ type: 'text', label: 'sliding', text: 'Can you please close the sliding glass doors?'},
  		{ type: 'text', label: 'Pepe', text: 'Can someone please help Peppay? '},
  		{ type: 'audio', label: 'Disappointed!', url: 'http://www.montypython.net/sounds/wanda/disappointed.wav'},
  		{ type: 'audio', label: 'Inconceivable!', url: 'http://www.moviesoundclips.net/download.php?id=2900&ft=mp3'},
  		{ type: 'audio', label: 'Excellent!', url: 'http://www.billandted.org/sounds/ea/eaexcellent.mp3'},
  	]}
  ]
};

export function main(props) {
	let { voices } = props;
	// render(SavedTextControl('hello'), document.getElementById('SavedText'));

	let state = {
		settings: {
			voiceNames: voices.map(v => {
				return v.name;
			}),
			voiceName: null,
			setVoiceName: voiceName => {
				state.settings.voiceName = voiceName;
				showSettings();
			}
		},
		Stash,
		History,
		Favorites
	};

	let showSettings = () => {
		// Don't show settings for the time being.
		// Will make into a popup
		const props = Object.assign({}, state.settings);
		render(Settings(props), document.getElementById('root'));
	}

	let addToStash = phrase => {
    phrase = Object.assign({ timestamp: new Date() }, phrase);
		Stash.items.unshift(phrase);
		localStorage.setItem("Stash", JSON.stringify(Stash));
		updateMain();
	}

	let addToHistory = obj => {
    obj = Object.assign({ timestamp: new Date() }, obj);
		History.items.unshift(obj);
		localStorage.setItem("History", JSON.stringify(History));
		updateMain();
	}

	// Add text to the voice synthesis queue
	function speak(text) {
		text = (typeof text === 'string') ? text : TextEntryRowGetText();
		if (text.length > 0) {
			let voice = voices.find(v => {
				return v.name === state.settings.voiceName;
			}) || voices[0];
			if (voice) {
				var msg = new SpeechSynthesisUtterance();
				msg.text = text;
				/*
				msg.volume = parseFloat(volumeInput.value);
				msg.rate = parseFloat(rateInput.value);
				msg.pitch = parseFloat(pitchInput.value);
				*/
				msg.volume = 1;
				msg.rate = 1;
				msg.pitch = 1;
				msg.voice = voice;
				window.speechSynthesis.speak(msg);
				TextEntryRowSetText('');
				addToHistory({ type: 'text', text });
			}
		}
	}

	// play audio from a URL
	function playAudio(label, url) {
		if (url && url.length > 0) {
			var audio = new Audio(url);
			audio.play();
			TextEntryRowSetText('');
			addToHistory({type:'audio', label, url });
		}
	}

	// Add text tohistory without speaking
	function stash(text) {
		text = (typeof text === 'string') ? text : TextEntryRowGetText();
		if (text.length > 0) {
			TextEntryRowSetText('');
			addToStash({ type: 'text', text });
		}
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
    let props = { Stash, onStashChange, onEditStashReturn, buildSlideRightTitle, speak };
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

  function onStashChange(newStash) {
    Stash = JSON.parse(JSON.stringify(newStash));  // deep clone
    localStorage.setItem("Stash", JSON.stringify(Stash));
  }

  function triggerUpdate() {
    // FIXME we are saving and redrawing the whole world
    localStorage.setItem("Stash", JSON.stringify(Stash));
    localStorage.setItem("History", JSON.stringify(History));
    localStorage.setItem("Favorites", JSON.stringify(Favorites));
    updateMain();
  }

	let updateMain = searchString => {
		let TextEntryRowProps = { initialText: '', speak, stash, search, clear };
		let PhrasesProps = { Stash, History, Favorites, speak, playAudio,
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
		} else if (e.key === '.' && !shift && (control || meta)) {
			// Control+period speaks the most recent entry in the History
			let text = History.length > 0 ? History[0].text : '';
			if (text.length > 0) {
				e.preventDefault();
				speak(text);
			}
    } else {
      // just pass through to default processing, which will add the character
    }
	}, false);

}
