
import { html, render } from './lib/lit-html/lit-html.js';
import { startupChecks } from './startupChecks.js';

let css = `
html {
  font-family: Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background: #bccbde;
}
.LoginSignup {
  border: 1px solid black;
  background: white;
  padding: 1em 2em;
  max-width: 500px;
  margin: 1em auto 0;
}
.LoginSignupTitle {
  font-size: 115%;
  font-weight: bold;
  text-align: center;
  margin: 0 0 0.5em;
}
.logo {
  margin-left: 0.25em;
  display: inline-block;
  width: 1.25em;
  height:1.25em;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  background-position: 50% 50%;
  background-image: url('./images/favicon.svg');
  vertical-align: middle;
  background-color: white;
}
.LoginSignupErrorMessage {
  text-align: center;
  color: red;
  font-weight: bold;
}
.LoginSignupPasswordSpan a, .LoginSignupPasswordSpan a:link,.LoginSignupPasswordSpan a:visited {
  color: black;
  margin-left: 1.25em;
  font-size: 85%;
}
.LoginSignupButtonRow {
  padding: 1em;
}
.LoginSignupData {
  width: fit-content;
  margin: 0 auto;
  padding: 1.25em 0 0;
}
.LoginSignupData .gridlayout {
  display: grid;
  grid-template-columns: auto auto;
  width: fit-content;
  grid-column-gap: 0.5em;
  grid-row-gap: 1em;
  line-height: 1.5em;
}
.LoginSignupData .gridlayout > * {
  display: flex;
  align-items: center;
  justify-content: start;
}
.LoginSignupData .gridlayout > label {
  white-space: nowrap;
}
.LoginSignupBottomMessage {
  margin-top: 2em;
  font-size: 85%;
}
.LoginSignupButtonRow {
  text-align: center;
  margin-top: 1em;'
}
.LoginSignupGoElsewhere {
  margin: 1em 0 1em;
  font-size: 85%;
  text-align: center;
}
.LoginSignupSuccess div {
  padding: 1em 0 0.5em;
}
.LoginSignupSuccess div.LoginSignupToComplete {
  padding-bottom: 1.5em;
}
`;

const EMAIL_NOT_REGISTERED = 'EMAIL_NOT_REGISTERED'
const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED'
const INCORRECT_PASSWORD = 'INCORRECT_PASSWORD'

const fetchPostOptionsTemplate = {
  method: 'POST',
  mode: 'same-origin',
  headers: { "Content-type": "application/json" },
  credentials: 'include',
};

const Signup = () => {
  let onClickSignup = e => {
    e.preventDefault();
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let SignupButton = document.getElementById('SignupButton');
    SignupButton.disabled  = !(email.validity.valid && password.value.length > 0);
    if (SignupButton.disabled) return; // overcome Chrome bug https://stackoverflow.com/questions/35049555/chrome-autofill-autocomplete-no-value-for-password
    let fetchPostOptions = JSON.parse(JSON.stringify(fetchPostOptionsTemplate));
    let credentials = {
      email: email.value,
      password: password.value,
    };
    fetchPostOptions.body = JSON.stringify(credentials);
    fetch('/api/signup', fetchPostOptions).then(resp => {
      console.log('status='+resp.status);
      if (resp.status === 200) {
        resp.json().then(data => {
          console.log('signup fetch return data=');
          console.dir(data);
          successEmail = data.account.email;
          localUpdate();
        });
      } else if (resp.status === 401) {
        alreadyExistsMessage = `*** User '${credentials.email}' already exists ***`;
        localUpdate();
      } else {
        console.error('signup fetch bad status='+resp.status);
        errorMessage = `Very sorry. Something unexpected went wrong. Perhaps try again. `;
        localUpdate();
      }
    }).catch(e => {
      console.error('signup fetch error e='+e);
    });
  };
  let onClickShowPassword = e => {
    e.preventDefault();
    passwordType = passwordType === 'password' ? 'text' : 'password';
    localUpdate();
  };
  let onClickReturn = e => {
    e.preventDefault();
    errorMessage = null;
    alreadyExistsMessage = '';
    localUpdate();
  };
  let onInput = e => {
    enableDisable();
  };
  let enableDisable = () => {
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let SignupButton = document.getElementById('SignupButton');
    SignupButton.disabled  = !(email.validity.valid && password.value.length > 0);
  };
  let passwordType = 'password';
  let errorMessage = null;
  let alreadyExistsMessage = '';
  let successEmail = null;
  let localUpdate = () => {
    let mainBody;
    if (successEmail) {
      mainBody = html`
        <div class=LoginSignupSuccess>
          <div>Thank you for filling out the Sign Up form.</div>
          <div class=LoginSignupToComplete>To complete the Sign Up process,
          go to your email (${successEmail}) and look for a confirmation email from EyeVocalize.com.
          After you click on the link in the email, you will be fully registered.</div>
        </div>
      `;
    } else if (errorMessage) {
      mainBody = html`
        <div class=LoginSignupErrorMessage>${errorMessage}</div>
        <div class=LoginSignupErrorReturn>Return to
          <a href="" @click=${onClickReturn} title="return to signup form">sign Up form</a>
        </div>
      `;
    } else {
      mainBody = html`
        <div class=LoginSignupErrorMessage>${alreadyExistsMessage}</div>
        <div class=LoginSignupData>
          <div class="gridlayout LoginSignupAppearance">
            <label for="email">Email</label>
            <input type="email" id="email" @input=${onInput} required placeholder="Enter email" autofocus="" autocomplete=email></input>
            <label for="email">Password</label>
            <span class=LoginSignupPasswordSpan>
              <input type=${passwordType} id=password @input=${onInput} required placeholder="Enter password"></input>
              <a @click=${onClickShowPassword} href="" title="show/hide password">
                ${passwordType === 'password' ? 'show' : 'hide'} password
              </a>
            </span>
          </div>
          <div class=LoginSignupBottomMessage>
            By clicking Sign Up below, you are agreeing to EyeVocalize.com's
            <a href="/TermsOfUse" title="go to Terms of Use page">Terms of Use</a>,
            <a href="/PrivacyPolicy" title="go to Privacy Policy page">Privacy Policy</a> and
            <a href="/Cookies" title="go to Cookies and Similar Technologies page">Use of Cookies and Similar Technologies</a>.
          </div>
          <div class=LoginSignupButtonRow>
            <button @click=${onClickSignup} id=SignupButton>Sign Up</button>
          </div>
          <div class=LoginSignupGoElsewhere>
            Already registered? Then,
            <a href="/login" title="go to login page">login</a>
          </div>
        </div>
      `;
    }
    render(html`
      <style>${css}</style>
      <div class=LoginSignup>
        <div class=LoginSignupTitle>
          You are signing up for EyeVocalize.com
          <span class=logo></span>
        </div>
        ${mainBody}
      </div>
    `, document.body);
  };
  localUpdate();
  setTimeout(() => {
    enableDisable();
  },  1000); // delay to allow browser to do autocomplete
};

