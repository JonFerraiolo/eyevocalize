
import { render, html } from 'https://unpkg.com/lit-html?module';
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

let cloneOnlyPermanentProperties = localStash => {
  let newStash = JSON.parse(JSON.stringify(localStash));  // deep clone
  newStash.items = newStash.items.map(item => {
    return { text: item.text, label: item.label, audio: item.audio };
  });
  return newStash;
};

export function updateStash(parentElement, props) {
  let { Stash, searchTokens, onPhraseClick, speak, onEditStash, rightSideIcons, buildTitleWithCollapseExpandArrows } = props;
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
            <button @click=${onPhraseClick} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
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
  let localStash = JSON.parse(JSON.stringify(Stash));  // deep clone
  localStash.items.forEach((item, index) => {
    item.selected = false;
  });
  let localUpdate = () => {
    localStash.items.forEach(item => {
      item.cls = item.selected ? 'selected' : '';
      item.checkmark = item.selected ? html`<span class=checkmark>&#x2714;</span>` : '';
    });
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
          Use the commands at the bottom to take actions.
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
          <button @click=${onClickAddItem}>New<br/>Item</button>
          <button @click=${onClickRemoveSelected} ?disabled=${!enableRemoveSelected}>Remove<br/>Selected</button>
          <button @click=${onClickMoveUp} ?disabled=${!enableMoveUp}>Move<br/>Up</button>
          <button @click=${onClickMoveDown} ?disabled=${!enableMoveDown}>Move<br/>Down</button>
        </div>
      </div>
    </div>`, parentElement);
  };
  localUpdate();
}
