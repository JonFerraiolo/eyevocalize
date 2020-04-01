
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows,
  deleteTemporaryProperties } from './Phrases.js';
import { updateMain, buildSlideRightTitle, sync,
  secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { EditPhrase } from './EditPhrase.js';
import { showPopup, hidePopup } from './popup.js';

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
#BuiltinsContainer .MyPhrasesTitleIcon {
  background-image: url('./images/diamond.svg');
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
.MyPhrasesChooseCategory {
  background: white;
  border: 2px solid black;
  padding: 0.25em 1.5em;
  font-size: 95%;
}
.MyPhrasesChooseCategoryTitle {
  font-weight: 700;
  padding: 0.6em 0;
  text-align: center;
}
.MyPhrasesChooseCategoryChooser {
  font-size: 90%;
}
.MyPhrasesChooseCategoryChooser label {
  font-size: 90%;;
}
.MyPhrasesChooseCategoryList {
  border: 1px solid black;
  padding: 0.2em;
  display: flex;
}
.MyPhrasesChooseCategoryColumn {
  vertical-align: top;
  flex: 1;
  padding: 0 3em 0 0.5em;
  border-left: 1px solid #ccc;
  display: inline-flex;
  flex-direction: column;
}
.MyPhrasesChooseCategoryListItem {
  padding: 0.2em 0;
  white-space: nowrap;
}
.MyPhrasesChooseCategoryColumn .spacer {
  flex: 1;
}
.MyPhrasesChooseCategoryListItem.MyPhrasesChooseCategoryListItemNew {
  font-style: italic;
  border: 1px solid #444;
  border-radius: 3px;
  padding: 0.25em;
  background: #f0f0f0;
  margin: 1.5em 0 0.75em;
  font-size: 80%;
  width: fit-content;
}
.MyPhrasesChooseCategoryListItem.selected {
  font-weight: bold;
  font-style: italic;
  background: #ddf;
  color: #004;
}
.MyPhrasesChooseCategoryButtonRow {
  padding: 1em 0;
  display: flex;
  justify-content: space-around;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let Favorites;
let Builtins;
let HiddenBuiltins;

export function initializeFavorites(props) {
  let { currentVersion } = props;
  // FIXME temporary
  let initialFavorites = window.eyevocalizeUserEmail.toLowerCase().indexOf('jonferraiolo') !== 0 ? {
    version: currentVersion,
    timestamp: 0,
    lastChooseCategory: { columnIndex: 0, categoryIndex: 0, categoryLabel: null },
    columns: [
      { categories: [
        	{ label: 'Category 1', expanded: true, items: [] },
      ]},
      { categories: [
          { label: 'Category 2', expanded: true, items: [] },
      ]},
    ],
  } : {
    version: currentVersion,
    timestamp: 0,
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
          { type: 'text', label: 'cold', text: 'I am a little cold. Could I please have something more over me?'},
          { type: 'text', label: 'warm', text: 'I am a little warm. Could you please take something off of me?'},
          { type: 'text', label: 'tubing', text: 'Please pull the blue tubing, you know, the tubing that goes from the breathing machine to my face mask, please pull it outside of the bed as much as possible. '},
          { type: 'text', label: 'itch', text: 'Can you please scratch something for me? '},
        ]},
        { label: 'Adjustments', expanded: true, items: [
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
          { type: 'text', label: 'thanka', text: 'Thank you. You are an angel.'},
          { type: 'text', label: 'Pepe', text: 'Can someone please help Peppay? '},
          { type: 'text', label: 'vgood', text: "very good"},
          { type: 'text', label: 'perfect', text: "perfect"},
          { type: 'text', label: 'wonful', text: "wonderful"},
          { type: 'text', label: 'g-aft', text: 'good afternoon'},
          { type: 'text', label: 'g-eve', text: 'good evening'},
          { type: 'text', label: 'g-night', text: 'good night'},
          { type: 'text', label: 'lol', text: "L O L"},
          { type: 'text', label: 'testing', text: 'Please ignore what comes out of the computer for the next couple of minutes. I am just testing the software. '},
        ]},
      ]},
    ]
  };
  let FavoritesString = localStorage.getItem("Favorites");
  try {
    Favorites = (typeof FavoritesString === 'string') ? JSON.parse(FavoritesString) : initialFavorites;
  } catch(e) {
    Favorites = initialFavorites;
  }
  if (typeof Favorites.version != 'number'|| Favorites.version < currentVersion) {
    Favorites = initialFavorites;
  }
  localStorage.setItem("Favorites", JSON.stringify(Favorites));
};

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
  let initialHiddenBuiltins = { version: currentVersion, timestamp: 0, items: [], };
  let HiddenBuiltinsString = localStorage.getItem("HiddenBuiltins");
  try {
    HiddenBuiltins = (typeof HiddenBuiltinsString === 'string') ? JSON.parse(HiddenBuiltinsString) : initialHiddenBuiltins;
  } catch(e) {
    HiddenBuiltins = initialHiddenBuiltins;
  }
  if (typeof HiddenBuiltins.version != 'number'|| HiddenBuiltins.version < currentVersion) {
    HiddenBuiltins = initialHiddenBuiltins;
  }
  localStorage.setItem("HiddenBuiltins", JSON.stringify(HiddenBuiltins));
};

