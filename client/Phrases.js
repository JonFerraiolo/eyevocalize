
import { html, render } from './lib/lit-html/lit-html.js';
import { speak, playYoutube } from './vocalize.js';
import { updateNotes } from './Notes.js';
import { updateHistory } from './History.js';
import { updateFavorites } from './MyPhrases.js';
import { updateMain } from './main.js';
import { TextEntryRowSetText, TextEntryRowSetFocus } from './TextEntryRow.js';

let css = `
.Phrases  {
	height: 100%;
	display: flex;
	flex-direction: row;
}
.NotesAndHistory, #FavoritesContainer {
	min-height: 0px;
	height: 100%;
	display: inline-block;
}
#FavoritesContainer {
	overflow-x: hidden;
	overflow-y: auto;
}
.NotesAndHistory {
	display: inline-flex;
	flex-direction: column;
	flex: 1;
	overflow: hidden;
}
#NotesContainer, #HistoryContainer {
	min-height: 25%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
#NotesContainer {
	flex: 0 0 auto;
	height: auto;
	max-height: 75%;
}
#HistoryContainer {
	flex: 1 1;
}
.NotesContent, .HistoryContent {
	overflow-x: hidden;
	overflow-y: auto;
	min-height: 25%;
}
.NotesContent {
	flex: 1 1;
}
.HistoryContent {
	flex: 1 1;
}
#FavoritesContainer {
	flex: 3;
}
.PhrasesSectionLabel {
	background: #eee;
	font-weight: bold;
	line-height: 1.1;
	text-align: center;
	border: 1px solid black;
	font-size: 0.9em;
}
#NotesContainer .PhrasesSectionLabel {
	background: var(--notes_bar_background_color);
}
#HistoryContainer .PhrasesSectionLabel {
	background: var(--history_bar_background_color);
}
#FavoritesContainer .PhrasesSectionLabel {
	background: var(--favorites_bar_background_color);
}
.PhrasesSectionLabel .collapsearrow, .PhrasesSectionLabel .expandarrow,
		.MyPhrasesCategoryLabel .collapsearrow, .MyPhrasesCategoryLabel .expandarrow,
				.Help .collapsearrow, .Help .expandarrow {
	padding: 0 0.5em;
	line-height: 50%;
	vertical-align: 50%;
}
.PhrasesSectionLabel .collapsearrow, .MyPhrasesCategoryLabel .collapsearrow, .Help .collapsearrow {
	vertical-align: -50%;
}
.PhrasesSectionLabel a, .PhrasesSectionLabel a:link, .PhrasesSectionLabel a:visited {
	text-decoration: none;
	cursor: pointer;
	color: black;
}
.PhraseRow {
	display: flex;
	padding: 0 6.5%;
	text-align: left;
}
.PhraseRow button {
	text-align: left;
}
.skinnyScreenChild .PhraseRow {
	padding: 0 1.5em;
}
.HistoryContent button, .NotesContent button {
	text-align: left;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	border-radius: 3px;
	padding: 0.15em 0.25em;
	color: black;
	margin: 1px 0;
}
.HistoryContent button {
	background: #fffdfa;
	border: 1px solid #440;
}
.NotesContent button {
	background: #fdfdff;
	border: 1px solid #004;
}
.rightsideicons {
	float: right;
	padding-right: 0.25em;
}
.rightsideicon, .rightsideicon:link, .rightsideicon:visited {
	display: inline-block;
	text-decoration: none;
	background-size: contain;
	background-repeat: no-repeat;
	padding: 0 0.6em;
}
.rightsideicon.import {
	background-image: url(images/import.svg);
	width: 1em;
	height: 1em;
	background-size: 0.8em 0.8em;
	vertical-align: middle;
	margin-right: 0.25em;
}
.rightsideicon.addicon {
	background-image: url(images/addicon.svg);
	width: 0.75em;
	height: 0.75em;
	vertical-align: 0%;
	padding-right: 0.55em;
}
.rightsideicon.editicon {
	background-image: url(images/editicon.svg);
	width: 1em;
	height: 1em;
	vertical-align: top;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

const expandArrowSpan = html`<span class=expandarrow>&#x2304;</span>`;
const collapseArrowSpan = html`<span class=collapsearrow>&#x2303;</span>`;
const phrasePermanentProps = ['type', 'text', 'label', 'url', 'videoId',
	'startAt', 'endAt',' timestamp'];

export function deleteTemporaryProperties(phrase) {
	Object.keys(phrase).forEach(key => {
		if (!phrasePermanentProps.includes(key))  {
			delete phrase[key];
		}
	});
};

export function rightSideIcons(params) {
	let { onClickImport, onClickAdd, onClickEdit } = params;
	let imp = onClickImport ? html`<a href="" @click=${onClickImport} class="rightsideicon import"></a>` : '';
	let add = onClickAdd ? html`<a href="" @click=${onClickAdd} class="rightsideicon addicon"></a>` : '';
	let edit = onClickEdit ? html`<a href="" @click=${onClickEdit} class="rightsideicon editicon"></a>` : '';
	return html`<span class=rightsideicons>${imp}${add}${edit}</span>`;
};

