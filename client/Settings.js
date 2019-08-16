
import { html, render } from './lib/lit-html/lit-html.js';
import { buildSlideRightTitle, secondLevelScreenShow, secondLevelScreenHide, updateMain } from './main.js';
import { speak } from './vocalize.js';

let css = `
.skinnyScreenChild .SettingsContent {
  padding: 0 1.75em 0.25em;
  font-size: 90%;
}
.skinnyScreenChild .SettingsContent .TabControlRadioData {
  padding: 0 0.5em;
  text-align: center;
}
.skinnyScreenChild .SettingsContent .TabControlRadioButton label {
  width: 100%;
}
.SettingsData {
  width: fit-content;
  margin: 0 auto;
  padding: 1.25em 1em 0;
}
.SettingsData .gridlayout {
  display: grid;
  grid-template-columns: auto auto;
  width: fit-content;
  grid-column-gap: 0.5em;
  grid-row-gap: 1em;
  line-height: 1.5em;
}
.SettingsData .gridlayout > * {
  text-align: left;
  vertical-align: middle;
}
.SettingsData .gridlayout > label {
  white-space: nowrap;
}
.SettingsData .chooseVoiceRow {
  margin-bottom: 0.25em;
}
.SettingsData input[type="range"] {
  width: 300px;
}
#SettingsMinScreenPercent {
  width: 200px;
}
.SettingsData .testsamplerow {
  grid-column-start: 1;
  grid-column-end: span 2;
  grid-row-start: 5;
  grid-row-end: span 5;
}
.SettingsData .testsamplerow > *{
  vertical-align: middle;
}
.SettingsData .testsamplerow textarea {
  width: 300px;
}
.SettingsRestoreDefaultsRow {
  text-align: center;
  line-height: 3.25em;
}
.SettingsRestoreDefaultsRow * {
  vertical-align: middle;
}
`;

let currentVersion;
let voices;
let voice;
let voiceName = null;
let voiceIndex = 0;
let defaultVolume = 1;
let volume = defaultVolume;
let defaultRate = 1;
let rate = defaultRate;
let defaultPitch = 1;
let pitch = defaultPitch;
let defaultSampleText = 'What do you think of the new voice settings?';
let sampleText = defaultSampleText;
let appFontSizes = [];
for (let i=14; i<=24; i++) {
  appFontSizes.push({ label: i+'', value: i+'px' });
}
let defaultFontSize = '16px';
let appFontSize = defaultFontSize;
let appFontSizeIndex;
let defaultMinScreenPercent = 50;
let minScreenPercent = defaultMinScreenPercent;

export function initializeSettings(props) {
  currentVersion = props.currentVersion;
  voices = speechSynthesis.getVoices();
  // Chrome loads voices asynchronously.
  window.speechSynthesis.onvoiceschanged = function(e) {
    voices = speechSynthesis.getVoices();
  };
  let initialSettings = { voiceName, volume, rate, pitch, sampleText, appFontSize, minScreenPercent };
  let Settings;
  let SettingsString = localStorage.getItem("Settings");
  try {
    Settings = (typeof SettingsString === 'string') ? JSON.parse(SettingsString) : initialSettings;
  } catch(e) {
    Settings = initialSettings;
  }
  if (typeof Settings.version != 'number'|| Settings.version < currentVersion) {
    Settings = initialSettings;
  }
  voiceName = Settings.voiceName;
  volume = Settings.volume;
  rate = Settings.rate;
  pitch = Settings.pitch;
  sampleText = Settings.sampleText;
  appFontSize = Settings.appFontSize;
  minScreenPercent = Settings.minScreenPercent;
};

let updateLocalStorage = () => {
  let Settings = { version: currentVersion, voiceName, volume, rate, pitch, sampleText,
    appFontSize, minScreenPercent };
  localStorage.setItem("Settings", JSON.stringify(Settings));
};

export function slideInAddSettingsScreen(props) {
  props = props || {};
  let { phrase } = props;
  let customControlsData = {};
  let params = {
    renderFunc: editSettings,
    renderFuncParams: {},
  };
  secondLevelScreenShow(params);
};

function onSettingsReturn() {
  updateMain();
  secondLevelScreenHide();
}