export function FavoritesGetPending(clientLastSync) {
  if (!Favorites.pending) return null;
  delete Favorites.pending;
  return Favorites.timestamp > clientLastSync ? Favorites : null;
}

export function HiddenBuiltinsGetPending(clientLastSync) {
  if (!HiddenBuiltins.pending) return null;
  delete HiddenBuiltins.pending;
  return HiddenBuiltins.timestamp > clientLastSync ? HiddenBuiltins : null;
}

export function FavoritesSync(thisSyncServerTimestamp, newData) {
  if (newData && typeof newData === 'object' && typeof newData.timestamp === 'number' && newData.timestamp > Favorites.timestamp) {
    console.log('FavoritesSync. newData.timestamp='+newData.timestamp+', Favorites.timestamp='+Favorites.timestamp);
    Favorites = newData;
    updateLocalStorageFavorites({ timestamp: newData.timestamp });
    let event = new CustomEvent("ServerInitiatedSyncFavorites", { detail: null } );
    window.dispatchEvent(event);
  }
}

export function HiddenBuiltinsSync(thisSyncServerTimestamp, newData) {
  if (newData && typeof newData === 'object' && typeof newData.timestamp === 'number' && newData.timestamp > HiddenBuiltins.timestamp) {
    console.log('HiddenBuiltinsSync. newData.timestamp='+newData.timestamp+', HiddenBuiltins.timestamp='+HiddenBuiltins.timestamp);
    HiddenBuiltins = newData;
    updateLocalStorageHiddenBuiltins({ timestamp: newData.timestamp });
    let event = new CustomEvent("ServerInitiatedSyncHiddenBuiltins", { detail: null } );
    window.dispatchEvent(event);
  }
}

function updateStorageFavorites()  {
  updateLocalStorageFavorites({ pending: true });
  sync();
}

function updateStorageHiddenBuiltins()  {
  updateLocalStorageHiddenBuiltins({ pending: true });
  sync();
}

function updateLocalStorageFavorites(overrides) {
  Favorites.timestamp = Date.now();
  Favorites = Object.assign({}, Favorites, overrides || {});
  localStorage.setItem("Favorites", JSON.stringify(Favorites));
}

function updateLocalStorageHiddenBuiltins(overrides) {
  HiddenBuiltins.timestamp = Date.now();
  HiddenBuiltins = Object.assign({}, HiddenBuiltins, overrides || {});
  localStorage.setItem("HiddenBuiltins", JSON.stringify(HiddenBuiltins));
}

// transfer hidden flags HiddenBuiltins to from the given MyPhrases data structure
function transferHiddenTo(aMyPhrases) {
  HiddenBuiltins.items.forEach(item => {
    let tokens = item.split('_');
    if (tokens.length  < 2) return;
    let [ col, cat, itm ] = tokens;
    let columnIndex = parseInt(col);
    if (isNaN(columnIndex) || columnIndex < 0 || columnIndex >= aMyPhrases.columns.length) return;
    let column = aMyPhrases.columns[columnIndex];
    let category = column.categories.find(category => category.label === cat);
    if (!category) return;
    if (tokens.length === 2) {
      category.hidden = true;
    } else {
      let item = category.items.find(item => item.label === itm);
      if (!item) return;
      item.hidden = true;
    }
  });
}

