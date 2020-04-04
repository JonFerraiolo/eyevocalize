
import { html, render } from './lib/lit-html/lit-html.js';

let popupStackCount = 0;
let popupStack =[];

/**
 * Show a popup.
 * @param {object} params Various parameters
 * @param {object|function} params.content if an function, call the given function to render the content.
 *         this routine will pass the parent node for the content as the sole parameter to the function.
 *         otherwise, content must be a lit-html value returned from html``
 * @param {object} [params.contentFuncParams] if content is a function, pass this to the function
 * @param {Element} [params.refNode] Position the popup relative to this element (default: body)
 * @param {string} [params.refX] Alignment edge on refNode: left|center|right (default: center)
 * @param {string} [params.refY] Alignment edge on refNode: top|center|bottom (default: center)
 * @param {string} [params.popupX] Alignment edge on popup: left|center|right (default: center)
 * @param {string} [params.popupY] Alignment edge on popup: top|center|bottom (default: center)
 * @param {number} [params.offsetX] After aligning edges, shift popup this many pixels to right (default: 0)
 * @param {number} [params.offsetY] After aligning edges, shift popup this many pixels to bottom (default: 0)
 * @param {boolean} [params.clickAwayToClose] Clicking on background closes the popup (default: true)
 * @param {boolean} [params.underlayOpacity] Opacity value for underlay (default: .6)
 * @param {function} [params.hideCallback] Callback to call when the popup comes down
 * @returns {object} object that must be passed back when calling hidePopup, includes popupOverlay root element
 */
export function showPopup(params) {
	let clickAwayToClose, underlayOpacity;
	var content = params.content;
	let { contentFuncParams } = params;
	var refNode = params.refNode || document.body;
	var refX = params.refX || 'center';
	var refY = params.refY || 'center';
	var popupX = params.popupX || 'center';
	var popupY = params.popupY || 'center';
	var offsetX = params.offsetX || 0;
	var offsetY = params.offsetY || 0;
	clickAwayToClose = typeof params.clickAwayToClose == 'boolean' ? params.clickAwayToClose : true;
	underlayOpacity = typeof params.underlayOpacity == 'undefined' ? '.6' : params.underlayOpacity;
	let hideCallback = params.hideCallback;
  if (!popupStack[popupStackCount]) {
    popupStack[popupStackCount] = { popupOverlay: null, popupUnderlay: null, popupStackCount };
  }
  let showPopupReturnData = popupStack[popupStackCount];
  showPopupReturnData.hideCallback = hideCallback;
  let { popupOverlay, popupUnderlay } = showPopupReturnData;
	if (!popupUnderlay) {
		popupUnderlay = document.createElement('div');
		popupUnderlay.className = 'popupUnderlay';
		popupUnderlay.style.position = 'absolute';
		popupUnderlay.style.left = '0px';
		popupUnderlay.style.right = '0px';
		popupUnderlay.style.top = '0px';
		popupUnderlay.style.bottom = '0px';
		popupUnderlay.style.backgroundColor = 'white';
		popupUnderlay.style.zIndex = (10000000+popupStackCount*2).toString();
		popupUnderlay.addEventListener('click', function(e) {
			e.stopPropagation();
			if (clickAwayToClose) {
				hidePopup(showPopupReturnData);
			}
		}.bind(this), false);
		document.body.appendChild(popupUnderlay);
    showPopupReturnData.popupUnderlay = popupUnderlay;
	}
	popupUnderlay.style.opacity = underlayOpacity;
	if (!popupOverlay) {
		popupOverlay = document.createElement('div');
		popupOverlay.className = 'popupOverlay';
		popupOverlay.style.position = 'absolute';
		popupOverlay.style.zIndex = (10000000+popupStackCount*2+1).toString();
		document.body.appendChild(popupOverlay);
    showPopupReturnData.popupOverlay = popupOverlay;
	}
	popupUnderlay.style.display = '';
	popupOverlay.style.display = '';
	popupOverlay.style.opacity = 0;
	popupOverlay.style.left = '0px';
	popupOverlay.style.top = '0px';
	if (typeof content == 'function') {
		content(popupOverlay, contentFuncParams);
	} else {
		render(params.content, popupOverlay);
	}
	// setTimeout to allow browser time to apply styling and computer sizes
	setTimeout(function(){
		var refRect = refNode === document.body ?
			{ left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight } :
			refNode.getBoundingClientRect();
		var overlayRect = popupOverlay.getBoundingClientRect();
		var w = overlayRect.width;
		var h = overlayRect.height;
		var rX = (refX == 'left' ? refRect.left : (refX == 'right' ? refRect.right : (refRect.left+refRect.right)/2));
		var rY = (refY == 'top' ? refRect.top : (refY == 'bottom' ? refRect.bottom : (refRect.top+refRect.bottom)/2));
		var x = (popupX == 'left' ? rX : (popupX == 'right' ? rX - w : rX - w/2));
		var y = (popupY == 'top' ? rY : (popupY == 'bottom' ? rY - h : rY - h/2));
		x += offsetX;
		y += offsetY;
		// Make sure popup doesn't extend off end of viewport
		var r = x + w;
		var b = y + h;
		if (r > window.innerWidth) {
			x -= (r - window.innerWidth);
		}
		if (b > window.innerHeight) {
			y -= (b - window.innerHeight);
		}
		if (x < 0) {
			x = 0;
		}
		if (y < 0) {
			y = 0;
		}
		popupOverlay.style.left = x + 'px';
		popupOverlay.style.top = y + 'px';
		popupOverlay.style.opacity = 1;
	}, 0);
  popupStackCount++;
	return showPopupReturnData;
}

export function hidePopup(showPopupReturnData, hideCallbackParams) {
  let { popupOverlay, popupUnderlay, hideCallback } = showPopupReturnData;
  popupStackCount--;
	popupUnderlay.style.display = 'none';
	popupOverlay.style.display = 'none';
	if (hideCallback) {
		hideCallback(hideCallbackParams);
		showPopupReturnData.hideCallback = null;
	}
}

export function popupShowing() {
  return popupStackCount > 0;
}
