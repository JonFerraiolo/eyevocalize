
import { html, render } from './lib/lit-html/lit-html.js';
import { showPopup, hidePopup } from './popup.js';

let css = `
`;
/*
export function showHelpPopup(props) {
  let { refNodeSelector } = props;
  let params = {
    //content: FavoritesChooseCategoryDialog,
    content: dialog(),
    refNode: document.querySelector(refNodeSelector),
    clickAwayToClose: false,
    underlayOpacity: 0.85,
    hideCallback: hideCallbackParams => {
      render(html``, popupRootElement);
      //buildChooseCategoryControl(hideCallbackParams.parentElement, hideCallbackParams);
    },
  };
  console.dir(params);
  let popupRootElement = showPopup(params);
}

let dialog = () => {
  let localStorageEmail = localStorage.getItem('email');
  if (localStorageEmail) {
    return loginDialog();
  } else {
    return signupDialog();
  }
};

let loginDialog = () => {
  return html`<style>h1 {background:yellow;color:red;}</style><h1>Login</h1>`;
};

let signupDialog = () => {
  let onClickSignup = e => {
    e.preventDefault();
    hidePopup();
  };
  let onClickShowPassword = e => {
    e.preventDefault();
  };
  let showHideText = 'show password';
  return html`
    <style>${css}</style>
    <div class=Help>
      <div class=HelpTitle>Signup</div>
      <div class=HelpData>
      <div class="gridlayout HelpAppearance">
        <label for="email">Email</label>
        <input type="email" name="username" id="email" placeholder="Enter email" autofocus=""></input>
        <label for="email">Password</label>
        <span class=HelpPasswordSpan>
          <input type="password" name="password" id="password" placeholder="Enter password"></input>
          <a @click=${onClickShowPassword} href="" title="show/hide password">${showHideText}</a>
        </span>
      </div>
      <div class=HelpButtonRow>
        <button @click=${onClickSignup}>Sign Up</button>
      </div>
    </div>
  `;
};
*/
