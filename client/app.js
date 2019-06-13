import { SavedTextControl } from './SavedTextControl.js';

const { wire, bind } = hyperHTML;

window.onload = function() {
	bind(document.getElementById('msg'))`
		${ ('speechSynthesis' in window) ?
		wire()`Your browser <strong>supports</strong> speech synthesis.` :
		wire()`Sorry your browser <strong>does not support</strong> speech synthesis.`
	}`
	document.getElementById('SavedText').appendChild(SavedTextControl('hello'));

	var voiceSelect = document.getElementById('voice');
	var button = document.getElementById('speak');
	var speechMsgInput = document.getElementById('speech-msg');
	var volumeInput = document.getElementById('volume');
	var rateInput = document.getElementById('rate');
	var pitchInput = document.getElementById('pitch');

	function loadVoices() {
		var voices = speechSynthesis.getVoices();
		bind(voiceSelect)`${
		  voices.map(
		    voice =>
		    wire(voice)`<option value=${voice.name}>${voice.name}</option>}`
		  )
		}`
	}

	// Chrome loads voices asynchronously.
	window.speechSynthesis.onvoiceschanged = function(e) {
	  loadVoices();
	};
	loadVoices();

	// Create a new utterance for the specified text and add it to
	// the queue.
	function speak(text) {
		if (voiceSelect.value) {
			var msg = new SpeechSynthesisUtterance();
			msg.text = text;
			msg.volume = parseFloat(volumeInput.value);
			msg.rate = parseFloat(rateInput.value);
			msg.pitch = parseFloat(pitchInput.value);
			msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == voiceSelect.value; })[0];
			window.speechSynthesis.speak(msg);
		}
	}
	button.addEventListener('click', function(e) {
		if (speechMsgInput.value.length > 0) {
			speak(speechMsgInput.value);
		}
	});
}
