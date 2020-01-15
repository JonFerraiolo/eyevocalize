
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows,
  deleteTemporaryProperties } from './Phrases.js';
import { updateMain, buildSlideRightTitle,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { EditPhrase } from './EditPhrase.js';
import { showPopup, hidePopup } from './popup.js';

let css = `
.Builtins {
  padding-left: 0.5em;
  min-height: 0px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.Builtins.EditBuiltins {
  padding-left: 0;
}
.BuiltinsTitleIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  background-image: url('./images/heart.svg');
  background-size: 1.1em 1.1em;
  background-position: 0px 1px;
  background-repeat: no-repeat;
}
.BuiltinsCategoryLabel {
  font-size: 90%;
  color: #888;
}
.BuiltinsCategoryLabel a, .BuiltinsCategoryLabel a:link, .BuiltinsCategoryLabel a:visited {
  text-decoration: none;
  cursor: pointer;
  color: #888;
}
.BuiltinsColumns {
  height: 100%;
  display: flex;
  width: 100%;
}
.BuiltinsColumn {
  height: 100%;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  border-left: 1px solid #eee;
  padding-left: 0.5em;
}
.BuiltinsColumn:first-child {
  border-left: none;
  padding-left: 0;
}
.BuiltinContainer {
  display: inline-block;
}
.Builtins .BuiltinContainer button {
  display: inline-block;
  flex: 1;
  margin: 1px 0;
  align-items: center;
  border-radius: 3px;
  border: 1px solid black;
  background: none;
  padding: 0.15em 0.25em;
  color: black;
  text-align: left;
}
.Builtins .BuiltinContainer button:hover, .Builtins .BuiltinContainer button:focus {
  cursor: pointer;
}
.Builtins .BuiltinContainer button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
.BuiltinsEditPhraseChooseCategory {
  text-align: center;
  padding: 0.75em 0 0.25em;
  font-size: 95%;
}
.BuiltinsEditPhraseChooseCategory * {
  vertical-align: middle;
}
.BuiltinsEditPhraseChooseCategory label {
  font-size: 85%;
  margin-right: 0.25em;
}
.BuiltinsEditPhraseColumnCategory {
  border: 1px solid #eee;
  background: #fcfcfc;
  padding: 0.25em;
}
.BuiltinsEditPhraseColumn, .BuiltinsEditPhraseCategory {
  font-weight: bold;
}
.BuiltinsEditPhraseColumn {
  font-size: 75%;
  margin-right: 0.25em;
}
.BuiltinsEditPhraseChooseCategory button {
  margin-left: 0.75em;
  font-size: 85%;
}
.BuiltinsChooseCategory {
  border: 1px solid black;
  padding: 0.5em 1em;
}
.EditBuiltinsChild {
  height:100%;
  display: flex;
  flex-direction: column;
  padding: 0 1em ;
}
.EditBuiltinsChild .SlideRightBackArrow {
  margin-left: -0.25em;
}
.EditBuiltinsChild .TabControlRadioButtons > label {
  display: inline-flex;
  align-items: center;
  padding: 0 0.5em;
  font-size: 80%;
  border-bottom: 2px solid black;
}
.EditBuiltins .TabControlRadioButton {
  font-size: 95%;
}
.EditBuiltinsData {
  flex:1;
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  border-top: none;
  padding: 0.25em 0.5em 0;
}
.EditBuiltins .ScreenInstructions {
  font-size: 85%;
  font-style: italic;
  text-align: center;
  padding: 0 0 0.5em;
}
.EditWhatCategories .BuiltinsCategoryLabel {
  font-size: 95%;
  color: black;
  background: #eee;
}
.EditWhatCategories .BuiltinsCategoryLabel.selected {
  font-weight: bold;
  font-style: italic;
  background: #ddf;
  color: #004;
}
.EditWhatCategories .BuiltinsCategoryLabel a, .EditWhatCategories .BuiltinsCategoryLabel a:link, .EditWhatCategories .BuiltinsCategoryLabel a:visited {
  color: black;
}
.Builtins .EditWhatCategories .BuiltinsCategoryItems {
  line-height: 0.15;
}
.Builtins .EditWhatCategories .BuiltinContainer button {
  border: 1px solid #888;
  color: #888;
  font-size: 0.35em;
}
.Builtins .EditWhatCategories .BuiltinsColumn {
  display: inline-flex;
  flex-direction: column;
  padding-bottom: 0.5em;
}
.Builtins .EditWhatCategories .BuiltinsColumn .spacer {
  flex: 1;
}
.EditBuiltinsNewCategoryRow button {
  font-size: 80%;
  font-style: italic;
}
.EditBuiltins .SelectLinksRow {
  padding: 0.5em 1.5em 0;
  display: flex;
  justify-content: space-around;
  font-size: 95%;
}
.EditBuiltins .SelectLinksRow a.EditBuiltinsSelectDisabled {
  opacity: 0.3;
  text-decoration: none;
  cursor: default;
  color: gray;
}
.EditBuiltinsChild .ButtonRow {
  padding: 0.5em 0;
}
.EditBuiltinsChild .ButtonRow button {
  padding: 0em 1.1em;
}
.EditBuiltinsChild .ButtonRow button .arrowButton {
  margin: -0.2em 0;
}
.BuiltinsChooseCategory {
  background: white;
  border: 2px solid black;
  padding: 0.25em 1.5em;
  font-size: 95%;
}
.BuiltinsChooseCategoryTitle {
  font-weight: 700;
  padding: 0.6em 0;
  text-align: center;
}
.BuiltinsChooseCategoryChooser {
  font-size: 90%;
}
.BuiltinsChooseCategoryChooser label {
  font-size: 90%;;
}
.BuiltinsChooseCategoryList {
  border: 1px solid black;
  padding: 0.2em;
  display: flex;
}
.BuiltinsChooseCategoryColumn {
  vertical-align: top;
  flex: 1;
  padding: 0 3em 0 0.5em;
  border-left: 1px solid #ccc;
  display: inline-flex;
  flex-direction: column;
}
.BuiltinsChooseCategoryListItem {
  padding: 0.2em 0;
  white-space: nowrap;
}
.BuiltinsChooseCategoryColumn .spacer {
  flex: 1;
}
.BuiltinsChooseCategoryListItem.BuiltinsChooseCategoryListItemNew {
  font-style: italic;
  border: 1px solid #444;
  border-radius: 3px;
  padding: 0.25em;
  background: #f0f0f0;
  margin: 1.5em 0 0.75em;
  font-size: 80%;
  width: fit-content;
}
.BuiltinsChooseCategoryListItem.selected {
  font-weight: bold;
  font-style: italic;
  background: #ddf;
  color: #004;
}
.BuiltinsChooseCategoryButtonRow {
  padding: 1em 0;
  display: flex;
  justify-content: space-around;
}
`;

let Builtins;

export function initializeBuiltins(props) {
  let { currentVersion } = props;
  Builtins = {
    version: currentVersion,
    lastChooseCategory: { columnIndex: 0, categoryIndex: 0, categoryLabel: null },
    columns: [
      { categories: [
        { label: 'Basic', expanded: true, items: [
          { type: 'text', label: 'nevermind', text: 'Sorry. Mistake. Ignore what I just said.'},
          { type: 'text', label: 'help', text: 'Please come and help me'},
          { type: 'text', label: 'yes', text: 'yes'},
          { type: 'text', label: 'no', text: 'no'},
          { type: 'text', label: 'OK', text: 'OK'},
          { type: 'text', label: 'good', text: "good"},
          { type: 'text', label: 'still', text: "still not right"},
          { type: 'text', label: 'gaze trouble', text: "I am having trouble with my eye gaze at the moment, so I may not be able to answer questions. Maybe try asking me questions that have yes and no answers. "},
        ]},
        { label: 'Pleasantries', expanded: true, items: [
          { type: 'text', label: 'please', text: 'Please.'},
          { type: 'text', label: 'thankyou', text: 'Thank you.'},
          { type: 'text', label: 'hello', text: 'hello'},
          { type: 'text', label: 'goodbye', text: 'goodbye'},
          { type: 'text', label: 'g-morn', text: 'good morning'},
          { type: 'text', label: 'howRU', text: 'how are you'},
        ]},
        { label: 'Adjustments', expanded: true, items: [
          { type: 'text', label: 'up', text: 'Please move it up. '},
          { type: 'text', label: 'down', text: 'Please move it down. '},
          { type: 'text', label: 'left', text: 'Please move it to my left. '},
          { type: 'text', label: 'right', text: 'Please move it to my right. '},
          { type: 'text', label: 'in', text: 'Please push it in. '},
          { type: 'text', label: 'out', text: 'Please push it out. '},
          { type: 'text', label: 'forward', text: 'Please move it forward. '},
          { type: 'text', label: 'backward', text: 'Please move it Backward. '},
          { type: 'text', label: 'tighter', text: 'Please make it tighter. '},
          { type: 'text', label: 'looser', text: 'Please make it looser. '},
          { type: 'text', label: 'little', text: 'Only a small amount. '},
          { type: 'text', label: 'a lot', text: 'Quite a lot. '},
          { type: 'text', label: 'hurry', text: 'Please hurry!'},
          { type: 'text', label: 'no rush', text: 'Take your time. Not urgent'},
        ]},
      ]},
    ]
  };
};

// Add phrase to Builtins without speaking
export function addToBuiltins(phrase, columnIndex, categoryIndex) {
  Builtins.columns[columnIndex].categories[categoryIndex].items.push(phrase);
  // FIXME localStorage.setItem("Builtins", JSON.stringify(Builtins));
};

function replaceBuiltinsEntry(columnIndex, categoryIndex, itemIndex, phrase) {
  Builtins.columns[columnIndex].categories[categoryIndex].items[itemIndex] = Object.assign({}, phrase);
  // FIXME localStorage.setItem("Builtins", JSON.stringify(Builtins));
};

// invoke a function for each category stored in a Builtins data structure
// four arguments are passed to the func (see below)
function traverseColumnsCategories(aBuiltins, func) {
  aBuiltins.columns.forEach((column, colIndex) => {
    column.categories.forEach((category, catIndex) => {
      func(category, aBuiltins, colIndex, catIndex);
    });
  });
}

// invoke a function for each phrase stored in a Builtins data structure
// five arguments are passed to the func (see below)
function traverseColumnsCategoriesItems(aBuiltins, func) {
  aBuiltins.columns.forEach((column, colIndex) => {
    column.categories.forEach((category, catIndex) => {
      category.items.forEach((item, itIndex) => {
        func(item, aBuiltins, colIndex, catIndex, itIndex);
      });
    });
  });
}

function onBuiltinsChange(newBuiltins) {
  // FIXME localStorage.setItem("Builtins", JSON.stringify(Builtins));
};

export function slideInAddBuiltinScreen(props) {
  props = props || {};
  let { phrase, slideInLevel } = props;
  let customControlsData = {};
  let params = {
    renderFunc: EditPhrase,
    renderFuncParams: {
      title: 'Add New Builtin',
      doItButtonLabel: 'Add Builtin',
      doItCallback: function(phrase) {
        let { columnIndex, categoryIndex } = customControlsData;
        // add phrase to Builtins, go back to parent screen
        addToBuiltins(phrase, columnIndex, categoryIndex);
        updateMain();
        if (slideInLevel === 'third') {
          thirdLevelScreenHide();
        } else {
          secondLevelScreenHide();
        }
      },
      cancelCallback: function() {
        // do nothing, go back to parent screen
        if (slideInLevel === 'third') {
          thirdLevelScreenHide();
        } else {
          secondLevelScreenHide();
        }
      },
      textLabelRequired: true,
      customControlsFunc: buildChooseCategoryControl,
      phrase,
      customControlsData,
    },
  };
  if (slideInLevel === 'third') {
    thirdLevelScreenShow(params);
  } else {
    secondLevelScreenShow(params);
  }
};

export function updateBuiltins(parentElement, props) {
  let { searchTokens } = props;
  let onClickAdd = e => {
    e.preventDefault();
    slideInAddBuiltinScreen();
  };
  let onClickEdit = e => {
    e.preventDefault();
    onEditBuiltins();
  };
  let localUpdate = () => {
    let filteredBuiltins = JSON.parse(JSON.stringify(Builtins));  // deep clone
    filteredBuiltins.columns.forEach(column => {
      column.categories.forEach((category, index) => {
        category.categoryIndex = index;
        category.items = category.items.filter(phrase => {
          if (searchTokens.length === 0) {
            return true;
          } else {
            return searchTokens.some(token => {
              return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                      (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
            });
          }
        });
      });
    });
    filteredBuiltins.columns.forEach((column, cIndex) => {
      column.categories.forEach(category => {
        let originalDataCategory = Builtins.columns[cIndex].categories[category.categoryIndex];
        category.titleContent = buildTitleWithCollapseExpandArrows(originalDataCategory, category.label);
      });
    });
    render(html`
    <style>${css}</style>
    <div class=Builtins>
      <div class=PhrasesSectionLabel><span class=BuiltinsTitleIcon></span>Builtins${rightSideIcons({ onClickAdd, onClickEdit })}</div>
      <div class=BuiltinsColumns>
        ${filteredBuiltins.columns.map(column => html`
          <div class=BuiltinsColumn>
            ${column.categories.map(category => html`
              <div class=BuiltinsCategoryLabel>${category.titleContent}</div>
              ${category.expanded ?
                html`${category.items.map(phrase =>
                  html`
                    <div class=BuiltinContainer>
                      <button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
                    </div>
                  `
                )}` : ''}
            `)}
          </div>
        `)}
      </div>
    </div>`, parentElement);
  };
  localUpdate();
}

function onEditBuiltins() {
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editBuiltins, renderFuncParams });
}

