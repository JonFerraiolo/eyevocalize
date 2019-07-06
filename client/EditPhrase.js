
import { render, html } from 'https://unpkg.com/lit-html?module';

let css = `
.EditPhrase {
}
`;

export function EditPhrase(props) {
  let { parentElement, title, doItButtonLabel, doItCallback, cancelCallback, speak, text, label, audio } = props;
  text = text || '';
  label = label || '';
  audio = audio || '';
  let onClickDoit = e => {
    e.preventDefault();
    doItCallback({ text, label, audio });
  };
  let onClickCancel = e => {
    e.preventDefault();
    cancelCallback();
  };
  render(html`
    <style>${css}</style>
    <div class=EditPhraseInputBlock>
      <label for=EditPhraseText>Text that should be spoken:</label
      ><textarea id=EditPhraseText></textarea>
    >/div>
    <div class=EditPhraseInputBlock>
      <label for=EditPhraseLabel>Optional label for this phrase:</label
      ><input id=EditPhraseLabel></input>
    >/div>
    <div class=EditPhraseInputBlock>
      <label for=EditPhraseAudio>URL for an audio clip:</label
      ><textarea id=EditPhraseText></textarea>
    >/div>
    <div class=ButtonRow>
      <button @click=${onClickDoit}>${doItButtonLabel}</button>
      <button @click=${onClickCancel}>Cancel</button>
    </div>
  </div>`, parentElement);
}
