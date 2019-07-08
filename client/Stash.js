
import { render, html } from 'https://unpkg.com/lit-html?module';
import { showPopup } from './popup.js';
// import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js';

let css = `
.editStash .skinnyScreenChild {
  display: flex;
  flex-direction: column;
}
.editStashPhraseRows {
  flex: 1;
  overflow: auto;
}
`;

export function updateStash(parentElement, props) {
  let { Stash, searchTokens, onPhraseClick, speak, onEditStash, rightSideIcons,
    buildTitleWithCollapseExpandArrows, cloneOnlyPermanentProperties } = props;
  let onClickEdit = e => {
    e.preventDefault();
    onEditStash();
  };
  let onClickHelp = e => {
    e.preventDefault();
    debugger;
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
  let StashTitle = buildTitleWithCollapseExpandArrows(Stash, "Stash");
  render(html`
  <style>${css}</style>
  <div class=Stash>
    <div class=PhrasesSectionLabel>
      ${StashTitle}${rightSideIcons(onClickEdit, onClickHelp)}
    </div>
    ${filteredStash.expanded ?
      html`${filteredStash.items.map(phrase =>
        html`
          <div class=PhraseRow>
            <button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
          </div>
        `
      )}` : ''}
  </div>`, parentElement);
}

export function editStash(parentElement, props) {
  let { Stash, onStashChange, onEditStashReturn, buildSlideRightTitle, speak } = props;
  let onItemClick = e => {
    e.preventDefault();
    let phrase = e.currentTarget.phraseObject;
    phrase.selected = !phrase.selected;
    localUpdate();
  };
  let onClickSelectAll = e => {
    e.preventDefault();
    localStash.items.forEach(item => {
      item.selected = true;
    });
    localUpdate();
  };
  let onClickDeselectAll = e => {
    e.preventDefault();
    localStash.items.forEach(item => {
      item.selected = false;
    });
    localUpdate();
  };
  let onClickAddItem = e => {
    e.preventDefault();
  };
  let onClickEditItem = e => {
    e.preventDefault();
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    localStash.items = localStash.items.filter(item => !item.selected);
    onStashChange(cloneOnlyPermanentProperties(localStash));
    localUpdate();
  };
  let onClickMoveUp = e => {
    e.preventDefault();
    for (let i=1, n=localStash.items.length; i<n; i++) {
      let item = localStash.items[i];
      if (item.selected && !localStash.items[i-1].selected) {
        [ localStash.items[i-1], localStash.items[i] ] = [ localStash.items[i], localStash.items[i-1] ];  // swap
      }
    }
    onStashChange(cloneOnlyPermanentProperties(localStash));
    localUpdate();
  };
  let onClickMoveDown = e => {
    e.preventDefault();
    for (let n=localStash.items.length, i=n-2; i>=0; i--) {
      let item = localStash.items[i];
      if (item.selected && !localStash.items[i+1].selected) {
        [ localStash.items[i+1], localStash.items[i] ] = [ localStash.items[i], localStash.items[i+1] ];  // swap
      }
    }
    onStashChange(cloneOnlyPermanentProperties(localStash));
    localUpdate();
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
    onStashChange(cloneOnlyPermanentProperties(localStash));
    localUpdate();
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
    onStashChange(cloneOnlyPermanentProperties(localStash));
    localUpdate();
  };
  let localStash = JSON.parse(JSON.stringify(Stash));  // deep clone
  localStash.items.forEach((item, index) => {
    item.selected = false;
  });
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
        ${buildSlideRightTitle("Manage Stash", onEditStashReturn)}
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
  localUpdate();
}