function onEditBuiltinsReturn() {
  updateMain();
  secondLevelScreenHide();
}

export function editBuiltins(parentElement, props) {
  let editWhat = 'items';
  let lastClickItemIndex = null, lastClickCategoryIndex = null, lastClickColumnIndex = null;
  let editCategoryNameColumnIndex = null, editCategoryNameCategoryIndex = null;
  let makeLocalChangesPermanent = (() => {
    Builtins = JSON.parse(JSON.stringify(localBuiltins)); // deep clone
    traverseColumnsCategoriesItems(Builtins, deleteTemporaryProperties);
    onBuiltinsChange();
    localUpdate();
  });
  let onClickTab = e => {
    e.preventDefault();
    editWhat = e.currentTarget.EditBuiltinsEditWhatValue;
    localUpdate();
  };
  let onItemClick = e => {
    e.preventDefault();
    let objType = e.currentTarget.favoritesFlavor;
    let obj = e.currentTarget.favoritesObject;
    if (objType === editWhat) {
      if (editWhat === 'items') {
        let phrase = e.currentTarget.favoritesObject;
        let colIndex = e.currentTarget.favoritesColumnIndex;
        let catIndex = e.currentTarget.favoritesCategoryIndex;
        let itIndex = e.currentTarget.favoritesItemIndex;
        let shift = e.getModifierState("Shift");
        let control = e.getModifierState("Control");
        let meta = e.getModifierState("Meta");
        if (control && !meta && !shift) {
          // control click is toggle selection for the thing that was clicked on
          phrase.selected = !phrase.selected;
          lastClickColumnIndex = colIndex;
          lastClickCategoryIndex = catIndex;
          lastClickItemIndex = itIndex;
        } else if (shift && !meta && !control && lastClickItemIndex != null &&
            lastClickColumnIndex === colIndex && lastClickCategoryIndex === catIndex) {
          // shift click is range selection
          traverseColumnsCategoriesItems(localBuiltins, item => {
            item.selected = false;
          });
          let f = (lastClickItemIndex > itIndex) ? itIndex : lastClickItemIndex;
          let l = (lastClickItemIndex > itIndex) ? lastClickItemIndex : itIndex;
          let items = localBuiltins.columns[colIndex].categories[catIndex].items;
          for (let i=f; i<=l; i++) {
            items[i].selected = true;
          }
        } else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
          // simple click deselects everything else but the item getting the click
          traverseColumnsCategoriesItems(localBuiltins, item => {
            item.selected = false;
          });
          phrase.selected = true;
          lastClickColumnIndex = colIndex;
          lastClickCategoryIndex = catIndex;
          lastClickItemIndex = itIndex;
        }
        localUpdate();
      } else {
        let category = e.currentTarget.favoritesObject;
        let colIndex = e.currentTarget.favoritesColumnIndex;
        let catIndex = e.currentTarget.favoritesCategoryIndex;
        let shift = e.getModifierState("Shift");
        let control = e.getModifierState("Control");
        let meta = e.getModifierState("Meta");
        if (!control && !meta && !shift) {
          // simple click deselects everything else but the item getting the click
          traverseColumnsCategories(localBuiltins, category => {
            category.selected = false;
          });
          category.selected = true;
        }
        localUpdate();
      }
    }
  };
  let onClickSelectAll = e => {
    // If editWhat==items, select all in categories with selected items
    // If categories, always disabled
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localBuiltins, category => {
        if (category.items.some(item => item.selected)) {
          category.items.forEach(item => {
            item.selected = true;
          });
        }
      });
      localUpdate();
      lastClickItemIndex = null;
      editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
    }
  };
  let onClickDeselectAll = e => {
    e.preventDefault();
    traverseColumnsCategories(localBuiltins, category => {
      if (editWhat === 'categories') {
        category.selected = false;
      } else if (editWhat === 'items') {
        category.items.forEach(item => {
          item.selected = false;
        });
      }
    });
    localUpdate();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;

  };
  let onClickAddItem = e => {
    // should never be called when editWhatis categories
    e.preventDefault();
    let customControlsData = {};
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        title: 'Add New Entry To Builtins',
        doItButtonLabel: 'Add to Builtins',
        doItCallback: function(phrase) {
          let { columnIndex, categoryIndex } = customControlsData;
          // add phrase to Builtins, go back to parent screen
          addToBuiltins(phrase, columnIndex, categoryIndex);
          localBuiltins = JSON.parse(JSON.stringify(Builtins));  // deep clone
          initializeSelection();
          localUpdate();
          thirdLevelScreenHide();
          lastClickItemIndex = null;
          editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
        },
        cancelCallback: function() {
          // do nothing, go back to parent screen
          thirdLevelScreenHide();
        },
        textLabelRequired: true,
        customControlsFunc: buildChooseCategoryControl,
        customControlsData,
      },
    };
    thirdLevelScreenShow(params);
  };
  let onClickEditItem = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      let phrase, columnIndex, categoryIndex, itemIndex;
      traverseColumnsCategoriesItems(localBuiltins, (item, origObj, colIndex, catIndex, itIndex) => {
        if (!phrase && item.selected) {
          phrase = item;
          columnIndex = colIndex;
          categoryIndex = catIndex;
          itemIndex = itIndex;
        }
      });
      let customControlsData = { columnIndex, categoryIndex };
      let params = {
        renderFunc: EditPhrase,
        renderFuncParams: {
          phrase,
          title: 'Edit Entry From Builtins',
          doItButtonLabel: 'Update Entry',
          doItCallback: function(phrase) {
            // add phrase to Builtins, go back to parent screen
            // FIXME  wrong if user changes category
            replaceBuiltinsEntry(columnIndex, categoryIndex, itemIndex, phrase);
            localBuiltins = JSON.parse(JSON.stringify(Builtins));  // deep clone
            localBuiltins.columns[columnIndex].categories[categoryIndex].items[itemIndex].selected = true;
            localUpdate();
            thirdLevelScreenHide();
          },
          cancelCallback: function() {
            // do nothing, go back to parent screen
            thirdLevelScreenHide();
          },
          textLabelRequired: true,
          customControlsFunc: buildChooseCategoryControl,
          customControlsData,
        },
      };
      thirdLevelScreenShow(params);
    } else {
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localBuiltins, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      editCategoryNameColumnIndex = columnIndex;
      editCategoryNameCategoryIndex = categoryIndex;
      localUpdate();
      setTimeout(() => {
        let elem = document.getElementById('EditBuiltinsEditCategoryName');
        elem.value = Builtins.columns[columnIndex].categories[categoryIndex].label;
        elem.focus();
        elem.setSelectionRange(0, elem.value.length);
      }, 0);
    }
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localBuiltins, category => {
        category.items = category.items.filter(item => !item.selected);
      });
    } else {
      // should only be here if a single empty category is selected and
      // and the column has more than one category
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localBuiltins, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      localBuiltins.columns[columnIndex].categories.splice(categoryIndex, 1);
    }
    makeLocalChangesPermanent();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
  };
  let onClickMoveLeft = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localBuiltins, category => {
        for (let i=1, n=category.items.length; i<n; i++) {
          let item = category.items[i];
          if (item.selected && !category.items[i-1].selected) {
            [ category.items[i-1], category.items[i] ] = [ category.items[i], category.items[i-1] ];  // swap
          }
        }
      });
    } else {
      // should only be here if a single category is selected and
      // and it is not the first in a column
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localBuiltins, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localBuiltins.columns[columnIndex];
      let i = categoryIndex;
      [ column.categories[i-1], column.categories[i] ] = [ column.categories[i], column.categories[i-1] ];  // swap
    }
    makeLocalChangesPermanent();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
  };
  let onClickMoveRight = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localBuiltins, category => {
        for (let n=category.items.length, i=n-2; i>=0; i--) {
          let item = category.items[i];
          if (item.selected && !category.items[i+1].selected) {
            [ category.items[i+1], category.items[i] ] = [ category.items[i], category.items[i+1] ];  // swap
          }
        }
      });
    } else {
      // should only be here if a single category is selected and
      // and it is not the last in a column
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localBuiltins, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localBuiltins.columns[columnIndex];
      let i = categoryIndex;
      [ column.categories[i+1], column.categories[i] ] = [ column.categories[i], column.categories[i+1] ];  // swap
    }
    makeLocalChangesPermanent();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
  };
  let onClickMoveToTop = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localBuiltins, category => {
        for (let n=category.items.length, toPosition=0, fromPosition=1; fromPosition<n; fromPosition++) {
          let toItem = category.items[toPosition];
          let fromItem = category .items[fromPosition];
          if (fromItem.selected && !toItem.selected) {
            category.items.splice(fromPosition, 1);
            category.items.splice(toPosition, 0, fromItem);
          }
          if (category.items[toPosition].selected) {
            toPosition++;
          }
        }
      });
    } else {
      // should only be here if a single category is selected and
      // and it is not the first in a column
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localBuiltins, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localBuiltins.columns[columnIndex];
      let deleted = column.categories.splice(categoryIndex, 1);
      column.categories.splice(0, 0, deleted[0]);
    }
    makeLocalChangesPermanent();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;

  };
  let onClickMoveToBottom = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localBuiltins, category => {
        for (let n=category.items.length, toPosition=n-1, fromPosition=n-2; fromPosition>=0; fromPosition--) {
          let toItem = category.items[toPosition];
          let fromItem = category.items[fromPosition];
          if (fromItem.selected && !toItem.selected) {
            category.items.splice(fromPosition, 1);
            category.items.splice(toPosition, 0, fromItem);
          }
          if (category.items[toPosition].selected) {
            toPosition--;
          }
        }
      });
    } else {
      // should only be here if a single category is selected and
      // and it is not the last  in a column
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localBuiltins, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localBuiltins.columns[columnIndex];
      let endpos = column.categories.length - 1;
      let deleted = column.categories.splice(categoryIndex, 1);
      column.categories.splice(endpos, 0, deleted[0]);
    }
    makeLocalChangesPermanent();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;

  };
  let onClickNewCategory = e => {
    e.preventDefault();
    editCategoryNameColumnIndex = e.currentTarget.favoritesColumnIndex;
    editCategoryNameCategoryIndex = e.currentTarget.favoritesCategoryIndex;
    localBuiltins.columns[editCategoryNameColumnIndex].categories.push(
      { label:  '', expanded: false, selected: false, items:[] });
    localUpdate();
    setTimeout(() => {
      let elem = document.getElementById('EditBuiltinsEditCategoryName');
      elem.focus();
    }, 0);
  };
  let doneWithEditCategoryName = () => {
    if (editCategoryNameColumnIndex === null) return;
    let elem = document.getElementById('EditBuiltinsEditCategoryName');
    let name = elem.value.trim();
    let categories = Builtins.columns[editCategoryNameColumnIndex].categories;
    if (name.length > 0) {
      if (editCategoryNameCategoryIndex >= categories.length) {
        categories.push({ label: name, expanded: true, items: [] });
      } else {
        categories[editCategoryNameCategoryIndex].label = name;
      }
    }
    localBuiltins = JSON.parse(JSON.stringify(Builtins));  // deep clone
    initializeSelection();
    localUpdate();
  };
  let onCategoryNameKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doneWithEditCategoryName();
    }
  };
  let onCategoryNameBlur = e => {
    e.preventDefault();
    doneWithEditCategoryName();
  };
  let initializeSelection = () => {
    traverseColumnsCategories(localBuiltins, category => {
      category.selected = false;
      category.items.forEach(item => {
        item.selected = false;
      });
    });
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
  };
  let buildEditWhatRadioButton = (id, value, label) => {
    let cls = 'TabControlRadioButton' + (editWhat===value ? ' TabControlRadioButtonChecked' : '');
    return html`
      <span class=${cls} @click=${onClickTab} .EditBuiltinsEditWhatValue=${value}>
        <label for=${id}>
          <input type=radio id=${id} name=EditBuiltinsEditWhat value=${value} ?checked=${editWhat===value}></input
          ><span class=TabControlRadioButtonLabel>${label}</span>
        </label>
      </span>
    `;
    return '';
  };
  let localUpdate = () => {
    localBuiltins.columns.forEach(column => {
      column.categories.forEach(category => {
        category.cls = (editWhat === 'categories' && category.selected) ? 'selected' : '';
        category.checkmark = (editWhat === 'categories' && category.selected) ? html`<span class=checkmark>&#x2714;</span>` : '';
        category.items.forEach(item => {
          item.cls = (editWhat === 'items' && item.selected) ? 'selected' : '';
          item.checkmark = (editWhat === 'items' && item.selected) ? html`<span class=checkmark>&#x2714;</span>` : '';
        });
      });
    });
    let enableEditItem = localBuiltins.columns.reduce((accumulator, column) => {
      accumulator += column.categories.reduce((accumulator, category) => {
        accumulator += category.items.reduce((accumulator, item) => {
          if (editWhat === 'items' && item.selected) {
            accumulator++;
          }
          return accumulator;
        }, 0);
        if (editWhat === 'categories' && category.selected) {
          accumulator++;
        }
        return accumulator;
      }, 0);
      return accumulator;
    }, 0) === 1;
    // enableRemoveSelected is true if editWhat==items and any selected individual items
    // or editWhat==categories and any categories are selected
    // enableSelectAll is true only if editWhat==items and at least one item is selected
    let enableRemoveSelected = false;
    let enableSelectAll = false;
    localBuiltins.columns.forEach(column => {
      if (editWhat === 'items') {
        column.categories.forEach(category => {
          if (category.items.some(item => item.selected)) {
            enableRemoveSelected = true;
            enableSelectAll = true;
          }
        });
      } else if (editWhat === 'categories') {
        let category = column.categories.find(category => category.selected);
        if (column.categories.length > 1 && category && category.items.length === 0)  {
          enableRemoveSelected = true;
        }
      }
    });
    let EditBuiltinsSelectAllClass = !enableSelectAll ? 'EditBuiltinsSelectDisabled' : '';
    let EditBuiltinsDeselectAllClass = ((editWhat === 'items' && !enableRemoveSelected) ||
      (editWhat === 'categories' && !enableEditItem)) ? 'EditBuiltinsSelectDisabled' : '';
    let enableMoveLeft;
    if (editWhat === 'items') {
      // enableMoveLeft is true if enableRemoveSelected is true
      // and at least one category can move left
      enableMoveLeft = enableRemoveSelected && localBuiltins.columns.some(column => {
        return column.categories.some(category => {
          return category.items.some((item, index, arr) =>
            item.selected && (index > 0 && !arr[index-1].selected));
        });
      });
    } else {
      // enableMoveLeft is true if at least one category can move up
      enableMoveLeft = localBuiltins.columns.some(column => {
        return column.categories.some((category, index, arr) =>
          category.selected && (index > 0 && !arr[index-1].selected));
      });
    }
    let enableMoveRight;
    if (editWhat === 'items') {
      // enableMoveRight is true if enableRemoveSelected is true
      // and at least one favorite can move right
      enableMoveRight = enableRemoveSelected && localBuiltins.columns.some(column => {
        return column.categories.some(category => {
          return category.items.some((item, index, arr) =>
            item.selected && (index < arr.length-1 && !arr[index+1].selected));
        });
      });
    } else {
      // enableMoveLeft is true if at least one category can move up
      enableMoveRight = localBuiltins.columns.some(column => {
        return column.categories.some((category, index, arr) =>
          category.selected && (index < arr.length-1 && !arr[index+1].selected));
      });
    }
    // FIXME css might be added multiple times
    render(html`
    <style>${css}</style>
    <div class="Builtins EditBuiltins">
      <div class=EditBuiltinsChild>
        ${buildSlideRightTitle("Manage Builtins", onEditBuiltinsReturn)}
        <div class=TabControlRadioButtons>
          <label>Edit what:</label>
          ${buildEditWhatRadioButton('EditBuiltinsEditWhatItems', 'items', 'Individual Builtins')}
          ${buildEditWhatRadioButton('EditBuiltinsEditWhatCategories', 'categories', 'Categories')}
        </div>
        <div class="EditBuiltinsData ${editWhat === 'items' ? 'EditWhatItems' : 'EditWhatCategories' }">
          <div class=ScreenInstructions>
            ${editWhat === 'items' ? '(Click individual favorites below to select.)' :
              '(Click individual categories to select.)'}
          </div>
          <div class=BuiltinsColumns>
            ${localBuiltins.columns.map((column, colIndex) => html`
              <div class=BuiltinsColumn>
                ${column.categories.map((category, catIndex) => html`
                  ${editWhat === 'categories' && editCategoryNameColumnIndex === colIndex &&
                    editCategoryNameCategoryIndex === catIndex ? html`
                    <div class=EditBuiltinsEditCategoryNameDiv>
                      <input id=EditBuiltinsEditCategoryName class=CategoryName placeholder="Enter category name"
                        @keydown=${onCategoryNameKeyDown} @blur=${onCategoryNameBlur}></input>
                    </div>` : html`
                    <div @click=${onItemClick} .favoritesFlavor=${'categories'} .favoritesObject=${category}
                      .favoritesColumnIndex=${colIndex} .favoritesCategoryIndex=${catIndex}
                      class="BuiltinsCategoryLabel ${editWhat === 'categories' && category.selected ? 'selected' : ''}">
                      ${category.checkmark}
                      ${category.label}
                    </div>`}
                  <div class=BuiltinsCategoryItems>
                    ${html`${category.items.map((phrase,itIndex) =>
                      html`
                        <div class=BuiltinContainer>
                          <button @click=${onItemClick} .favoritesFlavor=${'items'} .favoritesObject=${phrase}
                              .favoritesColumnIndex=${colIndex} .favoritesCategoryIndex=${catIndex} .favoritesItemIndex=${itIndex}
                              class=${phrase.cls}>
                            ${phrase.checkmark}
                            ${phrase.label || phrase.text}</button>
                        </div>
                      `
                    )}`}
                    </div>
                `)}
                ${editWhat === 'categories' && editCategoryNameColumnIndex === null ? html`
                  <div class=spacer>&nbsp;</div>
                  <div class="EditBuiltinsNewCategoryRow">
                    <button @click=${onClickNewCategory} .favoritesColumnIndex=${colIndex}
                      .favoritesCategoryIndex=${Builtins.columns[colIndex].categories.length}>New Category ...</button>
                  </div>` : '' }
              </div>
            `)}
          </div>
        </div >
        <div class=SelectLinksRow>
          <a href="" @click=${onClickSelectAll} class=${EditBuiltinsSelectAllClass}>Select All</a>
          <a href="" @click=${onClickDeselectAll} class=${EditBuiltinsDeselectAllClass}>Deselect All</a>
        </div>
        <div class=ButtonRow>
          ${editWhat === 'items' ? html`<button @click=${onClickAddItem}
            title="Add a new item to the bottom of the list">New</button>` : '' }
          <button @click=${onClickEditItem} ?disabled=${!enableEditItem}
            title="Edit the selected item">Edit</button>
            <button @click=${onClickRemoveSelected} ?disabled=${!enableRemoveSelected}
              title="Delete selected items">Delete</button>
            <button @click=${onClickMoveLeft} ?disabled=${!enableMoveLeft}
              title="Move selected items up one position">
              <span class=arrowButton>&#x1f851;</span></button>
            <button @click=${onClickMoveRight} ?disabled=${!enableMoveRight}
              title="Move selected items down one position">
              <span class=arrowButton>&#x1f853;</span></button>
            <button @click=${onClickMoveToTop} ?disabled=${!enableMoveLeft}
              title="Move selected items to the start of the list">
              <span class=arrowButton>&#x2b71;</span></button>
            <button @click=${onClickMoveToBottom} ?disabled=${!enableMoveRight}
              title="Move selected items to the end of the list">
              <span class=arrowButton>&#x2b73;</span></button>
          </div>
        </div>
      </div>
    </div>`, parentElement);
  };
  let localBuiltins = JSON.parse(JSON.stringify(Builtins));  // deep clone
  initializeSelection();
  localUpdate();
}

