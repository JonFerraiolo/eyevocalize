
import { html, render } from './lib/lit-html/lit-html.js';
import { unsafeHTML } from './lib/lit-html/directives/unsafe-html.js';
import { startupChecks } from './startupChecks.js';

let css = `
html, body {
  width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
}
body {
	background-image: linear-gradient(#2C3E50, #4CA1AF);
}
.PageContainer {
  height: 100%;
  display: flex;
}
.Page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5em 2em;
  max-width: 40em;
  margin: 0 auto;
  background: #fefefe;
  border-radius: 6px;
  box-shadow: 2px 2px 1px #444;
  overflow-x: hidden;
  overflow-y: hidden;
}
.PageTopBar {
  text-align: right;
}
.PageContent {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
h1 {
  font-size: 1.5em;
  text-align: center;
}
button {
  border-radius: 4px;
  box-shadow: 1px 1px 1px #999;
  margin-left: 0.35em;
}
.TryIt {
  background-color: lightgoldenrodyellow;
  border: 1px solid #440;
}
.SignUp {
  background-color: lightgreen;
  border: 1px solid #040;
}
.Login {
  background-color: lightblue;
  border: 1px solid #004;
}
.footer {
  display: flex;
  justify-content: space-around;
  font-size: 80%;
  padding: 1em 0 0.5em;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

const ShowPage = page => {
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
  let onClickFooter = () => {

  };
  render(html`
    <div class=PageContainer>
      <div class=Page>
        <div class=PageTopBar>
          <button @click=${tryit} class=TryIt>Try It</button>
          <button @click=${signup} class=SignUp>Sign Up</button>
          <button @click=${login} class=Login>Login</button>
        </div>
        <div class=PageContent>
          ${unsafeHTML(marked(md[page]))}
        </div>
        <div class=footer>
          <a href="/" class=Home @click=${onClickFooter}>Home</a>
          <a href="/About" class=About @click=${onClickFooter}>About</a>
          <a href="/TermsOfUse" class=TermsOfUse @click=${onClickFooter}>Terms of Use</a>
          <a href="/PrivacyPolicy" class=PrivacyPolicy @click=${onClickFooter}>Privacy Policy</a>
          <a href="/Cookies" class=Cookies @click=${onClickFooter}>Cookies</a>
        </div>
      </div>
    </div>`, document.body);
};

startupChecks(() => {
  let elem = document.createElement('script');
  elem.setAttribute('src', 'lib/marked.js');
  elem.addEventListener('load', e => {
    let page = xref[window.location.pathname] || "Home";
    ShowPage(page);
  }, false);
  document.head.appendChild(elem);
}, () => {});

let xref = {
  "/" : "Home",
  "/About": "About",
  "/TermsOfUse": "TermsOfUse",
  "/PrivacyPolicy": "PrivacyPolicy",
  "/Cookies": "Cookies",
};

let md = {
  Home: `
# Welcome to EyeVocalize.com!

This website is a free, public version of a text-to-speech Web application that I wrote for myself
(an advanced ALS patient).
I included various features so that I can communicate quickly and efficiently
using only my eyes.

Only a few people will find this application useful. This app might be useful if you, like me, are:
* Paralyzed in your arms and hands
* Unable to talk
* Proficient in using eye gaze technology,  such as the
[Tobii PC Eye Mini](https://www.tobiidynavox.com/en-us/devices/eye-gaze-devices/pceye-mini-access-windows-control/)

You run EyeVocalize in a browser tab,
which allows you to quickly switch between speech synthesis (using EyeVocalize),
other browser tabs (eg, web mail, search, calendar, chat, document authoring)
and other desktop applications (which for me is mostly programming tools).

EyeVocalize features:
* **Text-to-speech**: You can type text, then press Return (or click the speak icon) to cause the words to be spoken
using voice synthesis
* **Favorites**: You can define your own favorites for phrases that you use repeatedly, use the default set of favorites or import libraries of favorites
* **Notes**: You can prepare text in advance and
store on the Notes for one-click speaking at just the right time
* **Video**: For fun, you can play YouTube clips, such as
"Houston, we have a problem"

To explore, press the Try It button at the top of this window.
To sign up as a user of EyeVocalize.com, press the Sign Up button, which unlocks
cross-device syncing and automatic cloud backup
(and removes annoying reminders).
`,
About: `
# About EyeVocalize.com
not yet available
`,
TermsOfUse: `
# EyeVocalize.com Terms of Use
not yet available
`,
PrivacyPolicy: `
# EyeVocalize.com Privacy Policy
not yet available
`,
Cookies: `
# EyeVocalize.com Use of Cookies and Similar Technologies
not yet available
`,
};
