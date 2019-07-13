
import { html, render } from 'https://unpkg.com/lit-html?module';
import { speak, playAudio, playYoutube } from './vocalize.js';
import { updateStash } from './Stash.js';
import { updateHistory } from './History.js';
import { updateFavorites } from './Favorites.js';
import { updateMain } from './main.js';
import { TextEntryRowSetText, TextEntryRowSetFocus } from './TextEntryRow.js';

let css = `
.Phrases  {
  height: 100%;
  display: flex;
  flex-direction: row;
}
.StashAndHistory, #FavoritesContainer {
  flex: 1;
  overflow: auto;
  min-height: 0px;
  height: 100%;
  display: inline-block;
}
.PhrasesSectionLabel {
  background: #eee;
  font-weight: bold;
  line-height: 1.1;
  text-align: center;
  border: 1px solid black;
}
.PhrasesSectionLabel .collapsearrow, .PhrasesSectionLabel .expandarrow,
    .FavoritesCategoryLabel .collapsearrow, .FavoritesCategoryLabel .expandarrow {
  padding: 0 0.5em;
  line-height: 50%;
  vertical-align: -50%;
}
.PhrasesSectionLabel .collapsearrow, .FavoritesCategoryLabel .collapsearrow {
  vertical-align: 50%;
}
.PhrasesSectionLabel a, .PhrasesSectionLabel a:link, .PhrasesSectionLabel a:visited {
  text-decoration: none;
  cursor: pointer;
  color: black;
}
.PhraseRow {
  display: flex;
  padding: 0 5em;
}
.skinnyScreenChild .PhraseRow {
  padding: 0 1.5em;
}
.Stash .PhrasesSectionLabel {
  border-right: none;
}
.History button, .Stash button {
  text-align: left;
}
.rightsideicons {
  float: right;
  padding-right: 0.25em;
}
.editicon, .editicon:link, .editicon:visited, .helpicon, .helpicon:link, .helpicon:visited {
  display: inline-block;
  text-decoration: none;
  background-size: contain;
  background-repeat: no-repeat;
  padding: 0 0.6em;
}
.editicon {
  background-image: url(images/editicon.svg);
  width: 1em;
  height: 1em;
  vertical-align: top;
}
.helpicon {
  background-image: url(images/helpicon.svg);
  width: 0.75em;
  height: 0.75em;
  vertical-align: 0%;
}
`;

const expandArrowSpan = html`<span class=collapsearrow>&#x2304;</span>`;
const collapseArrowSpan = html`<span class=expandarrow>&#x2303;</span>`;

export function cloneOnlyPermanentProperties(localStash) {
  let newStash = JSON.parse(JSON.stringify(localStash));  // deep clone
  newStash.items = newStash.items.map(item => {
    return { type: item.type, text: item.text, label: item.label, url: item.url,
      videoId: item.videoId, startAt: item.startAt, endAt: item.endAt,
      timestamp: item.timestamp };
  });
  return newStash;
};

export function rightSideIcons(onEdit, onHelp) {
  return html`<span class=rightsideicons
  ><a href="" @click=${onEdit} class=editicon></a
  ><a href="" @click=${onHelp} class=helpicon></a
  ></span>`;
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
    if (type === 'youtube') {
      playYoutube(phrase);
    } else if (type === 'audio') {
      playAudio(phrase);
    } else {
      speak(text);
    }
    updateMain();
  }
};

let toggleCollapseExpand = e => {
  e.preventDefault();
  let obj = e.currentTarget.objToToggle;
  obj.expanded = !obj.expanded;
  updateMain();
};

export function buildTitleWithCollapseExpandArrows(obj, title) {
  let arrow = obj.expanded ? collapseArrowSpan : expandArrowSpan;
  return html`<a href="" @click=${toggleCollapseExpand} .objToToggle=${obj}>${title}${arrow}</a>`;
};

export function updatePhrases(parentElement, props) {
  let { searchString } = props;
  let searchTokens = (typeof searchString  === 'string') ?
    searchString.toLowerCase().replace(/\s+/g, ' ').trim().split(' ') :
    [];
  let StashProps = { searchTokens };
  let HistoryProps = { searchTokens };
  let FavoritesProps = { searchTokens };
  render(html`
  <style>${css}</style>
  <div class=Phrases>
    <div class=StashAndHistory>
      <div id=StashContainer></div>
      <div id=HistoryContainer></div>
    </div>
    <div id=FavoritesContainer></div>
  </div>`, parentElement);
  updateStash(document.getElementById('StashContainer'), StashProps);
  updateHistory(document.getElementById('HistoryContainer'), HistoryProps);
  updateFavorites(document.getElementById('FavoritesContainer'), FavoritesProps);
}
