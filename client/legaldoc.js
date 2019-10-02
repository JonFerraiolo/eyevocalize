
import { html, render } from './lib/lit-html/lit-html.js';
import { unsafeHTML } from './lib/lit-html/directives/unsafe-html.js';
import { startupChecks } from './startupChecks.js';

let css = `
`;

const LegalDoc = () => {
  render(html`
    <style>${css}</style>
    <div class=LegalDoc>
      ${unsafeHTML(marked(window.eyevocalizeMarkdown))}
    </div>`, document.body);
};

startupChecks(() => {
  let elem = document.createElement('script');
  elem.setAttribute('src', 'lib/marked.js');
  elem.addEventListener('load', e => {
    LegalDoc();
  }, false);
  document.head.appendChild(elem);
}, () => {});
