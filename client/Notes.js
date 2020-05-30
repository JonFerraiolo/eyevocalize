
import { html, render } from './lib/lit-html/lit-html.js';
import { TextEntryRowGetText, TextEntryRowSetText } from './TextEntryRow.js';
import { deleteTemporaryProperties } from './Phrases.js';
import { EditPhrase } from './EditPhrase.js';
import { updateMain, sync, buildSlideRightTitle,
	secondLevelScreenShow, secondLevelScreenHide, thirdLevelScreenShow, thirdLevelScreenHide } from './main.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows } from './Phrases.js';
import { slideInAddFavoriteScreen } from './MyPhrases.js';

let css = `
.NotesTitleIcon {
	display: inline-block;
	width: 1.25em;
	height: 1em;
	margin-right: 0.4em;
	background-image: url('./images/stickynote.svg');
	background-size: 1.25em 1.1em;
	background-position: 0em 10%;
	background-repeat: no-repeat;
}
.editNotes .skinnyScreenChild {
	display: flex;
	flex-direction: column;
}
.editNotes .ScreenInstructions {
	text-align: center;
	font-size: 90%;
}
.editNotesPhraseRows {
	flex: 1;
	overflow: auto;
}
.editNotesNewMyPhrase {
	display: inline-block;
	width: 1.4em;
	height: 1.4em;
	vertical-align: middle;
	background-image: url('./images/heart.svg');
	background-size: 1.75em 1.75em;
	background-position: 50% 40%;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let Notes;
let initialNotes;

function getNotes() {
	let NotesString = localStorage.getItem("Notes");
	try {
		Notes = (typeof NotesString === 'string') ? JSON.parse(NotesString) : initialNotes;
	} catch(e) {
		Notes = initialNotes;
	}
}

export function initializeNotes(props) {
	let { currentVersion } = props;
	initialNotes = { version: currentVersion, timestamp: 0, expanded: true, items: [] };
	getNotes();
	if (typeof Notes.version != 'number'|| Notes.version < currentVersion) {
		Notes = initialNotes;
	}
	localStorage.setItem("Notes", JSON.stringify(Notes));
}

export function NotesGetPending(clientLastSync) {
	if (!Notes.pending) return null;
	delete Notes.pending;
	return Notes.timestamp > clientLastSync ? Notes : null;
}

export function NotesSync(thisSyncServerTimestamp, newData) {
	// get latest data from localStorage in case a different browser window has updated the data in the background
	getNotes();
	if (newData && typeof newData === 'object' && typeof newData.timestamp === 'number' && newData.timestamp > Notes.timestamp) {
		Notes = newData;
		delete Notes.pending;
		// update data in localStorage setting timestamp to the value in newData
		updateLocalStorage({ timestamp: newData.timestamp });
	}
	let event = new CustomEvent("ServerInitiatedSyncNotes", { detail: null } );
	window.dispatchEvent(event);
}

function updateStorage()  {
	updateLocalStorage({ pending: true });
	sync();
}

function updateLocalStorage(overrides) {
	Notes.timestamp = Date.now();
	Notes = Object.assign({}, Notes, overrides || {});
	localStorage.setItem("Notes", JSON.stringify(Notes));
}

// Add phrase to Notes without speaking
export function addToNotes(phrase) {
	Notes.items.unshift(phrase);
	updateStorage();
};

function replaceNotesEntry(index, phrase) {
	Notes.items[index] = Object.assign({}, phrase);
	updateStorage();
};

function traverseItems(aNotes, func) {
	aNotes.items.forEach((item, itIndex) => {
		func(item, aNotes, itIndex);
	});
};

// Add text to Notes without speaking
export function AddTextToNotes(text) {
	text = (typeof text === 'string') ? text : TextEntryRowGetText();
	if (text.length > 0) {
		TextEntryRowSetText('');
		let phrase = { type: 'text', text, timestamp: Date.now() };
		addToNotes(phrase);
		updateMain(null, { Notes:true, History: true });
	}
}

function onNotesChange() {
	updateStorage();
}


function slideInAddEntryToNotesScreen(props) {
	props = props || {};
	let { phrase } = props;
	let params = {
		renderFunc: EditPhrase,
		renderFuncParams: {
			title: 'Add Entry to Notes',
			doItButtonLabel: 'Add Entry',
			doItCallback: function(phrase) {
				// add phrase to Notes, go back to parent screen
				addToNotes(phrase);
				updateMain(null, { Notes:true, History: true });
				secondLevelScreenHide();
			},
			cancelCallback: function() {
				// do nothing, go back to parent screen
				secondLevelScreenHide();
			},
			phrase,
		},
	};
	secondLevelScreenShow(params);
};

let updateNotesFirstTime = true;

export function updateNotes(parentElement, props) {
	if (updateNotesFirstTime) {
		updateNotesFirstTime = false;
		window.addEventListener('ServerInitiatedSyncNotes', function(e) {
			localUpdate();
		});
	}
	let { searchTokens } = props;
	let onClickAdd = e => {
		e.preventDefault();
		slideInAddEntryToNotesScreen();
	};
	let onClickEdit = e => {
		e.preventDefault();
		onEditNotes();
	};
	let NotesTitle = buildTitleWithCollapseExpandArrows(Notes, "Notes", "NotesTitleIcon");
	let localUpdate = () => {
		let filteredNotes = JSON.parse(JSON.stringify(Notes));  // deep clone
		if (searchTokens.length > 0) {
			filteredNotes.items = filteredNotes.items.filter(phrase => {
				return searchTokens.some(token => {
					return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
									(typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
				});
			});
		}
		render(html`
			<div class=PhrasesSectionLabel>
				${NotesTitle}${rightSideIcons({ onClickAdd, onClickEdit })}
			</div>
			${filteredNotes.expanded ?
				html`<div class=NotesContent>
					${filteredNotes.items.map(phrase =>
						html`
							<div class=PhraseRow>
								<button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
							</div>
						`
					)}
				</div>` : ''}
			`, parentElement);
	};
	localUpdate();
}

let editNotesActive = false;

function onEditNotes() {
	editNotesActive = true;
	let renderFuncParams = { };
	secondLevelScreenShow({ renderFunc: editNotes, renderFuncParams });
}

function onEditNotesReturn() {
	editNotesActive = false;
	updateMain(null, { Notes:true, History: true });
	secondLevelScreenHide();
}

let editNotesFirstTime = true;

export function editNotes(parentElement, props) {
	if (editNotesFirstTime) {
		editNotesFirstTime = false;
		window.addEventListener('ServerInitiatedSyncNotes', function(e) {
			if (editNotesActive && parentElement) {
				let NotesContent = parentElement.querySelector('.NotesContent');
				if (NotesContent) {
					initializeSelection();
					localUpdate();
				}
			}
		});
	}
	let lastClickItemIndex = null;
	let onItemClick = e => {
		e.preventDefault();
		let phrase = e.currentTarget.phraseObject;
		let phraseIndex = e.currentTarget.phraseIndex;
		let shift = e.getModifierState("Shift");
		let control = e.getModifierState("Control");
		let meta = e.getModifierState("Meta");
		if (control && !meta && !shift) {
			// t control click is toggle selection for the thing that was clicked on
			phrase.selected = !phrase.selected;
			lastClickItemIndex = phraseIndex;
		} else if (shift && !meta && !control && lastClickItemIndex != null) {
			// shift click is range selection
			localNotes.items.forEach(item => {
				item.selected = false;
			});
			let f = (lastClickItemIndex > phraseIndex) ? phraseIndex : lastClickItemIndex;
			let l = (lastClickItemIndex > phraseIndex) ? lastClickItemIndex : phraseIndex;
			for (let i=f; i<=l; i++) {
				localNotes.items[i].selected = true;
			}
		} else if (!control && !meta && (!shift || lastClickItemIndex === null)) {
			// simple click deselects everything else but the item getting the click
			localNotes.items.forEach(item => {
				item.selected = false;
			});
			phrase.selected = true;
			lastClickItemIndex = phraseIndex;
		}
		localUpdate();
	};
	let onClickSelectAll = e => {
		e.preventDefault();
		localNotes.items.forEach(item => {
			item.selected = true;
		});
		localUpdate();
		lastClickItemIndex = null;
	};
	let onClickDeselectAll = e => {
		e.preventDefault();
		localNotes.items.forEach(item => {
			item.selected = false;
		});
		localUpdate();
		lastClickItemIndex = null;
	};
	let onClickAddItem = e => {
		e.preventDefault();
		let params = {
			renderFunc: EditPhrase,
			renderFuncParams: {
				title: 'Add New Entry To Notes',
				doItButtonLabel: 'Add to Notes',
				doItCallback: function(phrase) {
					// add phrase to Notes, go back to parent screen
					addToNotes(phrase);
					localNotes = JSON.parse(JSON.stringify(Notes));  // deep clone
					initializeSelection();
					localUpdate();
					thirdLevelScreenHide();
					lastClickItemIndex = null;
				},
				cancelCallback: function() {
					// do nothing, go back to parent screen
					thirdLevelScreenHide();
				},
			},
		};
		thirdLevelScreenShow(params);
	};
	let onClickEditItem = e => {
		e.preventDefault();
		let index = localNotes.items.findIndex(phrase => phrase.selected);
		let phrase = Notes.items[index];
		let params = {
			renderFunc: EditPhrase,
			renderFuncParams: {
				phrase,
				title: 'Edit Entry From Notes',
				doItButtonLabel: 'Update Entry',
				doItCallback: function(phrase) {
					// add phrase to Notes, go back to parent screen
					replaceNotesEntry(index, phrase);
					localNotes = JSON.parse(JSON.stringify(Notes));  // deep clone
					localNotes.items[index].selected = true;
					localUpdate();
					thirdLevelScreenHide();
				},
				cancelCallback: function() {
					// do nothing, go back to parent screen
					thirdLevelScreenHide();
				},
			},
		};
		thirdLevelScreenShow(params);
	};
	let onClickRemoveSelected = e => {
		e.preventDefault();
		localNotes.items = localNotes.items.filter(item => !item.selected);
		Notes = JSON.parse(JSON.stringify(localNotes));  // deep clone
		traverseItems(Notes, deleteTemporaryProperties);
		onNotesChange();
		localUpdate();
		lastClickItemIndex = null;
	};
	let onClickAddToMyPhrases = e => {
		e.preventDefault();
		let index = localNotes.items.findIndex(phrase => phrase.selected);
		let phrase = Notes.items[index];
		slideInAddFavoriteScreen({ slideInLevel: 'third', phrase });
	};
	let onClickMoveUp = e => {
		e.preventDefault();
		for (let i=1, n=localNotes.items.length; i<n; i++) {
			let item = localNotes.items[i];
			if (item.selected && !localNotes.items[i-1].selected) {
				[ localNotes.items[i-1], localNotes.items[i] ] = [ localNotes.items[i], localNotes.items[i-1] ];  // swap
			}
		}
		Notes = JSON.parse(JSON.stringify(localNotes));  // deep clone
		traverseItems(Notes, deleteTemporaryProperties);
		onNotesChange();
		localUpdate();
		lastClickItemIndex = null;
	};
	let onClickMoveDown = e => {
		e.preventDefault();
		for (let n=localNotes.items.length, i=n-2; i>=0; i--) {
			let item = localNotes.items[i];
			if (item.selected && !localNotes.items[i+1].selected) {
				[ localNotes.items[i+1], localNotes.items[i] ] = [ localNotes.items[i], localNotes.items[i+1] ];  // swap
			}
		}
		Notes = JSON.parse(JSON.stringify(localNotes));  // deep clone
		traverseItems(Notes, deleteTemporaryProperties);
		onNotesChange();
		localUpdate();
		lastClickItemIndex = null;
	};
	let onClickMoveToTop = e => {
		e.preventDefault();
		for (let n=localNotes.items.length, toPosition=0, fromPosition=1; fromPosition<n; fromPosition++) {
			let toItem = localNotes.items[toPosition];
			let fromItem = localNotes.items[fromPosition];
			if (fromItem.selected && !toItem.selected) {
				localNotes.items.splice(fromPosition, 1);
				localNotes.items.splice(toPosition, 0, fromItem);
			}
			if (localNotes.items[toPosition].selected) {
				toPosition++;
			}
		}
		Notes = JSON.parse(JSON.stringify(localNotes));  // deep clone
		traverseItems(Notes, deleteTemporaryProperties);
		onNotesChange();
		localUpdate();
		lastClickItemIndex = null;
	};
	let onClickMoveToBottom = e => {
		e.preventDefault();
		for (let n=localNotes.items.length, toPosition=n-1, fromPosition=n-2; fromPosition>=0; fromPosition--) {
			let toItem = localNotes.items[toPosition];
			let fromItem = localNotes.items[fromPosition];
			if (fromItem.selected && !toItem.selected) {
				localNotes.items.splice(fromPosition, 1);
				localNotes.items.splice(toPosition, 0, fromItem);
			}
			if (localNotes.items[toPosition].selected) {
				toPosition--;
			}
		}
		Notes = JSON.parse(JSON.stringify(localNotes));  // deep clone
		traverseItems(Notes, deleteTemporaryProperties);
		onNotesChange();
		localUpdate();
		lastClickItemIndex = null;

	};
	let initializeSelection = () => {
		localNotes.items.forEach((item, index) => {
			item.selected = false;
		});
		lastClickItemIndex = null;
	};
	let localUpdate = () => {
		localNotes.items.forEach(item => {
			item.cls = item.selected ? 'selected' : '';
			item.checkmark = item.selected ? html`<span class=checkmark>&#x2714;</span>` : '';
		});
		let enableEditItem = localNotes.items.reduce((accumulator, item) => {
			if (item.selected) {
				accumulator++;
			}
			return accumulator;
		}, 0) === 1;
		let enableAddToMyPhrases = enableEditItem;
		let enableRemoveSelected = localNotes.items.some(item => item.selected);
		let enableMoveUp = localNotes.items.some((item, index, arr) =>
			item.selected && (index > 0 && !arr[index-1].selected));
		let enableMoveDown = localNotes.items.some((item, index, arr) =>
			item.selected && (index < arr.length-1 && !arr[index+1].selected));
		render(html`
		<div class="Notes editNotes skinnyScreenParent">
			<div class=skinnyScreenChild>
				${buildSlideRightTitle("Manage Notes", onEditNotesReturn)}
				<div class=ScreenInstructions>
					(Click to select, control-click to toggle, shift-click for range)
				</div>
				<div class=editNotesPhraseRows>
					${localNotes.items.map((phrase, index) => {
						return html`
							<div class=PhraseRow>
								<button @click=${onItemClick} .phraseObject=${phrase} .phraseIndex=${index} class=${phrase.cls}>
									${phrase.checkmark}
									${phrase.label || phrase.text}</button>
							</div>
						`;
					})}
				</div>
				<div class=SelectLinksRow>
					<a href="" @click=${onClickSelectAll}>Select All</a>
					<a href="" @click=${onClickDeselectAll}>Deselect All</a>
				</div>
				<div class=ButtonRow>
				<button @click=${onClickAddItem}
					title="Add a new item to the top of the list">New</button>
				<button @click=${onClickEditItem} ?disabled=${!enableEditItem}
					title="Edit the selected item">Edit</button>
					<button @click=${onClickRemoveSelected} ?disabled=${!enableRemoveSelected}
						title="Delete selected items">Delete</button>
					<button @click=${onClickAddToMyPhrases} ?disabled=${!enableAddToMyPhrases}
						title="Make selected item into a favorite">
						<span class=editNotesNewMyPhrase></span></button>
					<button @click=${onClickMoveUp} ?disabled=${!enableMoveUp}
						title="Move selected items up one position">
						<span class="arrowButton uparrow"></span></button>
					<button @click=${onClickMoveDown} ?disabled=${!enableMoveDown}
						title="Move selected items down one position">
						<span class="arrowButton downarrow"></span></button>
					<button @click=${onClickMoveToTop} ?disabled=${!enableMoveUp}
						title="Move selected items to the start of the list">
						<span class="arrowButton uparrowbar"></span></button>
					<button @click=${onClickMoveToBottom} ?disabled=${!enableMoveDown}
						title="Move selected items to the end of the list">
						<span class="arrowButton downarrowbar"></span></button>
				</div>
			</div>
		</div>`, parentElement);
	};
	let localNotes = JSON.parse(JSON.stringify(Notes));  // deep clone
	initializeSelection();
	localUpdate();
}
