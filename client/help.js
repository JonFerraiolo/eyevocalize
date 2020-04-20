
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
.HelpHeaderPosition, .HelpHeaderSize, .HelpHeaderClose, .HelpPageContentIcon1, .HelpPageContentIcon2 {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-size: 1em 1em;
  background-position: 50% 50%;
  background-repeat: no-repeat;
}
.HelpHeaderPosition, .HelpHeaderSize, .HelpHeaderClose {
  float: right;
  width: 1.5em;
  height: 1.5em;
  margin: 0 0.1em 0 0;
  cursor: pointer;
}
.HelpPageContentIcon1, .HelpPageContentIcon2 {
  vertical-align: bottom;
}
.HelpPageContentIcon2 {
  width: 2em;
  height: 2em;
  background-size: 1.75em 1.75em;
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
  padding: 0em 1em;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
.HelpPageTitle {
  font-size: 105%;
  font-weight: bold;
  padding: 0.5em 0 0.5em;
  display: flex;
  line-height: 100%;
}
.HelpPageTitle * {
  vertical-align: middle;
}
.HelpPageTitleString {
  flex: 1;
  text-align: center;
  margin-bottom: 0.7em;
}
.HelpPageContent {
  white-space: normal;
  font-size: 0.85em;
}
.HelpPageContent.HelpPageFlow > *:first-child {
  margin-top: 0em;
}
.HelpPageContent ul {
  padding-inline-start: 1.5em;
  margin-block-start: 0.0em;
  margin-block-end: 0.5em;
}
.HelpPageContent p {
  margin-block-start: 0.7em;
  margin-block-end: 0.7em;
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
  margin: 1em 0 0.4em;
}
.HelpPageContent topic {
  font-weight: bold;
}
.HelpVeryImportant {
  font-weight: bold;
  color: red;
}
`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

let oldClientX, oldClientY;
let showingHelp = false;
let Size, Position;
let DefaultSizeThin = '24em';
let DefaultSizeMedium = '36em';
let DefaultSizeWide = '48em';
let DefaultSizeShort = '21em';
let DefaultSizeTall = '60em';
let showHelpFirstTime = true;

export function showHelp(initialPage, initialSize) {
  Size = initialSize || 'short-thin'; // short-thin, short-medium, short-wide, tall-thin, tall-medium, tall-wide
  Position = 'middle-center'; // top-left, ... , bottom-right / top,middle,right;left,center,right plus manual
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
    if (window.eyevocalizeUserEmail.length > 1) {
      localStorage.setItem('LoginHelpClosed', Date.now().toString());
    }
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
    // replace all <icon>Foo</icon> with the markup equivalent of
    // <icon class="HelpPageContentIcon1" style="background-image:url(... Foo.svg)"></icon>
    let iconElems = helpDiv.querySelectorAll('icon1,icon2');
    iconElems.forEach(iconElem => {
      let iconName = iconElem.IconName || iconElem.innerText;
      iconElem.innerText = '';
      iconElem.IconName = iconName;
      iconElem.classList.add(iconElem.tagName.toLowerCase() === 'icon2' ? 'HelpPageContentIcon2' : 'HelpPageContentIcon1');
      iconElem.style.backgroundImage = 'url(./images/'+iconName+'.svg)';
    });
    helpDiv.style.visibility = 'hidden';
    helpDiv.style.display = 'flex';
    let [sizey, sizex] = Size.split('-');
    helpDiv.style.width = sizex === 'wide' ? DefaultSizeWide : (sizex === 'medium'  ?  DefaultSizeMedium : DefaultSizeThin);
    helpDiv.style.height = sizey === 'tall' ? DefaultSizeTall : DefaultSizeShort;
    let iw = window.innerWidth;
    let ih = window.innerHeight;
    let HelpContentElem = helpDiv.querySelector('.HelpContent');
    if (HelpContentElem) {
      HelpContentElem.scrollTop = 0;
    }
    let HelpPageContent = helpDiv.querySelector('.HelpPageContent');
    if (HelpPageContent) {
      HelpPageContent.style.columns = (sizex === 'wide') ? 2 : 1;
    }
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
          <span class=HelpContentsName>${buildGoto('Starting')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.StartingContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('Features')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.FeaturesContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('Type-to-speak')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.TtsContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('Whiteboard')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.WhiteboardContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('History')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.HistoryContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('Favorites')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.FavoritesContentsDesc)}</span>
          <span class=HelpContentsName>${buildGoto('Shortcuts')}</span>
          <span class=HelpContentsDesc>${unsafeHTML(localization.help.ShortcutsContentsDesc)}</span>
        </div>
      `,
    },
    Starting: {
      prev: null,
      next: 'Features',
      value: html`
        ${buildTitle('Starting')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.StartingContent)}</div>
      `,
    },
    Features: {
      prev: 'Starting',
      next: 'Type-to-speak',
      value: html`
        ${buildTitle('Features')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.FeaturesContent)}</div>
      `,
    },
    "Type-to-speak": {
      prev: 'Features',
      next: 'Whiteboard',
      value: html`
        ${buildTitle('Type-to-speak')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.TtsContent)}</div>
      `,
    },
    Whiteboard: {
      prev: 'Type-to-speak',
      next: 'History',
      value: html`
        ${buildTitle('Whiteboard')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.WhiteboardContent)}</div>
      `,
    },
    History: {
      prev: 'Whiteboard',
      next: 'Favorites',
      value: html`
        ${buildTitle('History')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.HistoryContent)}</div>
      `,
    },
    Favorites: {
      prev: 'History',
      next: 'Favorites',
      value: html`
        ${buildTitle('Favorites')}
        <div class="HelpPageContent HelpPageFlow">${unsafeHTML(localization.help.FavoritesContent)}</div>
      `,
    },
    Shortcuts: {
      prev: 'Favorites',
      next: null,
      value: html`
        ${buildTitle('Shortcuts')}
        <div class="HelpPageContent HelpShortcuts">
          <span class=HelpPageGridItem>Shortcut one</span>
        </div>
      `,
    },
  };

  let currentPage = (initialPage && helpPages[initialPage]) ? initialPage : 'Contents';
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

let showPopupReturnData;

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
	showPopupReturnData = showPopup(params);
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
    } else if (HelpMenuId === 'medium') {
      x = 'medium';
    } else if (HelpMenuId === 'min' || HelpMenuId === 'thin') {
      x = 'thin';
    }
    Size = y+'-'+x;
		hidePopup(showPopupReturnData, customControlsData);
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
      <li><a class="popupMenuItem" href="" .HelpMenuId=${'medium'} @click=${onClick}>
        <span class=popupMenuLabel>${localization.help['medium']}</span>
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
	showPopupReturnData = showPopup(params);
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
		hidePopup(showPopupReturnData, customControlsData);
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
