
import { speak } from './vocalize.js';
import { stash } from './Stash.js';
import { slideInAddFavoriteScreen } from './Favorites.js';
import { search, clear, getAppMinOrMax, setAppMinOrMax } from './main.js';
import { resizeableTextarea } from './resizeableTextarea.js';
import { slideInAddSettingsScreen } from './Settings.js';
import { html, render } from './lib/lit-html/lit-html.js';

let css = `
.TextEntryRow {
  padding: 0.25em;
  display: flex;
  align-items: center;
  flex: 0;
  font-size: 0.9em;
}
.TextEntryRow .TextEntryLabel {
  font-size: 90%;
  font-weight: bold;
  font-style: italic;
}
.TextEntryRow textarea {
  height: 2.75em;
  font-family: Arial, sans-serif;
  flex: 1;
  padding: 0.25em;
  font-size: 1em;
  border-radius: 3px;
  border: 1px solid #D9D9D9;
  overflow: hidden;
  resize: none;
  min-width: 8em;
}
.TextEntryRow button:hover, .TextEntryRow button:focus {
  cursor: pointer;
}
.TextEntryRow button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
.TextEntryIconBlocks {
  display: inline-block;
}
.TextEntryIconBlock {
  display: inline-block;
  white-space: nowrap;
}
.TextEntryIcon {
  display: inline-block;
  width: 3em;
  height: 3em;
  background-size: 3em 3em;
  background-repeat: no-repeat;
  border: 1px solid black;
  background-color: white;
  padding: 0;
  margin-left: -1px;;
}
.TextEntryClear {
  background-image: url('./images/noun_clear_713056.svg');
  width: 1.5em;
  background-size: 3.5em 5em;
  background-position: -1.1em -0.5em;
  border: none;
  margin-left: 0;
  margin-right: 1em;
}
.TextEntrySpeak {
  background-image: url('./images/noun_talk_1614342.svg');
  background-position: 0px 0.2em;
}
.TextEntryStash {
  background-image: url('./images/noun_sticky notes_2355407.svg');
  background-size: 2.5em 2.5em;
  background-position: 0.2em 0.5em;
}
.TextEntryAddFavorite {
  background-image: url('./images/heart.svg');
  background-size: 1.75em 1.75em;
  background-position: 50% 55%;
}
.TextEntrySearch {
  background-image: url('./images/noun_Search_2784652.svg');
  background-size: 2.5em 2.5em;
  background-position: 0.2em 0.5em;
  margin-right: 1em;
}
.TextEntryMinOrMax {
  border: none;
  background-size: 1.75em 1.75em;
  background-position: 50% 50%;
}
.TextEntryMinOrMax.Min {
  background-image: url('./images/halfpage.svg');
}
.TextEntryMinOrMax.Max {
  background-image: url('./images/fullpage.svg');
}
.TextEntrySettings {
  width: 2em;
  background-image: url('./images/Font_Awesome_5_solid_cog.svg');
  background-size: 1.5em 1.5em;
  background-position: 50% 50%;
  border: none;
}
.TextEntryHelp {
  width: 2em;
  background-image: url('./images/helpicon.svg');
  background-size: 1.25em 1.25em;
  background-position: 50% 50%;
  border: none;
}
.TextEntryUser {
  width: 2em;
  background-image: url('./images/user.svg');
  background-size: 2em 2em;
  background-position: 50% 50%;
  border: none;
  margin-right: 0.15em;
}
`;

export function updateTextEntryRow(parentElement, props) {
  let text = props.initialText || '';
  let MinOrMax = getAppMinOrMax();
  let onSpeak = e => {
    e.preventDefault();
    speak(document.getElementById('TextEntryRowTextArea').value);
    TextEntryRowSetFocus();
  }
  let onStash = e => {
    e.preventDefault();
    stash(document.getElementById('TextEntryRowTextArea').value);
    TextEntryRowSetFocus();
  }
  let onClear = e => {
    e.preventDefault();
    document.getElementById('TextEntryRowTextArea').value = '';
    clear();
    TextEntryRowSetFocus();
  }
  let onAddFavorite = e => {
    e.preventDefault();
    slideInAddFavoriteScreen({ slideInLevel: 'second',
      phrase: { type:'text', text:document.getElementById('TextEntryRowTextArea').value}});
  }
  let onMinOrMax = e => {
    e.preventDefault();
    MinOrMax = MinOrMax === 'Min' ? 'Max' : 'Min';
    setAppMinOrMax(MinOrMax);
    localUpdate();
    TextEntryRowSetFocus();
  }
  let onSettings = e => {
    e.preventDefault();
    slideInAddSettingsScreen();
  }
  let onHelp = e => {
    e.preventDefault();
    debugger;
    TextEntryRowSetFocus();
  }
  let onUser = e => {
    e.preventDefault();
    debugger;
    TextEntryRowSetFocus();
  }
  let localUpdate = () => {
    render(html`
    <style>${css} </style>
    <div class=TextEntryRow>
      <label class=TextEntryLabel for=TextEntryRowTextArea>Compose:</label
      ><textarea id=TextEntryRowTextArea>${text}</textarea
      ><button class="TextEntryIcon TextEntryClear" @click=${onClear}
        title='Clear the current composition in the text entry box'></button
      ><span class=TextEntryIconBlocks
        ><span class=TextEntryIconBlock
          ><button class="TextEntryIcon TextEntrySpeak" @click=${onSpeak}
            title='Vocalize the words in the text entry box using speech synthesis'></button
          ><button class="TextEntryIcon TextEntryStash" @click=${onStash}
            title='Save these words in the "Stash", the storage area for things you might need to say soon'></button
          ><button class="TextEntryIcon TextEntryAddFavorite" @click=${onAddFavorite}
            title='Save these words as a new favorite'></button
          ><button class="TextEntryIcon TextEntrySearch" @click=${search}
            title='Filter the stash, the history and your favorites using the search words typed into the text entry box'></button
        ></span
        ><span class=TextEntryIconBlock
          ><button class="TextEntryIcon TextEntryMinOrMax ${MinOrMax}" @click=${onMinOrMax}
            title="${MinOrMax==='Min' ? 'Expand the user interface vertical-vertically to take up the entire browser window' :
            'Compress the user interface vertically to take up only part of the browser window'}"></button
          ><button class="TextEntryIcon TextEntrySettings" @click=${onSettings}
            title='View and change application settings'></button
          ><button class="TextEntryIcon TextEntryHelp" @click=${onHelp}
            title='Get help with the user interface for this application'></button
          ><button class="TextEntryIcon TextEntryUser" @click=${onUser}
            title='Show user screen, includes logout'></button
        ></span
      ></span>
    </div>`, parentElement);
    resizeableTextarea(document.getElementById('TextEntryRowTextArea'));
  };
  localUpdate();
}

export function TextEntryRowSetFocus() {
  setTimeout(()  => {
    let textarea = document.getElementById('TextEntryRowTextArea');
    textarea.focus();
    let len = textarea.value.length;
    textarea.setSelectionRange(len, len);
  }, 0);
}

export function TextEntryRowGetText() {
  return document.getElementById('TextEntryRowTextArea').value;
}

export function TextEntryRowSetText(text) {
  document.getElementById('TextEntryRowTextArea').value = text || '';
}