// transfer hidden flags from the given MyPhrases data structure to HiddenBuiltins
function transferHiddenFrom(aMyPhrases) {
  HiddenBuiltins.items = [];
  aMyPhrases.columns.forEach((column, colIndex) => {
    column.categories.forEach((category, catIndex) => {
      if (category.hidden) {
        HiddenBuiltins.items.push(colIndex+'_'+category.label);
      }
      category.items.forEach((item, itIndex) => {
        if (item.hidden) {
          HiddenBuiltins.items.push(colIndex+'_'+category.label+'_'+item.label);
        }
      });
    });
  });
  updateStorageHiddenBuiltins();
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
function traverseColumnsCategoriesItems(aMyPhrases, func) {
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
  let customControlsData = {};
  let params = {
    renderFunc: EditPhrase,
    renderFuncParams: {
      title: 'Add New Favorite',
      doItButtonLabel: 'Add Favorite',
      doItCallback: function(phrase) {
        let { columnIndex, categoryIndex } = customControlsData;
        // add phrase to MyPhrases, go back to parent screen
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
  updateMyPhrases('Favorites', parentElement, props);
}
export function updateBuiltins(parentElement, props) {
  updateMyPhrases('Builtins', parentElement, props);
}
let lastParentFavorites, lastParentHiddenBuiltins;
let updateFavoritesFirstTime = true;
let updateHiddenBuiltinsFirstTime = true;
function updateMyPhrases(Section, parentElement, props) {
  if (Section === 'Favorites') {
    lastParentFavorites = parentElement;
  } else {
    lastParentHiddenBuiltins = parentElement;
  }
  if (updateFavoritesFirstTime) {
    updateFavoritesFirstTime = false;
    window.addEventListener('ServerInitiatedSyncFavorites', function(e) {
      console.log('updateFavorites ServerInitiatedSyncFavorites custom event listener entered ');
      let oldSection = Section;
      let oldParent = parentElement;
      Section = 'Favorites';
      parentElement = lastParentFavorites;
      localUpdate();
      Section = oldSection;
      parentElement = oldParent;
    });
  }
  if (updateHiddenBuiltinsFirstTime) {
    updateHiddenBuiltinsFirstTime = false;
    window.addEventListener('ServerInitiatedSyncHiddenBuiltins', function(e) {
      console.log('updateHiddenBuiltins ServerInitiatedSyncHiddenBuiltins custom event listener entered ');
      let oldSection = Section;
      let oldParent = parentElement;
      Section = 'HiddenBuiltins';
      parentElement = lastParentHiddenBuiltins;
      localUpdate();
      Section = oldSection;
      parentElement = oldParent;
    });
  }
  let { searchTokens } = props;
  let onClickImport = e => {
    e.preventDefault();
    debugger;
  };
  let onClickAdd = e => {
    e.preventDefault();
    slideInAddFavoriteScreen();
  };
  let onClickEdit = e => {
    e.preventDefault();
    if (Section === 'Favorites') {
      onEditFavorites();
    } else if (Section === 'Builtins') {
      onEditBuiltins();
    }
  };
  let localUpdate = () => {
    let filteredMyPhrases;
    if (Section === 'Favorites') {
      filteredMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
    } else {
      filteredMyPhrases = JSON.parse(JSON.stringify(Builtins));  // deep clone
      transferHiddenTo(filteredMyPhrases);
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
      let MyPhrases = Section === 'Favorites' ? Favorites : Builtins;
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
let editHiddenBuiltinsActive = false;

function onEditFavorites() {
  editFavoritesActive = true;
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editFavorites, renderFuncParams });
}

function onEditBuiltins() {
  editHiddenBuiltinsActive = true;
  let renderFuncParams = { };
  secondLevelScreenShow({ renderFunc: editBuiltins, renderFuncParams });
}

function onEditFavoritesReturn() {
  editFavoritesActive = false;
  updateMain();
  secondLevelScreenHide();
}

function onEditBuiltinsReturn() {
  editHiddenBuiltinsActive = false;
  updateMain();
  secondLevelScreenHide();
}

let editFavoritesFirstTime = true;
let editHiddenBuiltinsFirstTime = true;
let lastWhat;
export function editFavorites(parentElement, props) {
  editMyPhrases('Favorites', parentElement, props);
}
export function editBuiltins(parentElement, props) {
  editMyPhrases('Builtins', parentElement, props);
}
function editMyPhrases(Section, parentElement, props) {
  if (editFavoritesFirstTime) {
    editFavoritesFirstTime = false;
    window.addEventListener('ServerInitiatedSyncFavorites', function(e) {
      if (editFavoritesActive && parentElement) {
        console.log('editFavorites ServerInitiatedSyncFavorites custom event listener entered ');
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
  if (editHiddenBuiltinsFirstTime) {
    editHiddenBuiltinsFirstTime = false;
    window.addEventListener('ServerInitiatedSyncHiddenBuiltins', function(e) {
      if (editHiddenBuiltinsActive && parentElement) {
        console.log('editHiddenBuiltins ServerInitiatedSyncHiddenBuiltins custom event listener entered ');
        let MyPhrases = parentElement.querySelector('.MyPhrases');
        if (MyPhrases) {
          Section = 'Builtins';
          editWhat = lastWhat;
          localMyPhrases = JSON.parse(JSON.stringify(Builtins));  // deep clone
          transferHiddenTo(localMyPhrases);
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
    } else {
      updateStorageHiddenBuiltins();
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
    let customControlsData = {};
    let params = {
      renderFunc: EditPhrase,
      renderFuncParams: {
        title: 'Add New Entry To Favorites',
        doItButtonLabel: 'Add to Favorites',
        doItCallback: function(phrase) {
          let { columnIndex, categoryIndex } = customControlsData;
          // add phrase to MyPhrases, go back to parent screen
          addToFavorites(phrase, columnIndex, categoryIndex);
          if (Section === 'Favorites') {
            localMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
          } else {
            localMyPhrases = JSON.parse(JSON.stringify(Builtins));  // deep clone
            transferHiddenTo(localMyPhrases);
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
      let phrase, columnIndex, categoryIndex, itemIndex;
      traverseColumnsCategoriesItems(localMyPhrases, (item, origObj, colIndex, catIndex, itIndex) => {
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
            // add phrase to MyPhrases, go back to parent screen
            // FIXME  wrong if user changes category
            replaceFavoritesEntry(columnIndex, categoryIndex, itemIndex, phrase);
            if (Section === 'Favorites') {
              localMyPhrases = JSON.parse(JSON.stringify(Favorites));  // deep clone
            } else {
              localMyPhrases = JSON.parse(JSON.stringify(Builtins));  // deep clone
              transferHiddenTo(localMyPhrases);
            }
            localMyPhrases.columns[columnIndex].categories[categoryIndex].items[itemIndex].selected = true;
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
  let onClickShowSelected = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategoriesItems(localMyPhrases, item => {
        if (item.selected) {
          delete item.hidden;
        }
      });
    } else {
      // should only be here if a single empty category is selected and
      // and the column has more than one category
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          delete category.hidden;
        }
      });
    }
    transferHiddenFrom(localMyPhrases);
    localUpdate();
  };
  let onClickHideSelected = e => {
    e.preventDefault();
    if (editWhat === 'items') {
      traverseColumnsCategoriesItems(localMyPhrases, item => {
        if (item.selected) {
          item.hidden = true;
        }
      });
    } else {
      // should only be here if a single empty category is selected and
      // and the column has more than one category
      let columnIndex, categoryIndex;
      traverseColumnsCategories(localMyPhrases, (category, origObj, colIndex, catIndex) => {
        if (category.selected) {
          category.hidden = true;
        }
      });
    }
    transferHiddenFrom(localMyPhrases);
    localUpdate();
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
    } else {
      localMyPhrases = JSON.parse(JSON.stringify(Builtins));  // deep clone
      transferHiddenTo(localMyPhrases);
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
    let enableShow = false;
    let enableHide = false;
    localMyPhrases.columns.forEach(column => {
      if (editWhat === 'items') {
        column.categories.forEach(category => {
          if (category.items.some(item => item.selected)) {
            enableRemoveSelected = true;
            enableSelectAll = true;
          }
          if (category.items.some(item => (item.selected && item.hidden))) {
            enableShow = true;
          }
          if (category.items.some(item => (item.selected && !item.hidden))) {
            enableHide = true;
          }
        });
      } else if (editWhat === 'categories') {
        column.categories.forEach(category => {
          if (category.selected && column.categories.length > 1 && category.items.length === 0) {
            enableRemoveSelected = true;
          }
          if (category.selected && category.hidden) {
            enableShow = true;
          }
          if (category.selected && !category.hidden) {
            enableHide = true;
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
    } else {
      buttonRowHtml = html`
        <div class=ButtonRow>
          <button @click=${onClickShowSelected} ?disabled=${!enableShow} title="Show selected builtin items">Show</button>
          <button @click=${onClickHideSelected} ?disabled=${!enableHide} title="Hide selected builtin items">Hide</button>
        </div>
      `;
    }
    // FIXME css might be added multiple times
    render(html`
    <div class="MyPhrases EditMyPhrases skinnyScreenParent">
      <div class="EditMyPhrasesChild skinnyScreenChild">
        ${buildSlideRightTitle("Manage "+(Section === 'Favorites' ? 'Favorites' : 'Builtins'), onEditFavoritesReturn)}
        <div class=TabControlRadioButtons>
          <label>Edit what:</label>
          ${buildEditWhatRadioButton('EditMyPhrasesEditWhatItems', 'items', "Individual "+(Section === 'Favorites' ? 'Favorites' : 'Builtins'))}
          ${buildEditWhatRadioButton('EditMyPhrasesEditWhatCategories', 'categories', 'Categories')}
        </div>
        <div class="EditMyPhrasesData ${editWhat === 'items' ? 'EditWhatItems' : 'EditWhatCategories' }">
          <div class=ScreenInstructions>
            ${editWhat === 'items' ? '(Click individual '+(Section === 'Favorites' ? 'Favorites' : 'Builtins')+' below to select.)' :
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
  } else {
    localMyPhrases = JSON.parse(JSON.stringify(Builtins));  // deep clone
    transferHiddenTo(localMyPhrases);
  }
  initializeSelection();
  localUpdate();
}

let buildChooseCategoryControl = (parentElement, customControlsData) => {
  let { columnIndex, categoryIndex } = customControlsData;
  let onClickChangeCategory = e => {
    e.preventDefault();
    MyPhrasesChooseCategoryPopupShow(customControlsData);
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
    <div class=MyPhrasesEditPhraseChooseCategory>
      <label>Favorites category:</label
      ><span class=MyPhrasesEditPhraseColumnCategory
        ><span class=MyPhrasesEditPhraseColumn>[${columnIndex+1}]</span
        ><span class=MyPhrasesEditPhraseCategory>${Favorites.columns[columnIndex].categories[categoryIndex].label}</span
      ></span
      ><button class=MyPhrasesAddItemCategoryButton @click=${onClickChangeCategory}>Change ...</button>
    </div>
  `, parentElement);
};

let FavoritesChooseCategoryDialog = (parentElement, customControlsData) => {
  let newCategoryJustCreated = null;
  let onClickExistingCategory = e => {
    e.preventDefault();
    let target = e.currentTarget;
    selCol = target.MyPhrasesColumn;
    selCat = target.MyPhrasesCategory;
    localUpdate();
  };
  let onClickNewCategory = e => {
    e.preventDefault();
    newCategoryJustCreated = e.currentTarget.MyPhrasesColumn;
    localUpdate();
    setTimeout(() => {
      let elem = document.getElementById('MyPhrasesChooseCategoryNewCategory');
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
    let elem = document.getElementById('MyPhrasesChooseCategoryNewCategory');
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
    render(html`<div class=MyPhrasesChooseCategory>
      <div class=MyPhrasesChooseCategoryTitle>Choose a Favorites Category</div>
      <div class=MyPhrasesChooseCategoryChooser>
        <div class=MyPhrasesChooseCategoryList>
          ${Favorites.columns.map((column, columnIndex) => html`
            <span class=MyPhrasesChooseCategoryColumn>
              ${column.categories.map((category, categoryIndex) => html`
                <div @click=${onClickExistingCategory} .MyPhrasesCategory=${categoryIndex} .MyPhrasesColumn=${columnIndex}
                  class="MyPhrasesChooseCategoryListItem ${columnIndex === selCol && categoryIndex === selCat ? 'selected' : ''}">
                  ${columnIndex === selCol && categoryIndex === selCat ? html`<span class=checkmark>&#x2714;</span>` : ''}
                  <span class=CategoryName>${category.label}</span>
                </div>
              `)}
              ${newCategoryJustCreated === columnIndex ? html`
                <div @click=${onClickNewCategory} .MyPhrasesColumn=${columnIndex}
                  class="MyPhrasesChooseCategoryListItem MyPhrasesChooseCategoryListItemInput">
                  <input id=MyPhrasesChooseCategoryNewCategory class=CategoryName placeholder="Enter new category"
                    @keydown=${onKeyDown} @blur=${onNewBlur}></input>
                </div>
                ` : ''}
              <div class=spacer>&nbsp;</div>
              ${newCategoryJustCreated != null ? '' : html`
                <div @click=${onClickNewCategory} .MyPhrasesColumn=${columnIndex}
                  class="MyPhrasesChooseCategoryListItem MyPhrasesChooseCategoryListItemNew">
                  <span class=CategoryName>New ...</span>
                </div>
                `}
            </span>
          `)}
        </div>
      </div>
      <div class=MyPhrasesChooseCategoryButtonRow>
        <button @click=${onClickDoit} class=MyPhrasesChooseCategoryDoitButton>Select Category</button>
        <button @click=${onClickCancel} class=MyPhrasesChooseCategoryCancelButton>Cancel</button>
      </div>
    </div>`, parentElement);
  };
  localUpdate();
};

export function MyPhrasesChooseCategoryPopupShow(hideCallbackParams) {
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
