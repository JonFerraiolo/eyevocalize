
import { html } from 'https://unpkg.com/lit-html?module';

let css = `
.Phrases  {
  flex: 1;
  display: flex;
  flex-direction: row;
}
.StashAndHistory, .Favorites {
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
.Stash .PhrasesSectionLabel {
  border-right: none;
}
.Favorites {
  padding-left: 0.5em;
}
.FavoritesCategoryLabel {
  font-size: 90%;
  color: #ccc;
}
.PhraseRow {
  display: flex;
  padding: 0 5em;
}
.History button, .Stash button {
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
  let { speak, playAudio, Stash, History, Favorites, searchString, TextEntryRowSetText, TextEntryRowSetFocus } = props;
  let searchTokens = (typeof searchString  === 'string') ?
    searchString.toLowerCase().replace(/\s+/g, ' ').trim().split(' ') :
    [];
  let onClick = e => {
    let shift = e.getModifierState("Shift");
    let control = e.getModifierState("Control");
    let meta = e.getModifierState("Meta");
    let text = e.target.phraseContent;
    let label  = e.target.phraseLabel;
    let audio = e.target.phraseAudio;
    if (!shift && (control || meta)) {
      TextEntryRowSetText(text);
      TextEntryRowSetFocus();
    } else if (!shift && !control && !meta) {
      if (audio) {
        playAudio(label, audio);
      } else {
        speak(text);
      }
    }
  };
  let filteredStash = searchTokens.length === 0 ? Stash :
    Stash.filter(phrase => {
      return searchTokens.some(token => {
        return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
      });
    });
  let filteredHistory = searchTokens.length === 0 ? History :
    History.filter(phrase => {
      return searchTokens.some(token => {
        return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
      });
    });
  let filteredFavorites = Favorites;
  if (searchTokens.length > 0) {
    filteredFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
    filteredFavorites.forEach(category => {
      category.items = category.items.filter(phrase => {
        return searchTokens.some(token => {
          return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                  (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
        });
      });
    });
    filteredFavorites = filteredFavorites.filter(category => {
      return category.items.length > 0;
    });
  }
  return html`
  <style>${css}</style>
  <div class=Phrases>
    <div class=StashAndHistory>
      <div class=History>
      <div class=PhrasesSectionLabel>Stash</div>
      ${filteredStash.map(phrase => html`
        <div class=PhraseRow>
          <button @click=${onClick} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
        </div>
      `)}
      <div class=PhrasesSectionLabel>History</div>
      ${filteredHistory.map(phrase => html`
        <div class=PhraseRow>
          <button @click=${onClick} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
        </div>
      `)}
      </div>
    </div>
    <div class=Favorites>
      <div class=PhrasesSectionLabel>Favorites</div>
      ${filteredFavorites.map(category => html`
        <div class=FavoritesCategoryLabel>${category.label}</div>
        ${category.items.map(phrase => html`
          <div class=FavoriteContainer>
            <button @click=${onClick} .phraseContent=${phrase.text} .phraseLabel=${phrase.label} .phraseAudio=${phrase.audio}>${phrase.label || phrase.text}</button>
          </div>
        `)}
        </div>
      `)}
    </div>
  </div>`;
}
