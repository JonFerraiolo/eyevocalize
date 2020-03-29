
import { html, render } from './lib/lit-html/lit-html.js';
import { showPopup, hidePopup } from './popup.js';
import { unsafeHTML } from './lib/lit-html/directives/unsafe-html.js';
import { markedLoadedPromise } from './startupChecks.js';
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
  padding-left: 4em;
  cursor: move;
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
.HelpHeaderPosition, .HelpHeaderSize, .HelpHeaderClose {
  float: right;
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  background-size: 1em 1em;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  margin: 0 0.1em 0 0;
  cursor: pointer;
}
.HelpHeaderPosition {
  background-image: url('./images/position.svg');
}
.HelpHeaderSize {
  background-image: url('./images/size.svg');
}
.HelpHeaderClose {
  background-image: url('./images/close.svg');
}
.HelpContent {
  font-size: 0.95em;
  padding: 0.5em 1em;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
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
  white-space: normal;
  font-size: 0.95em;
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
let Size = 'short-thin'; // short-thin, tall-wide, tall-thin, short-wide
let Position = 'middle-center'; // top-left, ... , bottom-right / top,middle,right;left,center,right plus manual
let DefaultSizeThin = '24em';
let DefaultSizeWide = '37.5em';
let DefaultSizeShort = '21em';
let DefaultSizeTall = '60em';
let showHelpFirstTime = true;

function showHelp(topic) {
  function AppLayoutChangedHandler(e) {
    console.log('AppLayoutChangedHandler');
    if (showingHelp) {
      localUpdate();
    }
  }
  if (showHelpFirstTime)  {
    showHelpFirstTime = false;
    window.addEventListener('AppLayoutChanged', AppLayoutChangedHandler, false);
  }
  const helpDiv = document.querySelector('.Help');
  if (!helpDiv) return;
  showingHelp = true;
  let onPosition = e => {
    e.preventDefault();
    showPositionMenu(document.querySelector('.HelpHeaderPosition'), () => {
      localUpdate();
    });
  };
  let onSize = e => {
    e.preventDefault();
    showSizeMenu(document.querySelector('.HelpHeaderSize'), () => {
      localUpdate();
    });
  };
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
        <span class=HelpHeaderClose title=${localization.help['closeIconDesc']} @click=${onClose}></span>
        <span class=HelpHeaderPosition title=${localization.help['positionIconDesc']} @click=${onPosition}></span>
        <span class=HelpHeaderSize title=${localization.help['sizeIconDesc']} @click=${onSize}></span>
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
    let [sizey, sizex] = Size.split('-');
    helpDiv.style.width = sizex === 'wide' ? DefaultSizeWide : DefaultSizeThin;
    helpDiv.style.height = sizey === 'tall' ? DefaultSizeTall : DefaultSizeShort;
    let iw = window.innerWidth;
    let ih = window.innerHeight;
    setTimeout(() => {
      // First setTimeout to allow browser to lay out the help content so that everything has a size
      // so we can shrink if too big
      let topDiv = document.querySelector('.appmaincontent');
      let boundsHelpDiv = helpDiv.getBoundingClientRect();
      let boundsTopDiv = topDiv ? topDiv.getBoundingClientRect() : {x:0, left:0, y:0, top:0, right:iw, width:iw, bottom:ih, height:ih};
      helpDiv.style.width = Math.min(boundsHelpDiv.width, boundsTopDiv.width) + 'px';
      helpDiv.style.height = Math.min(boundsHelpDiv.height, boundsTopDiv.height) + 'px';
      setTimeout(() => {
        // Second setTimeout to allow browser to lay out the help content in case sizes change
        // and now place the helpDiv in the right place
        let [posy, posx] = Position.split('-');
        boundsHelpDiv = helpDiv.getBoundingClientRect();
        if (posy === 'bottom') {
          helpDiv.style.top = (boundsTopDiv.height - boundsHelpDiv.height) + 'px';
        } else if (posy === 'middle') {
          helpDiv.style.top = ((boundsTopDiv.height - boundsHelpDiv.height)/2) + 'px';
        } else {
          helpDiv.style.top = '0px';
        }
        if (posx === 'right') {
          helpDiv.style.left = (boundsTopDiv.width - boundsHelpDiv.width) + 'px';
        } else if (posx === 'center') {
          helpDiv.style.left = ((boundsTopDiv.width - boundsHelpDiv.width)/2) + 'px';
        } else {
          helpDiv.style.left = '0px';
        }
        helpDiv.style.visibility = 'visible';
      }, 0);
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

function showSizeMenu(refNode, hideCB) {
	let params = {
		content: HelpSizeMenu,
		refNode,
		refX: 'middle',
		refY: 'bottom',
		popupX: 'right',
		popupY: 'top',
    underlayOpacity: 0.4,
		hideCallback: () => { hideCB(); },
	};
	let popupRootElement = showPopup(params);
}

let HelpSizeMenu = (parentElement, customControlsData) => {
  let onClick = e => {
    e.preventDefault();
		e.stopPropagation();
    let HelpMenuId = e.currentTarget.HelpMenuId;
    let [y, x] = Size.split('-');
    if (HelpMenuId === 'max' || HelpMenuId === 'tall') {
      y = 'tall';
    } else if (HelpMenuId === 'min' || HelpMenuId === 'short') {
      y = 'short';
    }
    if (HelpMenuId === 'max' || HelpMenuId === 'wide') {
      x = 'wide';
    } else if (HelpMenuId === 'min' || HelpMenuId === 'thin') {
      x = 'thin';
    }
    Size = y+'-'+x;
		hidePopup(customControlsData);
  };
  render(html`<div class="HelpSizeMenu popupMenu">
  <div class=popupMenuTitle>${localization.help['Size']}</div>
		<ul class=popupMenuUL>
      <li><a class="popupMenuItem" href="" .HelpMenuId=${'max'} @click=${onClick}>
				<span class=popupMenuLabel>${localization.help['max']}</span>
			</a></li>
      <li><a class="popupMenuItem" href="" .HelpMenuId=${'min'} @click=${onClick}>
				<span class=popupMenuLabel>${localization.help['min']}</span>
			</a></li>
      <li class="popupMenuItem popupMenuSeparator"></li>
      <li><a class="popupMenuItem" href="" .HelpMenuId=${'tall'} @click=${onClick}>
				<span class=popupMenuLabel>${localization.help['tall']}</span>
			</a></li>
      <li><a class="popupMenuItem" href="" .HelpMenuId=${'short'} @click=${onClick}>
        <span class=popupMenuLabel>${localization.help['short']}</span>
      </a></li>
      <li class="popupMenuItem popupMenuSeparator"></li>
      <li><a class="popupMenuItem" href="" .HelpMenuId=${'wide'} @click=${onClick}>
        <span class=popupMenuLabel>${localization.help['wide']}</span>
      </a></li>
      <li><a class="popupMenuItem" href="" .HelpMenuId=${'thin'} @click=${onClick}>
        <span class=popupMenuLabel>${localization.help['thin']}</span>
      </a></li>
		</ul>
	</div>`, parentElement);
};

function showPositionMenu(refNode, hideCB) {
	let params = {
		content: HelpPositionMenu,
		refNode,
		refX: 'middle',
		refY: 'bottom',
		popupX: 'right',
		popupY: 'top',
    underlayOpacity: 0.4,
		hideCallback: () => { hideCB(); },
	};
	let popupRootElement = showPopup(params);
}

// v-align top, middle, bottom, h-align left, center, right,
// biggest, smallest, taller, shorter, wider, thinner
let HelpPositionMenu = (parentElement, customControlsData) => {
  let onClick = e => {
    e.preventDefault();
		e.stopPropagation();
    let HelpMenuId = e.currentTarget.HelpMenuId;
    let [y, x] = Position.split('-');
    if (['top', 'middle', 'bottom'].indexOf(HelpMenuId) >= 0) {
      Position = Position === 'manual' ? HelpMenuId+'-center' : HelpMenuId+'-'+x;
    } else if (['left', 'center', 'right'].indexOf(HelpMenuId) >= 0) {
      Position = Position === 'manual' ? 'middle-'+HelpMenuId : y+'-'+HelpMenuId;
    }
		hidePopup(customControlsData);
  };
  render(html`<div class="HelpPositionMenu popupMenu">
  <div class=popupMenuTitle>${localization.help['Position']}</div>
		<ul class=popupMenuUL>
      <li class="popupMenuItem popupMenuSection">${localization.help['vertical']}</li>
      <li><a class="popupMenuItem popupMenuItemIndented" href="" .HelpMenuId=${'top'} @click=${onClick}>
				<span class=popupMenuLabel>${localization.help['top']}</span>
			</a></li>
      <li><a class="popupMenuItem popupMenuItemIndented" href="" .HelpMenuId=${'middle'} @click=${onClick}>
				<span class=popupMenuLabel>${localization.help['middle']}</span>
			</a></li>
      <li><a class="popupMenuItem popupMenuItemIndented" href="" .HelpMenuId=${'bottom'} @click=${onClick}>
				<span class=popupMenuLabel>${localization.help['bottom']}</span>
			</a></li>
      <li class="popupMenuItem popupMenuSeparator"></li>
      <li class="popupMenuItem popupMenuSection">${localization.help['horizontal']}</li>
      <li><a class="popupMenuItem popupMenuItemIndented" href="" .HelpMenuId=${'left'} @click=${onClick}>
        <span class=popupMenuLabel>${localization.help['left']}</span>
      </a></li>
      <li><a class="popupMenuItem popupMenuItemIndented" href="" .HelpMenuId=${'center'} @click=${onClick}>
        <span class=popupMenuLabel>${localization.help['center']}</span>
      </a></li>
      <li><a class="popupMenuItem popupMenuItemIndented" href="" .HelpMenuId=${'right'} @click=${onClick}>
        <span class=popupMenuLabel>${localization.help['right']}</span>
      </a></li>
		</ul>
	</div>`, parentElement);
};
