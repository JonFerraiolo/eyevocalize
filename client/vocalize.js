
import { playYoutubeVideo } from './youtube.js' ;
import { addToHistory } from './History.js' ;
import { TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { getVoice } from './Settings.js';

let triggerUpdate;

export function initializeVocalize(props) {
	triggerUpdate = props.triggerUpdate;
};

// Add text to the voice synthesis queue
export function speak(text) {
	text = (typeof text === 'string') ? text : TextEntryRowGetText();
	if (text.length > 0) {
		let voice = getVoice();
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
      triggerUpdate();
		}
	}
};

// play audio from a URL
export function playAudio(phrase) {
  let { url } = phrase;
	if (url && url.length > 0) {
		var audio = new Audio(url);
		audio.play();
		TextEntryRowSetText('');
		addToHistory(Object.assign({}, phrase));
    updateMain();
	}
};

// play YouTube video from a videoId
export function playYoutube(phrase) {
	playYoutubeVideo(phrase);
};
