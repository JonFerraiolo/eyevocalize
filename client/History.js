
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows, playPhrase } from './Phrases.js';

let css = `
.History {
}
.HistoryGroup {
  font-size: 75%;
  font-style: italic;
  color: #888;
  text-align: center;
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
let interval = null;
let timeGroups = [
  { delta: 1000*60*10, label: 'moments ago' },
  { delta: 1000*60*60, label: 'within an hour' },
  { delta: 1000*60*60*24, label: 'within 24 hours' },
  { delta: 1000*60*60*24*7, label: 'within a week' },
  { delta: 1000*60*60*24*365, label: 'within a year' },
  { delta: Number.MAX_SAFE_INTEGER, label: 'over a year' },
];

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
  obj = Object.assign({ timestamp: Date.now() }, obj);
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

export function updateHistory(parentElement, props) {
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
  let localUpdate = () => {
    let now = Date.now();
    let historyElements = [];
    let nextGroup = 0;
    for(let i=0, n=filteredHistory.items.length; i<n; i++) {
      let phrase = filteredHistory.items[i];
      if (nextGroup < timeGroups.length) {
        /*
        if (i<15) {
          console.log('i='+i+', nextGroup:'+nextGroup+', datetime='+(new Date(phrase.timestamp)));
          console.log('phrase.timestamp='+phrase.timestamp);
          console.log('now - timeGroups[nextGroup].delta='+(now - timeGroups[nextGroup].delta));
          console.log('phrase.timestamp-(now - timeGroups[nextGroup].delta)='+(phrase.timestamp-(now - timeGroups[nextGroup].delta)));
        }
        */
        if (nextGroup === 0 || phrase.timestamp < now - timeGroups[nextGroup-1].delta) {
          do {
            nextGroup++;
          } while(nextGroup < timeGroups.length && phrase.timestamp < now - timeGroups[nextGroup-1].delta);
          if (nextGroup < timeGroups.length) {
            historyElements.push(html`<div class=HistoryGroup>${timeGroups[nextGroup-1].label}</div>`);
          }
        }
      }
      historyElements.push(html`
        <div class=PhraseRow>
          <button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
        </div>
      `);
    }
    render(html`
      <style>${css}</style>
      <div class=PhrasesSectionLabel>
        ${HistoryTitle}${rightSideIcons({ onClickEdit })}
      </div>
      ${filteredHistory.expanded ?
        html`<div class=HistoryContent>
          ${historyElements}
        </div>` : ''}
      `, parentElement);
  };
  localUpdate();

  let updateInterval = () => {
    if (document.hidden === false) {
      if (interval === null) {
        localUpdate();
        interval = setInterval(e => {
          localUpdate();
        }, 60*1000);
      }
    } else {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  };
  document.addEventListener('visibilitychange', e => {
    updateInterval();
  }, false);
  updateInterval();

}

export function editHistory(parentElement, props) {

};
