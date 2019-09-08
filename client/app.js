
import { main } from './main.js';
import { html, render } from './lib/lit-html/lit-html.js';

if (window.location.hostname === 'eyevocalize.com' && window.location.protocol === 'http:') {
	window.location = 'https://eyevocalize.com';
}

if ('speechSynthesis' in window) {
	main();

} else {
	render(html`
		<div class=nospeechsupport>
			Sorry, your browser does not support speech synthesis,
			which is required by this application.
			Please try a different browser.
		</div>`, document.body);
}
