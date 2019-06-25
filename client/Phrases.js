
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
.History button {
  text-align: left;
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
  let { speak, History, Favorites, searchString, TextEntryRowSetText, TextEntryRowSetFocus } = props;
  let searchTokens = (typeof searchString  === 'string') ?
    searchString.toLowerCase().replace(/\s+/g, ' ').trim().split(' ') :
    [];
  let onClick = e => {
    let shift = e.getModifierState("Shift");
    let control = e.getModifierState("Control");
    let meta = e.getModifierState("Meta");
    let text = e.target.phraseContent;
    if (!shift && (control || meta)) {
      TextEntryRowSetText(text);
      TextEntryRowSetFocus();
    } else if (!shift && !control && !meta) {
      speak(text);
    }
  };
  let filteredPhrases = searchTokens.length === 0 ? History :
    History.filter(phrase => {
      return searchTokens.some(token => {
        return phrase.text.toLowerCase().includes(token);
      });
    });
  return html`
  <style>${css}</style>
  <div class=Phrases>
    <div class=History>
      <div class=PhrasesSectionLabel>History</div>
      ${filteredPhrases.map(phrase => html`
        <div class=PhraseRow>
          <button @click=${onClick} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
        </div>
      `)}
    </div>
    <div class=Favorites>
      <div class=PhrasesSectionLabel>Favorites</div>
      ${Favorites.map(phrase => html`
        <div class=FavoriteContainer>
          <button @click=${onClick} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
        </div>
      `)}
    </div>
  </div>`;
}
