
import { html, render } from './lib/lit-html/lit-html.js';
import { TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { deleteTemporaryProperties } from './Phrases.js';
import { EditPhrase } from './EditPhrase.js';
import { updateMain, sync, buildSlideRightTitle,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows } from './Phrases.js';
import { slideInAddFavoriteScreen } from './MyPhrases.js';

let css = `
.WhiteboardTitleIcon {
  display: inline-block;
  width: 1.25em;
  height: 1em;
  margin-right: 0.4em;
  background-image: url('./images/stickynote.svg');
  background-size: 1.25em 1.1em;
  background-position: 0em 10%;
  background-repeat: no-repeat;
}
.editWhiteboard .skinnyScreenChild {
  display: flex;
  flex-direction: column;
}
.editWhiteboard .ScreenInstructions {
  text-align: center;
  font-size: 90%;
}
.editWhiteboardPhraseRows {
  flex: 1;
  overflow: auto;
}
.editWhiteboardNewMyPhrase {
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

let Whiteboard;

export function initializeWhiteboard(props) {
  let { currentVersion } = props;
  let initialWhiteboard = { version: currentVersion, timestamp: 0, expanded: true, items: [] };
  let WhiteboardString = localStorage.getItem("Whiteboard");
  try {
    Whiteboard = (typeof WhiteboardString === 'string') ? JSON.parse(WhiteboardString) : initialWhiteboard;
  } catch(e) {
    Whiteboard = initialWhiteboard;
  }
  if (typeof Whiteboard.version != 'number'|| Whiteboard.version < currentVersion) {
    Whiteboard = initialWhiteboard;
  }
  localStorage.setItem("Whiteboard", JSON.stringify(Whiteboard));
}

export function WhiteboardGetPending(clientLastSync) {
  if (!Whiteboard.pending) return null;
  delete Whiteboard.pending;
  return Whiteboard.timestamp > clientLastSync ? Whiteboard : null;
}

export function WhiteboardSync(thisSyncServerTimestamp, newData) {
  if (newData && typeof newData === 'object' && typeof newData.timestamp === 'number' && newData.timestamp > Whiteboard.timestamp) {
    Whiteboard = newData;
    updateLocalStorage({ timestamp: newData.timestamp });
    let event = new CustomEvent("ServerInitiatedSyncWhiteboard", { detail: null } );
    window.dispatchEvent(event);
  }
}

function updateStorage()  {
  updateLocalStorage({ pending: true });
  sync();
}

function updateLocalStorage(overrides) {
  Whiteboard.timestamp = Date.now();
  Whiteboard = Object.assign({}, Whiteboard, overrides || {});
  localStorage.setItem("Whiteboard", JSON.stringify(Whiteboard));
}

// Add phrase to Whiteboard without speaking
export function addToWhiteboard(phrase) {
  Whiteboard.items.unshift(phrase);
  updateStorage();
};

function replaceWhiteboardEntry(index, phrase) {
  Whiteboard.items[index] = Object.assign({}, phrase);
  updateStorage();
};

function traverseItems(aWhiteboard, func) {
  aWhiteboard.items.forEach((item, itIndex) => {
    func(item, aWhiteboard, itIndex);
  });
};

// Add text to Whiteboard without speaking
export function AddTextToWhiteboard(text) {
	text = (typeof text === 'string') ? text : TextEntryRowGetText();
	if (text.length > 0) {
		TextEntryRowSetText('');
		let phrase = { type: 'text', text, timestamp: Date.now() };
    addToWhiteboard(phrase);
    updateMain();
	}
}

function onWhiteboardChange() {
  updateStorage();
}


function slideInAddEntryToWhiteboardScreen(props) {
  props = props || {};
  let { phrase } = props;
  let params = {
    renderFunc: EditPhrase,
    renderFuncParams: {
      title: 'Add Entry to Whiteboard',
      doItButtonLabel: 'Add Entry',
      doItCallback: function(phrase) {
        // add phrase to Whiteboard, go back to parent screen
        addToWhiteboard(phrase);
        updateMain();
        secondLevelScreenHide();
      },
      cancelCallback: function() {
        // do nothing, go back to parent screen
        secondLevelScreenHide();
      },
      phrase,
    },
  };
  secondLevelScreenShow(params);
};

let updateWhiteboardFirstTime = true;

export function updateWhiteboard(parentElement, props) {
  if (updateWhiteboardFirstTime) {
    updateWhiteboardFirstTime = false;
    window.addEventListener('ServerInitiatedSyncWhiteboard', function(e) {
      console.log('updateWhiteboard ServerInitiatedSyncWhiteboard custom event listener entered ');
      localUpdate();
    });
  }
  let { searchTokens } = props;
  let onClickAdd = e => {
    e.preventDefault();
    slideInAddEntryToWhiteboardScreen();
  };
  let onClickEdit = e => {
    e.preventDefault();
    onEditWhiteboard();
  };
  let WhiteboardTitle = buildTitleWithCollapseExpandArrows(Whiteboard, "Whiteboard", "WhiteboardTitleIcon");
  let localUpdate = () => {
    let filteredWhiteboard = JSON.parse(JSON.stringify(Whiteboard));  // deep clone
    if (searchTokens.length > 0) {
      filteredWhiteboard.items = filteredWhiteboard.items.filter(phrase => {
        return searchTokens.some(token => {
          return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                  (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
        });
      });
    }
    render(html`
      <div class=PhrasesSectionLabel>
        ${WhiteboardTitle}${rightSideIcons({ onClickAdd, onClickEdit })}
      </div>
      ${filteredWhiteboard.expanded ?
        html`<div class=WhiteboardContent>
          ${filteredWhiteboard.items.map(phrase =>
            html`
              <div class=PhraseRow>
                <button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
              </div>
            `
          )}
        </div>` : ''}
      `, parentElement);
  };
  localUpdate();
}

let editWhiteboardActive = false;

function onEditWhiteboard() {
  editWhiteboardActive = true;
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editWhiteboard, renderFuncParams });
}

function onEditWhiteboardReturn() {
  editWhiteboardActive = false;
  updateMain();
  secondLevelScreenHide();
}

let editWhiteboardFirstTime = true;

export function editWhiteboard(parentElement, props) {
  if (editWhiteboardFirstTime) {
    editWhiteboardFirstTime = false;
    window.addEventListener('ServerInitiatedSyncWhiteboard', function(e) {
      if (editWhiteboardActive && parentElement) {
        console.log('editWhiteboard ServerInitiatedSyncWhiteboard custom event listener entered ');
        let WhiteboardContent = parentElement.querySelector('.WhiteboardContent');
        if (WhiteboardContent) {
          initializeSelection();
          localUpdate();
        }
      }
    });
  }
  let lastClickItemIndex = null;
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
      localWhiteboard.items.forEach(item => {
        item.selected = false;
      });
      let f = (lastClickItemIndex > phraseIndex) ? phraseIndex : lastClickItemIndex;
      let l = (lastClickItemIndex > phraseIndex) ? lastClickItemIndex : phraseIndex;
      for (let i=f; i<=l; i++) {
        localWhiteboard.items[i].selected = true;
      }
    } else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
      // simple click deselects everything else but the item getting the click
      localWhiteboard.items.forEach(item => {
        item.selected = false;
      });
      phrase.selected = true;
      lastClickItemIndex = phraseIndex;
    }
    localUpdate();
  };
  let onClickSelectAll = e => {
    e.preventDefault();
    localWhiteboard.items.forEach(item => {
      item.selected = true;
    });
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickDeselectAll = e => {
    e.preventDefault();
    localWhiteboard.items.forEach(item => {
      item.selected = false;
    });
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickAddItem = e => {
    e.preventDefault();
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        title: 'Add New Entry To Whiteboard',
        doItButtonLabel: 'Add to Whiteboard',
        doItCallback: function(phrase) {
          // add phrase to Whiteboard, go back to parent screen
          addToWhiteboard(phrase);
          localWhiteboard = JSON.parse(JSON.stringify(Whiteboard));  // deep clone
          initializeSelection();
          localUpdate();
          thirdLevelScreenHide();
          lastClickItemIndex = null;
        },
        cancelCallback: function() {
          // do nothing, go back to parent screen
          thirdLevelScreenHide();
        },
      },
    };
    thirdLevelScreenShow(params);
  };
  let onClickEditItem = e => {
    e.preventDefault();
    let index = localWhiteboard.items.findIndex(phrase => phrase.selected);
    let phrase = Whiteboard.items[index];
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        phrase,
        title: 'Edit Entry From Whiteboard',
        doItButtonLabel: 'Update Entry',
        doItCallback: function(phrase) {
          // add phrase to Whiteboard, go back to parent screen
          replaceWhiteboardEntry(index, phrase);
          localWhiteboard = JSON.parse(JSON.stringify(Whiteboard));  // deep clone
          localWhiteboard.items[index].selected = true;
          localUpdate();
          thirdLevelScreenHide();
        },
        cancelCallback: function() {
          // do nothing, go back to parent screen
          thirdLevelScreenHide();
        },
      },
    };
    thirdLevelScreenShow(params);
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    localWhiteboard.items = localWhiteboard.items.filter(item => !item.selected);
    Whiteboard = JSON.parse(JSON.stringify(localWhiteboard));  // deep clone
    traverseItems(Whiteboard, deleteTemporaryProperties);
    onWhiteboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickAddToMyPhrases = e => {
    e.preventDefault();
    let index = localWhiteboard.items.findIndex(phrase => phrase.selected);
    let phrase = Whiteboard.items[index];
    slideInAddFavoriteScreen({ slideInLevel: 'third', phrase });
  };
  let onClickMoveUp = e => {
    e.preventDefault();
    for (let i=1, n=localWhiteboard.items.length; i<n; i++) {
      let item = localWhiteboard.items[i];
      if (item.selected && !localWhiteboard.items[i-1].selected) {
        [ localWhiteboard.items[i-1], localWhiteboard.items[i] ] = [ localWhiteboard.items[i], localWhiteboard.items[i-1] ];  // swap
      }
    }
    Whiteboard = JSON.parse(JSON.stringify(localWhiteboard));  // deep clone
    traverseItems(Whiteboard, deleteTemporaryProperties);
    onWhiteboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveDown = e => {
    e.preventDefault();
    for (let n=localWhiteboard.items.length, i=n-2; i>=0; i--) {
      let item = localWhiteboard.items[i];
      if (item.selected && !localWhiteboard.items[i+1].selected) {
        [ localWhiteboard.items[i+1], localWhiteboard.items[i] ] = [ localWhiteboard.items[i], localWhiteboard.items[i+1] ];  // swap
      }
    }
    Whiteboard = JSON.parse(JSON.stringify(localWhiteboard));  // deep clone
    traverseItems(Whiteboard, deleteTemporaryProperties);
    onWhiteboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveToTop = e => {
    e.preventDefault();
    for (let n=localWhiteboard.items.length, toPosition=0, fromPosition=1; fromPosition<n; fromPosition++) {
      let toItem = localWhiteboard.items[toPosition];
      let fromItem = localWhiteboard.items[fromPosition];
      if (fromItem.selected && !toItem.selected) {
        localWhiteboard.items.splice(fromPosition, 1);
        localWhiteboard.items.splice(toPosition, 0, fromItem);
      }
      if (localWhiteboard.items[toPosition].selected) {
        toPosition++;
      }
    }
    Whiteboard = JSON.parse(JSON.stringify(localWhiteboard));  // deep clone
    traverseItems(Whiteboard, deleteTemporaryProperties);
    onWhiteboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveToBottom = e => {
    e.preventDefault();
    for (let n=localWhiteboard.items.length, toPosition=n-1, fromPosition=n-2; fromPosition>=0; fromPosition--) {
      let toItem = localWhiteboard.items[toPosition];
      let fromItem = localWhiteboard.items[fromPosition];
      if (fromItem.selected && !toItem.selected) {
        localWhiteboard.items.splice(fromPosition, 1);
        localWhiteboard.items.splice(toPosition, 0, fromItem);
      }
      if (localWhiteboard.items[toPosition].selected) {
        toPosition--;
      }
    }
    Whiteboard = JSON.parse(JSON.stringify(localWhiteboard));  // deep clone
    traverseItems(Whiteboard, deleteTemporaryProperties);
    onWhiteboardChange();
    localUpdate();
    lastClickItemIndex = null;

  };
  let initializeSelection = () => {
    localWhiteboard.items.forEach((item, index) => {
      item.selected = false;
    });
    lastClickItemIndex = null;
  };
  let localUpdate = () => {
    localWhiteboard.items.forEach(item => {
      item.cls = item.selected ? 'selected' : '';
      item.checkmark = item.selected ? html`<span class=checkmark>&#x2714;</span>` : '';
    });
    let enableEditItem = localWhiteboard.items.reduce((accumulator, item) => {
      if (item.selected) {
        accumulator++;
      }
      return accumulator;
    }, 0) === 1;
    let enableAddToMyPhrases = enableEditItem;
    let enableRemoveSelected = localWhiteboard.items.some(item => item.selected);
    let enableMoveUp = localWhiteboard.items.some((item, index, arr) =>
      item.selected && (index > 0 && !arr[index-1].selected));
    let enableMoveDown = localWhiteboard.items.some((item, index, arr) =>
      item.selected && (index < arr.length-1 && !arr[index+1].selected));
    render(html`
    <div class="Whiteboard editWhiteboard skinnyScreenParent">
      <div class=skinnyScreenChild>
        ${buildSlideRightTitle("Manage Whiteboard", onEditWhiteboardReturn)}
        <div class=ScreenInstructions>
          (Click to select, control-click to toggle, shift-click for range)
        </div>
        <div class=editWhiteboardPhraseRows>
          ${localWhiteboard.items.map((phrase, index) => {
            return html`
              <div class=PhraseRow>
                <button @click=${onItemClick} .phraseObject=${phrase} .phraseIndex=${index} class=${phrase.cls}>
                  ${phrase.checkmark}
                  ${phrase.label || phrase.text}</button>
              </div>
            `;
          })}
        </div>
        <div class=SelectLinksRow>
          <a href="" @click=${onClickSelectAll}>Select All</a>
          <a href="" @click=${onClickDeselectAll}>Deselect All</a>
        </div>
        <div class=ButtonRow>
        <button @click=${onClickAddItem}
          title="Add a new item to the top of the list">New</button>
        <button @click=${onClickEditItem} ?disabled=${!enableEditItem}
          title="Edit the selected item">Edit</button>
          <button @click=${onClickRemoveSelected} ?disabled=${!enableRemoveSelected}
            title="Delete selected items">Delete</button>
          <button @click=${onClickAddToMyPhrases} ?disabled=${!enableAddToMyPhrases}
            title="Make selected item into a favorite">
            <span class=editWhiteboardNewMyPhrase></span></button>
          <button @click=${onClickMoveUp} ?disabled=${!enableMoveUp}
            title="Move selected items up one position">
            <span class=arrowButton>&#x1f851;</span></button>
          <button @click=${onClickMoveDown} ?disabled=${!enableMoveDown}
            title="Move selected items down one position">
            <span class=arrowButton>&#x1f853;</span></button>
          <button @click=${onClickMoveToTop} ?disabled=${!enableMoveUp}
            title="Move selected items to the start of the list">
            <span class=arrowButton>&#x2b71;</span></button>
          <button @click=${onClickMoveToBottom} ?disabled=${!enableMoveDown}
            title="Move selected items to the end of the list">
            <span class=arrowButton>&#x2b73;</span></button>
        </div>
      </div>
    </div>`, parentElement);
  };
  let localWhiteboard = JSON.parse(JSON.stringify(Whiteboard));  // deep clone
  initializeSelection();
  localUpdate();
}