let buildChooseCategoryControl = (parentElement, customControlsData) => {
  let { columnIndex, categoryIndex } = customControlsData;
  let onClickChangeCategory = e => {
    e.preventDefault();
    BuiltinsChooseCategoryPopupShow(customControlsData);
  }
  if (typeof columnIndex != 'number' || typeof categoryIndex != 'number') {
    columnIndex = categoryIndex = 0;
  } else {
    columnIndex = Builtins.lastChooseCategory.columnIndex;
    categoryIndex = Builtins.lastChooseCategory.categoryIndex;
  }
  if (columnIndex < 0 || columnIndex >= Builtins.columns.length ||
    categoryIndex < 0 || categoryIndex >= Builtins.columns[columnIndex].categories.length ||
    Builtins.lastChooseCategory.categoryLabel != Builtins.columns[columnIndex].categories[categoryIndex].label) {
    columnIndex = categoryIndex = 0;
    Builtins.lastChooseCategory.categoryLabel = Builtins.columns[columnIndex].categories[categoryIndex].label;
  }
  customControlsData.parentElement = parentElement;
  customControlsData.columnIndex = columnIndex;
  customControlsData.categoryIndex = categoryIndex;
  render(html`
    <div class=BuiltinsEditPhraseChooseCategory>
      <label>Builtins category:</label
      ><span class=BuiltinsEditPhraseColumnCategory
        ><span class=BuiltinsEditPhraseColumn>[${columnIndex+1}]</span
        ><span class=BuiltinsEditPhraseCategory>${Builtins.columns[columnIndex].categories[categoryIndex].label}</span
      ></span
      ><button class=BuiltinsAddItemCategoryButton @click=${onClickChangeCategory}>Change ...</button>
    </div>
  `, parentElement);
};

