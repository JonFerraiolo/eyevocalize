
import { html } from 'https://unpkg.com/lit-html?module';

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

export function TextEntryRow(props) {
  let { speak, stash, onTextChange } = props;
  let text = props.initialText || '';
  let onKeyDown = e => {
    if (e.key === 'Enter') {
      let shift = e.getModifierState("Shift");
      let control = e.getModifierState("Control");
      let meta = e.getModifierState("Meta");
      if (shift && !control && !meta) {
        // just pass through to default processing, which will add a newline
      } else if (!shift && (control || meta)) {
        e.preventDefault();
        onStashAndClear();
      } else {
        e.preventDefault();
        onSpeak();
      }
    } else {
      // just pass through to default processing, which will add the character
    }
  }
  let onInput = e => {
    onTextChange(document.getElementById('TextEntryRowTextArea').value);
  }
  let onSpeak = () => {
    let text = document.getElementById('TextEntryRowTextArea').value;
    if (text.length > 0) {
      speak(text);
      onClear();
    }
  }
  let onStashAndClear = () => {
    let text = document.getElementById('TextEntryRowTextArea').value;
    if (text.length > 0) {
      stash(text);
      onClear();
    }
  }
  let onClear = e => {
    document.getElementById('TextEntryRowTextArea').value = '';
    TextEntryRowSetFocus();
  }
  return html`
  <style>${css} </style>
  <div class=TextEntryRow>
    <label class=TextEntryLabel for=TextEntryRowTextArea>Compose:</label
    ><textarea value=text id=TextEntryRowTextArea @keydown=${onKeyDown} @input=${onInput}></textarea
    ><button class=TextEntrySpeak @click=${onSpeak}>Speak</button
    ><button class=TextEntrySpeak @click=${onStashAndClear}>Stash</button
    ><button class=TextEntryClear @click=${onClear}>Clear</button>
  </div>`;
}

export function TextEntryRowSetFocus() {
  setTimeout(()  => {
    document.getElementById('TextEntryRowTextArea').focus();
  }, 0);
}
