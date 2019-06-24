
import { html } from 'https://unpkg.com/lit-html?module';

let css = `
.Phrases  {
  flex: 1;
  display: flex;
  flex-direction: row;
}
.History, .Favorites {
  flex: 1;
  overflow: auto;
  height: 100%;
  display: inline-block;
}
.PhrasesSectionLabel {
  background: #eee;
  font-weight: bold;
  line-height: 1.1;
  text-align: center;
  border: 1px solid black;
}
.History .PhrasesSectionLabel {
  border-right: none;
}
.PhraseRow {
  display: flex;
  padding: 0 5em;
}
.FavoriteContainer {
  display: inline-block;
}
.Favorites button {
  display: inline-block;
  flex: 1;
  margin: 1px 0;
  align-items: center;
  border-radius: 3px;
  border: 1px solid black;
  background: none;
  font-size: 1rem;
  padding: 0.3rem 0.8em;
  color: black;
  text-align: left;
}
.Favorites button:hover, .Favorites button:focus {
  cursor: pointer;
}
.Favorites button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
`;

export function Phrases(props) {
  let { speak, History, Favorites } = props;
  let onSpeak = e => {
    speak(e.target.phraseContent);
  };
  return html`
  <style>${css}</style>
  <div class=Phrases>
    <div class=History>
      <div class=PhrasesSectionLabel>History</div>
      ${History.map(phrase => html`
        <div class=PhraseRow>
          <button @click=${onSpeak} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
        </div>
      `)}
    </div>
    <div class=Favorites>
      <div class=PhrasesSectionLabel>Favorites</div>
      ${Favorites.map(phrase => html`
        <div class=FavoriteContainer>
          <button @click=${onSpeak} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
        </div>
      `)}
    </div>
  </div>`;
}