export function editSettings(parentElement, params) {
  let section = 'Voice';
  let buildSectionRadioButton = (id, value, label) => {
    let cls = 'TabControlRadioButton' + (section===value ? ' TabControlRadioButtonChecked' : '');
    return html`
      <span class=${cls} @click=${onClickTab} .SectionName=${value}>
        <label for=${id}>
          <input type=radio id=${id} name=EditPhraseType value=${value} ?checked=${section===value}></input
          ><span class=TabControlRadioButtonLabel>${label}</span>
        </label>
      </span>
    `;
  };
  let onClickTab = e => {
    e.preventDefault();
    section = e.currentTarget.SectionName;
    localUpdate();
  };
  let onChangeVoice = e => {
    e.preventDefault();
    voiceIndex = e.srcElement.selectedIndex;
    if (voiceIndex === -1) voiceIndex = 0;
    voice = voices[voiceIndex];
    voiceName = voice.name;
    updateLocalStorage();
  };
  let onChangeVolume = e => {
    e.preventDefault();
    volume = parseFloat(e.srcElement.value);
    updateLocalStorage();
  };
  let onChangeRate = e => {
    e.preventDefault();
    rate = parseFloat(e.srcElement.value);
    updateLocalStorage();
  };
  let onChangePitch = e => {
    e.preventDefault();
    pitch = parseFloat(e.srcElement.value);
    updateLocalStorage();
  };
  let onInputSampleText = e => {
    e.preventDefault();
    sampleText = document.getElementById('SettingsVoiceSampleText').value;
    updateLocalStorage();
  };
  let onTest = e => {
    e.preventDefault();
    let text = document.getElementById('SettingsVoiceSampleText').value;
    speak(text);
  };
  let onChangeFontSize = e => {
    e.preventDefault();
    appFontSizeIndex = e.srcElement.selectedIndex;
    appFontSize = appFontSizes[appFontSizeIndex].value;
    updateLocalStorage();
  };
  let onChangeMinScreenPercent = e => {
    e.preventDefault();
    minScreenPercent = parseFloat(e.srcElement.value);
    updateLocalStorage();
  };
  let onClickRestoreDefaults = e => {
    e.preventDefault();
    if (section === 'Appearance') {
      appFontSize = defaultFontSize;
      minScreenPercent = defaultMinScreenPercent;
    } else if (section === 'History') {

    } else if (section === 'Voice') {
      voiceName = null;
      volume = defaultVolume;
      rate = defaultRate;
      pitch = defaultPitch;
      sampleText = defaultSampleText;
    }
    localUpdate();
    updateLocalStorage();
  };
  let voiceOptionElements = html`${
    voices.map(
      voice =>
      html`<option value=${voice.name}>${voice.name}</option>}`
    )
  }`;
  let appFontSizeOptionElements = html`${
    appFontSizes.map(
      o =>
      html`<option value=${o.value}>${o.label}</option>}`
    )
  }`;
  let title = 'Settings';
  let localUpdate = () => {
    voiceIndex = voices.findIndex(v => v.name === voiceName );
    if (voiceIndex === -1) voiceIndex = 0;
    voice = voices[voiceIndex];
    voiceName = voice.name;
    appFontSizeIndex = appFontSizes.findIndex(o => o.value === appFontSize);
    if (appFontSizeIndex === -1) {
      appFontSizeIndex = appFontSizes.findIndex(o => o.value === defaultFontSize);
    }
    appFontSize = appFontSizes[appFontSizeIndex].value;
    let SettingsData;
    if (section === 'Appearance') {
      SettingsData = html`
        <div class="gridlayout SettingsAppearance">
          <label for="SettingsFontSize" class=chooseFontSizeRow>Application text size</label>
          <select id="SettingsFontSize" .selectedIndex=${appFontSizeIndex} @change=${onChangeFontSize} class=chooseFontSizeRow>
            ${appFontSizeOptionElements}
          </select>
          <label for="SettingsMinScreenPercent">Minimum screen percent</label>
          <input type="range" min="25" max="75" step="1" id="SettingsMinScreenPercent" .value=${minScreenPercent} @change=${onChangeMinScreenPercent}></input>
        </div>
      `;
    } else if (section === 'History') {
      SettingsData = html``;
    } else {
      SettingsData = html`
        <div class="gridlayout SettingsVoice">
          <label for="SettingsVoice" class=chooseVoiceRow>Voice</label>
          <select id="SettingsVoice" .selectedIndex=${voiceIndex} @change=${onChangeVoice} class=chooseVoiceRow>
            ${voiceOptionElements}
          </select>
          <label for="SettingsVolume">Volume</label>
          <input type="range" min="0" max="1" step="0.1" id="SettingsVolume" .value=${volume} @change=${onChangeVolume}></input>
          <label for="SettingsRate">Rate</label>
          <input type="range" min="0.1" max="10" step="0.1" id="SettingsRate" .value=${rate} @change=${onChangeRate}></input>
          <label for="SettingsPitch">Pitch</label>
          <input type="range" min="0" max="2" step="0.1" id="SettingsPitch" .value=${pitch} @change=${onChangePitch}></input>
          <span class=testsamplerow>
            <textarea id=SettingsVoiceSampleText @input=${onInputSampleText} .value=${sampleText} placeholder='Enter sample text, then press "Test" to try out settings'></textarea>
            <button @click=${onTest}>Test</button>
          </span>
        </div>
      `;
    }
    render(html`
      <style>${css}</style>
      <div class="Settings skinnyScreenParent">
        <div class=skinnyScreenChild>
          ${buildSlideRightTitle(title, onSettingsReturn)}
          <div class=SettingsContent>
            <div class=TabControlRadioButtons>
              ${buildSectionRadioButton('SettingsSectionVoice', 'Voice', 'Voice')}
              ${buildSectionRadioButton('SettingsSectionAppearance', 'Appearance', 'Appearance')}
              ${buildSectionRadioButton('SettingsSectionHistory', 'History', 'History')}
            </div>
            <div class=TabControlRadioData>
              <div class=SettingsData>
                ${SettingsData}
                <div class=SettingsRestoreDefaultsRow>
                  <button @click=${onClickRestoreDefaults}>Restore defaults</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `, parentElement);
    // lit-html mysteriously does not update the value of the select element
    if (section === 'Voice') {
      document.getElementById('SettingsVoice').selectedIndex = voiceIndex;
    } else if (section === 'Appearance') {
      document.getElementById('SettingsFontSize').selectedIndex = appFontSizeIndex;
    }
  };
  localUpdate();
}

export function getVoice() {
  voice = voice || voices[0];
  return voice;
}

export function mainAppPercentWhenSmall() {
  return minScreenPercent;
}

export function getAppFontSize() {
  return appFontSize;
}
