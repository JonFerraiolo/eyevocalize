
import { showPopup, hidePopup } from './popup.js';
import { slideInSettingsScreen } from './Settings.js';
import { html, render } from './lib/lit-html/lit-html.js';

let css = `
.CloseAccountDialog {
	border: 2px solid black;
	background: white;
	padding:1.5em;
	font-size: 95%;
	max-width: 400px;
}
.CloseAccountDialogTitle {
	font-weight: bold;
	text-align: center;
}
.CloseAccountDialogErrorMessage {
	color: red;
	font-size: 90%;
	font-weight: bold;
	padding: 0.25em 0;
}
.CloseAccountDialogWarning {
	margin: 1em 0;
}
.CloseAccountDialogButtonRow {
	display: flex;
	justify-content: space-between;
}
.CloseAccountDialogButtonNo {
	font-weight: bold;
	font-size: 105%;
	background: white;
}
.CloseAccountDialogButtonYes {
	background: gray;
	color: #222;
	font-size: 95%;
}
`;

export function showAccountMenu(refNode, hideCB) {
	let params = {
		content: AccountMenu,
		refNode,
		refX: 'middle',
		refY: 'bottom',
		popupX: 'right',
		popupY: 'top',
		hideCallback: () => { hideCB(); },
	};
	let popupRootElement = showPopup(params);
}

const fetchPostOptionsTemplate = {
  method: 'POST',
  mode: 'same-origin',
  headers: { "Content-type": "application/json" },
  credentials: 'include',
};

let AccountMenu = (parentElement, customControlsData) => {
  let onClickLogout = e => {
    e.preventDefault();
		e.stopPropagation();
		hidePopup(customControlsData);
		let fetchPostOptions = JSON.parse(JSON.stringify(fetchPostOptionsTemplate));
		let payload = {};
		fetchPostOptions.body = JSON.stringify(payload);
		fetch('/api/logout', fetchPostOptions).then(resp => {
			console.log('status='+resp.status);
			if (resp.status === 200) {
				resp.json().then(data => {
					console.log('logout fetch return data=');
					console.dir(data);
					window.location.href = '/login';
				});
			} else {
				console.error('logout fetch bad status='+resp.status);
				errorMessage = `Very sorry. Something unexpected went wrong. Perhaps try again. `;
				localUpdate();
			}
		}).catch(e => {
			console.error('logout fetch error e='+e);
		});
  };
  let onClickAccountSettings = e => {
    e.preventDefault();
		e.stopPropagation();
    hidePopup(customControlsData);
		slideInSettingsScreen({ initialSection: 'Account' });
  };
  render(html`<div class="AccountMenu popupMenu">
		<ul class=popupMenuUL>
			<li><a class=popupMenuItem href="" @click=${onClickLogout}>
				<span class=popupMenuLabel>Logout</span>
			</a></li>
			<li class="popupMenuItem popupMenuSeparator"></li>
			<li><a class=popupMenuItem href="" @click=${onClickAccountSettings}>
				<span class=popupMenuLabel>Account Settings</span>
			</a></li>
		</ul>
	</div>`, parentElement);
};

export function showCloseAccountPopup() {
	let params = {
		content: CloseAccountDialog,
		clickAwayToClose: false,
		refY: 'top',
		popupY: 'top',
		offsetY: 10,
	};
	let popupRootElement = showPopup(params);
}

let CloseAccountDialog = (parentElement, customControlsData) => {
  let onClickYesIAmSure = e => {
		let rootElement = document.querySelector('.CloseAccountDialog');
		if (rootElement) {
			rootElement.removeEventListener('keydown', onKeyDown, false);
		}
    e.preventDefault();
		e.stopPropagation();
		let fetchPostOptions = JSON.parse(JSON.stringify(fetchPostOptionsTemplate));
		let payload = {};
		fetchPostOptions.body = JSON.stringify(payload);
		fetch('/api/closeaccount', fetchPostOptions).then(resp => {
			console.log('status='+resp.status);
			if (resp.status === 200) {
				resp.json().then(data => {
					console.log('closeaccount fetch return data=');
					console.dir(data);
					window.location.href = '/accountclosed';
				});
			} else if (resp.status === 401) {
				errorMessage = `You are not logged in. You must be logged in to close your account.`;
				localUpdate();
			} else {
				console.error('closeaccount fetch bad status='+resp.status);
				errorMessage = `Very sorry. Something unexpected went wrong. Perhaps try again. `;
				localUpdate();
			}
		}).catch(e => {
			console.error('closeaccount fetch error e='+e);
		});
  };
  let onClickNevermind = e => {
		let rootElement = document.querySelector('.CloseAccountDialog');
		if (rootElement) {
			rootElement.removeEventListener('keydown', onKeyDown, false);
		}
    e.preventDefault();
		e.stopPropagation();
    hidePopup(customControlsData);
  };
	let onKeyDown = e => {
		if (e.key === 'Enter') {
			onClickNevermind(e);
		}
	};
	let errorMessage = '';
	let localUpdate = () => {
		render(html`
		<style>${css}</style>
		<div class="CloseAccountDialog">
			<div class=CloseAccountDialogTitle>Are you sure you want to close your account?</div>
			<div class=CloseAccountDialogErrorMessage>${errorMessage}</div>
			<div class=CloseAccountDialogWarning>
				Are you sure that you want to close your EyeVocalize account?
				Doing so doesn't really do much since the trial version is still available to you.
				It does remove the possibility that further user data will be stored on the server, but
				you can accomplish the same thing by turning off data synchronization
				and not allowing EyeVocalize to use your data, the two checkboxes on
				the page which brought up this confirmation dialog.
			</div>
			<div class=CloseAccountDialogButtonRow>
				<button class=CloseAccountDialogButtonNo @click=${onClickNevermind}>
					No, don't close
				</button>
				<button class=CloseAccountDialogButtonYes @click=${onClickYesIAmSure}>
					Close my account
				</button>
			</div>
		</div>`, parentElement);
		setTimeout(() => {
			let rootElement = document.querySelector('.CloseAccountDialog');
			if (rootElement) {
				rootElement.addEventListener('keydown', onKeyDown, false);
				rootElement.querySelector('.CloseAccountDialogButtonNo').focus();
			}
		}, 0);
	};
	localUpdate();
};
