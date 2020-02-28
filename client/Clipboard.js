
import { html, render } from './lib/lit-html/lit-html.js';
import { TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { deleteTemporaryProperties } from './Phrases.js';
import { EditPhrase } from './EditPhrase.js';
import { updateMain, buildSlideRightTitle,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows } from './Phrases.js';
import { slideInAddFavoriteScreen } from './MyPhrases.js';

let css = `
.ClipboardTitleIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  background-image: url('./images/noun_sticky notes_2355407.svg');
  background-size: 1.1em 1.5em;
  background-position: 0% 0%;
  background-repeat: no-repeat;
}
.editClipboard .skinnyScreenChild {
  display: flex;
  flex-direction: column;
}
.editClipboard .ScreenInstructions {
  text-align: center;
  font-size: 90%;
}
.editClipboardPhraseRows {
  flex: 1;
  overflow: auto;
}
.editClipboardNewMyPhrase {
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

let Clipboard;

export function initializeClipboard(props) {
  let { currentVersion } = props;
  let initialClipboard = { version: currentVersion, expanded: true, items: [] };
  let ClipboardString = localStorage.getItem("Clipboard");
  try {
    Clipboard = (typeof ClipboardString === 'string') ? JSON.parse(ClipboardString) : initialClipboard;
  } catch(e) {
    Clipboard = initialClipboard;
  }
  if (typeof Clipboard.version != 'number'|| Clipboard.version < currentVersion) {
    Clipboard = initialClipboard;
  }
}

// Add phrase to Clipboard without speaking
export function addToClipboard(phrase) {
  Clipboard.items.unshift(phrase);
  localStorage.setItem("Clipboard", JSON.stringify(Clipboard));
};

function replaceClipboardEntry(index, phrase) {
  Clipboard.items[index] = Object.assign({}, phrase);
  localStorage.setItem("Clipboard", JSON.stringify(Clipboard));
};

function traverseItems(aClipboard, func) {
  aClipboard.items.forEach((item, itIndex) => {
    func(item, aClipboard, itIndex);
  });
};

// Add text to Clipboard without speaking
export function stash(text) {
	text = (typeof text === 'string') ? text : TextEntryRowGetText();
	if (text.length > 0) {
		TextEntryRowSetText('');
		let phrase = { type: 'text', text, timestamp: Date.now() };
    addToClipboard(phrase);
    updateMain();
	}
}

function onClipboardChange() {
  localStorage.setItem("Clipboard", JSON.stringify(Clipboard));
}


function slideInAddEntryToClipboardScreen(props) {
  props = props || {};
  let { phrase } = props;
  let params = {
    renderFunc: EditPhrase,
    renderFuncParams: {
      title: 'Add Entry to Clipboard',
      doItButtonLabel: 'Add Entry',
      doItCallback: function(phrase) {
        // add phrase to Clipboard, go back to parent screen
        addToClipboard(phrase);
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

export function updateClipboard(parentElement, props) {
  let { searchTokens } = props;
  let onClickAdd = e => {
    e.preventDefault();
    slideInAddEntryToClipboardScreen();
  };
  let onClickEdit = e => {
    e.preventDefault();
    onEditClipboard();
  };
  let filteredClipboard = JSON.parse(JSON.stringify(Clipboard));  // deep clone
  if (searchTokens.length > 0) {
    filteredClipboard.items = filteredClipboard.items.filter(phrase => {
      return searchTokens.some(token => {
        return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
      });
    });
  }
  let ClipboardTitle = buildTitleWithCollapseExpandArrows(Clipboard, "Clipboard", "ClipboardTitleIcon");
  let localUpdate = () => {
    render(html`
      <div class=PhrasesSectionLabel>
        ${ClipboardTitle}${rightSideIcons({ onClickAdd, onClickEdit })}
      </div>
      ${filteredClipboard.expanded ?
        html`<div class=ClipboardContent>
          ${filteredClipboard.items.map(phrase =>
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

function onEditClipboard() {
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editClipboard, renderFuncParams });
}

function onEditClipboardReturn() {
  updateMain();
  secondLevelScreenHide();
}

export function editClipboard(parentElement, props) {
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
      localClipboard.items.forEach(item => {
        item.selected = false;
      });
      let f = (lastClickItemIndex > phraseIndex) ? phraseIndex : lastClickItemIndex;
      let l = (lastClickItemIndex > phraseIndex) ? lastClickItemIndex : phraseIndex;
      for (let i=f; i<=l; i++) {
        localClipboard.items[i].selected = true;
      }
    } else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
      // simple click deselects everything else but the item getting the click
      localClipboard.items.forEach(item => {
        item.selected = false;
      });
      phrase.selected = true;
      lastClickItemIndex = phraseIndex;
    }
    localUpdate();
  };
  let onClickSelectAll = e => {
    e.preventDefault();
    localClipboard.items.forEach(item => {
      item.selected = true;
    });
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickDeselectAll = e => {
    e.preventDefault();
    localClipboard.items.forEach(item => {
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
        title: 'Add New Entry To Clipboard',
        doItButtonLabel: 'Add to Clipboard',
        doItCallback: function(phrase) {
          // add phrase to Clipboard, go back to parent screen
          addToClipboard(phrase);
          localClipboard = JSON.parse(JSON.stringify(Clipboard));  // deep clone
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
    let index = localClipboard.items.findIndex(phrase => phrase.selected);
    let phrase = Clipboard.items[index];
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        phrase,
        title: 'Edit Entry From Clipboard',
        doItButtonLabel: 'Update Entry',
        doItCallback: function(phrase) {
          // add phrase to Clipboard, go back to parent screen
          replaceClipboardEntry(index, phrase);
          localClipboard = JSON.parse(JSON.stringify(Clipboard));  // deep clone
          localClipboard.items[index].selected = true;
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
    localClipboard.items = localClipboard.items.filter(item => !item.selected);
    Clipboard = JSON.parse(JSON.stringify(localClipboard));  // deep clone
    traverseItems(Clipboard, deleteTemporaryProperties);
    onClipboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickAddToMyPhrases = e => {
    e.preventDefault();
    let index = localClipboard.items.findIndex(phrase => phrase.selected);
    let phrase = Clipboard.items[index];
    slideInAddFavoriteScreen({ slideInLevel: 'third', phrase });
  };
  let onClickMoveUp = e => {
    e.preventDefault();
    for (let i=1, n=localClipboard.items.length; i<n; i++) {
      let item = localClipboard.items[i];
      if (item.selected && !localClipboard.items[i-1].selected) {
        [ localClipboard.items[i-1], localClipboard.items[i] ] = [ localClipboard.items[i], localClipboard.items[i-1] ];  // swap
      }
    }
    Clipboard = JSON.parse(JSON.stringify(localClipboard));  // deep clone
    traverseItems(Clipboard, deleteTemporaryProperties);
    onClipboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveDown = e => {
    e.preventDefault();
    for (let n=localClipboard.items.length, i=n-2; i>=0; i--) {
      let item = localClipboard.items[i];
      if (item.selected && !localClipboard.items[i+1].selected) {
        [ localClipboard.items[i+1], localClipboard.items[i] ] = [ localClipboard.items[i], localClipboard.items[i+1] ];  // swap
      }
    }
    Clipboard = JSON.parse(JSON.stringify(localClipboard));  // deep clone
    traverseItems(Clipboard, deleteTemporaryProperties);
    onClipboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveToTop = e => {
    e.preventDefault();
    for (let n=localClipboard.items.length, toPosition=0, fromPosition=1; fromPosition<n; fromPosition++) {
      let toItem = localClipboard.items[toPosition];
      let fromItem = localClipboard.items[fromPosition];
      if (fromItem.selected && !toItem.selected) {
        localClipboard.items.splice(fromPosition, 1);
        localClipboard.items.splice(toPosition, 0, fromItem);
      }
      if (localClipboard.items[toPosition].selected) {
        toPosition++;
      }
    }
    Clipboard = JSON.parse(JSON.stringify(localClipboard));  // deep clone
    traverseItems(Clipboard, deleteTemporaryProperties);
    onClipboardChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveToBottom = e => {
    e.preventDefault();
    for (let n=localClipboard.items.length, toPosition=n-1, fromPosition=n-2; fromPosition>=0; fromPosition--) {
      let toItem = localClipboard.items[toPosition];
      let fromItem = localClipboard.items[fromPosition];
      if (fromItem.selected && !toItem.selected) {
        localClipboard.items.splice(fromPosition, 1);
        localClipboard.items.splice(toPosition, 0, fromItem);
      }
      if (localClipboard.items[toPosition].selected) {
        toPosition--;
      }
    }
    Clipboard = JSON.parse(JSON.stringify(localClipboard));  // deep clone
    traverseItems(Clipboard, deleteTemporaryProperties);
    onClipboardChange();
    localUpdate();
    lastClickItemIndex = null;

  };
  let initializeSelection = () => {
    localClipboard.items.forEach((item, index) => {
      item.selected = false;
    });
    lastClickItemIndex = null;
  };
  let localUpdate = () => {
    localClipboard.items.forEach(item => {
      item.cls = item.selected ? 'selected' : '';
      item.checkmark = item.selected ? html`<span class=checkmark>&#x2714;</span>` : '';
    });
    let enableEditItem = localClipboard.items.reduce((accumulator, item) => {
      if (item.selected) {
        accumulator++;
      }
      return accumulator;
    }, 0) === 1;
    let enableAddToMyPhrases = enableEditItem;
    let enableRemoveSelected = localClipboard.items.some(item => item.selected);
    let enableMoveUp = localClipboard.items.some((item, index, arr) =>
      item.selected && (index > 0 && !arr[index-1].selected));
    let enableMoveDown = localClipboard.items.some((item, index, arr) =>
      item.selected && (index < arr.length-1 && !arr[index+1].selected));
    render(html`
    <div class="Clipboard editClipboard skinnyScreenParent">
      <div class=skinnyScreenChild>
        ${buildSlideRightTitle("Manage Clipboard", onEditClipboardReturn)}
        <div class=ScreenInstructions>
          (Click to select, control-click to toggle, shift-click for range)
        </div>
        <div class=editClipboardPhraseRows>
          ${localClipboard.items.map((phrase, index) => {
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
            <span class=editClipboardNewMyPhrase></span></button>
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
  let localClipboard = JSON.parse(JSON.stringify(Clipboard));  // deep clone
  initializeSelection();
  localUpdate();
}
