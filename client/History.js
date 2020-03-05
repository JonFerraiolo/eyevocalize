
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows, playPhrase,
          PhrasesAddDelSync } from './Phrases.js';
import { deleteTemporaryProperties } from './Phrases.js';
import { getAutoDeleteHistory } from './Settings.js';
import { EditPhrase } from './EditPhrase.js';
import { updateMain, sync, buildSlideRightTitle,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { slideInAddFavoriteScreen } from './MyPhrases.js';
import { styleMap } from './lib/lit-html/directives/style-map.js';

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
  font-size: 85%;
  white-space: nowrap;
  padding: 0 0 0 2em;
}
#editHistoryTextSearch {
  width: 10em;
}
.editHistory .editHistoryFilterRow Label {
  font-size: 95%;
  white-space: nowrap;
}
.editHistory .editHistoryFilterRow Label[for=editHistoryTextSearch] {
  margin: 0 0.25em 0 0;
}
.editHistory .editHistoryFilterRow Label[for=EditHistoryPhraseSize] {
  margin: 0 0.25em 0 0.75em;
}
.editHistory .HistoryContent button {
  white-space: normal;
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
#EditHistoryDateRange {
  margin-left: 2.25em;
}
.editHistory .ScreenInstructions {
  text-align: center;
  font-size: 80%;
  padding: 1em 0 0.5em;
}
.HistoryContent {
  position: relative;
}
.editHistoryNewMyPhrase {
  display: inline-block;
  width: 1.4em;
  height: 1.4em;
  vertical-align: middle;
  background-image: url('./images/heart.svg');
  background-size: 1.75em 1.75em;
  background-position: 50% 40%;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let History;
let HistoryPendingAdditions = [];
let HistoryPendingDeletions = [];
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
  let initialHistory = { version: currentVersion, timestamp: Date.now(), expanded: true, items: [] };
  let HistoryString = localStorage.getItem("History");
  let AdditionsString = localStorage.getItem("HistoryPendingAdditions");
  let DeletionsString = localStorage.getItem("HistoryPendingDeletions");
  try {
    History = (typeof HistoryString === 'string') ? JSON.parse(HistoryString) : initialHistory;
    HistoryPendingAdditions = (typeof AdditionsString === 'string') ? JSON.parse(AdditionsString) : [];
    HistoryPendingDeletions = (typeof DeletionsString === 'string') ? JSON.parse(DeletionsString) : [];
  } catch(e) {
    History = initialHistory;
    HistoryPendingAdditions = [];
    HistoryPendingDeletions = [];
  }
  if (typeof History.version != 'number'|| History.version < currentVersion) {
    History = initialHistory;
    HistoryPendingAdditions = [];
    HistoryPendingDeletions = [];
  }
}

export function HistoryGetPending(clientLastSync) {
  return { HistoryPendingAdditions, HistoryPendingDeletions };
}

export function HistorySync(thisSyncServerTimestamp, updates) {
  if (updates) {
    let retObj = PhrasesAddDelSync(thisSyncServerTimestamp, updates, History, HistoryPendingDeletions, HistoryPendingAdditions);
    History = retObj.Phrases;
    HistoryPendingDeletions = retObj.PhrasesPendingDeletions;
    HistoryPendingAdditions = retObj.PhrasesPendingAdditions;
    updateLocalStorage();
    let event = new CustomEvent("ServerInitiatedSyncHistory", { detail: null } );
    window.dispatchEvent(event);
  }
}

function updateStorage()  {
  updateLocalStorage();
  sync();
}

function updateLocalStorage() {
  History.timestamp = Date.now();
  localStorage.setItem("History", JSON.stringify(History));
  localStorage.setItem("HistoryPendingAdditions", JSON.stringify(HistoryPendingAdditions));
  localStorage.setItem("HistoryPendingDeletions", JSON.stringify(HistoryPendingDeletions));
}

