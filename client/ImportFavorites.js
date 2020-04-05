
import { html, render } from './lib/lit-html/lit-html.js';
import { getFavorites } from './MyPhrases.js';
import { localization } from './main.js';
import { showPopup, hidePopup } from './popup.js';

let css = `
.ImportFavorites {
  background: white;
  border: 2px solid black;
  padding: 0.25em 1.5em;
  font-size: 95%;
}
.ImportFavoritesTitle {
  font-weight: 700;
  padding: 0.6em 0;
  text-align: center;
}
.ImportFavoritesChooser {
  font-size: 90%;
}
.ImportFavoritesChooser label {
  font-size: 90%;;
}
.ImportFavoritesList {
  border: 1px solid black;
  padding: 0.2em;
  display: flex;
}
.ImportFavoritesColumn {
  vertical-align: top;
  flex: 1;
  padding: 0 3em 0 0.5em;
  border-left: 1px solid #ccc;
  display: inline-flex;
  flex-direction: column;
}
.ImportFavoritesListItem {
  padding: 0.2em 0;
  white-space: nowrap;
}
.ImportFavoritesColumn .spacer {
  flex: 1;
}
.ImportFavoritesListItem.ImportFavoritesListItemNew {
  font-style: italic;
  border: 1px solid #444;
  border-radius: 3px;
  padding: 0.25em;
  background: #f0f0f0;
  margin: 1.5em 0 0.75em;
  font-size: 80%;
  width: fit-content;
}
.ImportFavoritesListItem.selected {
  font-weight: bold;
  font-style: italic;
  background: #ddf;
  color: #004;
}
.ImportFavoritesButtonRow {
  padding: 1em 0;
  display: flex;
  justify-content: space-around;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let showPopupReturnData;

/*
export let buildImportFavoritesControl = (parentElement, customControlsData) => {
	let Favorites = getFavorites();
  let { columnIndex, categoryIndex } = customControlsData;
  let onClickChangeCategory = e => {
    e.preventDefault();
    ImportFavoritesPopupShow(customControlsData);
  }
  if (typeof columnIndex != 'number' || typeof categoryIndex != 'number') {
    columnIndex = categoryIndex = 0;
  } else {
    columnIndex = Favorites.lastImportFavorites.columnIndex;
    categoryIndex = Favorites.lastImportFavorites.categoryIndex;
  }
  if (columnIndex < 0 || columnIndex >= Favorites.columns.length ||
    categoryIndex < 0 || categoryIndex >= Favorites.columns[columnIndex].categories.length ||
    Favorites.lastImportFavorites.categoryLabel != Favorites.columns[columnIndex].categories[categoryIndex].label) {
    columnIndex = categoryIndex = 0;
    Favorites.lastImportFavorites.categoryLabel = Favorites.columns[columnIndex].categories[categoryIndex].label;
  }
  customControlsData.parentElement = parentElement;
  customControlsData.columnIndex = columnIndex;
  customControlsData.categoryIndex = categoryIndex;
  render(html`
    <div class=MyPhrasesEditPhraseImportFavorites>
      <label>Favorites category:</label
      ><span class=MyPhrasesEditPhraseColumnCategory
        ><span class=MyPhrasesEditPhraseColumn>[${columnIndex+1}]</span
        ><span class=MyPhrasesEditPhraseCategory>${Favorites.columns[columnIndex].categories[categoryIndex].label}</span
      ></span
      ><button class=MyPhrasesAddItemCategoryButton @click=${onClickChangeCategory}>Change ...</button>
    </div>
  `, parentElement);
};

*/

let ImportFavoritesDialog = (parentElement, customControlsData) => {
	let Favorites = getFavorites();
	/*
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
      let elem = document.getElementById('ImportFavoritesNewCategory');
      elem.focus();
    }, 0);
  };
	*/
  let onClickDoit = e => {
    e.preventDefault();
		/* FIXME
    Favorites.lastImportFavorites.columnIndex = selCol;
    Favorites.lastImportFavorites.categoryIndex = selCat;
    Favorites.lastImportFavorites.categoryLabel = Favorites.columns[selCol].categories[selCat].label;
    customControlsData.columnIndex = selCol;
    customControlsData.categoryIndex = selCat;
		*/
    hidePopup(showPopupReturnData, customControlsData);
		customControlsData.doItCallback();
  };
  let onClickCancel = e => {
    e.preventDefault();
    hidePopup(showPopupReturnData, customControlsData);
		customControlsData.cancelCallback();
  };
	/* FIXME
  let doneWithNewCategoryName = () => {
		if (newCategoryJustCreated === null) {
			return;
		}
    let elem = document.getElementById('ImportFavoritesNewCategory');
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
  let selCol = Favorites.lastImportFavorites.columnIndex;
  let selCat = Favorites.lastImportFavorites.categoryIndex;
	*/
  let localUpdate = () => {
		/* FIXME
    render(html`<div class=ImportFavorites>
      <div class=ImportFavoritesTitle>Choose a Favorites Category</div>
      <div class=ImportFavoritesChooser>
        <div class=ImportFavoritesList>
          ${Favorites.columns.map((column, columnIndex) => html`
            <span class=ImportFavoritesColumn>
              ${column.categories.map((category, categoryIndex) => html`
                <div @click=${onClickExistingCategory} .MyPhrasesCategory=${categoryIndex} .MyPhrasesColumn=${columnIndex}
                  class="ImportFavoritesListItem ${columnIndex === selCol && categoryIndex === selCat ? 'selected' : ''}">
                  ${columnIndex === selCol && categoryIndex === selCat ? html`<span class=checkmark>&#x2714;</span>` : ''}
                  <span class=CategoryName>${category.label}</span>
                </div>
              `)}
              ${newCategoryJustCreated === columnIndex ? html`
                <div @click=${onClickNewCategory} .MyPhrasesColumn=${columnIndex}
                  class="ImportFavoritesListItem ImportFavoritesListItemInput">
                  <input id=ImportFavoritesNewCategory class=CategoryName placeholder="Enter new category"
                    @keydown=${onKeyDown} @blur=${onNewBlur}></input>
                </div>
                ` : ''}
              <div class=spacer>&nbsp;</div>
              ${newCategoryJustCreated != null ? '' : html`
                <div @click=${onClickNewCategory} .MyPhrasesColumn=${columnIndex}
                  class="ImportFavoritesListItem ImportFavoritesListItemNew">
                  <span class=CategoryName>New ...</span>
                </div>
                `}
            </span>
          `)}
        </div>
      </div>
      <div class=ImportFavoritesButtonRow>
        <button @click=${onClickDoit} class=ImportFavoritesDoitButton>Select Category</button>
        <button @click=${onClickCancel} class=ImportFavoritesCancelButton>Cancel</button>
      </div>
    </div>`, parentElement);
		*/
		render(html`<div class=ImportFavorites>
			<div class=ImportFavoritesTitle>${localization.ImportFavorites['Import Favorites']}</div>
			<div class=ImportFavoritesButtonRow>
				<button @click=${onClickDoit} class=ImportFavoritesDoitButton>${localization.ImportFavorites['Import Favorites']}</button>
				<button @click=${onClickCancel} class=ImportFavoritesCancelButton>${localization.common['Cancel']}</button>
			</div>
		</div>`, parentElement);
  };
  localUpdate();
};

export function ImportFavoritesPopupShow(hideCallbackParams) {
  let params = {
    content: ImportFavoritesDialog,
    contentFuncParams: hideCallbackParams,
    refNode: document.querySelector('.appmaincontent'),
    refY: 'top',
    popupY: 'bottom',
    clickAwayToClose: false,
    underlayOpacity: 0.85,
    hideCallback: hideCallbackParams => {
      render(html``, showPopupReturnData.popupOverlay);
    },
  };
  showPopupReturnData = showPopup(params);
};
