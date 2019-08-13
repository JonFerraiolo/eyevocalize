
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows, playPhrase } from './Phrases.js';

let css = `
.History {
}
.HistoryTitleIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  background-image: url('./images/noun_History_1563152.svg');
  background-size: 1.1em 1.5em;
  background-position: 0% 0%;
  background-repeat: no-repeat;
}
`;

let History;

export function initializeHistory(props) {
  let { currentVersion } = props;
  let initialHistory = { version: currentVersion, expanded: true, items: [] };
  let HistoryString = localStorage.getItem("History");
  try {
    History = (typeof HistoryString === 'string') ? JSON.parse(HistoryString) : initialHistory;
  } catch(e) {
    History = initialHistory;
  }
  if (typeof History.version != 'number'|| History.version < currentVersion) {
    History = initialHistory;
  }
}

export function addToHistory(obj) {
  obj = Object.assign({ timestamp: new Date() }, obj);
	History.items.unshift(obj);
	localStorage.setItem("History", JSON.stringify(History));
};

export function playLastHistoryItem() {
  if (History.items.length > 0) {
    let phrase = History.items[0];
    playPhrase(phrase);
    addToHistory(phrase);
  }
};

export function updateHistory(props) {
  let { searchTokens } = props;
  let onClickEdit = e => {
    e.preventDefault();
    debugger;
  };
  let filteredHistory = History;
  if (searchTokens.length > 0) {
    filteredHistory = JSON.parse(JSON.stringify(History));  // deep clone
    filteredHistory.items = filteredHistory.items.filter(phrase => {
      return searchTokens.some(token => {
        return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
      });
    });
  }
  let HistoryTitle = buildTitleWithCollapseExpandArrows(History, "History", "HistoryTitleIcon");
  return html`
    <style>${css}</style>
    <div class=PhrasesSectionLabel>
      ${HistoryTitle}${rightSideIcons({ onClickEdit })}
    </div>
    ${filteredHistory.expanded ?
      html`<div class=HistoryContent>
        ${filteredHistory.items.map(phrase =>
          html`
            <div class=PhraseRow>
              <button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
            </div>
          `
        )}
      </div>` : ''}
    `;
}

export function editHistory(parentElement, props) {

}
