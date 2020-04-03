
import { html, render } from './lib/lit-html/lit-html.js';
import { unsafeHTML } from './lib/lit-html/directives/unsafe-html.js';
import { startupChecks } from './startupChecks.js';

let css = `
.WelcomeTopBar {
  text-align: right;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

const Welcome = () => {
  const tryit = e => {
    e.preventDefault();
    window.location='/app';
  };
  const signup = e => {
    e.preventDefault();
    window.location='/signup';
  };
  const login = e => {
    e.preventDefault();
    window.location='/login';
  };
  render(html`
    <div class=Welcome>
      <div class=WelcomeTopBar>
        <button @click=${tryit}>Try It</button>
        <button @click=${signup}>Sign Up</button>
        <button @click=${login}>Login</button>
      </div>
      ${unsafeHTML(marked(`
# Welcome to EyeVocalize.com!

This website is a free, public version of a Web application that I wrote for myself
so that I can participate in conversations and communicate my needs
using only my eye, despite the fact that I have advanced ALS.

Only a few people will find this application useful. If you, like me, are:
* Paralyzed in your arms and hands
* Unable to talk
* Proficient in using [eye gaze technology], particularly the
[Tobii PC Eye Mini]

You run EyeVocalize in a browser tab,
which allows you to quickly switch between speech synthesis (using EyeVocalize)
other browser tabs (eg, web mail, search, calendar, chat, document authoring)
and other desktop applications (which for me is mostly programming tools).

EyeVocalize features:
* you can type text, then press Return (or click the speak icon) to cause the words to be spoken
using voice synthesis
* a built-in library of common expressions, such as yes, no,
thank you, toilet please, etc.
* you can define your own favorites for phrases that you use repeatedly
* you can prepare text in advance and
store on the Whiteboard for one-click speaking at just the right time
* for fun, you can play YouTube clips, such as
"Houston, we have a problem"

To explore, press the Try It button at the top of this window.
To sign up as a member of EyeVocalize.com, which unlocks
[cross-device syncing] and allows you to [contribute] to making the
application better, press the Sign Up button.
      `))}
    </div>`, document.body);
};

startupChecks(() => {
  let elem = document.createElement('script');
  elem.setAttribute('src', 'lib/marked.js');
  elem.addEventListener('load', e => {
    Welcome();
  }, false);
  document.head.appendChild(elem);
}, () => {});