const Login = () => {
  let onClickLogin = e => {
    e.preventDefault();
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let LoginButton = document.getElementById('LoginButton');
    LoginButton.disabled  = !(email.validity.valid && password.value.length > 0);
    if (LoginButton.disabled) return; // overcome Chrome bug https://stackoverflow.com/questions/35049555/chrome-autofill-autocomplete-no-value-for-password
    let fetchPostOptions = JSON.parse(JSON.stringify(fetchPostOptionsTemplate));
    let credentials = {
      email: email.value,
      password: password.value,
    };
    fetchPostOptions.body = JSON.stringify(credentials);
    fetch('/api/login', fetchPostOptions).then(resp => {
      console.log('status='+resp.status);
      if (resp.status === 200) {
        resp.json().then(data => {
          console.log('login fetch return data=');
          console.dir(data);
          window.location = '/app';
        });
      } else if (resp.status === 401) {
        resp.json().then(data => {
          console.log('login fetch 401 return data=');
          console.dir(data);
          let email = document.getElementById('email').value;
          if (data.error === EMAIL_NOT_REGISTERED) {
            loginMessage = `*** Error: '${email}' not registered ***`;
          } else if (data.error === EMAIL_NOT_VERIFIED) {
            notVerifiedEmail = email;
          } else if (data.error === INCORRECT_PASSWORD) {
            loginMessage = `*** Error: incorrect password for '${email}' ***`;
          } else {
            errorMessage = `Very sorry. Something unexpected went wrong(login 401-1). Perhaps try again. `;
          }
          localUpdate();
        }).catch(e => {
          errorMessage = `Very sorry. Something unexpected went wrong (login 401-2). Perhaps try again. `;
        });
        localUpdate();
      } else {
        console.error('signup fetch bad status='+resp.status);
        errorMessage = `Very sorry. Something unexpected went wrong (login). Perhaps try again. `;
        localUpdate();
      }
    }).catch(e => {
      console.error('signup fetch error e='+e);
    });
  };
  let onClickShowPassword = e => {
    e.preventDefault();
    passwordType = passwordType === 'password' ? 'text' : 'password';
    localUpdate();
  };
  let onClickReturn = e => {
    e.preventDefault();
    errorMessage = null;
    resendSuccessEmail = null;
    notVerifiedEmail = null;
    loginMessage = '';
    localUpdate();
  };
  let onClickResendVerification = e => {
    e.preventDefault();
    let fetchPostOptions = JSON.parse(JSON.stringify(fetchPostOptionsTemplate));
    let credentials = {
      email: notVerifiedEmail,
    };
    fetchPostOptions.body = JSON.stringify(credentials);
    fetch('/api/resendverification', fetchPostOptions).then(resp => {
      console.log('status='+resp.status);
      if (resp.status === 200) {
        resp.json().then(data => {
          console.log('resendverification fetch return data=');
          console.dir(data);
          errorMessage = null;
          resendSuccessEmail = notVerifiedEmail;
          notVerifiedEmail = null;
          loginMessage = '';
          localUpdate();
        });
      } else {
        console.error('resendverification fetch bad status='+resp.status);
        errorMessage = `Very sorry. Something unexpected went wrong (resendverification). Perhaps try again. `;
        resendSuccessEmail = null;
        notVerifiedEmail = null;
        loginMessage = '';
        localUpdate();
      }
    }).catch(e => {
      console.error('resendverification fetch error e='+e);
    });
  };
  let onInput = e => {
    enableDisable();
  };
  let enableDisable = () => {
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let LoginButton = document.getElementById('LoginButton');
    LoginButton.disabled  = !(email.validity.valid && password.value.length > 0);
  };
  let passwordType = 'password';
  let errorMessage = null;
  let notVerifiedEmail = null;
  let resendSuccessEmail = null;
  let loginMessage = '';
  let localUpdate = () => {
    let mainBody;
    if (notVerifiedEmail) {
      mainBody = html`
        <div class=LoginSignupResend>
          <div class=LoginSignResendErrorMessage>${`*** Error: '${notVerifiedEmail}' registered, but not yet verified ***`}/div>
          <div class=LoginSignupToComplete>To complete the Sign Up / Registration process,
          you need to click on the account verification link found in the email you should have
          received from EyeVocalize.com.</div>
          <div>If you would like to have another account verification email sent,
          then please click <a href="" title="resend verification email" @click=${onClickResendVerification}>here</a>.</div>
          <div class=LoginSignupErrorReturn>To return to the login form, please click
            <a href="" @click=${onClickReturn} title="return to login form">here</a>.
          </div>
        </div>
      `;
    } else if (resendSuccessEmail) {
      mainBody = html`
        <div class=LoginSignupSuccess>
          <div>Another account verification email has been sent to ${resendSuccessEmail}</div>
          <div class=LoginSignupToComplete>To complete the Sign Up / Registration process,
          go to your email and look for a confirmation email from EyeVocalize.com.
          After you click on the link in the email, you will be fully registered.
          (Note that if you find multiple account verification emails, only the last one sent will work.)</div>
          <div class=LoginSignupErrorReturn>To return to the login form, please click
            <a href="" @click=${onClickReturn} title="return to login form">here</a>.
          </div>

        </div>
      `;
    } else if (errorMessage) {
      mainBody = html`
        <div class=LoginSignupErrorMessage>${errorMessage}</div>
        <div class=LoginSignupErrorReturn>To return to the login form, please click
          <a href="" @click=${onClickReturn} title="return to login form">here</a>.
        </div>
      `;
    } else {
      mainBody = html`
        <div class=LoginSignupErrorMessage>${loginMessage}</div>
        <div class=LoginSignupData>
          <div class="gridlayout LoginSignupAppearance">
            <label for="email">Email</label>
            <input type="email" id="email" @input=${onInput} required placeholder="Enter email" autofocus="" autocomplete=email></input>
            <label for="email">Password</label>
            <span class=LoginSignupPasswordSpan>
              <input type=${passwordType} id=password @input=${onInput} required placeholder="Enter password"></input>
              <a @click=${onClickShowPassword} href="" title="show/hide password">
                ${passwordType === 'password' ? 'show' : 'hide'} password
              </a>
            </span>
          </div>
          <div class=LoginSignupButtonRow>
            <button @click=${onClickLogin} id=LoginButton>Login</button>
          </div>
          <div class=LoginSignupGoElsewhere>
            Not yet registered? Then,
            <a href="/signup" title="go to login page">sign up</a>
          </div>
        </div>
      `;
    }
    render(html`
      <style>${css}</style>
      <div class=LoginSignup>
        <div class=LoginSignupTitle>
          You are logging into EyeVocalize.com
          <span class=logo></span>
        </div>
        ${mainBody}
      </div>
    `, document.body);
  };
  localUpdate();
  setTimeout(() => {
    enableDisable();
  },  1000); // delay to allow browser to do autocomplete
};

startupChecks(() => {
  const path = window.location.pathname;
  if (path === '/signup') {
    Signup();
  } else {
    Login();
  }
}, () => {});

/*
export function showLoginSignupPopup(props) {
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
    <div class=LoginSignup>
      <div class=LoginSignupTitle>Signup</div>
      <div class=LoginSignupData>
      <div class="gridlayout LoginSignupAppearance">
        <label for="email">Email</label>
        <input type="email" name="username" id="email" placeholder="Enter email" autofocus=""></input>
        <label for="email">Password</label>
        <span class=LoginSignupPasswordSpan>
          <input type="password" name="password" id="password" placeholder="Enter password"></input>
          <a @click=${onClickShowPassword} href="" title="show/hide password">${showHideText}</a>
        </span>
      </div>
      <div class=LoginSignupButtonRow>
        <button @click=${onClickSignup}>Sign Up</button>
      </div>
    </div>
  `;
};
*/
