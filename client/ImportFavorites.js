
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

/* grid columns:
	collection checkbox, item checkbox, item label, item text or YouTube: videoId, target/Test
	collection row: checkbox, span=3:collection name - desc, target
	item row: empty, checkbox, item label, item text, Test
*/
.ImportFavoritesData {
	display: grid;
	grid-template-columns: 1.5em 1.5em 1.5em 1fr 3fr 5em;
}
.ImportFavoritesData > * {
	display: contents; /* the grid should ignore the DIV surrounding each row */
	grid-column-start: 1;
  grid-column-end: 7;
}
.ImportFavoritesCollectionLabel {
	grid-column-start: 3;
	grid-column-end: 5;
}
.ImportFavoritesNoItemsSelected {
	grid-column-start: 1;
	grid-column-end: 7;
	text-align: center;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let showPopupReturnData;

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
	let onChangeFrom = e => {
		e.preventDefault();
		fromIndex = e.currentTarget.selectedIndex;
		fromValue = e.currentTarget.value;
	};
	let onClickExpandCollapse = e => {
		e.preventDefault();
		let collection = data[e.currentTarget.CollectionIndex];
		collection.expanded = !collection.expanded;
		localUpdate();
	};
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
	let initializeData = ()  => {
		let initializeExpanded = () => {
			data.forEach(collection => {
				collection.expanded = false;
			});
		};
		if (fromValue === 'EyeVocalize.com') {
			if (builtinsData === null) {
				builtinsData = JSON.parse(JSON.stringify(localization.builtinFavoritesCollections)); // deep clone
				data = builtinsData;
				initializeExpanded();
			} else {
				data = builtinsData;
			}
		}
	};
	let fromIndex = 0;
	let fromValue = 'EyeVocalize.com';
	let builtinsData = null;
	let data;
	initializeData();
  let localUpdate = () => {
		render(html`<div class=ImportFavorites>
			<div class=ImportFavoritesTitle>${localization.ImportFavorites['Import Favorites']}</div>
			<div class=ImportFavoritesInstructions>${localization.ImportFavorites['instructions']}</div>
			<div class=ImportFavoritesTopControlsRow>
				<label for="#ImportFavoritesFromSelect">${localization.common['From']}:</label>
				<select @change=${onChangeFrom} id=ImportFavoritesFromSelect>
					<option value="EyeVocalize.com">EyeVocalize.com</option>
					<option value="URL">URL</option>
					<option value="local file">${localization.common['local file']}</option>
				</select>
			</div>
			<div class=ImportFavoritesData>
				${data.map((collection, collectionIndex) => {
					let target = 'target';
					let triangle = collection.expanded ? html`&#x25bc;` : html`&#x25b6;`; // &#x25bc; Down &#x25b6; Right
					return html`
						<div class=ImportFavoritesCollectionRow>
							<span class=ImportFavoritesCollectionCheckbox><input type=checkbox></input></span>
							<span class=ImportFavoritesCollectionExpandCollapse .CollectionIndex=${collectionIndex} @click=${onClickExpandCollapse}>${triangle}</span>
							<span class=ImportFavoritesCollectionLabel>${collection.label}</span>
							<span class=ImportFavoritesCollectionDesc>${collection.desc}</span>
							<span class=ImportFavoritesCollectionTarget>${target}</span>
						</div>
						${(() => { // using funky (func)() to create an expression out of func
							if (collection.expanded) {
								return html`
									<div class=ImportFavoritesNoItemsSelectedRow>
										<span class=ImportFavoritesNoItemsSelected>No items selected</span>
									</div>
								`;
							} else {
								return '';
							}
						})()}
					`;
				})}
			</div>
			<div class=ImportFavoritesButtonRow>
				<button @click=${onClickDoit} class=ImportFavoritesDoitButton>${localization.ImportFavorites['Import Favorites']}</button>
				<button @click=${onClickCancel} class=ImportFavoritesCancelButton>${localization.common['Cancel']}</button>
			</div>
		</div>`, parentElement);
		document.getElementById('ImportFavoritesFromSelect').selectedIndex = fromIndex;
	};
	localUpdate();

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
