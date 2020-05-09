
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows,
  deleteTemporaryProperties } from './Phrases.js';
import { updateMain, buildSlideRightTitle, sync, localization,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { EditPhrase } from './EditPhrase.js';
import { buildChooseCategoryControl, MyPhrasesChooseCategoryPopupShow } from './ChooseCategory.js';
import { ImportFavoritesPopupShow } from './ImportFavorites.js';

let css = `
.MyPhrases {
  padding-left: 0.5em;
  min-height: 0px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.MyPhrases.EditMyPhrases {
  padding-left: 0;
}
.MyPhrasesTitleIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  background-size: 1.1em 1.1em;
  background-position: 0px 1px;
  background-repeat: no-repeat;
}
#FavoritesContainer .MyPhrasesTitleIcon {
  background-image: url('./images/heart.svg');
}
.MyPhrasesCategoryLabel {
  font-size: 90%;
  color: #888;
}
.MyPhrasesCategoryLabel a, .MyPhrasesCategoryLabel a:link, .MyPhrasesCategoryLabel a:visited {
  text-decoration: none;
  cursor: pointer;
  color: #888;
}
.MyPhrasesColumns {
  flex: 1 1 0;
  display: flex;
  width: 100%;
  overflow: hidden;
}
.MyPhrasesColumn {
  height: 100%;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  border-left: 1px solid #eee;
  padding-left: 0.5em;
}
.MyPhrasesColumn:first-child {
  border-left: none;
  padding-left: 0;
}
.MyPhraseContainer {
  display: inline-block;
}
.MyPhrases .MyPhraseContainer button {
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
.MyPhrases .MyPhraseContainer button:hover, .MyPhrases .MyPhraseContainer button:focus {
  cursor: pointer;
}
.MyPhrases .MyPhraseContainer button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
.MyPhrasesEditPhraseChooseCategory {
  text-align: center;
  padding: 0.75em 0 0.25em;
  font-size: 95%;
}
.MyPhrasesEditPhraseChooseCategory * {
  vertical-align: middle;
}
.MyPhrasesEditPhraseChooseCategory label {
  font-size: 85%;
  margin-right: 0.25em;
}
.MyPhrasesEditPhraseColumnCategory {
  border: 1px solid #eee;
  background: #fcfcfc;
  padding: 0.25em;
}
.MyPhrasesEditPhraseColumn, .MyPhrasesEditPhraseCategory {
  font-weight: bold;
}
.MyPhrasesEditPhraseColumn {
  font-size: 75%;
  margin-right: 0.25em;
}
.MyPhrasesEditPhraseChooseCategory button {
  margin-left: 0.75em;
  font-size: 85%;
}
.MyPhrasesChooseCategory {
  border: 1px solid black;
  padding: 0.5em 1em;
}
.EditMyPhrasesChild {
  height:100%;
  display: flex;
  flex-direction: column;
  padding: 0 1em ;
}
.EditMyPhrasesChild .SlideRightBackArrow {
  margin-left: -0.25em;
}
.EditMyPhrasesChild .TabControlRadioButtons > label {
  display: inline-flex;
  align-items: center;
  padding: 0 0.5em;
  font-size: 80%;
  border-bottom: 2px solid black;
}
.EditMyPhrases .TabControlRadioButton {
  font-size: 95%;
}
.EditMyPhrasesData {
  flex:1;
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  border-top: none;
  padding: 0.25em 0.5em 0;
}
.EditMyPhrases .ScreenInstructions {
  font-size: 85%;
  font-style: italic;
  text-align: center;
  padding: 0 0 0.5em;
}
.EditWhatCategories .MyPhrasesCategoryLabel {
  font-size: 95%;
  color: black;
  background: #eee;
}
.EditWhatCategories .MyPhrasesCategoryLabel.selected {
  font-weight: bold;
  font-style: italic;
  background: #ddf;
  color: #004;
}
.EditWhatCategories .MyPhrasesCategoryLabel.hidden {
  opacity: 0.4;
  background: #999;
  color: #004;
}
.EditWhatCategories .MyPhrasesCategoryLabel a, .EditWhatCategories .MyPhrasesCategoryLabel a:link, .EditWhatCategories .MyPhrasesCategoryLabel a:visited {
  color: black;
}
.MyPhrases .EditWhatCategories .MyPhrasesCategoryItems {
  line-height: 0.15;
}
.MyPhrases .EditWhatCategories .MyPhraseContainer button {
  border: 1px solid #888;
  color: #888;
  font-size: 0.35em;
}
.MyPhrases .EditWhatCategories .MyPhrasesColumn {
  display: inline-flex;
  flex-direction: column;
  padding-bottom: 0.5em;
}
.MyPhrases .EditWhatCategories .MyPhrasesColumn .spacer {
  flex: 1;
}
.EditMyPhrasesNewCategoryRow button {
  font-size: 80%;
  font-style: italic;
}
.EditMyPhrases .SelectLinksRow {
  padding: 0.5em 1.5em 0;
  display: flex;
  justify-content: space-around;
  font-size: 95%;
}
.EditMyPhrases .SelectLinksRow a.EditMyPhrasesSelectDisabled {
  opacity: 0.3;
  text-decoration: none;
  cursor: default;
  color: gray;
}
.EditMyPhrasesChild .ButtonRow {
  padding: 0.5em 0;
}
.EditMyPhrasesChild .ButtonRow button {
  padding: 0em 1.1em;
}
.EditMyPhrasesChild .ButtonRow button .arrowButton {
  margin: -0.2em 0;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let Favorites;
export function getFavorites() {
  let FavoritesString = localStorage.getItem("Favorites");
  try {
    Favorites = (typeof FavoritesString === 'string') ? JSON.parse(FavoritesString) : initialFavorites;
  } catch(e) {
    Favorites = initialFavorites;
  }
  return Favorites;
}

let initialFavorites;

export function initializeFavorites(props) {
  let { currentVersion } = props;
  initialFavorites = {
    version: currentVersion,
    timestamp: 0,
    lastChooseCategory: { columnIndex: 0, categoryIndex: 0, categoryLabel: null },
    columns: [
      { categories: [] },
      { categories: [] },
      { categories: [] },
    ]
  };
  let tempDefaultCollections = localization.builtinFavoritesCollections.filter(collection => collection.default);
  tempDefaultCollections.forEach(collection => {
    initialFavorites.columns[collection.column-1].categories.push({
      label: collection.category, expanded: true, items: collection.items,
    });
  });
  getFavorites();
  if (typeof Favorites.version != 'number'|| Favorites.version < currentVersion) {
    Favorites = initialFavorites;
  }
  localStorage.setItem("Favorites", JSON.stringify(Favorites));
};

export function FavoritesGetPending(clientLastSync) {
  if (!Favorites.pending) return null;
  delete Favorites.pending;
  return Favorites.timestamp > clientLastSync ? Favorites : null;
}

export function FavoritesSync(thisSyncServerTimestamp, newData) {
  getFavorites();
  if (newData && typeof newData === 'object' && typeof newData.timestamp === 'number' && newData.timestamp > Favorites.timestamp) {
    Favorites = newData;
    updateLocalStorageFavorites({ timestamp: newData.timestamp });
  }
  let event = new CustomEvent("ServerInitiatedSyncFavorites", { detail: null } );
  window.dispatchEvent(event);

}

function updateStorageFavorites()  {
  updateLocalStorageFavorites({ pending: true });
  sync();
}

function updateLocalStorageFavorites(overrides) {
  Favorites.timestamp = Date.now();
  Favorites = Object.assign({}, Favorites, overrides || {});
  localStorage.setItem("Favorites", JSON.stringify(Favorites));
}

// Add phrase to Favorites without speaking
export function addToFavorites(phrase, columnIndex, categoryIndex) {
  Favorites.columns[columnIndex].categories[categoryIndex].items.push(phrase);
  updateStorageFavorites();
};

function replaceFavoritesEntry(columnIndex, categoryIndex, itemIndex, phrase) {
  Favorites.columns[columnIndex].categories[categoryIndex].items[itemIndex] = Object.assign({}, phrase);
  updateStorageFavorites();
};

// invoke a function for each category stored in a MyPhrases data structure
// four arguments are passed to the func (see below)
function traverseColumnsCategories(aMyPhrases, func) {
  aMyPhrases.columns.forEach((column, colIndex) => {
    column.categories.forEach((category, catIndex) => {
      func(category, aMyPhrases, colIndex, catIndex);
    });
  });
}

// invoke a function for each phrase stored in a MyPhrases data structure
// five arguments are passed to the func (see below)
export function traverseColumnsCategoriesItems(aMyPhrases, func) {
  aMyPhrases.columns.forEach((column, colIndex) => {
    column.categories.forEach((category, catIndex) => {
      category.items.forEach((item, itIndex) => {
        func(item, aMyPhrases, colIndex, catIndex, itIndex);
      });
    });
  });
}

export function slideInAddFavoriteScreen(props) {
  props = props || {};
  let { phrase, slideInLevel } = props;
  let customControlsData = Object.assign({}, Favorites.lastChooseCategory);
  let params = {
    renderFunc: EditPhrase,
    renderFuncParams: {
      title: 'Add New Favorite',
      doItButtonLabel: 'Add Favorite',
      doItCallback: function(phrase) {
        let { columnIndex, categoryIndex, categoryLabel } = customControlsData;
        Favorites.lastChooseCategory = { columnIndex, categoryIndex, categoryLabel };
        // add phrase to MyPhrases, go back to parent screen
        addToFavorites(phrase, columnIndex, categoryIndex);
        updateMain(null, { Favorites:true, });
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

export function updateFavorites(parentElement, props) {
  updateMyPhrases('Favorites', parentElement, props);
}
let lastParentFavorites;
let updateFavoritesFirstTime = true;
function updateMyPhrases(Section, parentElement, props) {
  if (Section === 'Favorites') {
    lastParentFavorites = parentElement;
  }
  if (updateFavoritesFirstTime) {
    updateFavoritesFirstTime = false;
    window.addEventListener('ServerInitiatedSyncFavorites', function(e) {
      let oldSection = Section;
      let oldParent = parentElement;
      Section = 'Favorites';
      parentElement = lastParentFavorites;
      localUpdate();
      Section = oldSection;
      parentElement = oldParent;
    });
  }
  let { searchTokens } = props;
  let onClickImport = e => {
    e.preventDefault();
    let customControlsData = {
      doItCallback: () => {
        traverseColumnsCategoriesItems(Favorites, deleteTemporaryProperties);
        updateStorageFavorites();
        localUpdate();
      },
      cancelCallback: () => {
        localUpdate();
      },
    };
    ImportFavoritesPopupShow(customControlsData);
  };
  let onClickAdd = e => {
    e.preventDefault();
    slideInAddFavoriteScreen();
  };
  let onClickEdit = e => {
    e.preventDefault();
    if (Section === 'Favorites') {
      onEditFavorites();
    }
  };
  let localUpdate = () => {
    let filteredMyPhrases;
    if (Section === 'Favorites') {
      filteredMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
    }
    filteredMyPhrases.columns.forEach(column => {
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
    filteredMyPhrases.columns.forEach((column, cIndex) => {
      let MyPhrases = Section === 'Favorites' ? Favorites : null;
      column.categories.forEach(category => {
        let originalDataCategory = MyPhrases.columns[cIndex].categories[category.categoryIndex];
        category.titleContent = buildTitleWithCollapseExpandArrows(originalDataCategory, category.label);
      });
    });
    render(html`
    <div class=MyPhrases>
      <div class=PhrasesSectionLabel><span class=MyPhrasesTitleIcon
        ></span>${Section}${rightSideIcons({
          onClickImport: Section === 'Favorites' ? onClickImport : null,
          onClickAdd: Section === 'Favorites' ? onClickAdd : null,
          onClickEdit } )}</div>
      <div class=MyPhrasesColumns>
        ${filteredMyPhrases.columns.map(column => html`
          <div class=MyPhrasesColumn>
            ${column.categories.map(category => html`
              ${!category.hidden ? html`<div class=MyPhrasesCategoryLabel>${category.titleContent}</div>` : ''}
              ${(category.expanded && !category.hidden) ? html`
                ${category.items.map(phrase => html`
                  ${(!phrase.hidden) ? html`
                    <div class=MyPhraseContainer>
                      <button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
                    </div>
                  ` : '' }
                `)}
              ` : '' }
            `)}
          </div>
        `)}
      </div>
    </div>`, parentElement);
  };
  localUpdate();
}

let editFavoritesActive = false;

function onEditFavorites() {
  editFavoritesActive = true;
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editFavorites, renderFuncParams });
}

function onEditFavoritesReturn() {
  editFavoritesActive = false;
  updateMain(null, { Favorites: true });
  secondLevelScreenHide();
}

let editFavoritesFirstTime = true;
let lastWhat;
export function editFavorites(parentElement, props) {
  editMyPhrases('Favorites', parentElement, props);
}
function editMyPhrases(Section, parentElement, props) {
  if (editFavoritesFirstTime) {
    editFavoritesFirstTime = false;
    window.addEventListener('ServerInitiatedSyncFavorites', function(e) {
      if (editFavoritesActive && parentElement) {
        let MyPhrases = parentElement.querySelector('.MyPhrases');
        if (MyPhrases) {
          Section = 'Favorites';
          editWhat = lastWhat;
          localMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
          initializeSelection();
          localUpdate();
        }
      }
    });
  }
  let editWhat = lastWhat = 'items';
  let lastClickItemIndex = null, lastClickCategoryIndex = null, lastClickColumnIndex = null;
  let editCategoryNameColumnIndex = null, editCategoryNameCategoryIndex = null;
  let makeLocalChangesPermanent = (() => {
    if (Section === 'Favorites') {
      Favorites = JSON.parse(JSON.stringify(localMyPhrases)); // deep clone
      traverseColumnsCategoriesItems(Favorites, deleteTemporaryProperties);
      updateStorageFavorites();
    }
    localUpdate();
  });
  let onClickTab = e => {
    e.preventDefault();
    editWhat = lastWhat = e.currentTarget.EditMyPhrasesEditWhatValue;
    localUpdate();
  };
  let onItemClick = e => {
    e.preventDefault();
    let objType = e.currentTarget.myphrasesFlavor;
    let obj = e.currentTarget.myphrasesObject;
    if (objType === editWhat) {
      if (editWhat === 'items') {
        let phrase = e.currentTarget.myphrasesObject;
        let colIndex = e.currentTarget.myphrasesColumnIndex;
        let catIndex = e.currentTarget.myphrasesCategoryIndex;
        let itIndex = e.currentTarget.myphrasesItemIndex;
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
          traverseColumnsCategoriesItems(localMyPhrases, item => {
            item.selected = false;
          });
          let f = (lastClickItemIndex > itIndex) ? itIndex : lastClickItemIndex;
          let l = (lastClickItemIndex > itIndex) ? lastClickItemIndex : itIndex;
          let items = localMyPhrases.columns[colIndex].categories[catIndex].items;
          for (let i=f; i<=l; i++) {
            items[i].selected = true;
          }
        } else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
          // simple click deselects everything else but the item getting the click
          traverseColumnsCategoriesItems(localMyPhrases, item => {
            item.selected = false;
          });
          phrase.selected = true;
          lastClickColumnIndex = colIndex;
          lastClickCategoryIndex = catIndex;
          lastClickItemIndex = itIndex;
        }
        localUpdate();
      } else {
        let category = e.currentTarget.myphrasesObject;
        let colIndex = e.currentTarget.myphrasesColumnIndex;
        let catIndex = e.currentTarget.myphrasesCategoryIndex;
        let shift = e.getModifierState("Shift");
        let control = e.getModifierState("Control");
        let meta = e.getModifierState("Meta");
        if (!control && !meta && !shift) {
          // simple click deselects everything else but the item getting the click
          traverseColumnsCategories(localMyPhrases, category => {
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
      traverseColumnsCategories(localMyPhrases, category => {
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
    traverseColumnsCategories(localMyPhrases, category => {
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
    let customControlsData = Object.assign({}, Favorites.lastChooseCategory);
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        title: 'Add New Entry To Favorites',
        doItButtonLabel: 'Add to Favorites',
        doItCallback: function(phrase) {
          let { columnIndex, categoryIndex, categoryLabel } = customControlsData;
          Favorites.lastChooseCategory = { columnIndex, categoryIndex, categoryLabel };
          // add phrase to MyPhrases, go back to parent screen
          addToFavorites(phrase, columnIndex, categoryIndex);
          if (Section === 'Favorites') {
            localMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
          }
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
      let phrase, columnIndex, categoryIndex, categoryLabel, itemIndex;
      traverseColumnsCategoriesItems(localMyPhrases, (item, origObj, colIndex, catIndex, itIndex) => {
        if (!phrase && item.selected) {
          phrase = item;
          columnIndex = colIndex;
          categoryIndex = catIndex;
          categoryLabel = localMyPhrases.columns[columnIndex].categories[categoryIndex].label;
          itemIndex = itIndex;
        }
      });
      let customControlsData = { columnIndex, categoryIndex, categoryLabel };
      let params = {
        renderFunc: EditPhrase,
        renderFuncParams: {
          phrase,
          title: 'Edit Entry From Favorites',
          doItButtonLabel: 'Update Entry',
          doItCallback: function(phrase, customControlsData) {
            // delete old phrase from MyPhrases, add new phrase, go back to parent screen
            if (customControlsData.columnIndex === columnIndex && customControlsData.categoryIndex === categoryIndex) {
              makeLocalChangesPermanent();
              replaceFavoritesEntry(columnIndex, categoryIndex, itemIndex, phrase);
            } else {
              traverseColumnsCategories(localMyPhrases, category => {
                category.items = category.items.filter(item => !item.selected);
              });
              makeLocalChangesPermanent();
              addToFavorites(phrase, customControlsData.columnIndex, customControlsData.categoryIndex);
            }
            if (Section === 'Favorites') {
              localMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
            }
            if (customControlsData.columnIndex === columnIndex && customControlsData.categoryIndex === categoryIndex) {
              localMyPhrases.columns[columnIndex].categories[categoryIndex].items[itemIndex].selected = true;
            }
            lastClickItemIndex = null;
            editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
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
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      editCategoryNameColumnIndex = columnIndex;
      editCategoryNameCategoryIndex = categoryIndex;
      localUpdate();
      setTimeout(() => {
        let elem = document.getElementById('EditMyPhrasesEditCategoryName');
        elem.value = Favorites.columns[columnIndex].categories[categoryIndex].label;
        elem.focus();
        elem.setSelectionRange(0, elem.value.length);
      }, 0);
    }
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localMyPhrases, category => {
        category.items = category.items.filter(item => !item.selected);
      });
    } else {
      // should only be here if a single empty category is selected and
      // and the column has more than one category
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      localMyPhrases.columns[columnIndex].categories.splice(categoryIndex, 1);
    }
    makeLocalChangesPermanent();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
  };
  let onClickMoveLeft = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localMyPhrases, category => {
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
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localMyPhrases.columns[columnIndex];
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
      traverseColumnsCategories(localMyPhrases, category => {
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
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localMyPhrases.columns[columnIndex];
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
      traverseColumnsCategories(localMyPhrases, category => {
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
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localMyPhrases.columns[columnIndex];
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
      traverseColumnsCategories(localMyPhrases, category => {
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
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localMyPhrases.columns[columnIndex];
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
    editCategoryNameColumnIndex = e.currentTarget.myphrasesColumnIndex;
    editCategoryNameCategoryIndex = e.currentTarget.myphrasesCategoryIndex;
    localMyPhrases.columns[editCategoryNameColumnIndex].categories.push(
      { label:  '', expanded: false, selected: false, items:[] });
    localUpdate();
    setTimeout(() => {
      let elem = document.getElementById('EditMyPhrasesEditCategoryName');
      elem.focus();
    }, 0);
  };
  let doneWithEditCategoryName = () => {
    if (editCategoryNameColumnIndex === null) return;
    let elem = document.getElementById('EditMyPhrasesEditCategoryName');
    let name = elem.value.trim();
    let categories = Favorites.columns[editCategoryNameColumnIndex].categories;
    if (name.length > 0) {
      if (editCategoryNameCategoryIndex >= categories.length) {
        categories.push({ label: name, expanded: true, items: [] });
      } else {
        categories[editCategoryNameCategoryIndex].label = name;
      }
    }
    if (Section === 'Favorites') {
      localMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
    }
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
    traverseColumnsCategories(localMyPhrases, category => {
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
      <span class=${cls} @click=${onClickTab} .EditMyPhrasesEditWhatValue=${value}>
        <label for=${id}>
          <input type=radio id=${id} name=EditMyPhrasesEditWhat value=${value} ?checked=${editWhat===value}></input
          ><span class=TabControlRadioButtonLabel>${label}</span>
        </label>
      </span>
    `;
  };
  let localUpdate = () => {
    localMyPhrases.columns.forEach(column => {
      column.categories.forEach(category => {
        category.cls = (editWhat === 'categories' && category.selected) ? 'selected' : '';
        category.cls = category.cls + (category.hidden ? '  hidden' : '') ;
        category.checkmark = (editWhat === 'categories' && category.selected) ? html`<span class=checkmark>&#x2714;</span>` : '';
        category.items.forEach(item => {
          item.cls = (editWhat === 'items' && item.selected) ? 'selected' : '';
          item.cls = item.cls + ((category.hidden || item.hidden) ? '  hidden' : '') ;
          item.checkmark = (editWhat === 'items' && item.selected) ? html`<span class=checkmark>&#x2714;</span>` : '';
        });
      });
    });
    let enableEditItem = localMyPhrases.columns.reduce((accumulator, column) => {
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
    localMyPhrases.columns.forEach(column => {
      if (editWhat === 'items') {
        column.categories.forEach(category => {
          if (category.items.some(item => item.selected)) {
            enableRemoveSelected = true;
            enableSelectAll = true;
          }
        });
      } else if (editWhat === 'categories') {
        column.categories.forEach(category => {
          if (category.selected && column.categories.length > 1 && category.items.length === 0) {
            enableRemoveSelected = true;
          }
        });
      }
    });
    let EditMyPhrasesSelectAllClass = !enableSelectAll ? 'EditMyPhrasesSelectDisabled' : '';
    let EditMyPhrasesDeselectAllClass = ((editWhat === 'items' && !enableRemoveSelected) ||
      (editWhat === 'categories' && !enableEditItem)) ? 'EditMyPhrasesSelectDisabled' : '';
    let enableMoveLeft;
    if (editWhat === 'items') {
      // enableMoveLeft is true if enableRemoveSelected is true
      // and at least one category can move left
      enableMoveLeft = enableRemoveSelected && localMyPhrases.columns.some(column => {
        return column.categories.some(category => {
          return category.items.some((item, index, arr) =>
            item.selected && (index > 0 && !arr[index-1].selected));
        });
      });
    } else {
      // enableMoveLeft is true if at least one category can move up
      enableMoveLeft = localMyPhrases.columns.some(column => {
        return column.categories.some((category, index, arr) =>
          category.selected && (index > 0 && !arr[index-1].selected));
      });
    }
    let enableMoveRight;
    if (editWhat === 'items') {
      // enableMoveRight is true if enableRemoveSelected is true
      // and at least one favorite can move right
      enableMoveRight = enableRemoveSelected && localMyPhrases.columns.some(column => {
        return column.categories.some(category => {
          return category.items.some((item, index, arr) =>
            item.selected && (index < arr.length-1 && !arr[index+1].selected));
        });
      });
    } else {
      // enableMoveLeft is true if at least one category can move up
      enableMoveRight = localMyPhrases.columns.some(column => {
        return column.categories.some((category, index, arr) =>
          category.selected && (index < arr.length-1 && !arr[index+1].selected));
      });
    }
    let buttonRowHtml;
    if (Section === 'Favorites') {
      buttonRowHtml = html`
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
      `;
    }
    // FIXME css might be added multiple times
    render(html`
    <div class="MyPhrases EditMyPhrases skinnyScreenParent">
      <div class="EditMyPhrasesChild skinnyScreenChild">
        ${buildSlideRightTitle("Manage "+(Section === 'Favorites' ? 'Favorites' : 'null'), onEditFavoritesReturn)}
        <div class=TabControlRadioButtons>
          <label>Edit what:</label>
          ${buildEditWhatRadioButton('EditMyPhrasesEditWhatItems', 'items', "Individual "+(Section === 'Favorites' ? 'Favorites' : 'null'))}
          ${buildEditWhatRadioButton('EditMyPhrasesEditWhatCategories', 'categories', 'Categories')}
        </div>
        <div class="EditMyPhrasesData ${editWhat === 'items' ? 'EditWhatItems' : 'EditWhatCategories' }">
          <div class=ScreenInstructions>
            ${editWhat === 'items' ? '(Click individual '+(Section === 'Favorites' ? 'Favorites' : 'null')+' below to select.)' :
              '(Click individual categories to select.)'}
          </div>
          <div class=MyPhrasesColumns>
            ${localMyPhrases.columns.map((column, colIndex) => html`
              <div class=MyPhrasesColumn>
                ${column.categories.map((category, catIndex) => html`
                  ${editWhat === 'categories' && editCategoryNameColumnIndex === colIndex &&
                    editCategoryNameCategoryIndex === catIndex ? html`
                    <div class=EditMyPhrasesEditCategoryNameDiv>
                      <input id=EditMyPhrasesEditCategoryName class=CategoryName placeholder="Enter category name"
                        @keydown=${onCategoryNameKeyDown} @blur=${onCategoryNameBlur}></input>
                    </div>` : html`
                    <div @click=${onItemClick} .myphrasesFlavor=${'categories'} .myphrasesObject=${category}
                      .myphrasesColumnIndex=${colIndex} .myphrasesCategoryIndex=${catIndex}
                      class="MyPhrasesCategoryLabel ${editWhat === 'categories' && category.selected ? 'selected' : ''} ${editWhat === 'categories' && category.hidden ? 'hidden' : ''}">
                      ${category.checkmark}
                      ${category.label}
                    </div>`}
                  <div class=MyPhrasesCategoryItems>
                    ${html`${category.items.map((phrase,itIndex) =>
                      html`
                        <div class=MyPhraseContainer>
                          <button @click=${onItemClick} .myphrasesFlavor=${'items'} .myphrasesObject=${phrase}
                              .myphrasesColumnIndex=${colIndex} .myphrasesCategoryIndex=${catIndex} .myphrasesItemIndex=${itIndex}
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
                  <div class="EditMyPhrasesNewCategoryRow">
                    <button @click=${onClickNewCategory} .myphrasesColumnIndex=${colIndex}
                      .myphrasesCategoryIndex=${Favorites.columns[colIndex].categories.length}>New Category ...</button>
                  </div>` : '' }
              </div>
            `)}
          </div>
        </div >
        <div class=SelectLinksRow>
          <a href="" @click=${onClickSelectAll} class=${EditMyPhrasesSelectAllClass}>Select All</a>
          <a href="" @click=${onClickDeselectAll} class=${EditMyPhrasesDeselectAllClass}>Deselect All</a>
        </div>
        ${buttonRowHtml}
        </div>
      </div>
    </div>`, parentElement);
  };
  let localMyPhrases;
  if (Section === 'Favorites') {
    localMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
  }
  initializeSelection();
  localUpdate();
}
