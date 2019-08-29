
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows, playPhrase } from './Phrases.js';
import { deleteTemporaryProperties } from './Phrases.js';
import { getAutoDeleteHistory } from './Settings.js';
import { EditPhrase } from './EditPhrase.js';
import { updateMain, buildSlideRightTitle,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { slideInAddFavoriteScreen } from './Favorites.js';

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
.editHistory .skinnyScreenChild {
  display: flex;
  flex-direction: column;
}
.editHistory .editHistoryFilterRow {
  text-align: center;
}
.editHistory .editHistoryFilterRow Label {
  font-size: 85%;
  margin: 0 0.5em 0 2em;
}
.editHistoryClear {
  display: inline-block;
  background-image: url('./images/noun_clear_713056.svg');
  width: 1.5em;
  height: 100%;
  vertical-align: middle;
  background-size: 3.5em 5em;
  background-position: 50% 40%;
  background-repeat: no-repeat;
  border: none;
  background-color: white;
  padding: 0;
  margin-left: 0;
}
.editHistory .editHistoryFilterRow select {
  margin-left: 2.25em;
}
.editHistory .ScreenInstructions {
  text-align: center;
  font-size: 80%;
  padding: 1em 0 0.5em;
}
.editHistoryPhraseRows {
  flex: 1;
  overflow: auto;
}
.editHistoryNewFavorite {
  display: inline-block;
  width: 1.4em;
  height: 1.4em;
  vertical-align: middle;
  background-image: url('./images/heart.svg');
  background-size: 1.75em 1.75em;
  background-position: 50% 40%;
}
`;

let History;
let interval = null;
let timeGroups = [
  { delta: 1000*60*15, label: '1-15 minutes ago' },
  { delta: 1000*60*60, label: '15-60 minutes ago' },
  { delta: 1000*60*60*24, label: '1-24 hours ago' },
  { delta: 1000*60*60*24*7, label: '1-7 days ago' },
  { delta: 1000*60*60*24*365, label: 'within past year' },
  { delta: Number.MAX_SAFE_INTEGER, label: 'over a year old' },
];
let autoDeleteOffset = {
  hour: 1000*60*60,
  day: 1000*60*60*24,
  week: 1000*60*60*24*7,
  month: 1000*60*60*24*30,
  year: 1000*60*60*24*365,
};

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

function updateLocalStorage()  {
  localStorage.setItem("History", JSON.stringify(History));
}

export function addToHistory(obj) {
  obj = Object.assign({ timestamp: Date.now() }, obj);
	History.items.unshift(obj);
  updateLocalStorage();
};

function traverseItems(aHistory, func) {
  aHistory.items.forEach((item, itIndex) => {
    func(item, aHistory, itIndex);
  });
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
    onEditHistory();
  };
  let HistoryTitle = buildTitleWithCollapseExpandArrows(History, "History", "HistoryTitleIcon");
  let localUpdate = () => {
    let now = Date.now();
    let autoDeleteHistory = getAutoDeleteHistory();
    let offset = autoDeleteOffset[autoDeleteHistory];
    if (typeof offset == 'number') {
      let deleteDateTime = now - offset;
      let firstItemToDelete = -1;
      for (let i=0, n=History.items.length; i<n; i++) {
        let item = History.items[i];
        if (item.timestamp < deleteDateTime) {
          firstItemToDelete = i;
          break;
        }
      }
      if (firstItemToDelete != -1) {
        // delete history items that have aged out
        History.items.splice(firstItemToDelete);
      }
    }
    let localHistory = History;
    if (searchTokens.length > 0) {
      localHistory = JSON.parse(JSON.stringify(History));  // deep clone
      localHistory.items = localHistory.items.filter(phrase => {
        return searchTokens.some(token => {
          return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                  (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
        });
      });
    }
    let historyElements = [];
    let nextGroup = 0;
    for(let i=0, n=localHistory.items.length; i<n; i++) {
      let phrase = localHistory.items[i];
      if (nextGroup < timeGroups.length) {
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
      ${localHistory.expanded ?
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

function onEditHistory() {
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editHistory, renderFuncParams });
}

function onEditHistoryReturn() {
  updateMain();
  secondLevelScreenHide();
}

export function editHistory(parentElement, props) {
  let lastClickItemIndex = null;
  let searchString = '';
  let searchTokens = [];
  let dateRange = 'none';
  const day = 1000*60*60*24;
  const week = day * 7;
  const month = day * 30;
  const options = [
    { value: 'none', label: 'anytime'},
    { value: '<day', label: '0-24 hours ago'},
    { value: '<week', label: '0-7 days ago'},
    { value: '<month', label: '0-30 days ago'},
    { value: '>day', label: '> 24 hours ago'},
    { value: '>week', label: '> 7 days ago'},
    { value: '>month', label: '> 30 days ago'},
  ];
  const optionElements = options.map(option =>
    html`<option .value=${option.value}>${option.label}</option>`
  );
  let onInput = e => {
    e.preventDefault();
    searchString = e.target.value;
    searchTokens = (typeof searchString  === 'string') ?
      searchString.toLowerCase().replace(/\s+/g, ' ').trim().split(' ') :
      [];
    initializeLocalHistory();
    localUpdate();
  };
  let onChange = e => {
    e.preventDefault();
    dateRange = options[e.target.selectedIndex].value;
    initializeLocalHistory();
    localUpdate();
  };
  let onClear = e => {
    e.preventDefault();
    searchString = '';
    searchTokens = [];
    initializeLocalHistory();
    localUpdate();
  };
  let onItemClick = e => {
    e.preventDefault();
    let phrase = e.currentTarget.phraseObject;
    let phraseIndex = e.currentTarget.phraseIndex;
    let shift = e.getModifierState("Shift");
    let control = e.getModifierState("Control");
    let meta = e.getModifierState("Meta");
    if (control && !meta && !shift) {
      // t control click is toggle selection for the thing that was clicked on
      phrase.selected = !phrase.selected;
      lastClickItemIndex = phraseIndex;
    } else if (shift && !meta && !control && lastClickItemIndex != null) {
      // shift click is range selection
      localHistory.items.forEach(item => {
        item.selected = false;
      });
      let f = (lastClickItemIndex > phraseIndex) ? phraseIndex : lastClickItemIndex;
      let l = (lastClickItemIndex > phraseIndex) ? lastClickItemIndex : phraseIndex;
      for (let i=f; i<=l; i++) {
        localHistory.items[i].selected = true;
      }
    } else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
      // simple click deselects everything else but the item getting the click
      localHistory.items.forEach(item => {
        item.selected = false;
      });
      phrase.selected = true;
      lastClickItemIndex = phraseIndex;
    }
    localUpdate();
  };
  let onClickSelectAll = e => {
    e.preventDefault();
    localHistory.items.forEach(item => {
      item.selected = true;
    });
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickDeselectAll = e => {
    e.preventDefault();
    localHistory.items.forEach(item => {
      item.selected = false;
    });
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    History.items = History.items.filter(item => {
      return !localHistory.items.some(it => it.selected && item.timestamp === it.timestamp);
    });
    updateLocalStorage();
    initializeLocalHistory();
    localUpdate();
  };
  let onClickAddToFavorites = e => {
    e.preventDefault();
    let index = localHistory.items.findIndex(phrase => phrase.selected);
    let phrase = History.items.find(item => item.timestamp === localHistory.items[index].timestamp);
    slideInAddFavoriteScreen({ slideInLevel: 'third', phrase });
  };
  let localHistory;
  let historyElements;
  let initializeLocalHistory = () => {
    localHistory = JSON.parse(JSON.stringify(History));  // deep clone
    if (searchTokens.length > 0 || dateRange != 'none') {
      let now = Date.now();
      let starttime, endtime;
      if (dateRange === '<day') { starttime = now - day; endtime = now; }
      else if (dateRange === '<week') { starttime = now - week; endtime = now; }
      else if (dateRange === '<month') { starttime = now - month; endtime = now; }
      else if (dateRange === '>day') { starttime = 0; endtime = now - day; }
      else if (dateRange === '>week') { starttime = 0; endtime = now - week; }
      else if (dateRange === '>month') { starttime = 0; endtime = now - month; }
      else { starttime = 0; endtime = now; }
      if (searchTokens.length > 0) {
        localHistory.items = localHistory.items.filter(phrase => {
          return searchTokens.some(token => {
            return ((typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                    (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token))) &&
                    phrase.timestamp >= starttime && phrase.timestamp <= endtime;
          });
        });
      } else {
        localHistory.items = localHistory.items.filter(phrase => phrase.timestamp >= starttime && phrase.timestamp <= endtime);
      }
    }
    localHistory.items.forEach((item, index) => {
      item.selected = false;
    });
    lastClickItemIndex = null;
  };
  let localUpdate = () => {
    localHistory.items.forEach(item => {
      item.cls = item.selected ? 'selected' : '';
      item.checkmark = item.selected ? html`<span class=checkmark>&#x2714;</span>` : '';
    });
    historyElements = [];
    let nextGroup = 0;
    let now = Date.now();
    for(let i=0, n=localHistory.items.length; i<n; i++) {
      let index = i;
      let phrase = localHistory.items[i];
      if (nextGroup < timeGroups.length) {
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
          <button @click=${onItemClick} .phraseObject=${phrase} .phraseIndex=${index} class=${phrase.cls}>
            ${phrase.checkmark}
            ${phrase.label || phrase.text}</button>
        </div>
      `);
    }
    let enableAddToFavorites = localHistory.items.reduce((accumulator, item) => {
      if (item.selected) {
        accumulator++;
      }
      return accumulator;
    }, 0) === 1;
    let enableRemoveSelected = localHistory.items.some(item => item.selected);
    render(html`
    <style>${css}</style>
    <div class="History editHistory skinnyScreenParent">
      <div class=skinnyScreenChild>
        ${buildSlideRightTitle("Manage History", onEditHistoryReturn)}
        <div class=editHistoryFilterRow>
          <label for=editHistoryTextSearch>Filter:</label
          ><input id=editHistoryTextSearch .value=${searchString} placeholder="filter text" @input=${onInput}></input
          ><button class="editHistoryClear" @click=${onClear}
            title='Clear the filter text'></button
          ><select @change=${onChange}>
            ${optionElements}
          </select>
        </div>
        <div class=ScreenInstructions>
          (Click to select, control-click to toggle, shift-click for range)
        </div>
        <div class=HistoryContent>
          ${historyElements}
        </div>
        <div class=SelectLinksRow>
          <a href="" @click=${onClickSelectAll}>Select All</a>
          <a href="" @click=${onClickDeselectAll}>Deselect All</a>
        </div>
        <div class=ButtonRow>
          <button @click=${onClickRemoveSelected} ?disabled=${!enableRemoveSelected}
            title="Delete selected items">Delete</button>
          <button @click=${onClickAddToFavorites} ?disabled=${!enableAddToFavorites}
            title="Make selected item into a favorite">
            <span class=editHistoryNewFavorite></span></button>
        </div>
      </div>
    </div>`, parentElement);
    parentElement.querySelector('.editHistoryFilterRow select').value = dateRange;
  };
  initializeLocalHistory();
  localUpdate();
}
