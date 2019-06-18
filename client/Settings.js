
import { html } from 'https://unpkg.com/lit-html?module';

let css = `
input[type="range"] {
  width: 300px;
}

label {
  display: inline-block;
  float: left;
  width: 150px;
}

.option {
  margin: 1em 0;
}
`;

export function Settings(props) {
  let { voiceNames, setVoiceName } = props;
  let voiceName = props.voice || voiceNames[0];
  let onChangeVoice = e => {
    e.preventDefault();
    setVoiceName(voiceNames.find(voiceName => voiceName === e.target.value));
  }
  let voiceOptionElements = html`${
    voiceNames.map(
      name =>
      html`<option value=${name}>${name}</option>}`
    )
  }`
  return html`
  <style>${css}</style>
  <div class="option">
    <label for="voice">Voice</label>
    <select name="voice" id="voice" value=${voiceName} @change=${onChangeVoice}>
      ${voiceOptionElements}
    </select>
  </div>
  <div class="option">
    <label for="volume">Volume</label>
    <input type="range" min="0" max="1" step="0.1" name="volume" id="volume" value="1">
  </div>
  <div class="option">
    <label for="rate">Rate</label>
    <input type="range" min="0.1" max="10" step="0.1" name="rate" id="rate" value="1">
  </div>
  <div class="option">
    <label for="pitch">Pitch</label>
    <input type="range" min="0" max="2" step="0.1" name="pitch" id="pitch" value="1">
  </div>
  `;
}