
import { html, render } from './lib/lit-html/lit-html.js';
import { getFavorites, traverseColumnsCategoriesItems } from './MyPhrases.js';
import { localization } from './main.js';
import { showPopup, hidePopup } from './popup.js';
import { buildChooseCategoryControl } from './ChooseCategory.js';
import { playPhrase } from './Phrases.js';

let css = `
.ImportFavorites {
  background: white;
  border: 2px solid black;
  padding: 0.25em 1.5em;
  font-size: 80%;
}
.ImportFavoritesTitle {
	font-size: 1.1em;
  font-weight: 700;
  padding: 0.6em 0;
  text-align: center;
}
/* grid columns:
	collection checkbox, item checkbox, item label, item text or YouTube: videoId, target
	collection row: checkbox, expand/collapse, span=3:collection name, target
	item row: empty, empty, checkbox, item label, span=2:item text/videoId+play
*/
.ImportFavoritesData {
	display: grid;
	grid-template-columns: 1.5em 1.25em 1.5em 1fr 3fr auto;
}
.ImportFavoritesData > * {
	display: contents; /* the grid should ignore the DIV surrounding each row */
	grid-column-start: 1;
  grid-column-end: 7;
}
.ImportFavoritesCollectionLabel {
	grid-column-start: 3;
	grid-column-end: 6;
}
.ImportFavoritesItemInitialEmpty {
	grid-column-start: 1;
	grid-column-end: 3;
}
.ImportFavoritesItemDetail {
	grid-column-start: 5;
	grid-column-end: 7;
	display: grid;
	grid-template-columns:  1fr auto;
}
.ImportFavoritesCollectionRow.selected, .ImportFavoritesItemRow.selected {
	font-weight: bold;
}
.ImportFavoritesCollectionRow.imported, .ImportFavoritesItemRow.imported {
	text-decoration: line-through;
}
.ImportFavoritesCollectionExpandCollapse {
	text-align: center;
}
.ImportFavoritesItemCheckbox {
	margin-left: -0.3em;
}
.ImportFavoritesCollectionTarget {
	white-space: nowrap;
}
.ImportFavoritesCollectionTarget button {
	white-space: nowrap;
	width: 9em;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: left;
	padding: 0.1em 0.1em;
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

let ImportFavoritesDialog = (parentElement, customControlsData) => {
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
	let onClickCollectionTarget = e => {
		e.preventDefault();
	};
	let onClickItemRow = e => {
		e.preventDefault();
		let item = data[e.currentTarget.CollectionIndex].items[e.currentTarget.ItemIndex];
		if (!item.alreadyImported) {
			item.selected = !item.selected;
			localUpdate();
		}
	};
	let onClickPlay = e => {
		e.preventDefault();
		e.stopPropagation();
		let item = data[e.currentTarget.CollectionIndex].items[e.currentTarget.ItemIndex];
		playPhrase(item) ;
	};
	let onClickSelectAll = e => {
		e.preventDefault();
		data.forEach(collection => {
			selectCollection(collection);
		});
		localUpdate();
	};
	let onClickDeselectAll = e => {
		e.preventDefault();
		data.forEach(collection => {
			deselectCollection(collection);
		});
		localUpdate();
	};
	let onClickExpandAll = e => {
		e.preventDefault();
		data.forEach(collection => {
			collection.expanded = true;
		});
		localUpdate();
	};
	let onClickCollapseAll = e => {
		e.preventDefault();
		data.forEach(collection => {
			collection.expanded = false;
		});
		localUpdate();
	};
  let onClickDoit = e => {
    e.preventDefault();
    hidePopup(showPopupReturnData, customControlsData);
		let Favorites = getFavorites();
		data.forEach(collection => {
			let columnIndex = collection.column;
			if (isNaN(columnIndex) || !Number.isInteger(columnIndex) || columnIndex < 1 || columnIndex > Favorites.columns.length) {
				return;
			}
			columnIndex--;
			let column = Favorites.columns[columnIndex];
			let targetCategory = collection.category;
			if (typeof targetCategory !== 'string' || targetCategory.length === 0) {
				return;
			}
			let categoryIndex = column.categories.findIndex(category => category.label === targetCategory);
			collection.items.forEach(item => {
				if (item.selected) {
					if (categoryIndex === -1) {
						categoryIndex = column.categories.length;
						column.categories.push({ label: targetCategory, expanded: true,  items: [] });
					}
					column.categories[categoryIndex].items.push(item);
				}
			});
		});
		cleanUpCandidates();
		customControlsData.doItCallback();
  };
  let onClickCancel = e => {
    e.preventDefault();
    hidePopup(showPopupReturnData, customControlsData);
		cleanUpCandidates();
		customControlsData.cancelCallback();
  };
	let cleanUpCandidates = () => {
		//  remove all candidate categories that are empty, delete candidate property
		let Favorites = getFavorites();
		Favorites.columns.forEach(column => {
			let categories = column.categories;
			for (let i=categories.length-1; i--; i>=0) {
				let category = categories[i];
				if (category.ifCandidate) {
					if (category.items.length === 0) {
						categories.splice(i, 1);
					} else {
						delete category.ifCandidate;
					}
				}
			}
		});
	};
	let prepareNewData = originalData => {
		let Favorites = getFavorites();
		let tempData = JSON.parse(JSON.stringify(originalData)); // deep clone
		tempData.forEach(collection => {
			collection.expanded = false;
			collection.selected = false;
			collection.indeterminate = false;
			let anyNotYetImported = false;
			collection.items.forEach(item => {
				item.selected = false;
				let anyMatches = false;
				traverseColumnsCategoriesItems(Favorites, itm => {
					if (itm.type === 'text' && item.type === 'text' &&
						itm.label === item.label && itm.text === item.text) {
						anyMatches = true;
					} else if (itm.type === 'youtube' && item.type === 'youtube' &&
						itm.label === item.label && itm.videoId === item.videoId &&
						itm.startAt === item.startAt && itm.endAt === item.endAt) {
							anyMatches = true;
						}
				});
				item.alreadyImported = anyMatches;
				if (!anyMatches) {
					anyNotYetImported = true;
				}
			});
			collection.alreadyImported = !anyNotYetImported;
		});
		// Add candidate categories for any collections that don't target an existing category
		tempData.forEach(collection => {
			let colIndex = collection.column;
			if (isNaN(colIndex) || !Number.isInteger(colIndex) || colIndex < 1 || colIndex > Favorites.columns.length) {
				colIndex = collection.column = 1;
			}
			let catIndex = Favorites.columns[colIndex-1].categories.findIndex(category => category.label === collection.category);
			if (catIndex === -1) {
				Favorites.columns[colIndex-1].categories.push({ label: collection.category, expanded: true, ifCandidate: true, items: [] });
			}
		});
		let returnData = [];
		tempData.forEach(collection => {
			if (!collection.alreadyImported) {
				let newItems = collection.items.filter(item => !item.alreadyImported);
				collection.items = newItems;
				returnData.push(collection);
			}
		});
		return returnData;
	};
	let urlData = null;
	let localData = null;
	let fromIndex = 0;
	let fromValue = 'EyeVocalize.com';
	let builtinsData = prepareNewData(localization.builtinFavoritesCollections);
	let data = builtinsData;
  let localUpdate = () => {
		let Favorites = getFavorites();
		let SelectAll = localization.common['Select all'];
		let DeselectAll = localization.common['Deselect all'];
		let ExpandAll = localization.common['Expand all'];
		let CollapseAll = localization.common['Collapse all'];
		render(html`<div class=ImportFavorites>
			<div class=ImportFavoritesTitle>${localization.ImportFavorites['Import Favorites']}</div>
			<div class=ImportFavoritesTopControlsRow>
				<label for="#ImportFavoritesFromSelect">${localization.common['From']}:</label>
				<select @change=${onChangeFrom} id=ImportFavoritesFromSelect>
					<option value="EyeVocalize.com">EyeVocalize.com</option>
					<option value="URL">URL</option>
					<option value="local file">${localization.common['local file']}</option>
				</select>
			</div>
			<div class=ImportFavoritesInstructions>${localization.ImportFavorites['instructions']}</div>
			<div class=ImportFavoritesData>
				${data.map((collection, collectionIndex) => {
					let triangle = collection.expanded ? html`&#x25bc;` : html`&#x25b6;`; // &#x25bc; Down &#x25b6; Right
					let collectionClass = "ImportFavoritesCollectionRow" +
						(collection.selected ? " selected" : "") + (collection.alreadyImported ? " imported" : "");
					return html`
						<div class=${collectionClass} @click=${onClickCollectionRow} .CollectionIndex=${collectionIndex}>
							<label class=ImportFavoritesCollectionCheckbox>
								<input .CollectionIndex=${collectionIndex} type=checkbox></input>
							</label>
							<span class=ImportFavoritesCollectionExpandCollapse .CollectionIndex=${collectionIndex} @click=${onClickExpandCollapse}>${triangle}</span>
							<span class=ImportFavoritesCollectionLabel>${collection.label}</span>
							<span class=ImportFavoritesCollectionTarget .CollectionIndex=${collectionIndex}></span>
						</div>
						${(() => { // using funky (func)() to create an expression out of func
							if (collection.expanded) {
								return html`
									${collection.items.map((item, itemIndex) => {
										let itemClass = "ImportFavoritesItemRow" +
											(item.selected ? " selected" : "") + (item.alreadyImported ? " imported" : "");
										return html`
											<div class=${itemClass} .CollectionIndex=${collectionIndex} .ItemIndex=${itemIndex} @click=${onClickItemRow}>
												<span class=ImportFavoritesItemInitialEmpty></span>
												<label class=ImportFavoritesItemCheckbox>
													<input .CollectionIndex=${collectionIndex} .ItemIndex=${itemIndex} type=checkbox></input>
												</label>
												<span class=ImportFavoritesItemLabel>${item.label}</span>
												<span class=ImportFavoritesItemDetail>
													${item.type === 'youtube' ? 'youtube:'+item.videoId : item.text}
													<button class=ImportFavoritesItemPlay .CollectionIndex=${collectionIndex} .ItemIndex=${itemIndex} @click=${onClickPlay}>
														${localization.ImportFavorites['Play']}
													</button>
												</span>
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
			<div class=ImportFavoritesSelectExpandRow>
				<a href="" title=${SelectAll} @click=${onClickSelectAll}>${SelectAll}</a>
				<a href="" title=${DeselectAll} @click=${onClickDeselectAll}>${DeselectAll}</a>
				<a href="" title=${ExpandAll} @click=${onClickExpandAll}>${ExpandAll}</a>
				<a href="" title=${CollapseAll} @click=${onClickCollapseAll}>${CollapseAll}</a>
			</div>
			<div class=ImportFavoritesButtonRow>
				<button @click=${onClickDoit} class=ImportFavoritesDoitButton>${localization.ImportFavorites['Import Favorites']}</button>
				<button @click=${onClickCancel} class=ImportFavoritesCancelButton>${localization.common['Cancel']}</button>
			</div>
		</div>`, parentElement);
		parentElement.querySelectorAll('.ImportFavoritesCollectionTarget').forEach(targetSpan => {
			let collectionIndex = targetSpan.CollectionIndex;
			let collection = data[collectionIndex];
			let columnIndex = collection.column-1;
			if (columnIndex < 0 || columnIndex >= Favorites.columns.length) columnIndex = 0;
			let categoryLabel = collection.category;
			let categoryIndex = Favorites.columns[columnIndex].categories.findIndex(category => category.label === categoryLabel);
			let customControlsData = { columnIndex, categoryIndex, categoryLabel };
			render(html`
				<button .CollectionIndex=${collectionIndex} @click=${onClickCollectionTarget}>
					(${columnIndex+1}) ${categoryLabel}
				</button>
			`, targetSpan);
		});
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
