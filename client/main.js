import { SavedTextControl } from './SavedTextControl.js';
import { Settings } from './Settings.js';
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

.main {
  width: 500px;
  margin: 10px auto;
  padding: 1em;
  background: #FFFFFF;
}

.nospeechsupport {
  font-size: 2em;
}

input[type="text"] {
  width: 100%;
  padding: 0.5em;
  font-size: 1.2em;
  border-radius: 3px;
  border: 1px solid #D9D9D9;
  box-shadow: 0 2px 3px rgba(0,0,0,0.1) inset;
}

input[type="range"] {
  width: 300px;
}

label {
  display: inline-block;
  float: left;
  width: 150px;
}

.option {
  margin: 1em 0;
}

button {
  display: inline-block;
  border-radius: 3px;
  border: none;
  font-size: 0.9rem;
  padding: 0.5rem 0.8em;
  background: #69c773;
  border-bottom: 1px solid #498b50;
  color: white;
  -webkit-font-smoothing: antialiased;
  font-weight: bold;
  margin: 0;
  width: 100%;
  text-align: center;
}

button:hover, button:focus {
  opacity: 0.75;
  cursor: pointer;
}

button:active {
  opacity: 1;
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
`;

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
		}
	};

	let showSettings = () => {
		// Don't show settings for the time being.
		// Will make into a popup
		const props = Object.assign({}, state.settings);
		//render(Settings(props), document.getElementById('root'));
	}

	// Create a new utterance for the specified text and add it to
	// the queue.
	function speak() {
		let text = document.getElementById('speech-msg').value;
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

	render(html`
		<style>${css}</style>
		<div class=main>
			<div id="root"></div>
			<div>
				<input type="text" name="speech-msg" id="speech-msg" x-webkit-speech />
			</div>
			<div id="SavedText"></div>
			<button @click=${speak}>Speak</button>
		</div>
	`, document.body);

}
