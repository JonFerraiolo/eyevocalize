
import { speak } from './vocalize.js';
import { stash } from './Stash.js';
import { render, html } from 'https://unpkg.com/lit-html?module';

let css = `
.TextEntryRow {
  padding: 0.25em;
  display: flex;
  align-items: center;
  flex: 0;
}
.TextEntryRow > * {
}
.TextEntryRow textarea {
  font-family: Arial, sans-serif;
  flex: 1;
  padding: 0.5em;
  font-size: 1em;
  border-radius: 3px;
  border: 1px solid #D9D9D9;
}
.TextEntryRow button {
  height: 4em;
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  border: black;
  font-size: 0.9rem;
  margin: 0 2px;
  padding: 0.5rem 0.8em;
  background: lightgreen;
  color: black;
  font-weight: bold;
  text-align: center;
}
.TextEntryRow button:hover, .TextEntryRow button:focus {
  cursor: pointer;
}
.TextEntryRow button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
`;

export function updateTextEntryRow(parentElement, props) {
  let { search, clear } = props;
  let text = props.initialText || '';
  let onClear = e => {
    document.getElementById('TextEntryRowTextArea').value = '';
    clear();
    TextEntryRowSetFocus();
  }
  render(html`
  <style>${css} </style>
  <div class=TextEntryRow>
    <label class=TextEntryLabel for=TextEntryRowTextArea>Compose:</label
    ><textarea value=text id=TextEntryRowTextArea></textarea
    ><button class=TextEntrySpeak @click=${speak}>Speak</button
    ><button class=TextEntrySpeak @click=${stash}>Stash</button
    ><button class=TextEntrySpeak @click=${search}>Search</button
    ><button class=TextEntryClear @click=${onClear}>Clear</button>
  </div>`, parentElement);
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
