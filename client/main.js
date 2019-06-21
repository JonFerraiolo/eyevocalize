
import { TextEntryRow, TextEntryRowSetFocus } from './TextEntryRow.js';
import { Settings } from './Settings.js';
import { DefaultPhrases } from './DefaultPhrases.js';
import { BuildPhrases } from './BuildPhrases.js';
import { PhrasesAndTags } from './PhrasesAndTags.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

let css = `
*, *:before, *:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
html {
  font-family: Helvetica, Arial, sans-serif;
  background: #222;
}
html, body {
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
}
.main {
  width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
  padding: 1em;
  background: #FFFFFF;
}
.nospeechsupport {
  font-size: 2em;
}
`;

let phrases = BuildPhrases(DefaultPhrases);

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
		phrases
	};

	let showSettings = () => {
		// Don't show settings for the time being.
		// Will make into a popup
		const props = Object.assign({}, state.settings);
		render(Settings(props), document.getElementById('root'));
	}

	// Create a new utterance for the specified text and add it to
	// the queue.
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
			}
		}
	}

	let TextEntryRowProps = {
		initialText: '',
		speak
	};
	let PhrasesAndTagsProps = { phrases, speak };

	render(html`
		<style>${css}</style>
		<div class=main>
			${TextEntryRow(TextEntryRowProps)}
			${PhrasesAndTags(PhrasesAndTagsProps)}
		</div>
	`, document.body);

	TextEntryRowSetFocus();
}
