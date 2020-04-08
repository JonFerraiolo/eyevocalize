
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
.ImportFavoritesItemInitialEmpty {
	grid-column-start: 1;
	grid-column-end: 3;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let showPopupReturnData;

let ImportFavoritesDialog = (parentElement, customControlsData) => {
	let Favorites = getFavorites();
	let onChangeFrom = e => {
		e.preventDefault();
		fromIndex = e.currentTarget.selectedIndex;
		fromValue = e.currentTarget.value;
	};
	let onClickExpandCollapse = e => {
		e.preventDefault();
		e.stopPropagation();
		let collection = data[e.currentTarget.CollectionIndex];
		collection.expanded = !collection.expanded;
		localUpdate();
	};
	let setSelectionCollection = (collection, bool) => {
		if (!collection.alreadyImported) {
			collection.selected = bool;
			collection.items.forEach(item => {
				if (!item.alreadyImported) {
					item.selected = bool;
				}
			});
		}
	};
	let selectCollection = collection => {
		setSelectionCollection(collection, true);
	};
	let deselectCollection = collection => {
		setSelectionCollection(collection, false);
	};
	let onClickCollectionRow = e => {
		e.preventDefault();
		let collection = data[e.currentTarget.CollectionIndex];
		if (!collection.alreadyImported) {
			if (collection.selected) {
				deselectCollection(collection);
			} else {
				selectCollection(collection);
			}
			localUpdate();
		}
	};
	let onClickItemRow = e => {
		e.preventDefault();
		let item = data[e.currentTarget.CollectionIndex].items[e.currentTarget.ItemIndex];
		if (!item.alreadyImported) {
			item.selected = !item.selected;
			localUpdate();
		}
	};
	let onClickSelectAll = e => {
		e.preventDefault();
		data.forEach(collection => {
			selectCollection(collection);
		});
		localUpdate();
	};
  let onClickDoit = e => {
    e.preventDefault();
    hidePopup(showPopupReturnData, customControlsData);
		customControlsData.doItCallback();
  };
  let onClickCancel = e => {
    e.preventDefault();
    hidePopup(showPopupReturnData, customControlsData);
		customControlsData.cancelCallback();
  };
	let initializeData = ()  => {
		let prepareNewData = () => {
			data.forEach(collection => {
				collection.expanded = false;
				collection.selected = false;
				collection.indeterminate = false;
				collection.items.forEach(item => {
					item.selected = false;
				});
			});
		};
		if (fromValue === 'EyeVocalize.com') {
			if (builtinsData === null) {
				builtinsData = JSON.parse(JSON.stringify(localization.builtinFavoritesCollections)); // deep clone
				data = builtinsData;
				prepareNewData();
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
						<div class=ImportFavoritesCollectionRow @click=${onClickCollectionRow} .CollectionIndex=${collectionIndex}>
							<label class=ImportFavoritesCollectionCheckbox>
								<input .CollectionIndex=${collectionIndex} type=checkbox></input>
							</label>
							<span class=ImportFavoritesCollectionExpandCollapse .CollectionIndex=${collectionIndex} @click=${onClickExpandCollapse}>${triangle}</span>
							<span class=ImportFavoritesCollectionLabel>${collection.label}</span>
							<span class=ImportFavoritesCollectionDesc>${collection.desc}</span>
							<span class=ImportFavoritesCollectionTarget>${target}</span>
						</div>
						${(() => { // using funky (func)() to create an expression out of func
							if (collection.expanded) {
								return html`
									${collection.items.map((item, itemIndex) => {
										return html`
											<div class=ImportFavoritesItemRow .CollectionIndex=${collectionIndex} .ItemIndex=${itemIndex} @click=${onClickItemRow}>
												<span class=ImportFavoritesItemInitialEmpty></span>
												<label class=ImportFavoritesItemCheckbox>
													<input .CollectionIndex=${collectionIndex} .ItemIndex=${itemIndex} type=checkbox></input>
												</label>
												<span class=ImportFavoritesItemLabel>${item.label}</span>
												<span class=ImportFavoritesItemDetail>${item.text}</span>
												<span class=ImportFavoritesItemPlay>${target}</span>
											</div>
										`;
									})}
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
		setTimeout(() => {
			document.getElementById('ImportFavoritesFromSelect').selectedIndex = fromIndex;
			parentElement.querySelectorAll('.ImportFavoritesCollectionCheckbox > input').forEach(checkboxElem => {
				let collectionIndex = checkboxElem.CollectionIndex;
				checkboxElem.checked = data[collectionIndex].selected;
				checkboxElem.indeterminate = data[collectionIndex].indeterminate;
			});
			parentElement.querySelectorAll('.ImportFavoritesItemCheckbox > input').forEach(checkboxElem => {
				let collectionIndex = checkboxElem.CollectionIndex;
				let itemIndex = checkboxElem.ItemIndex;
				checkboxElem.checked = data[collectionIndex].items[itemIndex].selected;
			});
		}, 0);
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
