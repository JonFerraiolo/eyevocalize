
import { html, render } from './lib/lit-html/lit-html.js';
import { speak, playAudio, playYoutube } from './vocalize.js';
import { updateStash } from './Stash.js';
import { updateHistory } from './History.js';
import { updateFavorites } from './MyPhrases.js';
import { updateBuiltins } from './MyPhrases.js';
import { updateMain } from './main.js';
import { TextEntryRowSetText, TextEntryRowSetFocus } from './TextEntryRow.js';

let css = `
.Phrases  {
  height: 100%;
  display: flex;
  flex-direction: row;
}
.StashAndHistory, #FavoritesContainer, #BuiltinsContainer {
  min-height: 0px;
  height: 100%;
  display: inline-block;
}
#FavoritesContainer, #BuiltinsContainer {
  overflow-x: hidden;
  overflow-y: auto;
}
.StashAndHistory {
  display: inline-flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
#StashContainer, #HistoryContainer {
  min-height: 25%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
#StashContainer {
  flex: 0 0 auto;
  height: auto;
  max-height: 75%;
}
#HistoryContainer {
  flex: 1 1;
}
.StashContent, .HistoryContent {
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 25%;
}
.StashContent {
  flex: 1 1;
}
.HistoryContent {
  flex: 1 1;
}
#FavoritesContainer {
  flex: 2;
}
#BuiltinsContainer {
  flex: 1;
}
.PhrasesSectionLabel {
  background: #eee;
  font-weight: bold;
  line-height: 1.1;
  text-align: center;
  border: 1px solid black;
  font-size: 0.9em;
}
.PhrasesSectionLabel .collapsearrow, .PhrasesSectionLabel .expandarrow,
    .MyPhrasesCategoryLabel .collapsearrow, .MyPhrasesCategoryLabel .expandarrow,
    .BuiltinsCategoryLabel .collapsearrow, .BuiltinsCategoryLabel .expandarrow {
  padding: 0 0.5em;
  line-height: 50%;
  vertical-align: -50%;
}
.PhrasesSectionLabel .collapsearrow, .MyPhrasesCategoryLabel .collapsearrow {
  vertical-align: 50%;
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
.HistoryContent button, .StashContent button {
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const expandArrowSpan = html`<span class=collapsearrow>&#x2304;</span>`;
const collapseArrowSpan = html`<span class=expandarrow>&#x2303;</span>`;
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
  let { onClickAdd, onClickEdit } = params;
  let add = onClickAdd ? html`<a href="" @click=${onClickAdd} class="rightsideicon addicon"></a>` : '';
  let edit = onClickEdit ? html`<a href="" @click=${onClickEdit} class="rightsideicon editicon"></a>` : '';
  return html`<span class=rightsideicons>${add}${edit}</span>`;
};

export function playPhrase(phrase) {
  let { type } = phrase;
  if (type === 'youtube') {
    playYoutube(phrase);
  } else if (type === 'audio') {
    playAudio(phrase);
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
    updateMain();
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
  let { searchString } = props;
  let searchTokens = (typeof searchString  === 'string') ?
    searchString.toLowerCase().replace(/\s+/g, ' ').trim().split(' ') :
    [];
  let StashProps = { searchTokens };
  let HistoryProps = { searchTokens };
  let MyPhrasesProps = { searchTokens };
  render(html`
  <style>${css}</style>
  <div class=Phrases>
    <div class=StashAndHistory>
      <div id=StashContainer></div>
      <div id=HistoryContainer></div>
    </div>
    <div id=FavoritesContainer></div>
    <div id=BuiltinsContainer></div>
  </div>`, parentElement);
  updateStash(document.getElementById('StashContainer'), StashProps);
  updateHistory(document.getElementById('HistoryContainer'), HistoryProps);
  updateFavorites(document.getElementById('FavoritesContainer'), MyPhrasesProps);
  updateBuiltins(document.getElementById('BuiltinsContainer'), MyPhrasesProps);
}
