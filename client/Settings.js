
import { html, render } from './lib/lit-html/lit-html.js';
import { buildSlideRightTitle, secondLevelScreenShow, secondLevelScreenHide, updateMain, sync, isChrome } from './main.js';
import { speak } from './vocalize.js';
import { showCloseAccountPopup } from './account.js';
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
.SettingsAccountTrialVersion {
	margin-bottom: 1.5em;
}
.SettingsAccountUseMyDataExplanation {
	font-size: 90%;
	margin: 0.5em 0 0.5em 2em;
	text-align: left;
}
.SettingsAccountCloseAccountDiv {
	text-align: right;
	margin: 2em 0 0;
	padding: 1em 0;
	border-top: 2px solid gray;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

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
let defaultAutoDeleteHistory = 'week';
let autoDeleteHistory = defaultAutoDeleteHistory;
let autoDeleteHistoryOptions = [
	{ value: 'hour',  label: 'an hour' },
	{ value: 'day',  label: 'a day' },
	{ value: 'week',  label: 'a week' },
	{ value: 'month',  label: 'thirty days' },
	{ value: 'twomonths',  label: 'sixty days' },
];
let autoDeleteHistoryIndex = autoDeleteHistoryOptions.length -  1;
let defaultSyncMyData = true;
let syncMyData = defaultSyncMyData;
let defaultOKUseMyData = false;
let okUseMyData = defaultOKUseMyData;
let pending;

let volumeCombo = new combobox();
let rateCombo = new combobox();
let pitchCombo = new combobox();
let appFontSizeCombo = new combobox();
let minScreenPercentCombo = new combobox();

let getInitialSettings = () => {
	return { timestamp: 0, voiceName, volume, rate, pitch, sampleText, appFontSize,
		minScreenPercent, autoDeleteHistory, syncMyData, okUseMyData };
}

let getSettings = () => {
	let initialSettings = getInitialSettings();
	let Settings;
	let SettingsString = localStorage.getItem("Settings");
	try {
		Settings = (typeof SettingsString === 'string') ? JSON.parse(SettingsString) : initialSettings;
		if (autoDeleteHistory === 'year' || autoDeleteHistory === 'never') {
			autoDeleteHistory = 'twomonths'; // earlier versions allowed history forever, but performance got affected
		}
	} catch(e) {
		Settings = initialSettings;
	}
	return Settings;
}

let setSettings = Settings => {
	section = Settings.section || 'Voice';
	voiceName = Settings.voiceName;
	volume = Settings.volume;
	rate = Settings.rate;
	pitch = Settings.pitch;
	sampleText = Settings.sampleText;
	appFontSize = Settings.appFontSize;
	minScreenPercent = Settings.minScreenPercent;
	autoDeleteHistory = Settings.autoDeleteHistory;
	syncMyData = Settings.syncMyData;
	okUseMyData = Settings.okUseMyData;
	pending = Settings.pending;
}

export function initializeSettings(props) {
	voices = window.evc_voices;  // set in startupChecks
	let Settings = getSettings();
	setSettings(Settings);
	localStorage.setItem("Settings", JSON.stringify(Settings));
};

export function SettingsGetPending(clientLastSync) {
	let Settings = getSettings();
	if (!Settings.pending) return null;
	delete Settings.pending;
	let { timestamp, sampleText, autoDeleteHistory, syncMyData, okUseMyData } = Settings;
	let o = { timestamp, sampleText, autoDeleteHistory, syncMyData, okUseMyData };
	return timestamp > clientLastSync ? o : null;
}

export function SettingsSync(thisSyncServerTimestamp, newData) {
	// get latest data from localStorage in case a different browser window has updated the data in the background
	let Settings = getSettings();
	if (newData && typeof newData === 'object' && typeof newData.timestamp === 'number' && newData.timestamp > Settings.timestamp) {
		console.log('SettingsSync. newData.timestamp='+newData.timestamp+', Settings.timestamp='+Settings.timestamp);
		Settings = Object.assign({}, Settings, newData);
		delete Settings.pending;
		setSettings(Settings);
		// update data in localStorage setting timestamp to the value in newData
		updateLocalStorage({ timestamp: newData.timestamp });
		let event = new CustomEvent("ServerInitiatedSyncSettings", { detail: null } );
		window.dispatchEvent(event);
	}
}

function updateStorage()  {
	updateLocalStorage({ timestamp: Date.now(), pending: true, });
	sync();
}

let updateLocalStorage = overrides => {
	let Settings = getSettings();
	let o = { section, voiceName, volume, rate, pitch, sampleText, appFontSize, minScreenPercent, autoDeleteHistory, syncMyData, okUseMyData };
	Settings = Object.assign({}, Settings, o, overrides || {});
	localStorage.setItem("Settings", JSON.stringify(Settings));
};

let editSettingsActive = false;

export function slideInSettingsScreen(props) {
	editSettingsActive = true;
	props = props || {};
	let { initialSection } = props;
	let params = {
		renderFunc: editSettings,
		renderFuncParams: { initialSection },
	};
	secondLevelScreenShow(params);
};

function onSettingsReturn() {
	editSettingsActive = false;;
	updateMain(null, { Notes:true, History: true, Favorites: true });
	secondLevelScreenHide();
}

let editSettingsFirstTime = true;

export function editSettings(parentElement, params) {
	if (editSettingsFirstTime) {
		editSettingsFirstTime = false;
		window.addEventListener('ServerInitiatedSyncSettings', function(e) {
			if (editSettingsActive && parentElement) {
				console.log('editSettings ServerInitiatedSyncSettings custom event listener entered ');
				let SettingsContent = parentElement.querySelector('.SettingsContent');
				if (SettingsContent) {
					localUpdate();
				}
			}
		});
	}
	params = params || {};
	let { initialSection } = params;
	if (initialSection) {
		section = initialSection;
		updateStorage();
	}
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
		updateStorage();
	};
	let onChangeVoice = e => {
		e.preventDefault();
		voiceIndex = e.target.selectedIndex;
		if (voiceIndex === -1) voiceIndex = 0;
		voice = voices[voiceIndex];
		voiceName = voice.name;
		localUpdate();
		updateStorage();
	};
	let onChangeVolume = newValue => {
		volume = parseFloat(newValue);
		if (volume === NaN) volume = defaultVolume;
		localUpdate();
		updateStorage();
	};
	let onChangeRate = newValue => {
		rate = parseFloat(newValue);
		if (rate === NaN) rate = defaultRate;
		localUpdate();
		updateStorage();
	};
	let onChangePitch = newValue => {
		pitch = parseFloat(newValue);
		if (pitch === NaN) pitch = defaultPitch;
		localUpdate();
		updateStorage();
	};
	let onInputSampleText = e => {
		e.preventDefault();
		sampleText = document.getElementById('SettingsVoiceSampleText').value;
		updateStorage();
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
		updateStorage();
		setTimeout(() => {
			let event = new CustomEvent("AppLayoutChanged", { detail: null } );
			window.dispatchEvent(event);
		}, 0);
	};
	let onChangeMinScreenPercent = newValue => {
		let v = parseFloat(newValue);
		if (v === NaN || v < minScreenPercentMin || v > minScreenPercentMax) return;
		minScreenPercent = v;
		updateMain(null, { Notes:true, History: true, Favorites: true });
		updateStorage();
		setTimeout(() => {
			let event = new CustomEvent("AppLayoutChanged", { detail: null } );
			window.dispatchEvent(event);
		}, 0);
	};
	let onChangeAutoDeleteHistory = e => {
		e.preventDefault();
		autoDeleteHistoryIndex = e.target.selectedIndex;
		if (autoDeleteHistoryIndex === -1) autoDeleteHistoryIndex = autoDeleteHistoryOptions.length - 1;
		autoDeleteHistory = autoDeleteHistoryOptions[autoDeleteHistoryIndex].value;
		localUpdate();
		updateMain(null, { Notes:true, History: true, });
		updateStorage();
	};
	let onChangeSyncData = e => {
		e.preventDefault();
		syncMyData = e.target.checked;
		updateMain();
		updateStorage();
	};
	let onChangeOKUseMyData = e => {
		e.preventDefault();
		okUseMyData = e.target.checked;
		updateMain();
		updateStorage();
	};
	let onClickCloseAccount = e => {
		e.preventDefault();
		showCloseAccountPopup();
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
		} else if (section === 'Account') {
			syncMyData = defaultSyncMyData;
			okUseMyData = defaultOKUseMyData;
		}
		localUpdate();
		updateMain();
		updateStorage();
		setTimeout(() => {
			let event = new CustomEvent("AppLayoutChanged", { detail: null } );
			window.dispatchEvent(event);
		}, 0);
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
	let trial = !(window.eyevocalizeUserEmail);
	let localUpdate = () => {
		voiceIndex = voices.findIndex(v => v.name === voiceName );
		if (voiceIndex === -1) voiceIndex = 0;
		voice = voices[voiceIndex];
		voiceName = voice.name;
		autoDeleteHistoryIndex = autoDeleteHistoryOptions.findIndex(o => o.value === autoDeleteHistory);
		if (autoDeleteHistoryIndex === -1) autoDeleteHistoryIndex = autoDeleteHistoryOptions.length - 1;
		autoDeleteHistory = autoDeleteHistoryOptions[autoDeleteHistoryIndex].value;
		let SettingsData;
		let BottomData = '';
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
		} else if (section === 'Account') {
			let trial = window.eyevocalizeUserEmail ? '' : html`<div class="SettingsAccountTrialVersion TrialVersion">
				Because you are using the Trial Version, the options below are inactive.
			</div>`;
			SettingsData = html`
				${trial}
				<div class="gridlayout SettingsAccount">
					<input type=checkbox id=SettingsSyncData @change=${onChangeSyncData} class=chooseVoiceRow>
					</input>
					<label for="SettingsSyncData" class=chooseFontSizeRow>Synchronize my data across all client devices and browsers</label>
					<input type=checkbox id=SettingsOKUseMyData @change=${onChangeOKUseMyData} class=chooseVoiceRow>
					</input>
					<label for="SettingsOKUseMyData" class=chooseFontSizeRow>Allow EyeVocalize team to use my data (*)</label>
				</div>
				<div class=SettingsAccountUseMyDataExplanation>
					(*) Your data will be used anonymously only for the purpose of improving the EyeVocalize app and website.
					For more, read the <a href="/PrivacyPolicy" target="_blank">EyeVocalize Privacy Policy</a>.
				</div>
			`;
			BottomData = html`
			<div class=SettingsAccountCloseAccountDiv>
				<button @click=${onClickCloseAccount}>Close My Account</button>
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
			<div class="Settings skinnyScreenParent">
				<div class=skinnyScreenChild>
					${buildSlideRightTitle(title, onSettingsReturn)}
					<div class=SettingsContent>
						<div class=TabControlRadioButtons>
							${buildSectionRadioButton('SettingsSectionVoice', 'Voice', 'Voice')}
							${buildSectionRadioButton('SettingsSectionAppearance', 'Appearance', 'Appearance')}
							${buildSectionRadioButton('SettingsSectionHistory', 'History', 'History')}
							${buildSectionRadioButton('SettingsSectionAccount', 'Account', 'Account')}
						</div>
						<div class=TabControlRadioData>
							<div class=SettingsData>
								${SettingsData}
								<div class=SettingsRestoreDefaultsRow>
									<button @click=${onClickRestoreDefaults}>Restore defaults</button>
								</div>
								${BottomData}
							</div>
						</div>
					</div>
				</div>
			</div>
		`, parentElement);
		// lit-html mysteriously does not update the value of the select element
		parentElement.querySelector('.SettingsRestoreDefaultsRow button').disabled = false;
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
		} else if (section === 'Account') {
			document.getElementById('SettingsSyncData').checked = syncMyData;
			document.getElementById('SettingsOKUseMyData').checked = okUseMyData;
			document.getElementById('SettingsSyncData').disabled = trial;
			document.getElementById('SettingsOKUseMyData').disabled = trial;
			parentElement.querySelector('.SettingsAccountCloseAccountDiv button').disabled = trial;
			parentElement.querySelector('.SettingsRestoreDefaultsRow button').disabled = trial;
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

export function getSyncMyData() {
	return syncMyData;
}

export function getOKUseMyData() {
	return okUseMyData;
}