export function addToHistory(obj) {
  obj = Object.assign({ timestamp: Date.now() }, obj);
	History.items.unshift(obj);
  HistoryPendingAdditions.unshift(JSON.parse(JSON.stringify(obj)));
  updateStorage();
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

let updateHistoryFirstTime = true;

export function updateHistory(parentElement, props) {
  if (updateHistoryFirstTime) {
    updateHistoryFirstTime = false;
    document.addEventListener('visibilitychange', e => {
      if (document.visibilityState === 'visible') {
        console.log('updateHistory visibilitychange event listener entered ');
        updateInterval();
      }
    }, false);
    window.addEventListener('ServerInitiatedSyncHistory', function(e) {
      console.log('updateHistory ServerInitiatedSyncHistory custom event listener entered ');
      localUpdate();
    });
  }
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

let editHistoryFirstTime = true;

export function editHistory(parentElement, props) {
  let editHistoryActive = true;
  let externalEvent = () => {
    if (editHistoryActive && parentElement) {
      let HistoryContent = parentElement.querySelector('.HistoryContent');
      if (HistoryContent) {
        initializeLocalHistory();
        localUpdate();
      }
    }
  };
  if (editHistoryFirstTime) {
    editHistoryFirstTime = false;
    document.addEventListener('visibilitychange', e => {
      if (editHistoryActive && document.visibilityState === 'visible') {
        console.log('editHistory visibilitychange event listener entered ');
        externalEvent();
      }
    }, false);
    window.addEventListener('ServerInitiatedSyncHistory', function(e) {
      if (editHistoryActive) {
        console.log('editHistory ServerInitiatedSyncHistory custom event listener entered ');
        externalEvent();
      }
    });
  }
  let lastClickItemIndex = null;
  let searchString = '';
  let searchTokens = [];
  let dateRange = 'none';
  let phraseSize = '1';
  const day = 1000*60*60*24;
  const week = day * 7;
  const month = day * 30;
  const rangeOptions = [
    { value: 'none', label: 'anytime'},
    { value: '<day', label: '0-24 hours ago'},
    { value: '<week', label: '0-7 days ago'},
    { value: '<month', label: '0-30 days ago'},
    { value: '>day', label: '> 24 hours ago'},
    { value: '>week', label: '> 7 days ago'},
    { value: '>month', label: '> 30 days ago'},
  ];
  const phraseSizeOptions = [
    { value: '1', label: '1'},
    { value: '2', label: '2'},
    { value: '3', label: '3'},
    { value: '4', label: '4'},
    { value: '5', label: '5'},
    { value: '10', label: '10'},
    { value: 'none', label: 'none'},
  ];
  const rangeOptionElements = rangeOptions.map(option =>
    html`<option .value=${option.value}>${option.label}</option>`
  );
  const phraseSizeOptionElements = phraseSizeOptions.map(option =>
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
  let onChangeRange = e => {
    e.preventDefault();
    dateRange = rangeOptions[e.target.selectedIndex].value;
    initializeLocalHistory();
    localUpdate();
  };
  let onChangePhraseSize = e => {
    e.preventDefault();
    phraseSize = phraseSizeOptions[e.target.selectedIndex].value;
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
  let onClickScrollTo = e => {
    e.preventDefault();
    let found = localHistory.items.find(item => item.selected);
    let { timestamp } = found;
    searchString = '';
    searchTokens = [];
    dateRange = 'none';
    initializeLocalHistory();
    scrollToIndex = localHistory.items.findIndex(item => item.timestamp === timestamp);
    if (scrollToIndex !== -1) {
      localHistory.items[scrollToIndex].selected = true;
    }
    localUpdate();
  };
  let onClickCopySelected = e => {
    e.preventDefault();
    copySelected();
  };
  let copySelected = () => {
    let text = '', nItems = 0;
    for (let i=localHistory.items.length-1; i>=0; i--) {
      let item =  localHistory.items[i];
      if (item.selected) {
        if (nItems > 0) {
          text += '\n';
        }
        text += (item.text || item.label || '');
        nItems++;
      }
    }
    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '0px';
    div.style.top = '0px';
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.opacity = 0;
    div.textContent = text;
    document.body.appendChild(div);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(div);
    selection.removeAllRanges();
    selection.addRange(range);
    try {
      document.execCommand('copy');
    } catch(e) {
      console.log('copy to clipboard failed');
    }
    document.body.removeChild(div);
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    History.items = History.items.filter(item => {
      return !localHistory.items.some(it => {
        if (it.selected && item.timestamp === it.timestamp) {
          HistoryPendingDeletions.unshift(item);
          return true;
        }
      });
    });
    updateStorage();
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
  let scrollToIndex;
  let initializeLocalHistory = () => {
    localHistory = JSON.parse(JSON.stringify(History));  // deep clone
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
    }
    localHistory.items = localHistory.items.filter(phrase => phrase.timestamp >= starttime && phrase.timestamp <= endtime);
    localHistory.items.forEach((item, index) => {
      item.selected = false;
    });
    lastClickItemIndex = null;
    scrollToIndex = -1;
  };
  let keydownEvent = e => {
    let shift = e.getModifierState("Shift");
    let control = e.getModifierState("Control");
    let meta = e.getModifierState("Meta");
    if (e.key === 'c' && !shift && (control || meta)) {
      e.preventDefault();
      copySelected();
    }
  };
  let onReturn = () => {
    document.removeEventListener('keydown', keydownEvent, false);
    editHistoryActive = false;
    onEditHistoryReturn();
  };
  document.addEventListener('keydown', keydownEvent, false);
  let localUpdate = () => {
    localHistory.items.forEach(item => {
      item.cls = item.selected ? 'selected' : '';
      item.checkmark = item.selected ? html`<span class=checkmark>&#x2714;</span>` : '';
    });
    historyElements = [];
    let nextGroup = 0;
    let now = Date.now();
    let buttonInlineStyle = styleMap({ maxHeight:(phraseSize==='none' ? 'max-content' : (0.2+parseInt(phraseSize)*1.2)+'em') });
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
          <button @click=${onItemClick} .phraseObject=${phrase} .phraseIndex=${index} class=${phrase.cls} style=${buttonInlineStyle}>
            ${phrase.checkmark}
            ${phrase.label || phrase.text}</button>
        </div>
      `);
    }
    let exactlyOneSelected = localHistory.items.reduce((accumulator, item) => {
      if (item.selected) {
        accumulator++;
      }
      return accumulator;
    }, 0) === 1;
    let atLeastOneSelected = localHistory.items.some(item => item.selected);
    render(html`
    <div class="History editHistory skinnyScreenParent">
      <div class=skinnyScreenChild>
        ${buildSlideRightTitle("Manage History", onReturn)}
        <div class=editHistoryFilterRow>
          <label for=editHistoryTextSearch>Filter:</label
          ><input id=editHistoryTextSearch .value=${searchString} placeholder="filter text" @input=${onInput}></input
          ><button class="editHistoryClear" @click=${onClear}
            title='Clear the filter text'></button
          ><select @change=${onChangeRange} id=EditHistoryDateRange>
            ${rangeOptionElements}
          </select><label for=EditHistoryPhraseSize>Max size:</label
          ><select @change=${onChangePhraseSize} id=EditHistoryPhraseSize>
            ${phraseSizeOptionElements}
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
          <button @click=${onClickScrollTo} ?disabled=${!exactlyOneSelected}
            title="Scroll to selected item, as any filtering is canceled">Scroll to</button>
          <button @click=${onClickCopySelected} ?disabled=${!atLeastOneSelected}
            title="Copy text from selected items to system clipboard">Copy</button>
          <button @click=${onClickRemoveSelected} ?disabled=${!atLeastOneSelected}
            title="Delete selected items">Delete</button>
          <button @click=${onClickAddToFavorites} ?disabled=${!exactlyOneSelected}
            title="Make selected item into a favorite">
            <span class=editHistoryNewMyPhrase></span></button>
        </div>
      </div>
    </div>`, parentElement);
    document.getElementById('EditHistoryDateRange').selectedIndex = rangeOptions.findIndex(option => option.value === dateRange);
    document.getElementById('EditHistoryPhraseSize').selectedIndex = phraseSizeOptions.findIndex(option => option.value === phraseSize);
    if (scrollToIndex !== -1) {
      let buttonIndex = scrollToIndex;
      scrollToIndex = -1;
      function scrollIt() {
        let historyContent = parentElement.querySelector('.HistoryContent');
        let buttons = Array.from(historyContent.querySelectorAll('button'));
        let button = buttons[buttonIndex];
        let phraseRow  = button.parentElement;
        historyContent.scrollTop = phraseRow.offsetTop - (historyContent.clientHeight - phraseRow.offsetHeight)  / 2;
      }
      // kludge do scroll twice in case there is a very large history
      setTimeout(scrollIt, 200);
      setTimeout(scrollIt, 2000);
    }
  };
  initializeLocalHistory();
  localUpdate();
}
