
import { html } from 'https://unpkg.com/lit-html?module';

export function Settings(props) {
  let { voices, setVoice } = props;
  let voice = props.voice || voices[0];
  let onChangeVoice = e => {
    e.preventDefault();
    setVoice(voices.find(v => v.name === e.target.value));
  }
  let voiceOptionElements = html`${
    voices.map(
      v =>
      html`<option value=${v.name}>${v.name}</option>}`
    )
  }`
  return html`
  <div class="option">
    <label for="voice">Voice</label>
    <select name="voice" id="voice" value=${voice.name} @change=${onChangeVoice}>
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