export function playPhrase(phrase) {
	let { type } = phrase;
	if (type === 'youtube') {
		playYoutube(phrase);
	} else {
		let { text } = phrase;
		speak(text);
	}
};

export function onPhraseClick(e) {
	let shift = e.getModifierState("Shift");
	let control = e.getModifierState("Control");
	let meta = e.getModifierState("Meta");
	let phrase = e.target.phraseObject;
	let { type, text, label, url } = phrase;
	if (!shift && (control || meta)) {
		TextEntryRowSetText(type==='text' ? text : label );
		TextEntryRowSetFocus();
	} else if (!shift && !control && !meta) {
		playPhrase(phrase);
		updateMain(null, { Notes:true, History: true });
	}
};

let toggleCollapseExpand = e => {
	e.preventDefault();
	let obj = e.currentTarget.objToToggle;
	obj.expanded = !obj.expanded;
	updateMain();
};

export function buildTitleWithCollapseExpandArrows(obj, title, iconClass) {
	let arrow = obj.expanded ? collapseArrowSpan : expandArrowSpan;
	let icon = iconClass ? html`<span class="${iconClass}"></span>` : '';
	return html`<a href="" @click=${toggleCollapseExpand} .objToToggle=${obj}>${icon}${title}${arrow}</a>`;
};

export function updatePhrases(parentElement, props) {
	let { searchString, updateWhat } = props;
	updateWhat = updateWhat || { Notes: true, History: true, Favorites: true };
	let searchTokens = (typeof searchString  === 'string') ?
		searchString.toLowerCase().replace(/\s+/g, ' ').trim().split(' ') :
		[];
	let NotesProps = { searchTokens };
	let HistoryProps = { searchTokens };
	let MyPhrasesProps = { searchTokens };
	render(html`
	<div class=Phrases>
		<div class=NotesAndHistory>
			<div id=NotesContainer></div>
			<div id=HistoryContainer></div>
		</div>
		<div id=FavoritesContainer></div>
	</div>`, parentElement);
	if (updateWhat.Notes) {
		updateNotes(document.getElementById('NotesContainer'), NotesProps);
	}
	if (updateWhat.History) {
		updateHistory(document.getElementById('HistoryContainer'), HistoryProps);
	}
	if (updateWhat.Favorites) {
		updateFavorites(document.getElementById('FavoritesContainer'), MyPhrasesProps);
	}
}

export function PhrasesAddDelSync(thisSyncServerTimestamp, updates, Phrases, PhrasesPendingDeletions, PhrasesPendingAdditions) {
	if (updates) {
		let { deletions, additions } = updates;
		if (!Array.isArray(deletions)) deletions = [];
		if (!Array.isArray(additions)) additions = [];
		let PhrasesIndex = {};
		Phrases.items.forEach((item, i) => {
			PhrasesIndex[item.timestamp] = item.timestamp;
		});
		deletions.sort((a, b) => a.timestamp - b.timestamp); // most recent last
		additions.sort((a, b) => a.timestamp - b.timestamp); // most recent last
		PhrasesPendingDeletions.sort((a, b) => a.timestamp - b.timestamp); // most recent last
		PhrasesPendingAdditions.sort((a, b) => a.timestamp - b.timestamp); // most recent last
		let PhrasesPendingDeletionsIndex = {};
		PhrasesPendingDeletions.forEach((item, i) => {
			PhrasesPendingDeletionsIndex[item.timestamp] = i;
		});
		let PhrasesPendingAdditionsIndex = {};
		PhrasesPendingAdditions.forEach((item, i) => {
			PhrasesPendingAdditionsIndex[item.timestamp] = i;
		});
		additions.forEach((item) => {
			if (typeof PhrasesIndex[item.timestamp] !== 'number') {
				try {
					Phrases.items.unshift(item);
					PhrasesIndex[item.timestamp] = item.timestamp;
				} catch(e) {
					console.error('exception in PhrasesAddDelSync. e='+e);
				}
			}
		});
		let DeletionsIndex = {};
		deletions.forEach(item => {
			DeletionsIndex[item.timestamp] = item;
		});
		for (let i = Phrases.items.length-1; i>=0; i--) {
			let phrase = Phrases.items[i];
			if (DeletionsIndex[phrase.timestamp]) {
				Phrases.items.splice(i, 1);
			}
		}
		Phrases.items.sort((a, b) => b.timestamp - a.timestamp); // most recent first
		for (let i = deletions.length-1; i>=0; i--) {
			let phrase = deletions[i];
			let index = PhrasesPendingDeletionsIndex[phrase.timestamp];
			if (typeof index === 'number') {
				PhrasesPendingDeletions.splice(index, 1);
			}
		}
		for (let i = additions.length-1; i>=0; i--) {
			let phrase = additions[i];
			let index = PhrasesPendingAdditionsIndex[phrase.timestamp];
			if (typeof index === 'number') {
				PhrasesPendingAdditions.splice(index, 1);
			}
		}
	}
	return { Phrases, PhrasesPendingDeletions, PhrasesPendingAdditions };
}
