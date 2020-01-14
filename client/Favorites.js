
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows,
  deleteTemporaryProperties } from './Phrases.js';
import { updateMain, buildSlideRightTitle,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { EditPhrase } from './EditPhrase.js';
import { showPopup, hidePopup } from './popup.js';

let css = `
.Favorites {
  padding-left: 0.5em;
  min-height: 0px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.Favorites.EditFavorites {
  padding-left: 0;
}
.FavoritesTitleIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  background-image: url('./images/heart.svg');
  background-size: 1.1em 1.1em;
  background-position: 0px 1px;
  background-repeat: no-repeat;
}
.FavoritesCategoryLabel {
  font-size: 90%;
  color: #888;
}
.FavoritesCategoryLabel a, .FavoritesCategoryLabel a:link, .FavoritesCategoryLabel a:visited {
  text-decoration: none;
  cursor: pointer;
  color: #888;
}
.FavoritesColumns {
  height: 100%;
  display: flex;
  width: 100%;
}
.FavoritesColumn {
  height: 100%;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  border-left: 1px solid #eee;
  padding-left: 0.5em;
}
.FavoritesColumn:first-child {
  border-left: none;
  padding-left: 0;
}
.FavoriteContainer {
  display: inline-block;
}
.Favorites .FavoriteContainer button {
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
.Favorites .FavoriteContainer button:hover, .Favorites .FavoriteContainer button:focus {
  cursor: pointer;
}
.Favorites .FavoriteContainer button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
.FavoritesEditPhraseChooseCategory {
  text-align: center;
  padding: 0.75em 0 0.25em;
  font-size: 95%;
}
.FavoritesEditPhraseChooseCategory * {
  vertical-align: middle;
}
.FavoritesEditPhraseChooseCategory label {
  font-size: 85%;
  margin-right: 0.25em;
}
.FavoritesEditPhraseColumnCategory {
  border: 1px solid #eee;
  background: #fcfcfc;
  padding: 0.25em;
}
.FavoritesEditPhraseColumn, .FavoritesEditPhraseCategory {
  font-weight: bold;
}
.FavoritesEditPhraseColumn {
  font-size: 75%;
  margin-right: 0.25em;
}
.FavoritesEditPhraseChooseCategory button {
  margin-left: 0.75em;
  font-size: 85%;
}
.FavoritesChooseCategory {
  border: 1px solid black;
  padding: 0.5em 1em;
}
.EditFavoritesChild {
  height:100%;
  display: flex;
  flex-direction: column;
  padding: 0 1em ;
}
.EditFavoritesChild .SlideRightBackArrow {
  margin-left: -0.25em;
}
.EditFavoritesChild .TabControlRadioButtons > label {
  display: inline-flex;
  align-items: center;
  padding: 0 0.5em;
  font-size: 80%;
  border-bottom: 2px solid black;
}
.EditFavorites .TabControlRadioButton {
  font-size: 95%;
}
.EditFavoritesData {
  flex:1;
  display: flex;
  flex-direction: column;
  border: 2px solid black;
  border-top: none;
  padding: 0.25em 0.5em 0;
}
.EditFavorites .ScreenInstructions {
  font-size: 85%;
  font-style: italic;
  text-align: center;
  padding: 0 0 0.5em;
}
.EditWhatCategories .FavoritesCategoryLabel {
  font-size: 95%;
  color: black;
  background: #eee;
}
.EditWhatCategories .FavoritesCategoryLabel.selected {
  font-weight: bold;
  font-style: italic;
  background: #ddf;
  color: #004;
}
.EditWhatCategories .FavoritesCategoryLabel a, .EditWhatCategories .FavoritesCategoryLabel a:link, .EditWhatCategories .FavoritesCategoryLabel a:visited {
  color: black;
}
.Favorites .EditWhatCategories .FavoritesCategoryItems {
  line-height: 0.15;
}
.Favorites .EditWhatCategories .FavoriteContainer button {
  border: 1px solid #888;
  color: #888;
  font-size: 0.35em;
}
.Favorites .EditWhatCategories .FavoritesColumn {
  display: inline-flex;
  flex-direction: column;
  padding-bottom: 0.5em;
}
.Favorites .EditWhatCategories .FavoritesColumn .spacer {
  flex: 1;
}
.EditFavoritesNewCategoryRow button {
  font-size: 80%;
  font-style: italic;
}
.EditFavorites .SelectLinksRow {
  padding: 0.5em 1.5em 0;
  display: flex;
  justify-content: space-around;
  font-size: 95%;
}
.EditFavorites .SelectLinksRow a.EditFavoritesSelectDisabled {
  opacity: 0.3;
  text-decoration: none;
  cursor: default;
  color: gray;
}
.EditFavoritesChild .ButtonRow {
  padding: 0.5em 0;
}
.EditFavoritesChild .ButtonRow button {
  padding: 0em 1.1em;
}
.EditFavoritesChild .ButtonRow button .arrowButton {
  margin: -0.2em 0;
}
.FavoritesChooseCategory {
  background: white;
  border: 2px solid black;
  padding: 0.25em 1.5em;
  font-size: 95%;
}
.FavoritesChooseCategoryTitle {
  font-weight: 700;
  padding: 0.6em 0;
  text-align: center;
}
.FavoritesChooseCategoryChooser {
  font-size: 90%;
}
.FavoritesChooseCategoryChooser label {
  font-size: 90%;;
}
.FavoritesChooseCategoryList {
  border: 1px solid black;
  padding: 0.2em;
  display: flex;
}
.FavoritesChooseCategoryColumn {
  vertical-align: top;
  flex: 1;
  padding: 0 3em 0 0.5em;
  border-left: 1px solid #ccc;
  display: inline-flex;
  flex-direction: column;
}
.FavoritesChooseCategoryListItem {
  padding: 0.2em 0;
  white-space: nowrap;
}
.FavoritesChooseCategoryColumn .spacer {
  flex: 1;
}
.FavoritesChooseCategoryListItem.FavoritesChooseCategoryListItemNew {
  font-style: italic;
  border: 1px solid #444;
  border-radius: 3px;
  padding: 0.25em;
  background: #f0f0f0;
  margin: 1.5em 0 0.75em;
  font-size: 80%;
  width: fit-content;
}
.FavoritesChooseCategoryListItem.selected {
  font-weight: bold;
  font-style: italic;
  background: #ddf;
  color: #004;
}
.FavoritesChooseCategoryButtonRow {
  padding: 1em 0;
  display: flex;
  justify-content: space-around;
}
`;

let Favorites;

export function initializeFavorites(props) {
  let { currentVersion } = props;
  Favorites = {
    version: currentVersion,
    lastChooseCategory: { columnIndex: 0, categoryIndex: 0, categoryLabel: null },
    columns: [
      { categories: [
        	{ label: 'Clips', expanded: true, items: [
            { type: 'youtube', label: 'johnny1', videoId: 'WZKmsA8bzao', startAt: 25.5, endAt: 39 },
            { type: 'youtube', label: 'johnny2', videoId: 'gpCUMdfRa9w', startAt: 67, endAt: 71 },
        		{ type: 'audio', label: 'Disappointed!', url: 'http://www.montypython.net/sounds/wanda/disappointed.wav'},
        		{ type: 'audio', label: 'Inconceivable!', url: 'http://www.moviesoundclips.net/download.php?id=2900&ft=mp3'},
            { type: 'audio', label: 'Excellent!', url: 'http://www.billandted.org/sounds/ea/eaexcellent.mp3'},
            { type: 'youtube', label: 'gehrig1', videoId: 'qswig8dcEAY', startAt: 5, endAt: 16 },
            { type: 'youtube', label: 'gehrig2', videoId: 'OyT4mPBe4YQ', startAt: 150, endAt: 165 },
            { type: 'youtube', label: 'home', videoId: 'RPs2Y4FdGzM', startAt: 143, endAt: 153 },
            { type: 'youtube', label: 'tara', videoId: 'c_WkyalPOEI', startAt: 32, endAt: 999 },
            { type: 'youtube', label: 'kind', videoId: 'l4V8OHy0su0', startAt: 50, endAt: 60 },
            { type: 'youtube', label: 'houston', videoId: 'Bti9_deF5gs', startAt: 25, endAt: 150 },
            { type: 'youtube', label: 'stupid', videoId: 'cJe6-afGz0Q', startAt: 4, endAt: 999 },
            { type: 'youtube', label: 'crying', videoId: 'Xx8cCDthsuk', startAt: 50, endAt: 56 },
            { type: 'youtube', label: 'pretty', videoId: 'lT8qgvgk1rU', startAt: 98, endAt: 106 },
            { type: 'youtube', label: 'kenny', videoId: 'kXxr9A_UBG4', startAt: 10, endAt: 16 },
            { type: 'youtube', label: 'missed', videoId: 'oPwrodxghrw', startAt: 2.5, endAt: 7.5 },
            { type: 'youtube', label: 'to me?', videoId: 'tp6KExqs_3o', startAt: 0, endAt: 7.5 },
            { type: 'youtube', label: 'les', videoId: 'dROwEc4VyJA', startAt: 84, endAt: 93 },
            { type: 'youtube', label: 'friend', videoId: 'AVQ8byG2mY8', startAt: 11, endAt: 17 },
            { type: 'youtube', label: 'hasta', videoId: 'PnYu23SseHs', startAt: 46, endAt: 51 },
            { type: 'youtube', label: 'yippie', videoId: '4XEaeOxqy_4', startAt: 20.5, endAt: 25 },
            { type: 'youtube', label: 'punk', videoId: '8Xjr2hnOHiM', startAt: 109, endAt: 135 },
            { type: 'youtube', label: 'gin', videoId: '09g2PzusuzI', startAt: 24, endAt: 32 },
            { type: 'youtube', label: 'bumpy', videoId: 'yKHUGvde7KU', startAt: 3, endAt: 10 },
            { type: 'youtube', label: 'mad', videoId: 'tUY05_ZwFzg', startAt: 0, endAt: 999 },
            { type: 'youtube', label: 'failure', videoId: 'V2f-MZ2HRHQ', startAt: 2, endAt: 999 },
            { type: 'youtube', label: 'betcha', videoId: 'fv9XtSiqEDA', startAt: 0, endAt: 999 },
            { type: 'youtube', label: 'fraud', videoId: 'AC9z7LIQX_A', startAt: 0, endAt: 999 },
            { type: 'youtube', label: 'bro', videoId: 'QkkLUP-gm4Q', startAt: 114, endAt: 119 },
            { type: 'text', label: 'hello', text: "You had me at hello"},
            { type: 'text', label: 'girl', text: "I'm just a girl, standing in front of a boy, asking him to love her"},
        	]},
        ]
      },
      { categories: [
        { label: 'Care Requests', expanded: true, items: [
          { type: 'text', label: 'air', text: 'Can I have air?'},
          { type: 'text', label: 'mask', text: 'Can you please fix my breathing mask?'},
          { type: 'text', label: 'nebulizer', text: 'Time for nebulizer and feeding'},
          { type: 'text', label: 'stretch', text: 'Can I please stretch?'},
          { type: 'text', label: 'toilet', text: 'Take me to the toilet, please'},
          { type: 'text', label: 'urinal', text: 'can I please use the urinal'},
          { type: 'text', label: 'bed', text: 'Can I please go to my bed?'},
          { type: 'text', label: 'hurry', text: 'Please hurry!'},
          { type: 'text', label: 'no rush', text: 'Take your time. Not urgent'},
          { type: 'text', label: 'cold', text: 'I am a little cold. Could I please have something more over me?'},
          { type: 'text', label: 'warm', text: 'I am a little warm. Could you please take something off of me?'},
          { type: 'text', label: 'tubing', text: 'Please pull the blue tubing, you know, the tubing that goes from the breathing machine to my face mask, please pull it outside of the bed as much as possible. '},
          { type: 'text', label: 'itch', text: 'Can you please scratch something for me? '},
        ]},
        { label: 'Adjustments', expanded: true, items: [
          { type: 'text', label: 'up', text: 'Please move it up. '},
          { type: 'text', label: 'down', text: 'Please move it down. '},
          { type: 'text', label: 'left', text: 'Please move it to my left. '},
          { type: 'text', label: 'right', text: 'Please move it to my right. '},
          { type: 'text', label: 'in', text: 'Please push it in a little. '},
          { type: 'text', label: 'forward', text: 'Please move it forward. '},
          { type: 'text', label: 'backward', text: 'Please move it Backward. '},
          { type: 'text', label: 'tighter', text: 'Please make it tighter. '},
          { type: 'text', label: 'looser', text: 'Please make it looser. '},
          { type: 'text', label: 'hands', text: 'Please move my hands. They are uncomfortable.'},
          { type: 'text', label: 'laptop', text: 'Can you please adjust the position of the computer?'},
          { type: 'text', label: 'strap', text: 'Can you please adjust the head strap?'},
          { type: 'text', label: 'mask', text: 'Can you please adjust the mask?'},
          { type: 'text', label: 'leak', text: 'my mask is leaking'},
          { type: 'text', label: 'eyes', text: 'The eye gaze bar cannot see one of my eyes. '},
          { type: 'text', label: 'crooked', text: 'It is crooked. Please straighten.'},
          { type: 'text', label: 'hurts', text: 'It hurts. Please adjust.'},
          { type: 'text', label: 'body', text: 'Please roll me a little so that my body is flat on the bed and my head is facing straight up. '},
          { type: 'text', label: 'head', text: 'Please straighten my head '},
          { type: 'text', label: 'chair pos', text: 'Can you please fix the position of the wheelchair?'},
          { type: 'text', label: 'tilt fwd', text: 'Can you please tilt the wheelchair forward?'},
          { type: 'text', label: 'tilt back', text: 'Can you please tilt the wheelchair backward?'},
          { type: 'text', label: 'feet up', text: 'Can you please elevate my feet a little?'},
          { type: 'text', label: 'plug', text: 'Can you please plug in the computer?'},
        ]},
        { label: 'Other', expanded: true, items: [
          { type: 'text', label: 'sliding', text: 'Can you please close the sliding glass doors?'},
          { type: 'text', label: 'Pepe', text: 'Can someone please help Peppay? '},
        ]},
      ]},
      { categories: [
        { label: 'Basic', expanded: true, items: [
          { type: 'text', label: 'nevermind', text: 'Sorry. False alarm. Nevermind what I just said.'},
          { type: 'text', label: 'thanks', text: 'Thank you.'},
          { type: 'text', label: 'thanka', text: 'Thank you. You are an angel.'},
          { type: 'text', label: 'hello', text: 'hello'},
          { type: 'text', label: 'morn', text: 'good morning'},
          { type: 'text', label: 'howRU', text: 'how are you'},
          { type: 'text', label: 'help', text: 'Please come and help me'},
          { type: 'text', label: 'yes', text: 'yes'},
          { type: 'text', label: 'no', text: 'no'},
          { type: 'text', label: 'OK', text: 'OK'},
          { type: 'text', label: 'good', text: "good"},
          { type: 'text', label: 'vgood', text: "very good"},
          { type: 'text', label: 'perfect', text: "perfect"},
          { type: 'text', label: 'wonful', text: "wonderful"},
          { type: 'text', label: 'trouble', text: "I am having trouble with my eye gaze at the moment, so I may not be able to answer questions.. Maybe try asking me questions that have yes and no answers. "},
          { type: 'text', label: 'lol', text: "L O L"},
          { type: 'text', label: 'testing', text: 'Please ignore what comes out of the computer for the next couple of minutes. I am just testing the software. '},
        ]},
      ]},
    ]
  };
};

// Add phrase to Favorites without speaking
export function addToFavorites(phrase, columnIndex, categoryIndex) {
  Favorites.columns[columnIndex].categories[categoryIndex].items.push(phrase);
  // FIXME localStorage.setItem("Favorites", JSON.stringify(Favorites));
};

function replaceFavoritesEntry(columnIndex, categoryIndex, itemIndex, phrase) {
  Favorites.columns[columnIndex].categories[categoryIndex].items[itemIndex] = Object.assign({}, phrase);
  // FIXME localStorage.setItem("Favorites", JSON.stringify(Favorites));
};

// invoke a function for each category stored in a Favorites data structure
// four arguments are passed to the func (see below)
function traverseColumnsCategories(aFavorites, func) {
  aFavorites.columns.forEach((column, colIndex) => {
    column.categories.forEach((category, catIndex) => {
      func(category, aFavorites, colIndex, catIndex);
    });
  });
}

// invoke a function for each phrase stored in a Favorites data structure
// five arguments are passed to the func (see below)
function traverseColumnsCategoriesItems(aFavorites, func) {
  aFavorites.columns.forEach((column, colIndex) => {
    column.categories.forEach((category, catIndex) => {
      category.items.forEach((item, itIndex) => {
        func(item, aFavorites, colIndex, catIndex, itIndex);
      });
    });
  });
}

function onFavoritesChange(newFavorites) {
  // FIXME localStorage.setItem("Favorites", JSON.stringify(Favorites));
};

export function slideInAddFavoriteScreen(props) {
  props = props || {};
  let { phrase, slideInLevel } = props;
  let customControlsData = {};
  let params = {
    renderFunc: EditPhrase,
    renderFuncParams: {
      title: 'Add New Favorite',
      doItButtonLabel: 'Add Favorite',
      doItCallback: function(phrase) {
        let { columnIndex, categoryIndex } = customControlsData;
        // add phrase to Favorites, go back to parent screen
        addToFavorites(phrase, columnIndex, categoryIndex);
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

export function updateFavorites(parentElement, props) {
  let { searchTokens } = props;
  let onClickAdd = e => {
    e.preventDefault();
    slideInAddFavoriteScreen();
  };
  let onClickEdit = e => {
    e.preventDefault();
    onEditFavorites();
  };
  let localUpdate = () => {
    let filteredFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
    filteredFavorites.columns.forEach(column => {
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
    filteredFavorites.columns.forEach((column, cIndex) => {
      column.categories.forEach(category => {
        let originalDataCategory = Favorites.columns[cIndex].categories[category.categoryIndex];
        category.titleContent = buildTitleWithCollapseExpandArrows(originalDataCategory, category.label);
      });
    });
    render(html`
    <style>${css}</style>
    <div class=Favorites>
      <div class=PhrasesSectionLabel><span class=FavoritesTitleIcon></span>Favorites${rightSideIcons({ onClickAdd, onClickEdit })}</div>
      <div class=FavoritesColumns>
        ${filteredFavorites.columns.map(column => html`
          <div class=FavoritesColumn>
            ${column.categories.map(category => html`
              <div class=FavoritesCategoryLabel>${category.titleContent}</div>
              ${category.expanded ?
                html`${category.items.map(phrase =>
                  html`
                    <div class=FavoriteContainer>
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

function onEditFavorites() {
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editFavorites, renderFuncParams });
}

function onEditFavoritesReturn() {
  updateMain();
  secondLevelScreenHide();
}

export function editFavorites(parentElement, props) {
  let editWhat = 'items';
  let lastClickItemIndex = null, lastClickCategoryIndex = null, lastClickColumnIndex = null;
  let editCategoryNameColumnIndex = null, editCategoryNameCategoryIndex = null;
  let makeLocalChangesPermanent = (() => {
    Favorites = JSON.parse(JSON.stringify(localFavorites)); // deep clone
    traverseColumnsCategoriesItems(Favorites, deleteTemporaryProperties);
    onFavoritesChange();
    localUpdate();
  });
  let onClickTab = e => {
    e.preventDefault();
    editWhat = e.currentTarget.EditFavoritesEditWhatValue;
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
          traverseColumnsCategoriesItems(localFavorites, item => {
            item.selected = false;
          });
          let f = (lastClickItemIndex > itIndex) ? itIndex : lastClickItemIndex;
          let l = (lastClickItemIndex > itIndex) ? lastClickItemIndex : itIndex;
          let items = localFavorites.columns[colIndex].categories[catIndex].items;
          for (let i=f; i<=l; i++) {
            items[i].selected = true;
          }
        } else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
          // simple click deselects everything else but the item getting the click
          traverseColumnsCategoriesItems(localFavorites, item => {
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
          traverseColumnsCategories(localFavorites, category => {
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
      traverseColumnsCategories(localFavorites, category => {
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
    traverseColumnsCategories(localFavorites, category => {
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
        title: 'Add New Entry To Favorites',
        doItButtonLabel: 'Add to Favorites',
        doItCallback: function(phrase) {
          let { columnIndex, categoryIndex } = customControlsData;
          // add phrase to Favorites, go back to parent screen
          addToFavorites(phrase, columnIndex, categoryIndex);
          localFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
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
      traverseColumnsCategoriesItems(localFavorites, (item, origObj, colIndex, catIndex, itIndex) => {
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
          title: 'Edit Entry From Favorites',
          doItButtonLabel: 'Update Entry',
          doItCallback: function(phrase) {
            // add phrase to Favorites, go back to parent screen
            // FIXME  wrong if user changes category
            replaceFavoritesEntry(columnIndex, categoryIndex, itemIndex, phrase);
            localFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
            localFavorites.columns[columnIndex].categories[categoryIndex].items[itemIndex].selected = true;
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
      traverseColumnsCategories(localFavorites, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      editCategoryNameColumnIndex = columnIndex;
      editCategoryNameCategoryIndex = categoryIndex;
      localUpdate();
      setTimeout(() => {
        let elem = document.getElementById('EditFavoritesEditCategoryName');
        elem.value = Favorites.columns[columnIndex].categories[categoryIndex].label;
        elem.focus();
        elem.setSelectionRange(0, elem.value.length);
      }, 0);
    }
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localFavorites, category => {
        category.items = category.items.filter(item => !item.selected);
      });
    } else {
      // should only be here if a single empty category is selected and
      // and the column has more than one category
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localFavorites, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      localFavorites.columns[columnIndex].categories.splice(categoryIndex, 1);
    }
    makeLocalChangesPermanent();
    lastClickItemIndex = null;
    editCategoryNameColumnIndex = editCategoryNameCategoryIndex = null;
  };
  let onClickMoveLeft = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localFavorites, category => {
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
      traverseColumnsCategories(localFavorites, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localFavorites.columns[columnIndex];
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
      traverseColumnsCategories(localFavorites, category => {
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
      traverseColumnsCategories(localFavorites, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localFavorites.columns[columnIndex];
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
      traverseColumnsCategories(localFavorites, category => {
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
      traverseColumnsCategories(localFavorites, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localFavorites.columns[columnIndex];
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
      traverseColumnsCategories(localFavorites, category => {
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
      traverseColumnsCategories(localFavorites, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          columnIndex = colIndex;
          categoryIndex = catIndex;
        }
      });
      let column = localFavorites.columns[columnIndex];
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
    localFavorites.columns[editCategoryNameColumnIndex].categories.push(
      { label:  '', expanded: false, selected: false, items:[] });
    localUpdate();
    setTimeout(() => {
      let elem = document.getElementById('EditFavoritesEditCategoryName');
      elem.focus();
    }, 0);
  };
  let doneWithEditCategoryName = () => {
    if (editCategoryNameColumnIndex === null) return;
    let elem = document.getElementById('EditFavoritesEditCategoryName');
    let name = elem.value.trim();
    let categories = Favorites.columns[editCategoryNameColumnIndex].categories;
    if (name.length > 0) {
      if (editCategoryNameCategoryIndex >= categories.length) {
        categories.push({ label: name, expanded: true, items: [] });
      } else {
        categories[editCategoryNameCategoryIndex].label = name;
      }
    }
    localFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
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
    traverseColumnsCategories(localFavorites, category => {
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
      <span class=${cls} @click=${onClickTab} .EditFavoritesEditWhatValue=${value}>
        <label for=${id}>
          <input type=radio id=${id} name=EditFavoritesEditWhat value=${value} ?checked=${editWhat===value}></input
          ><span class=TabControlRadioButtonLabel>${label}</span>
        </label>
      </span>
    `;
    return '';
  };
  let localUpdate = () => {
    localFavorites.columns.forEach(column => {
      column.categories.forEach(category => {
        category.cls = (editWhat === 'categories' && category.selected) ? 'selected' : '';
        category.checkmark = (editWhat === 'categories' && category.selected) ? html`<span class=checkmark>&#x2714;</span>` : '';
        category.items.forEach(item => {
          item.cls = (editWhat === 'items' && item.selected) ? 'selected' : '';
          item.checkmark = (editWhat === 'items' && item.selected) ? html`<span class=checkmark>&#x2714;</span>` : '';
        });
      });
    });
    let enableEditItem = localFavorites.columns.reduce((accumulator, column) => {
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
    localFavorites.columns.forEach(column => {
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
    let EditFavoritesSelectAllClass = !enableSelectAll ? 'EditFavoritesSelectDisabled' : '';
    let EditFavoritesDeselectAllClass = ((editWhat === 'items' && !enableRemoveSelected) ||
      (editWhat === 'categories' && !enableEditItem)) ? 'EditFavoritesSelectDisabled' : '';
    let enableMoveLeft;
    if (editWhat === 'items') {
      // enableMoveLeft is true if enableRemoveSelected is true
      // and at least one category can move left
      enableMoveLeft = enableRemoveSelected && localFavorites.columns.some(column => {
        return column.categories.some(category => {
          return category.items.some((item, index, arr) =>
            item.selected && (index > 0 && !arr[index-1].selected));
        });
      });
    } else {
      // enableMoveLeft is true if at least one category can move up
      enableMoveLeft = localFavorites.columns.some(column => {
        return column.categories.some((category, index, arr) =>
          category.selected && (index > 0 && !arr[index-1].selected));
      });
    }
    let enableMoveRight;
    if (editWhat === 'items') {
      // enableMoveRight is true if enableRemoveSelected is true
      // and at least one favorite can move right
      enableMoveRight = enableRemoveSelected && localFavorites.columns.some(column => {
        return column.categories.some(category => {
          return category.items.some((item, index, arr) =>
            item.selected && (index < arr.length-1 && !arr[index+1].selected));
        });
      });
    } else {
      // enableMoveLeft is true if at least one category can move up
      enableMoveRight = localFavorites.columns.some(column => {
        return column.categories.some((category, index, arr) =>
          category.selected && (index < arr.length-1 && !arr[index+1].selected));
      });
    }
    // FIXME css might be added multiple times
    render(html`
    <style>${css}</style>
    <div class="Favorites EditFavorites">
      <div class=EditFavoritesChild>
        ${buildSlideRightTitle("Manage Favorites", onEditFavoritesReturn)}
        <div class=TabControlRadioButtons>
          <label>Edit what:</label>
          ${buildEditWhatRadioButton('EditFavoritesEditWhatItems', 'items', 'Individual Favorites')}
          ${buildEditWhatRadioButton('EditFavoritesEditWhatCategories', 'categories', 'Categories')}
        </div>
        <div class="EditFavoritesData ${editWhat === 'items' ? 'EditWhatItems' : 'EditWhatCategories' }">
          <div class=ScreenInstructions>
            ${editWhat === 'items' ? '(Click individual favorites below to select.)' :
              '(Click individual categories to select.)'}
          </div>
          <div class=FavoritesColumns>
            ${localFavorites.columns.map((column, colIndex) => html`
              <div class=FavoritesColumn>
                ${column.categories.map((category, catIndex) => html`
                  ${editWhat === 'categories' && editCategoryNameColumnIndex === colIndex &&
                    editCategoryNameCategoryIndex === catIndex ? html`
                    <div class=EditFavoritesEditCategoryNameDiv>
                      <input id=EditFavoritesEditCategoryName class=CategoryName placeholder="Enter category name"
                        @keydown=${onCategoryNameKeyDown} @blur=${onCategoryNameBlur}></input>
                    </div>` : html`
                    <div @click=${onItemClick} .favoritesFlavor=${'categories'} .favoritesObject=${category}
                      .favoritesColumnIndex=${colIndex} .favoritesCategoryIndex=${catIndex}
                      class="FavoritesCategoryLabel ${editWhat === 'categories' && category.selected ? 'selected' : ''}">
                      ${category.checkmark}
                      ${category.label}
                    </div>`}
                  <div class=FavoritesCategoryItems>
                    ${html`${category.items.map((phrase,itIndex) =>
                      html`
                        <div class=FavoriteContainer>
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
                  <div class="EditFavoritesNewCategoryRow">
                    <button @click=${onClickNewCategory} .favoritesColumnIndex=${colIndex}
                      .favoritesCategoryIndex=${Favorites.columns[colIndex].categories.length}>New Category ...</button>
                  </div>` : '' }
              </div>
            `)}
          </div>
        </div >
        <div class=SelectLinksRow>
          <a href="" @click=${onClickSelectAll} class=${EditFavoritesSelectAllClass}>Select All</a>
          <a href="" @click=${onClickDeselectAll} class=${EditFavoritesDeselectAllClass}>Deselect All</a>
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
  let localFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
  initializeSelection();
  localUpdate();
}

let buildChooseCategoryControl = (parentElement, customControlsData) => {
  let { columnIndex, categoryIndex } = customControlsData;
  let onClickChangeCategory = e => {
    e.preventDefault();
    FavoritesChooseCategoryPopupShow(customControlsData);
  }
  if (typeof columnIndex != 'number' || typeof categoryIndex != 'number') {
    columnIndex = categoryIndex = 0;
  } else {
    columnIndex = Favorites.lastChooseCategory.columnIndex;
    categoryIndex = Favorites.lastChooseCategory.categoryIndex;
  }
  if (columnIndex < 0 || columnIndex >= Favorites.columns.length ||
    categoryIndex < 0 || categoryIndex >= Favorites.columns[columnIndex].categories.length ||
    Favorites.lastChooseCategory.categoryLabel != Favorites.columns[columnIndex].categories[categoryIndex].label) {
    columnIndex = categoryIndex = 0;
    Favorites.lastChooseCategory.categoryLabel = Favorites.columns[columnIndex].categories[categoryIndex].label;
  }
  customControlsData.parentElement = parentElement;
  customControlsData.columnIndex = columnIndex;
  customControlsData.categoryIndex = categoryIndex;
  render(html`
    <div class=FavoritesEditPhraseChooseCategory>
      <label>Favorites category:</label
      ><span class=FavoritesEditPhraseColumnCategory
        ><span class=FavoritesEditPhraseColumn>[${columnIndex+1}]</span
        ><span class=FavoritesEditPhraseCategory>${Favorites.columns[columnIndex].categories[categoryIndex].label}</span
      ></span
      ><button class=FavoritesAddItemCategoryButton @click=${onClickChangeCategory}>Change ...</button>
    </div>
  `, parentElement);
};

let FavoritesChooseCategoryDialog = (parentElement, customControlsData) => {
  let newCategoryJustCreated = null;
  let onClickExistingCategory = e => {
    e.preventDefault();
    let target = e.currentTarget;
    selCol = target.FavoritesColumn;
    selCat = target.FavoritesCategory;
    localUpdate();
  };
  let onClickNewCategory = e => {
    e.preventDefault();
    newCategoryJustCreated = e.currentTarget.FavoritesColumn;
    localUpdate();
    setTimeout(() => {
      let elem = document.getElementById('FavoritesChooseCategoryNewCategory');
      elem.focus();
    }, 0);
  };
  let onClickDoit = e => {
    e.preventDefault();
    Favorites.lastChooseCategory.columnIndex = selCol;
    Favorites.lastChooseCategory.categoryIndex = selCat;
    Favorites.lastChooseCategory.categoryLabel = Favorites.columns[selCol].categories[selCat].label;
    customControlsData.columnIndex = selCol;
    customControlsData.categoryIndex = selCat;
    hidePopup(customControlsData);
  };
  let onClickCancel = e => {
    e.preventDefault();
    hidePopup(customControlsData);
  };
  let doneWithNewCategoryName = () => {
    let elem = document.getElementById('FavoritesChooseCategoryNewCategory');
    let name = elem.value.trim();
    if (name.length > 0) {
      Favorites.columns[newCategoryJustCreated].categories.push({ label: name, expanded: true, items: [] });
      selCol = newCategoryJustCreated;
      selCat = Favorites.columns[newCategoryJustCreated].categories.length - 1;
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
  let selCol = Favorites.lastChooseCategory.columnIndex;
  let selCat = Favorites.lastChooseCategory.categoryIndex;
  let localUpdate = () => {
    render(html`<div class=FavoritesChooseCategory>
      <div class=FavoritesChooseCategoryTitle>Choose a Favorites Category</div>
      <div class=FavoritesChooseCategoryChooser>
        <div class=FavoritesChooseCategoryList>
          ${Favorites.columns.map((column, columnIndex) => html`
            <span class=FavoritesChooseCategoryColumn>
              ${column.categories.map((category, categoryIndex) => html`
                <div @click=${onClickExistingCategory} .FavoritesCategory=${categoryIndex} .FavoritesColumn=${columnIndex}
                  class="FavoritesChooseCategoryListItem ${columnIndex === selCol && categoryIndex === selCat ? 'selected' : ''}">
                  ${columnIndex === selCol && categoryIndex === selCat ? html`<span class=checkmark>&#x2714;</span>` : ''}
                  <span class=CategoryName>${category.label}</span>
                </div>
              `)}
              ${newCategoryJustCreated === columnIndex ? html`
                <div @click=${onClickNewCategory} .FavoritesColumn=${columnIndex}
                  class="FavoritesChooseCategoryListItem FavoritesChooseCategoryListItemInput">
                  <input id=FavoritesChooseCategoryNewCategory class=CategoryName placeholder="Enter new category"
                    @keydown=${onKeyDown} @blur=${onNewBlur}></input>
                </div>
                ` : ''}
              <div class=spacer>&nbsp;</div>
              ${newCategoryJustCreated != null ? '' : html`
                <div @click=${onClickNewCategory} .FavoritesColumn=${columnIndex}
                  class="FavoritesChooseCategoryListItem FavoritesChooseCategoryListItemNew">
                  <span class=CategoryName>New ...</span>
                </div>
                `}
            </span>
          `)}
        </div>
      </div>
      <div class=FavoritesChooseCategoryButtonRow>
        <button @click=${onClickDoit} class=FavoritesChooseCategoryDoitButton>Select Category</button>
        <button @click=${onClickCancel} class=FavoritesChooseCategoryCancelButton>Cancel</button>
      </div>
    </div>`, parentElement);
  };
  localUpdate();
};

export function FavoritesChooseCategoryPopupShow(hideCallbackParams) {
  let params = {
    content: FavoritesChooseCategoryDialog,
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
