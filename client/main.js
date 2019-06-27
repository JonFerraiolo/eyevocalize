
import { TextEntryRow, TextEntryRowSetFocus, TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
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

let StashString = localStorage.getItem("Stash") || [];
let Stash = (typeof StashString === 'string') ? JSON.parse(StashString) : [];
let HistoryString = localStorage.getItem("History") || [];
let History = (typeof HistoryString === 'string') ? JSON.parse(HistoryString) : [];
let Favorites = [
	{ label: 'Basic', items: [
		{ label: 'nevermind', text: 'Sorry. False alarm. Nevermind what I just said.'},
		{ label: 'thanks', text: 'Thank you.'},
		{ label: 'thanka', text: 'Thank you. You are an angel.'},
		{ label: 'help', text: 'Please come and help me'},
		{ label: 'testing', text: 'Please ignore what comes out of the computer for the next couple of minutes. I am just testing the software. '},
	]},
	{ label: 'Care Requests', items: [
		{ label: 'air', text: 'Can I have air?'},
		{ label: 'mask', text: 'Can you please fix my breathing mask?'},
		{ label: 'nebulizer', text: 'Time for nebulizer and feeding'},
		{ label: 'toilet', text: 'Take me to the toilet, please'},
		{ label: 'urinal', text: 'can I please use the urinal'},
		{ label: 'bed', text: 'Can I please go to my bed?'},
		{ label: 'hurry', text: 'Please hurry!'},
		{ label: 'no rush', text: 'Take your time. Not urgent'},
		{ label: 'cold', text: 'I am a little cold. Could I please have something more over me?'},
		{ label: 'warm', text: 'I am a little warm. Could you please take something off of me?'},
		{ label: 'tubing', text: 'Please pull the blue tubing, you know, the tubing that goes from the breathing machine to my face mask, please pull it outside of the bed as much as possible. '},
		{ label: 'face up', text: 'Please roll me a little so that my body is flat on the bed and my head is facing straight up. '},
		{ label: 'head', text: 'Please straighten my head '},
	]},
	{ label: 'Adjustments', items: [
		{ label: 'down', text: 'Please move it down. '},
		{ label: 'up', text: 'Please move it up. '},
		{ label: 'left', text: 'Please move it to my left. '},
		{ label: 'right', text: 'Please move it to my right. '},
		{ label: 'chair pos', text: 'Can you please fix the position of the wheelchair?'},
		{ label: 'tilt fwd', text: 'Can you please tilt the wheelchair forward?'},
		{ label: 'tilt back', text: 'Can you please tilt the wheelchair backward?'},
	]},
	{ label: 'Other', items: [
		{ label: 'sliding', text: 'Can you please close the sliding glass doors?'},
		{ label: 'Pepe', text: 'Can someone please help Peppay? '},
		{ label: 'Disappointed!', text: 'ignore this', audio: 'http://www.montypython.net/sounds/wanda/disappointed.wav'},
		{ label: 'Inconceivable!', text: 'ignore this', audio: 'http://www.moviesoundclips.net/download.php?id=2900&ft=mp3'},
		{ label: 'Excellent!', text: 'ignore this', audio: 'http://www.billandted.org/sounds/ea/eaexcellent.mp3'},
	]}
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

	let addToStash = (text, type) => {
		Stash.push({ text, type, timestamp: new Date() });
		localStorage.setItem("Stash", JSON.stringify(Stash));
		update();
	}

	let addToHistory = (text, type) => {
		History.unshift({ text, type, timestamp: new Date() });
		localStorage.setItem("History", JSON.stringify(History));
		update();
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
				addToHistory(text, 'speak');
			}
		}
	}

	// play audio from a URL
	function playAudio(label, url) {
		if (url && url.length > 0) {
			var audio = new Audio(url);
			audio.play();
			TextEntryRowSetText('');
			addToHistory(label, 'audio', url);
		}
	}

	// Add text tohistory without speaking
	function stash(text) {
		text = (typeof text === 'string') ? text : TextEntryRowGetText();
		if (text.length > 0) {
			TextEntryRowSetText('');
			addToStash(text, 'stash')
		}
	}

	let search = text => {
		text = (typeof text === 'string') ? text : TextEntryRowGetText();
		update(text);
	}

	// The text area control has been cleared
	function clear() {
		update();
	}

	let update = searchString => {
		let TextEntryRowProps = { initialText: '', speak, stash, search, clear };
		let PhrasesProps = { Stash, History, Favorites, speak, playAudio, searchString, TextEntryRowSetText, TextEntryRowSetFocus };
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
