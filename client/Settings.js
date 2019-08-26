
import { html, render } from './lib/lit-html/lit-html.js';
import { buildSlideRightTitle, secondLevelScreenShow, secondLevelScreenHide, updateMain, isChrome } from './main.js';
import { speak } from './vocalize.js';
import { combobox } from './combobox.js';

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
  display: flex;
  align-items: center;
  justify-content: start;
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
#SettingsVoiceSampleText {
  font-size: 115%;
}
`;

let currentVersion;
let section = 'Voice';
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
let defaultFontSize = 100;
let appFontSize = defaultFontSize;
let defaultMinScreenPercent = 50, minScreenPercentMin = 30, minScreenPercentMax = 100;
let minScreenPercent = defaultMinScreenPercent;
let defaultAutoDeleteHistory = 'never';
let autoDeleteHistory = defaultAutoDeleteHistory;
let autoDeleteHistoryOptions = [
  { value: 'hour',  label: 'an hour' },
  { value: 'day',  label: 'a day' },
  { value: 'week',  label: 'a week' },
  { value: 'month',  label: 'thirty days' },
  { value: 'year',  label: 'a year' },
  { value: 'never',  label: 'never' },
];
let autoDeleteHistoryIndex = autoDeleteHistoryOptions.length -  1;

let volumeCombo = new combobox();
let rateCombo = new combobox();
let pitchCombo = new combobox();
let appFontSizeCombo = new combobox();
let minScreenPercentCombo = new combobox();

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
  section = Settings.section || 'Voice';
  voiceName = Settings.voiceName;
  volume = Settings.volume;
  rate = Settings.rate;
  pitch = Settings.pitch;
  sampleText = Settings.sampleText;
  appFontSize = Settings.appFontSize;
  minScreenPercent = Settings.minScreenPercent;
  autoDeleteHistory = Settings.autoDeleteHistory;
};

let updateLocalStorage = () => {
  let Settings = { version: currentVersion, section,
    voiceName, volume, rate, pitch, sampleText,
    appFontSize, minScreenPercent, autoDeleteHistory };
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
  if (isChrome()) pitch = 1;  // chrome freezes voice synthesis if you speak with pitch! =1
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
    updateLocalStorage();
  };
  let onChangeVoice = e => {
    e.preventDefault();
    voiceIndex = e.target.selectedIndex;
    if (voiceIndex === -1) voiceIndex = 0;
    voice = voices[voiceIndex];
    voiceName = voice.name;
    localUpdate();
    updateLocalStorage();
  };
  let onChangeVolume = newValue => {
    volume = parseFloat(newValue);
    if (volume === NaN) volume = defaultVolume;
    localUpdate();
    updateLocalStorage();
  };
  let onChangeRate = newValue => {
    rate = parseFloat(newValue);
    if (rate === NaN) rate = defaultRate;
    localUpdate();
    updateLocalStorage();
  };
  let onChangePitch = newValue => {
    pitch = parseFloat(newValue);
    if (pitch === NaN) pitch = defaultPitch;
    localUpdate();
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
  let onChangeFontSize = newValue => {
    appFontSize = parseFloat(newValue);
    if (appFontSize === NaN) appFontSize = defaultFontSize;
    localUpdate();
    updateMain();
    updateLocalStorage();
  };
  let onChangeMinScreenPercent = newValue => {
    let v = parseFloat(newValue);
    if (v === NaN || v < minScreenPercentMin || v > minScreenPercentMax) return;
    minScreenPercent = v;
    updateMain();
    updateLocalStorage();
  };
  let onChangeAutoDeleteHistory = e => {
    e.preventDefault();
    autoDeleteHistoryIndex = e.target.selectedIndex;
    if (autoDeleteHistoryIndex === -1) autoDeleteHistoryIndex = autoDeleteHistoryOptions.length - 1;
    autoDeleteHistory = autoDeleteHistoryOptions[autoDeleteHistoryIndex].value;
    localUpdate();
    updateMain();
    updateLocalStorage();
  };
  let onClickRestoreDefaults = e => {
    e.preventDefault();
    if (section === 'Appearance') {
      appFontSize = defaultFontSize;
      minScreenPercent = defaultMinScreenPercent;
    } else if (section === 'History') {
      autoDeleteHistory = defaultAutoDeleteHistory;
    } else if (section === 'Voice') {
      voiceName = null;
      volume = defaultVolume;
      rate = defaultRate;
      pitch = defaultPitch;
      sampleText = defaultSampleText;
    }
    localUpdate();
    updateMain();
    updateLocalStorage();
  };
  let voiceOptionElements = html`${
    voices.map(
      voice =>
      html`<option value=${voice.name}>${voice.name}</option>}`
    )
  }`;
  let autoDeleteHistoryOptionElements = html`${
    autoDeleteHistoryOptions.map(
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
    autoDeleteHistoryIndex = autoDeleteHistoryOptions.findIndex(o => o.value === autoDeleteHistory);
    if (autoDeleteHistoryIndex === -1) autoDeleteHistoryIndex = autoDeleteHistoryOptions.length - 1;
    autoDeleteHistory = autoDeleteHistoryOptions[autoDeleteHistoryIndex].value;
    let SettingsData;
    if (section === 'Appearance') {
      SettingsData = html`
        <div class="gridlayout SettingsAppearance">
          <label for="SettingsFontSize" class=chooseFontSizeRow>App text size (% of normal)</label>
          <span class=SettingsAppFontSizeCombo></span>
          <label for="SettingsMinScreenPercent">Minimum screen percent</label>
          <span class=SettingsMinScreenPercentCombo></span>
        </div>
      `;
    } else if (section === 'History') {
      SettingsData = html`
        <div class="gridlayout SettingsHistory">
          <label for="SettingsAutoDeleteHistory" class=chooseFontSizeRow>Auto delete history older than</label>
          <select id="SettingsAutoDeleteHistory" .selectedIndex=${autoDeleteHistoryIndex} @change=${onChangeAutoDeleteHistory} class=chooseVoiceRow>
            ${autoDeleteHistoryOptionElements}
          </select>
        </div>
      `;
    } else {
      SettingsData = html`
        <div class="gridlayout SettingsVoice">
          <label for="SettingsVoice" class=chooseVoiceRow>Voice</label>
          <select id="SettingsVoice" .selectedIndex=${voiceIndex} @change=${onChangeVoice} class=chooseVoiceRow>
            ${voiceOptionElements}
          </select>
          <label>Volume</label>
          <span class=SettingsVolumeCombo></span>
          <label for="SettingsRate">Rate</label>
          <span class=SettingsRateCombo></span>
          ${!isChrome() ? html`
            <label for="SettingsPitch">Pitch</label>
            <span class=SettingsPitchCombo></span>` : '' }
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
      volumeCombo.update(document.querySelector('.SettingsVolumeCombo'), {
        inputType: 'number', min: 0, max: 1, step: 0.1, digits: 1, showPlusMinus: true,
        value: volume, onChange: onChangeVolume, inputWidthEms: 5
      });
      rateCombo.update(document.querySelector('.SettingsRateCombo'), {
        inputType: 'number', min: 0.2, max: 1, step: 0.1, digits: 1, showPlusMinus: true,
        value: rate, onChange: onChangeRate, inputWidthEms: 5
      });
      if (!isChrome()) {
        pitchCombo.update(document.querySelector('.SettingsPitchCombo'), {
          inputType: 'number', min: 0.5, max: 1.5, step: 0.1, digits: 1, showPlusMinus: true,
          value: pitch, onChange: onChangePitch, inputWidthEms: 5
        });
      }
    } else if (section === 'Appearance') {
      appFontSizeCombo.update(document.querySelector('.SettingsAppFontSizeCombo'), {
        inputType: 'number', min: 80, max: 120, step: 5, digits: 0, showPlusMinus: true,
        value: appFontSize, onChange: onChangeFontSize, inputWidthEms: 5
      });
      minScreenPercentCombo.update(document.querySelector('.SettingsMinScreenPercentCombo'), {
        inputType: 'number', min: minScreenPercentMin, max: minScreenPercentMax, step: 10, digits: 0, showPlusMinus: true,
        value: minScreenPercent, onChange: onChangeMinScreenPercent, inputWidthEms: 5
      });
    } else if (section === 'History') {
      document.getElementById('SettingsAutoDeleteHistory').selectedIndex = autoDeleteHistoryIndex;
    }
  };
  localUpdate();
}

export function getVoice() {
  voice = voice || voices[0];
  return voice;
}

export function getVolume() {
  return volume;
}

export function getRate() {
  return rate;
}

export function getPitch() {
  return pitch;
}

export function mainAppPercentWhenSmall() {
  return minScreenPercent;
}

export function getAppFontSize() {
  return appFontSize;
}

export function getAutoDeleteHistory() {
  return autoDeleteHistory;
}
