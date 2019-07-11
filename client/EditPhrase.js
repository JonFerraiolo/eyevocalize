
import { render, html } from 'https://unpkg.com/lit-html?module';

let css = `
.EditPhrase {
}
`;

export function EditPhrase(parentElement, params) {
  let { phrase, title, doItButtonLabel, doItCallback, cancelCallback } = params;
  phrase = phrase || {};
  let { type, text, label, url, videoId, startAt, endAt } = phrase;
  type = type || 'text';
  text = text || '';
  label = label || '';
  url = url || '';
  videoId = videoId || '';
  startAt = startAt || '';
  endAt = endAt || '';
  let onClickDoit = e => {
    e.preventDefault();
    doItCallback({ type, text, label, url, videoId, startAt, endAt });
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
