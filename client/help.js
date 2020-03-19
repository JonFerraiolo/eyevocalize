
import { html, render } from './lib/lit-html/lit-html.js';
import { unsafeHTML } from './lib/lit-html/directives/unsafe-html.js';
import { markedLoadedPromise } from './startupChecks.js';
import { mainAppPercentWhenSmall } from './Settings.js';
import { localization } from './main.js';

let css = `
.Help {
  background: white;
  position: fixed;
  z-index: 411;
  border: 1px solid black;
  font-size: 0.85em;
  top: 0px;
  left: 0px;
  width: 30%;
  height: 30%;
  text-align: left;
}
.HelpHeader {
  z-index: 412;
  font-weight: bold;
  text-align: center;
  background: #bbb;
  border-bottom: 1px solid #555;
  height: 1.5em;
  line-height: 1.5em;
  vertical-align: middle;
}
.HelpContent {
  font-size: 0.9em;
}
.HelpHeaderIcon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-size: 0.75em 0.75em;
  background-image: url('./images/helpicon.svg');
  background-position: 50% 95%;
  background-repeat: no-repeat;
  margin: 0 0.1em 0 0;
}
.HelpHeaderClose {
  float: right;
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  background-size: 1em 1em;
  background-image: url('./images/close.svg');
  background-position: 50% 50%;
  background-repeat: no-repeat;
  margin: 0 0.1em 0 0;
  cursor: pointer;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let oldClientX, oldClientY;
let showingHelp = false;

function showHelp(topic) {
  const helpDiv = document.querySelector('.Help');
  if (!helpDiv) return;
  showingHelp = true;
  let onClose = e => {
    e.preventDefault();
    hideHelp();
  };
  let dragMouseDown = e => {
    e.preventDefault();
    oldClientX = e.clientX;
    oldClientY = e.clientY;
    document.addEventListener('mousemove', dragElement, false);
    document.addEventListener('mouseup', closeDragElement, false);
  };
  let onGoto = e => {
    e.preventDefault();
    content = html`${helpPages[e.currentTarget.PageId]}`;
    localUpdate();
  };
  let buildGoto = (textLocalizationId) => {
    return html`<a href="" @click=${onGoto} .PageId=${textLocalizationId}>${localization.help[textLocalizationId]}</a>`;
  };
  let localUpdate = () => {
    render(html`
      <div class=HelpHeader @mousedown=${dragMouseDown}>
        <span class=HelpHeaderIcon></span>Help
        <span class=HelpHeaderClose @click=${onClose}></span>
      </div>
      <div class=HelpContent>${content}</div>
    `, helpDiv);
    helpDiv.style.visibility = 'hidden';
    helpDiv.style.display = 'block';
    setTimeout(() => {
      // setTimeout to allow browser to lay out the help content so that everything has a size
      let bounds = helpDiv.getBoundingClientRect();
      let left = Math.max((window.innerWidth - bounds.width) / 2, 0);
      let topSection = mainAppPercentWhenSmall() / 100;
      let top = Math.max((window.innerHeight*topSection - bounds.height) / 2, 0); // force to top part
      helpDiv.style.left = left + 'px';
      helpDiv.style.top = top + 'px';
      helpDiv.style.visibility = 'visible';
    }, 0);
  };

  let helpPages = {
    "Help Table of Contents": html`
      <div class=HelpPageTitle>${localization.help['Help Table of Contents']}</div>
      <div class=HelpPageGrid>
        <span class=HelpPageGridItem>${buildGoto('Keyboard shortcuts')}</span>
      </div>
    `,
    "Keyboard shortcuts": html`
      <div class=HelpPageTitle>${localization.help['Keyboard shortcuts']}</div>
      <div class=HelpPageGrid>
        <span class=HelpPageGridItem>Shortcut one</span>
      </div>
    `,
  };

  let content = html`${helpPages['Help Table of Contents']}`;
  localUpdate();
}

function hideHelp() {
  showingHelp = false;
  const helpDiv = document.querySelector('.Help');
  if (!helpDiv) return;
  helpDiv.style.display = 'none';
}

export function toggleHelp(topic) {
  const helpDiv = document.querySelector('.Help');
  if (!helpDiv) return;
  if (helpDiv.style.display === 'none') {
    showHelp(topic);
  } else {
    hideHelp();
  }
}

export function helpShowing() {
  return showingHelp;
}

let dragElement = e => {
  e.preventDefault();
  const helpDiv = document.querySelector('.Help');
  if (!helpDiv) return;
  let deltaX = oldClientX - e.clientX;
  let deltaY = oldClientY - e.clientY;
  oldClientX = e.clientX;
  oldClientY = e.clientY;
  helpDiv.style.top = (helpDiv.offsetTop - deltaY) + "px";
  helpDiv.style.left = (helpDiv.offsetLeft - deltaX) + "px";
}

let closeDragElement = e => {
  document.removeEventListener('mousemove', dragElement, false);
  document.removeEventListener('mouseup', closeDragElement, false);
  let minVisibleX = 75;
  let minVisibleY = 35;
  const helpDiv = document.querySelector('.Help');
  if (!helpDiv) return;
  let bounds = helpDiv.getBoundingClientRect();
  let { left, right, top, bottom, width, height } = bounds;
  let anyChanges = false;
  if (right < minVisibleX) {
    left = minVisibleX - width;
    anyChanges = true;
  }
  if (left > window.innerWidth - minVisibleX) {
    left = window.innerWidth - minVisibleX;
    anyChanges = true;
  }
  if (top > window.innerHeight - minVisibleY) {
    top = window.innerHeight - minVisibleY;
    anyChanges = true;
  }
  if (top < 0) {
    top = 0;
    anyChanges = true;
  }
  if (anyChanges) {
    helpDiv.style.left = left + 'px';
    helpDiv.style.top = top + 'px';
  }
};
