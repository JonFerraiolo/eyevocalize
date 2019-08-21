
import { playYoutubeVideo } from './youtube.js' ;
import { addToHistory } from './History.js' ;
import { TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { getVoice, getVolume, getRate, getPitch } from './Settings.js';
import { updateMain, isChrome } from './main.js';

// Add text to the voice synthesis queue
export function speak(text) {
	text = (typeof text === 'string') ? text : TextEntryRowGetText();
	if (text.length > 0) {
		let voice = getVoice();
		let volume = getVolume();
		let rate = getRate();
		let pitch = getPitch();
		if (isChrome()) pitch = 1;  // chrome freezes voice synthesis if you speak with pitch! =1
		if (voice) {
			var msg = new SpeechSynthesisUtterance();
			msg.text = text;
			msg.volume = volume;
			msg.rate = rate;
			msg.pitch = pitch;
			msg.voice = voice;
			window.speechSynthesis.speak(msg);
			TextEntryRowSetText('');
			addToHistory({ type: 'text', text });
      updateMain();
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
