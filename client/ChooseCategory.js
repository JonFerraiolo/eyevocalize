
import { html, render } from './lib/lit-html/lit-html.js';
import { getFavorites } from './MyPhrases.js';
import { localization } from './main.js';
import { showPopup, hidePopup } from './popup.js';

let css = `
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

let showPopupReturnData;

export let buildChooseCategoryControl = (parentElement, customControlsData) => {
	let Favorites = getFavorites();
  let { columnIndex, categoryIndex, categoryLabel } = customControlsData;
  let onClickChangeCategory = e => {
    e.preventDefault();
    MyPhrasesChooseCategoryPopupShow(customControlsData);
  }
  if (typeof columnIndex != 'number' || typeof categoryIndex != 'number' ||
    !Number.isInteger(columnIndex) || !Number.isInteger(categoryIndex)) {
    columnIndex = categoryIndex = 0;
  }
  if (columnIndex < 0 || columnIndex >= Favorites.columns.length ||
    categoryIndex < 0 || categoryIndex >= Favorites.columns[columnIndex].categories.length ||
    categoryLabel != Favorites.columns[columnIndex].categories[categoryIndex].label) {
    columnIndex = categoryIndex = 0;
    categoryLabel = Favorites.columns[columnIndex].categories[categoryIndex].label;
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

export let FavoritesChooseCategoryDialog = (parentElement, customControlsData) => {
	let Favorites = getFavorites();
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
    let showPopupReturnDataChooseCategory = customControlsData.getShowPopupReturnData();;
    customControlsData.columnIndex = selCol;
    customControlsData.categoryIndex = selCat;
    customControlsData.categoryLabel = Favorites.columns[selCol].categories[selCat].label;
    hidePopup(showPopupReturnDataChooseCategory, customControlsData);
  };
  let onClickCancel = e => {
    e.preventDefault();
    let showPopupReturnDataChooseCategory = customControlsData.getShowPopupReturnData();;
    hidePopup(showPopupReturnDataChooseCategory, customControlsData);
  };
  let doneWithNewCategoryName = () => {
		if (newCategoryJustCreated === null) {
			return;
		}
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
  let selCol = customControlsData.columnIndex;
  let selCat = customControlsData.categoryIndex;
  let showPopupReturnDataChooseCategory;
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
  let contentFuncParams = Object.assign({}, hideCallbackParams, { getShowPopupReturnData: () => {
    return showPopupReturnData;
  }});
  let params = {
    content: FavoritesChooseCategoryDialog,
    contentFuncParams,
    refNode: document.querySelector('.EditPhraseCustomControls'),
    refY: 'top',
    popupY: 'bottom',
    clickAwayToClose: false,
    underlayOpacity: 0.85,
    hideCallback: hideCallbackParams => {
      render(html``, showPopupReturnData.popupOverlay);
      buildChooseCategoryControl(hideCallbackParams.parentElement, hideCallbackParams);
    },
  };
  showPopupReturnData = showPopup(params);
};
