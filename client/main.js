
import { TextEntryRow, TextEntryRowSetFocus } from './TextEntryRow.js';
import { Settings } from './Settings.js';
import { Phrases } from './Phrases.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

let css = `
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
	display: flex;
	flex-direction: column;
  padding: 1em;
  background: #FFFFFF;
	height: 100%;
}
.nospeechsupport {
  font-size: 2em;
}
`;

let HistoryString = localStorage.getItem("History") || [];
let History = (typeof HistoryString === 'string') ? JSON.parse(HistoryString) : [];
let Favorites = [
	{ label: 'help', text: 'Please come and help me'},
	{ label: 'air', text: 'Can I have air?'},
	{ label: 'nebulizer', text: 'Time for nebulizer and feeding'},
	{ label: 'toilet', text: 'Take me to the toilet, please'},
	{ label: 'urinal', text: 'can I please use the urinal'},
	{ label: 'bed', text: 'Can I please go to my bed?'},
	{ label: 'hurry', text: 'Please hurry!'},
	{ label: 'no rush', text: 'Take your time. Not urgent'},
	{ label: 'Pepe', text: 'Can someone please help Pehpay? '}
];

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
		History,
		Favorites
	};

	let showSettings = () => {
		// Don't show settings for the time being.
		// Will make into a popup
		const props = Object.assign({}, state.settings);
		render(Settings(props), document.getElementById('root'));
	}

	let addToHistory = (text, type) => {
		History.unshift({ text, type, timestamp: new Date() });
		localStorage.setItem("History", JSON.stringify(History));
		update();
	}

	// Add text to the voice synthesis queue
	function speak(text) {
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
				addToHistory(text, 'speak')
			}
		}
	}

	// Add text tohistory without speaking
	function stash(text) {
		if (text.length > 0) {
			addToHistory(text, 'stash')
		}
	}

	let search = (text) => {
		update(text);
	}

	// The text area control has been cleared
	function clear() {
		update();
	}

	let update = searchString => {
		let TextEntryRowProps = { initialText: '', speak, stash, search, clear };
		let PhrasesProps = { History, Favorites, speak, searchString };
		render(html`
			<style>${css}</style>
			<div class=main>
				${TextEntryRow(TextEntryRowProps)}
				${Phrases(PhrasesProps)}
			</div>
		`, document.body);
		TextEntryRowSetFocus();
	};
	update();

}
