import { SavedTextControl } from './SavedTextControl.js';
import { Settings } from './Settings.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

window.onload = function() {
	render(html`
		${ ('speechSynthesis' in window) ?
		html`Your browser <strong>supports</strong> speech synthesis.` :
		html`Sorry your browser <strong>does not support</strong> speech synthesis.`
		}`, document.getElementById('msg'));
	render(SavedTextControl('hello'), document.getElementById('SavedText'));

	let voices = speechSynthesis.getVoices();
	// Chrome loads voices asynchronously.
	window.speechSynthesis.onvoiceschanged = function(e) {
		voices = speechSynthesis.getVoices();
	  state.settings.voiceNames = voices.map(v => {
			return v.name;
		})
		showSettings();
	};

	let state = {
		settings: {
			voiceNames: null,
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
		// render(Settings(props), document.getElementById('root'));
	}

	var button = document.getElementById('speak');
	var speechMsgInput = document.getElementById('speech-msg');

	// Create a new utterance for the specified text and add it to
	// the queue.
	function speak(text) {
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
	button.addEventListener('click', function(e) {
		if (speechMsgInput.value.length > 0) {
			speak(speechMsgInput.value);
		}
	});
}
