
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
  font-size: 0.95em;
  top: 0px;
  left: 0px;
  min-width: 20em;
  max-width: 90%;
  min-height: 15em;
  max-height: 90%;
  text-align: left;
  display: flex;
  flex-direction: column;
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
.HelpContent {
  font-size: 0.95em;
  padding: 0.5em 1em;
  flex: 1;
}
.HelpPageTitle {
  font-size: 105%;
  font-weight: bold;
  padding: 0.5em 0 1.0em;
  display: flex;
  line-height: 100%;
}
.HelpPageTitle * {
  vertical-align: middle;
}
.HelpPageTitleString {
  flex: 1;
  text-align: center;
}
.HelpPageContent {
  overflow-x: hidden;
  overflow-y: auto;
  white-space: normal;
}
.HelpContents {
  display: grid;
  grid-template-columns: auto auto;
  width: fit-content;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.5em;
  line-height: 1.2em;
}
.HelpFooter {
  display: flex;
  justify-content: space-between;
  font-size: 0.95em;
}
.HelpPageContent topic {
  font-weight: bold;
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
    let page = e.currentTarget.PageId;
    if (helpPages[page]) {
      currentPage = page;
      localUpdate();
    }
  };
  let buildGoto = helpPageId => {
    return html`<a href="" @click=${onGoto} .PageId=${helpPageId}>${localization.help[helpPageId]}</a>`;
  };
  let buildGotoContent = (helpPageId, content) => {
    return html`<a href="" @click=${onGoto} .PageId=${helpPageId}>${unsafeHTML(content)}</a>`;
  };
  let buildGotoPrevNext = (helpPageId, PrevOrNext) => {
    let clz = "HelpFooter"+PrevOrNext;
    if (!helpPageId) {
      return html`<span class=${clz}></span>`;
    } else {
      return html`<a href="" @click=${onGoto} .PageId=${helpPageId} class=${clz}>
        ${localization.help[PrevOrNext]}
        <span class=HelpFooterPrevNextName>(${localization.help[helpPageId]})</span>
      </a>`;
    }
  };
  let localUpdate = () => {
    let content = html`${helpPages[currentPage].value}`;
    let footer = '';
    if (currentPage !== 'Contents') {
      let prev = buildGotoPrevNext(helpPages[currentPage].prev, 'Prev');
      let next = buildGotoPrevNext(helpPages[currentPage].next, 'Next');
      footer = html`
      <div class=HelpFooter>
        ${prev}
        <a href="" @click=${onGoto} .PageId=${"Contents"} class=HelpFooterContents>Contents</a>
        ${next}
      </div>
      `;
    }
    render(html`
      <div class=HelpHeader @mousedown=${dragMouseDown}>
        <span class=HelpHeaderIcon></span>Help
        <span class=HelpHeaderClose @click=${onClose}></span>
      </div>
      <div class=HelpContent>${content}</div>
      ${footer}
    `, helpDiv);
    // replace all <topic>Foo</topic> with the markup equivalent of
    // <topic>${buildGoto(Foo)}</topic>
    let topicElems = helpDiv.querySelectorAll('topic');
    topicElems.forEach(topicElem => {
      let helpPageId = topicElem.innerText;
      if (helpPages[helpPageId]) {
        render(buildGoto(helpPageId), topicElem);
      }
    });
    helpDiv.style.visibility = 'hidden';
    helpDiv.style.display = 'flex';
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

  let buildTitle = (thisPage) => {
    return html`<div class=HelpPageTitle>
      <span class=HelpPageTitleString>${localization.help[thisPage]}</span>
    </div>`;
  };
  let helpPages = {
    Contents: {
      prev: null,
      next: null,
      value: html`
        ${buildTitle('Contents')}
        <div class="HelpPageContent HelpContents">
          <span class=HelpContentsName>${buildGoto('Introduction')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.IntroductionContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('Features')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.FeaturesContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('Shortcuts')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.ShortcutsContentsDesc)}</span>
        </div>
      `,
    },
    Introduction: {
      prev: null,
      next: 'Features',
      value: html`
        ${buildTitle('Introduction')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.IntroductionContent)}</div>
      `,
    },
    Features: {
      prev: 'Introduction',
      next: 'Shortcuts',
      value: html`
        ${buildTitle('Features')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.FeaturesContent)}</div>
      `,
    },
    Shortcuts: {
      prev: 'Features',
      next: null,
      value: html`
        ${buildTitle('Shortcuts')}
        <div class="HelpPageContent HelpShortcuts">
          <span class=HelpPageGridItem>Shortcut one</span>
        </div>
      `,
    },
  };

  let currentPage = 'Contents';
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