let BuiltinsChooseCategoryDialog = (parentElement, customControlsData) => {
  let newCategoryJustCreated = null;
  let onClickExistingCategory = e => {
    e.preventDefault();
    let target = e.currentTarget;
    selCol = target.BuiltinsColumn;
    selCat = target.BuiltinsCategory;
    localUpdate();
  };
  let onClickNewCategory = e => {
    e.preventDefault();
    newCategoryJustCreated = e.currentTarget.BuiltinsColumn;
    localUpdate();
    setTimeout(() => {
      let elem = document.getElementById('BuiltinsChooseCategoryNewCategory');
      elem.focus();
    }, 0);
  };
  let onClickDoit = e => {
    e.preventDefault();
    Builtins.lastChooseCategory.columnIndex = selCol;
    Builtins.lastChooseCategory.categoryIndex = selCat;
    Builtins.lastChooseCategory.categoryLabel = Builtins.columns[selCol].categories[selCat].label;
    customControlsData.columnIndex = selCol;
    customControlsData.categoryIndex = selCat;
    hidePopup(customControlsData);
  };
  let onClickCancel = e => {
    e.preventDefault();
    hidePopup(customControlsData);
  };
  let doneWithNewCategoryName = () => {
    let elem = document.getElementById('BuiltinsChooseCategoryNewCategory');
    let name = elem.value.trim();
    if (name.length > 0) {
      Builtins.columns[newCategoryJustCreated].categories.push({ label: name, expanded: true, items: [] });
      selCol = newCategoryJustCreated;
      selCat = Builtins.columns[newCategoryJustCreated].categories.length - 1;
    }
    newCategoryJustCreated = null;
    localUpdate();
  };
  let onNewBlur = e => {
    e.preventDefault();
    doneWithNewCategoryName();
  };
  let onKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doneWithNewCategoryName();
    }
  };
  let selCol = Builtins.lastChooseCategory.columnIndex;
  let selCat = Builtins.lastChooseCategory.categoryIndex;
  let localUpdate = () => {
    render(html`<div class=BuiltinsChooseCategory>
      <div class=BuiltinsChooseCategoryTitle>Choose a Builtins Category</div>
      <div class=BuiltinsChooseCategoryChooser>
        <div class=BuiltinsChooseCategoryList>
          ${Builtins.columns.map((column, columnIndex) => html`
            <span class=BuiltinsChooseCategoryColumn>
              ${column.categories.map((category, categoryIndex) => html`
                <div @click=${onClickExistingCategory} .BuiltinsCategory=${categoryIndex} .BuiltinsColumn=${columnIndex}
                  class="BuiltinsChooseCategoryListItem ${columnIndex === selCol && categoryIndex === selCat ? 'selected' : ''}">
                  ${columnIndex === selCol && categoryIndex === selCat ? html`<span class=checkmark>&#x2714;</span>` : ''}
                  <span class=CategoryName>${category.label}</span>
                </div>
              `)}
              ${newCategoryJustCreated === columnIndex ? html`
                <div @click=${onClickNewCategory} .BuiltinsColumn=${columnIndex}
                  class="BuiltinsChooseCategoryListItem BuiltinsChooseCategoryListItemInput">
                  <input id=BuiltinsChooseCategoryNewCategory class=CategoryName placeholder="Enter new category"
                    @keydown=${onKeyDown} @blur=${onNewBlur}></input>
                </div>
                ` : ''}
              <div class=spacer>&nbsp;</div>
              ${newCategoryJustCreated != null ? '' : html`
                <div @click=${onClickNewCategory} .BuiltinsColumn=${columnIndex}
                  class="BuiltinsChooseCategoryListItem BuiltinsChooseCategoryListItemNew">
                  <span class=CategoryName>New ...</span>
                </div>
                `}
            </span>
          `)}
        </div>
      </div>
      <div class=BuiltinsChooseCategoryButtonRow>
        <button @click=${onClickDoit} class=BuiltinsChooseCategoryDoitButton>Select Category</button>
        <button @click=${onClickCancel} class=BuiltinsChooseCategoryCancelButton>Cancel</button>
      </div>
    </div>`, parentElement);
  };
  localUpdate();
};

export function BuiltinsChooseCategoryPopupShow(hideCallbackParams) {
  let params = {
    content: BuiltinsChooseCategoryDialog,
    contentFuncParams: hideCallbackParams,
    refNode: document.querySelector('.EditPhraseCustomControls'),
    refY: 'top',
    popupY: 'bottom',
    clickAwayToClose: false,
    underlayOpacity: 0.85,
    hideCallback: hideCallbackParams => {
      render(html``, popupRootElement);
      buildChooseCategoryControl(hideCallbackParams.parentElement, hideCallbackParams);
    },
  };
  let popupRootElement = showPopup(params);
};
