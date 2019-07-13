
import { render, html } from 'https://unpkg.com/lit-html?module';
import { buildSlideRightTitle } from './main.js';

let css = `
.EditPhraseContent {
  padding: 0.5em 1.75em 1em;
  font-size: 95%;
}
.EditPhraseTypeRadioButtons {
  display: flex;
}
.EditPhraseTypeRadioButton {
  flex: 1 1 0;
  background: #f0f0f0;
  border: 1px solid #888;
  border-bottom: 2px solid black;
  font-weight: normal;
  padding: 0.25em 0.8em 0.45em 0.1em;
  margin-left: -1px;
  text-align: center;
}
.EditPhraseTypeRadioButton * {
  vertical-align: middle;
}
.EditPhraseTypeRadioButtonChecked {
  background: white;
  border: 2px solid black;
  border-bottom: 2px solid white;
  font-weight: bold;
  margin-left: 0;
}
.EditPhraseData {
  border: 2px solid black;
  border-top: none;
  padding: 1em;
}
.EditPhraseInputBlock *:invalid {
  border-color: red;
  background: pink;
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
  let patternUrl = "^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$";
  let regexUrl = new RegExp(patternUrl);
  let patternVideoId = "^[A-Za-z0-9\-\._\~\:\@\$]{8,}$";
  let regexVideoId = new RegExp(patternVideoId);
  let patternSeconds = "^([0-9]*\.[0-9]+|[0-9]+)$";
  let regexSeconds = new RegExp(patternSeconds);
  let enableDoit;
  let validateData = () => {
    enableDoit = false;
    if (type === 'text') {
      enableDoit = text.trim().length > 0;
    } else if (type === 'audio') {
      enableDoit = regexUrl.test(url) && label.trim().length > 0;
    } else if (type === 'youtube') {
      enableDoit = label.trim().length > 0 && regexVideoId.test(videoId) &&
        (startAt.length === 0 || regexSeconds.test(startAt)) &&
        (endAt.length === 0 || regexSeconds.test(endAt));
      if (regexSeconds.test(startAt) && regexSeconds.test(endAt)) {
        let startNum = parseFloat(startAt);
        let endNum = parseFloat(endAt);
        if (endNum <= startNum) {
          enableDoit = false;
        }
      }
    }
    document.getElementById('EditPhraseDoitButton').disabled = !enableDoit;
  };
  let onClickTab = e => {
    e.preventDefault();
    type = e.currentTarget.EditPhraseValue;
    localUpdate();
    validateData();
  };
  let onInput = e => {
    let field = e.currentTarget.editPhraseField;
    let value = e.currentTarget.value;
    if (field === 'text') text = value;
    else if (field === 'label') label = value;
    else if (field === 'url') url = value;
    else if (field === 'videoId') videoId = value;
    else if (field === 'startAt') startAt = value;
    else if (field === 'endAt') endAt = value;
    validateData();
  };
  let onClickDoit = e => {
    e.preventDefault();
    doItCallback({ type, text, label, url, videoId, startAt, endAt });
  };
  let onClickCancel = e => {
    e.preventDefault();
    cancelCallback();
  };
  let buildTypeRadioButton = (id, value, label) => {
    let cls = 'EditPhraseTypeRadioButton' + (type===value ? ' EditPhraseTypeRadioButtonChecked' : '');
    return html`
      <span class=${cls}>
        <label for=${id} @click=${onClickTab} .EditPhraseValue=${value}>
          <input type=radio id=${id} name=EditPhraseType value=${value} ?checked=${type===value}></input
          ><span class=EditPhraseTypeLabel>${label}</span>
        </label>
      </span>
    `;
  };
  let localUpdate = () => {
    let phraseData;
    if (type === 'audio') {
      phraseData = html`
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseLabel>Label:</label>
          <input id=EditPhraseLabel @input=${onInput} .editPhraseField=${'label'}></input>
        </div>
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseURl>URL for the audio clip:</label>
          <textarea id=EditPhraseURl @input=${onInput} pattern=${patternUrl} .editPhraseField=${'url'}></textarea>
        </div>
      `;
    } else if (type === 'youtube') {
      phraseData = html`
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseLabel>Label:</label>
          <input id=EditPhraseLabel @input=${onInput} .editPhraseField=${'label'}></input>
        </div>
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseVideoId>YouTube videoId for this clip:</label>
          <input id=EditPhraseVideoId @input=${onInput} pattern=${patternVideoId} .editPhraseField=${'videoId'}></input>
        </div>
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseStartAt>Start at: (seconds, default=0)</label>
          <input id=EditPhraseStartAt @input=${onInput} pattern=${patternSeconds} .editPhraseField=${'startAt'}></input>
        </div>
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseEndAt>End at: (seconds, default=end of clip)</label>
          <input id=EditPhraseEndAt @input=${onInput} pattern=${patternSeconds} .editPhraseField=${'endAt'}></input>
        </div>
      `;
    } else {
      phraseData = html`
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseText>Text to be spoken:</label>
          <textarea id=EditPhraseText @input=${onInput} .editPhraseField=${'text'}></textarea>
        </div>
        <div class=EditPhraseInputBlock>
          <label for=EditPhraseLabel>Optional label:</label>
          <input id=EditPhraseLabel @input=${onInput} .editPhraseField=${'label'}></input>
        </div>
      `;
    }
    render(html`
      <style>${css}</style>
      <div class="EditPhrase skinnyScreenParent">
        <div class=skinnyScreenChild>
          ${buildSlideRightTitle(title, null)}
          <div class=EditPhraseContent>
            <div class=EditPhraseTypeRadioButtons>
              ${buildTypeRadioButton('EditPhraseTypeText', 'text', 'Spoken text')}
              ${buildTypeRadioButton('EditPhraseTypeAudio', 'audio', 'Web audio')}
              ${buildTypeRadioButton('EditPhraseTypeYoutube', 'youtube', 'YouTube video')}
            </div>
            <div class=EditPhraseData>
              ${phraseData}
            </div>
            <div class=ButtonRow>
              <button id=EditPhraseDoitButton @click=${onClickDoit}>${doItButtonLabel}</button>
              <button @click=${onClickCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>`, parentElement);
  };
  localUpdate();
  validateData();
}
