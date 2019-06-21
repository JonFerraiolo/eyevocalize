
import { html } from 'https://unpkg.com/lit-html?module';

let css = `
.Phrases {
}
.PhraseRow {
  display: flex;
}
.Phrases button {
  display: inline-block;
  flex: 1;
  margin: 1px 1em 1px 5em;
  align-items: center;
  border-radius: 3px;
  border: 1px solid black;
  background: none;
  font-size: 1.1rem;
  padding: 0.3rem 0.8em;
  color: black;
  text-align: left;
}
.Phrases button:hover, .Phrases button:focus {
  cursor: pointer;
}
.Phrases button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}

`;

export function Phrases(props) {
  let { speak, phrases } = props;
  let onSpeak = e => {
    speak(e.target.phraseContent);
  };
  return html`
  <style>${css}</style>
  <div class=Phrases>
    ${phrases.map(phrase => html`
      <div class=PhraseRow>
        <button @click=${onSpeak} .phraseContent=${phrase.text}>${phrase. label || phrase.text}</button>
      </div>
    `)}
  </div>`;
}
