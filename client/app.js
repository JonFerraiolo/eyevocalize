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
	  state.settings.voices = speechSynthesis.getVoices();
		showSettings();
	};

	let state = {
		settings: {
			voices,
			voice: null,
			setVoice: voice => {
				state.settings.voice = voice;
				showSettings();
			}
		}
	};

	let showSettings = () => {
		render(Settings(state.settings), document.getElementById('root'));
	}

	var button = document.getElementById('speak');
	var speechMsgInput = document.getElementById('speech-msg');

/*
	var voiceSelect = document.getElementById('voice');
	var volumeInput = document.getElementById('volume');
	var rateInput = document.getElementById('rate');
	var pitchInput = document.getElementById('pitch');
*/

	// Create a new utterance for the specified text and add it to
	// the queue.
	function speak(text) {
		let voice = state.settings.voice || state.settings.voices[0];
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
