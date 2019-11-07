
import { playYoutubeVideo } from './youtube.js' ;
import { addToHistory } from './History.js' ;
import { TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { getVoice, getVolume, getRate, getPitch } from './Settings.js';
import { showPopup, hidePopup } from './popup.js';
import { updateMain, isChrome } from './main.js';
import { html, render } from './lib/lit-html/lit-html.js';

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
			addToHistory({ type: 'text', text, timestamp: Date.now() });
      updateMain();
			vocalizePopup('Now vocalizing:', text, () => {
				window.speechSynthesis.cancel();
			}, () => {
				return window.speechSynthesis.pending || window.speechSynthesis.speaking;
			});
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
		addToHistory(Object.assign({}, phrase, { timestamp: Date.now() }));
    updateMain();
		vocalizePopup('Playing Web audio:', phrase.label || '', () => {
			audio.pause();
		}, () => {
			return !audio.paused && !audio.ended;
		});
	}
};

// play YouTube video from a videoId
export function playYoutube(phrase) {
	playYoutubeVideo(phrase);
};

function vocalizePopup(title, content, cancelCB, inProcessCB) {
	let params = {
		content: html`<div class=Vocalize>
				<div class=VocalizeTitle>${title}</div>
				<div class=VocalizeContent>${content}</div>
			</div>`,
		refNode: document.querySelector('.main'),
		hideCallback: () => {
			if (popupUp) {
				cancelCB();
				render(html``, popupRootElement);
				popupUp = false;
			}
			updateMain();
		}
	};
	let popupUp = true;
	let popupRootElement = showPopup(params);
	let interval = setInterval(function () {
		if (!popupUp || !inProcessCB()) {
			clearInterval(interval);
			hidePopup();
		}
	}, 10);
}
