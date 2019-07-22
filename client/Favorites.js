
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
.FavoritesCategoryLabel {
  font-size: 90%;
  color: #ccc;
}
.FavoritesCategoryLabel a, .FavoritesCategoryLabel a:link, .FavoritesCategoryLabel a:visited {
  text-decoration: none;
  cursor: pointer;
  color: #ccc;
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
  font-size: 0.95rem;
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
  font-size: 90%;
  text-align: center;
  padding: 0 0 0.5em;
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
`;

let Favorites;

export function initializeFavorites(props) {
  let { currentVersion } = props;
  Favorites = {
    version: currentVersion,
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
          { type: 'text', label: 'toilet', text: 'Take me to the toilet, please'},
          { type: 'text', label: 'urinal', text: 'can I please use the urinal'},
          { type: 'text', label: 'bed', text: 'Can I please go to my bed?'},
          { type: 'text', label: 'hurry', text: 'Please hurry!'},
          { type: 'text', label: 'no rush', text: 'Take your time. Not urgent'},
          { type: 'text', label: 'cold', text: 'I am a little cold. Could I please have something more over me?'},
          { type: 'text', label: 'warm', text: 'I am a little warm. Could you please take something off of me?'},
          { type: 'text', label: 'tubing', text: 'Please pull the blue tubing, you know, the tubing that goes from the breathing machine to my face mask, please pull it outside of the bed as much as possible. '},
          { type: 'text', label: 'face up', text: 'Please roll me a little so that my body is flat on the bed and my head is facing straight up. '},
          { type: 'text', label: 'head', text: 'Please straighten my head '},
          { type: 'text', label: 'itch', text: 'Can you please scratch something for me? '},
        ]},
        { label: 'Adjustments', expanded: true, items: [
          { type: 'text', label: 'down', text: 'Please move it down. '},
          { type: 'text', label: 'up', text: 'Please move it up. '},
          { type: 'text', label: 'left', text: 'Please move it to my left. '},
          { type: 'text', label: 'right', text: 'Please move it to my right. '},
          { type: 'text', label: 'in', text: 'Please push it in a little. '},
          { type: 'text', label: 'mask', text: 'Can you please fix the mask?'},
          { type: 'text', label: 'chair pos', text: 'Can you please fix the position of the wheelchair?'},
          { type: 'text', label: 'tilt fwd', text: 'Can you please tilt the wheelchair forward?'},
          { type: 'text', label: 'tilt back', text: 'Can you please tilt the wheelchair backward?'},
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
          { type: 'text', label: 'help', text: 'Please come and help me'},
          { type: 'text', label: 'yes', text: 'yes'},
          { type: 'text', label: 'no', text: 'no'},
          { type: 'text', label: 'good', text: "that's good"},
          { type: 'text', label: 'lol', text: "L O L"},
          { type: 'text', label: 'almost', text: "that's almost perfect, but it needs a slight adjustment"},
          { type: 'text', label: 'testing', text: 'Please ignore what comes out of the computer for the next couple of minutes. I am just testing the software. '},
        ]},
      ]},
    ]
  };
};

// Add phrase to Favorites without speaking
export function addToFavorites(phrase) {
  // Favorites.items.unshift(phrase);
  // localStorage.setItem("Favorites", JSON.stringify(Favorites));
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
}

export function updateFavorites(parentElement, props) {
  let { searchTokens } = props;
  let onClickAdd = e => {
    e.preventDefault();
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        title: 'Add New Favorite',
        doItButtonLabel: 'Add Favorite',
        doItCallback: function(phrase) {
          // add phrase to Favorites, go back to parent screen
          addToFavorites(phrase);
          localUpdate();
          secondLevelScreenHide();
        },
        cancelCallback: function() {
          // do nothing, go back to parent screen
          secondLevelScreenHide();
        },
        customControls: html`
          <div class=FavoritesEditPhraseChooseCategory>
            <label>Favorites category:</label
            ><span class=FavoritesEditPhraseColumnCategory
              ><span class=FavoritesEditPhraseColumn>[1]</span
              ><span class=FavoritesEditPhraseCategory>Clips</span
            ></span
            ><button class=FavoritesAddItemCategoryButton @click=${onClickChangeCategory}>Change ...</button>
          </div>
        `,
      },
    };
    secondLevelScreenShow(params);
  };
  let onClickEdit = e => {
    e.preventDefault();
    onEditFavorites();
  };
  let onClickHelp = e => {
    e.preventDefault();
    debugger;
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
    filteredFavorites.columns.forEach(column => {
      column.categories = column.categories.filter(category => {
        return category.items.length > 0;
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
      <div class=PhrasesSectionLabel>Favorites${rightSideIcons({ onClickAdd, onClickEdit, onClickHelp })}</div>
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
  let makeLocalChangesPermanent = (() => {
    Favorites = JSON.parse(JSON.stringify(localFavorites)); // deep clone
    traverseColumnsCategoriesItems(Favorites, deleteTemporaryProperties);
    onFavoritesChange();
    localUpdate();
  });
  let buildChooseCategoryControl = ((columnIndex, categoryIndex) => {
    // FIXME Incomplete
    return html`
      <div class=FavoritesEditPhraseChooseCategory>
        <label>Favorites category:</label
        ><span class=FavoritesEditPhraseColumnCategory
          ><span class=FavoritesEditPhraseColumn>[1]</span
          ><span class=FavoritesEditPhraseCategory>Clips</span
        ></span
        ><button class=FavoritesAddItemCategoryButton @click=${onClickChangeCategory}>Change ...</button>
      </div>
    `;
  })
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
      obj.selected = !obj.selected;
    }
    localUpdate();
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
  };
  let onClickAddItem = e => {
    e.preventDefault();
    let columnIndex = 0, categoryIndex = 0;  // FIXME
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        title: 'Add New Entry To Favorites',
        doItButtonLabel: 'Add to Favorites',
        doItCallback: function(phrase) {
          // add phrase to Favorites, go back to parent screen
          addToFavorites(phrase);
          localFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
          initializeSelection();
          localUpdate();
          thirdLevelScreenHide();
        },
        cancelCallback: function() {
          // do nothing, go back to parent screen
          thirdLevelScreenHide();
        },
        customControls: buildChooseCategoryControl(columnIndex, categoryIndex),
      },
    };
    thirdLevelScreenShow(params);
  };
  let onClickEditItem = e => {
    e.preventDefault();
    let phrase, columnIndex, categoryIndex, itemIndex;
    traverseColumnsCategoriesItems(localFavorites, (item, origObj, colIndex, catIndex, itIndex) => {
      if (!phrase && item.selected) {
        phrase = item;
        columnIndex = colIndex;
        categoryIndex = catIndex;
        itemIndex = itIndex;
      }
    });
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        phrase,
        title: 'Edit Entry From Favorites',
        doItButtonLabel: 'Update Entry',
        doItCallback: function(phrase) {
          // add phrase to Favorites, go back to parent screen
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
        customControls: buildChooseCategoryControl(columnIndex,categoryIndex),
      },
    };
    thirdLevelScreenShow(params);
  };
  let onClickRemoveSelected = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategories(localFavorites, category => {
        category.items = category.items.filter(item => !item.selected);
      });
    }
    makeLocalChangesPermanent();
  };
  let onClickMoveLeft = e => {
    e.preventDefault();
    traverseColumnsCategories(localFavorites, category => {
      for (let i=1, n=category.items.length; i<n; i++) {
        let item = category.items[i];
        if (item.selected && !category.items[i-1].selected) {
          [ category.items[i-1], category.items[i] ] = [ category.items[i], category.items[i-1] ];  // swap
        }
      }
    });
    makeLocalChangesPermanent();
  };
  let onClickMoveRight = e => {
    e.preventDefault();
    traverseColumnsCategories(localFavorites, category => {
      for (let n=category.items.length, i=n-2; i>=0; i--) {
        let item = category.items[i];
        if (item.selected && !category.items[i+1].selected) {
          [ category.items[i+1], category.items[i] ] = [ category.items[i], category.items[i+1] ];  // swap
        }
      }
    });
    makeLocalChangesPermanent();
  };
  let onClickMoveToTop = e => {
    e.preventDefault();
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
    makeLocalChangesPermanent();
  };
  let onClickMoveToBottom = e => {
    e.preventDefault();
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
    makeLocalChangesPermanent();
  };
  let initializeSelection = () => {
    traverseColumnsCategories(localFavorites, category => {
      category.selected = false;
      category.items.forEach(item => {
        item.selected = false;
      });
    });
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
        if (column.categories.some(category => category.selected)) {
          enableRemoveSelected = true;
        }
      }
    });
    let EditFavoritesSelectAllClass = !enableSelectAll ? 'EditFavoritesSelectDisabled' : '';
    let EditFavoritesDeselectAllClass = !enableRemoveSelected ? 'EditFavoritesSelectDisabled' : '';
    // enableMoveLeft is true if enableRemoveSelected is true
    // and at least one favorite can move left
    let enableMoveLeft = enableRemoveSelected && localFavorites.columns.some(column => {
      return column.categories.some(category => {
        return category.items.some((item, index, arr) =>
          item.selected && (index > 0 && !arr[index-1].selected));
      });
    });
    // enableMoveRight is true if enableRemoveSelected is true
    // and at least one favorite can move right
    let enableMoveRight = enableRemoveSelected && localFavorites.columns.some(column => {
      return column.categories.some(category => {
        return category.items.some((item, index, arr) =>
          item.selected && (index < arr.length-1 && !arr[index+1].selected));
      });
    });
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
        <div class=EditFavoritesData>
          <div class=ScreenInstructions>
            Click individual favorites below to select and deselect.
          </div>
          <div class=FavoritesColumns>
            ${localFavorites.columns.map(column => html`
              <div class=FavoritesColumn>
                ${column.categories.map(category => html`
                  <div @click=${onItemClick} .favoritesFlavor=${'categories'} .favoritesObject=${category} class=FavoritesCategoryLabel>${category.label}</div>
                  ${html`${category.items.map((phrase,index) =>
                    html`
                      <div class=FavoriteContainer>
                        <button @click=${onItemClick} .favoritesFlavor=${'items'} .favoritesObject=${phrase} class=${phrase.cls}>
                          ${phrase.checkmark}
                          ${phrase.label || phrase.text}</button>
                      </div>
                    `
                  )}`}
                `)}
              </div>
            `)}
          </div>
        </div >
        <div class=SelectLinksRow>
          <a href="" @click=${onClickSelectAll} class=${EditFavoritesSelectAllClass}>Select All</a>
          <a href="" @click=${onClickDeselectAll} class=${EditFavoritesDeselectAllClass}>Deselect All</a>
        </div>
        <div class=ButtonRow>
        <button @click=${onClickAddItem}
          title="Add a new item to the top of the list">New</button>
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
    </div>`, parentElement);
  };
  let localFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
  initializeSelection();
  localUpdate();
}

