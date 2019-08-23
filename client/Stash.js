
import { html, render } from './lib/lit-html/lit-html.js';
import { TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { deleteTemporaryProperties } from './Phrases.js';
import { EditPhrase } from './EditPhrase.js';
import { updateMain, buildSlideRightTitle,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows } from './Phrases.js';

let css = `
.StashTitleIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  background-image: url('./images/noun_sticky notes_2355407.svg');
  background-size: 1.1em 1.5em;
  background-position: 0% 0%;
  background-repeat: no-repeat;
}
.editStash .skinnyScreenChild {
  display: flex;
  flex-direction: column;
}
.editStashPhraseRows {
  flex: 1;
  overflow: auto;
}
`;

let Stash;

export function initializeStash(props) {
  let { currentVersion } = props;
  let initialStash = { version: currentVersion, expanded: true, items: [] };
  let StashString = localStorage.getItem("Stash");
  try {
    Stash = (typeof StashString === 'string') ? JSON.parse(StashString) : initialStash;
  } catch(e) {
    Stash = initialStash;
  }
  if (typeof Stash.version != 'number'|| Stash.version < currentVersion) {
    Stash = initialStash;
  }
}

// Add phrase to Stash without speaking
export function addToStash(phrase) {
  Stash.items.unshift(phrase);
  localStorage.setItem("Stash", JSON.stringify(Stash));
};

function replaceStashEntry(index, phrase) {
  Stash.items[index] = Object.assign({}, phrase);
  localStorage.setItem("Stash", JSON.stringify(Stash));
};

function traverseItems(aStash, func) {
  aStash.items.forEach((item, itIndex) => {
    func(item, aStash, itIndex);
  });
};

// Add text to Stash without speaking
export function stash(text) {
	text = (typeof text === 'string') ? text : TextEntryRowGetText();
	if (text.length > 0) {
		TextEntryRowSetText('');
		let phrase = { type: 'text', text, timestamp: Date.now() };
    addToStash(phrase);
    updateMain();
	}
}

function onStashChange() {
  localStorage.setItem("Stash", JSON.stringify(Stash));
}


function slideInAddEntryToStashScreen(props) {
  props = props || {};
  let { phrase } = props;
  let params = {
    renderFunc: EditPhrase,
    renderFuncParams: {
      title: 'Add Entry to Noteboard',
      doItButtonLabel: 'Add Entry',
      doItCallback: function(phrase) {
        // add phrase to Stash, go back to parent screen
        addToStash(phrase);
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

export function updateStash(parentElement, props) {
  let { searchTokens } = props;
  let onClickAdd = e => {
    e.preventDefault();
    slideInAddEntryToStashScreen();
  };
  let onClickEdit = e => {
    e.preventDefault();
    onEditStash();
  };
  let filteredStash = JSON.parse(JSON.stringify(Stash));  // deep clone
  if (searchTokens.length > 0) {
    filteredStash.items = filteredStash.items.filter(phrase => {
      return searchTokens.some(token => {
        return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
      });
    });
  }
  let StashTitle = buildTitleWithCollapseExpandArrows(Stash, "Noteboard", "StashTitleIcon");
  let localUpdate = () => {
    render(html`
      <style>${css}</style>
      <div class=PhrasesSectionLabel>
        ${StashTitle}${rightSideIcons({ onClickAdd, onClickEdit })}
      </div>
      ${filteredStash.expanded ?
        html`<div class=StashContent>
          ${filteredStash.items.map(phrase =>
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

function onEditStash() {
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editStash, renderFuncParams });
}

function onEditStashReturn() {
  updateMain();
  secondLevelScreenHide();
}

export function editStash(parentElement, props) {
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
      localStash.items.forEach(item => {
        item.selected = false;
      });
      let f = (lastClickItemIndex > phraseIndex) ? phraseIndex : lastClickItemIndex;
      let l = (lastClickItemIndex > phraseIndex) ? lastClickItemIndex : phraseIndex;
      for (let i=f; i<=l; i++) {
        localStash.items[i].selected = true;
      }
    } else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
      // simple click deselects everything else but the item getting the click
      localStash.items.forEach(item => {
        item.selected = false;
      });
      phrase.selected = true;
      lastClickItemIndex = phraseIndex;
    }
    localUpdate();
  };
  let onClickSelectAll = e => {
    e.preventDefault();
    localStash.items.forEach(item => {
      item.selected = true;
    });
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickDeselectAll = e => {
    e.preventDefault();
    localStash.items.forEach(item => {
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
        title: 'Add New Entry To Noteboard',
        doItButtonLabel: 'Add to Noteboard',
        doItCallback: function(phrase) {
          // add phrase to Stash, go back to parent screen
          addToStash(phrase);
          localStash = JSON.parse(JSON.stringify(Stash));  // deep clone
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
    let index = localStash.items.findIndex(phrase => phrase.selected);
    let phrase = Stash.items[index];
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        phrase,
        title: 'Edit Entry From Noteboard',
        doItButtonLabel: 'Update Entry',
        doItCallback: function(phrase) {
          // add phrase to Stash, go back to parent screen
          replaceStashEntry(index, phrase);
          localStash = JSON.parse(JSON.stringify(Stash));  // deep clone
          localStash.items[index].selected = true;
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
    localStash.items = localStash.items.filter(item => !item.selected);
    Stash = JSON.parse(JSON.stringify(localStash));  // deep clone
    traverseItems(Stash, deleteTemporaryProperties);
    onStashChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveUp = e => {
    e.preventDefault();
    for (let i=1, n=localStash.items.length; i<n; i++) {
      let item = localStash.items[i];
      if (item.selected && !localStash.items[i-1].selected) {
        [ localStash.items[i-1], localStash.items[i] ] = [ localStash.items[i], localStash.items[i-1] ];  // swap
      }
    }
    Stash = JSON.parse(JSON.stringify(localStash));  // deep clone
    traverseItems(Stash, deleteTemporaryProperties);
    onStashChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveDown = e => {
    e.preventDefault();
    for (let n=localStash.items.length, i=n-2; i>=0; i--) {
      let item = localStash.items[i];
      if (item.selected && !localStash.items[i+1].selected) {
        [ localStash.items[i+1], localStash.items[i] ] = [ localStash.items[i], localStash.items[i+1] ];  // swap
      }
    }
    Stash = JSON.parse(JSON.stringify(localStash));  // deep clone
    traverseItems(Stash, deleteTemporaryProperties);
    onStashChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveToTop = e => {
    e.preventDefault();
    for (let n=localStash.items.length, toPosition=0, fromPosition=1; fromPosition<n; fromPosition++) {
      let toItem = localStash.items[toPosition];
      let fromItem = localStash.items[fromPosition];
      if (fromItem.selected && !toItem.selected) {
        localStash.items.splice(fromPosition, 1);
        localStash.items.splice(toPosition, 0, fromItem);
      }
      if (localStash.items[toPosition].selected) {
        toPosition++;
      }
    }
    Stash = JSON.parse(JSON.stringify(localStash));  // deep clone
    traverseItems(Stash, deleteTemporaryProperties);
    onStashChange();
    localUpdate();
    lastClickItemIndex = null;
  };
  let onClickMoveToBottom = e => {
    e.preventDefault();
    for (let n=localStash.items.length, toPosition=n-1, fromPosition=n-2; fromPosition>=0; fromPosition--) {
      let toItem = localStash.items[toPosition];
      let fromItem = localStash.items[fromPosition];
      if (fromItem.selected && !toItem.selected) {
        localStash.items.splice(fromPosition, 1);
        localStash.items.splice(toPosition, 0, fromItem);
      }
      if (localStash.items[toPosition].selected) {
        toPosition--;
      }
    }
    Stash = JSON.parse(JSON.stringify(localStash));  // deep clone
    traverseItems(Stash, deleteTemporaryProperties);
    onStashChange();
    localUpdate();
    lastClickItemIndex = null;

  };
  let initializeSelection = () => {
    localStash.items.forEach((item, index) => {
      item.selected = false;
    });
    lastClickItemIndex = null;
  };
  let localUpdate = () => {
    localStash.items.forEach(item => {
      item.cls = item.selected ? 'selected' : '';
      item.checkmark = item.selected ? html`<span class=checkmark>&#x2714;</span>` : '';
    });
    let enableEditItem = localStash.items.reduce((accumulator, item) => {
      if (item.selected) {
        accumulator++;
      }
      return accumulator;
    }, 0) === 1;
    let enableRemoveSelected = localStash.items.some(item => item.selected);
    let enableMoveUp = localStash.items.some((item, index, arr) =>
      item.selected && (index > 0 && !arr[index-1].selected));
    let enableMoveDown = localStash.items.some((item, index, arr) =>
      item.selected && (index < arr.length-1 && !arr[index+1].selected));
    render(html`
    <style>${css}</style>
    <div class="Stash editStash skinnyScreenParent">
      <div class=skinnyScreenChild>
        ${buildSlideRightTitle("Manage Noteboard", onEditStashReturn)}
        <div class=ScreenInstructions>
          Click items in the list below to select and deselect.
        </div>
        <div class=editStashPhraseRows>
          ${localStash.items.map((phrase, index) => {
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
  let localStash = JSON.parse(JSON.stringify(Stash));  // deep clone
  initializeSelection();
  localUpdate();
}
