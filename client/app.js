
import { main } from './main.js';
import { html, render } from 'https://unpkg.com/lit-html?module';

if ('speechSynthesis' in window) {
	let voices = speechSynthesis.getVoices();
	let renderMain = () => {
		if (voices && voices.length > 0) {
			main({ voices });
		}
	}
	// Chrome loads voices asynchronously.
	window.speechSynthesis.onvoiceschanged = function(e) {
		voices = speechSynthesis.getVoices();
		renderMain();
	};
	renderMain();

} else {
	render(html`
		<div class=nospeechsupport>
			Sorry, your browser does not support speech synthesis,
			which is required by this application.
			Please try a different browser.
		</div>`, document.body);
}