let onClickChangeCategory = e => {
  e.preventDefault();
  FavoritesChooseCategoryPopupShow();
}

let FavoritesChooseCategoryDialog = () => {
  let onClickExistingCategory = e => {
    e.preventDefault();
    debugger;
  };
  let onClickNewCategory = e => {
    e.preventDefault();
    debugger;
  };
  let onClickDoit = e => {
    e.preventDefault();
    debugger;
  };
  let onClickCancel = e => {
    e.preventDefault();
    debugger;
  };
  let anySelected = true;
  return html`<div class=FavoritesChooseCategory>
    <div class=FavoritesChooseCategoryTitle>Choose a Favorites Category</div>
    <div class=FavoritesChooseCategoryChooser>
      <label>Categories:</label>
      <span class=FavoritesChooseCategoryList>
        ${Favorites.columns.map((column, columnIndex) => html`
          ${column.categories.map(category => html`
            <div @click=${onClickExistingCategory} .FavoritesCategory=${category.label} .FavoritesColumn=${columnIndex}
              class=FavoritesChooseCategoryListItem>
              <span class=CategoryColumn>[${columnIndex+1}]</span>
              <span class=CategoryName>${category.label}</span>
            </div>
          `)}
          <div @click=${onClickNewCategory} .FavoritesColumn=${columnIndex}
            class="FavoritesChooseCategoryListItem FavoritesChooseCategoryListItemNew">
            <span class=CategoryColumn>[${columnIndex+1}]</span>
            <span class=CategoryName>New Category</span>
          </div>
        `)}
      </span>
    </div>

    <div class=FavoritesChooseCategoryButtonRow>
      <button @click=${onClickDoit} ?disabled=${!anySelected} class=FavoritesChooseCategoryDoitButton>Select Category</button>
      <button @click=${onClickCancel} class=FavoritesChooseCategoryCancelButton>Cancel</button>
    </div>
  </div>`;
};

export function FavoritesChooseCategoryPopupShow() {
  let params = {
    content: FavoritesChooseCategoryDialog(),
    refNode: document.querySelector('.main'),
    hideCallback: () => {
      render(html``, popupRootElement);
    },
  };
  let popupRootElement = showPopup(params);
};
