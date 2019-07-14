
import { main } from './main.js';
import { html, render } from './lib/lit-html/lit-html.js';

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
