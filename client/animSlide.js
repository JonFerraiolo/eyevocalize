/**
 * Utilities for slide-in replacement of one DIV with the contents of a second DIV
 */

/**
 * Performs a slide-from-right animation of two side-by-side DIVs,
 * where the old content is in the left-side DIV and the new content
 * is in the right-side DIV. Slides the old content out of view to
 * the left, and slides the new content into view from the right.
 *
 * Setup rules:
 *   Need to set up a DOM hierarchy like this:
 *     DIV.slideParent
 *       DIV.leftContentDiv
 *         content in left-side DIV at start of animation
 *       DIV.rightContentDiv
 *         content in right-side DIV at start of animation
 *   Need to set up CSS like this:
 *     .slideParent { width:<somevalue>; overflow:hidden; white-space:nowrap; }
 *     .leftContentDiv, .rightContentDiv { width:<somevalue>; display:inline-block; }
 *     .slideFromRightAnim {
 *        -webkit-animation-name: slideFromRight; -webkit-animation-duration: <duration>; -webkit-animation-timing-function: <function>;
 *        animation-name: slideLeft; animation-duration: <duration>; animation-timing-function: <function>;
 *      }
 *      @-webkit-keyframes slideFromRight { from { margin-left: 0; } to { margin-left: -100%; } }
 *      @keyframes slideFromRight { from { margin-left: 0; } to { margin-left: -100%; } }
 *   Then to cause the slide-from-right to happen, issue this call:
 *      slide.fromRight(params);
 *
 * @param {object} params Various parameters
 * @param {Element} params.leftContentDiv Contains the content before the animation
 * @param {string} params.animClassName Class name to add to leftContentDiv to trigger animation
 * @param {function} [params.animEndCallback] Called when the animation is finished
 */
export function fromRight(params) {
	var leftContentDiv = params.leftContentDiv;
	var animClassName = params.animClassName;
	var animEndCallback = params.animEndCallback;
	var animEndListener = function(e) {
		leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
		leftContentDiv.removeEventListener('animationend', animEndListener, false);
		if (animEndCallback) {
			animEndCallback();
		}
	};
	leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.removeEventListener('animationend', animEndListener, false);
	leftContentDiv.addEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.addEventListener('animationend', animEndListener, false);
	cls.add(leftContentDiv, animClassName);
};

/**
 * Performs a slide-from-left animation of two side-by-side DIVs,
 * where the old content is in the right-side DIV and the new content
 * is in the left-side DIV. Slides the old content out of view to
 * the left, and slides the new content into view from the left.
 *
 * Setup rules:
 *   (Similar DOM and CSS setup as fromRight())
 *   Additional CSS:
 *     .undoSlideFromRightAnim {
 *        -webkit-animation-name: undoSlideFromRight; -webkit-animation-duration: <duration>; -webkit-animation-timing-function: <function>;
 *        animation-name: undoSlideFromRight; animation-duration: <duration>; animation-timing-function: <function>;
 *      }
 *      @-webkit-keyframes undoSlideFromRight { from { margin-left: -100%; } to { margin-left: 0; } }
 *      @keyframes undoSlideFromRight { from { margin-left: -100%; } to { margin-left: 0; } }
 *   Then to cause the slide-from-right to happen, issue this call:
 *      slide.fromLeft(params);
 *
 * @param {object} params Various parameters
 * @param {Element} params.leftContentDiv Contains the content before the animation
 * @param {string} params.animClassName Class name to add to leftContentDiv to do a reverse animation
 * @param {function} [params.animEndCallback] Called when the animation is finished
 */
export function fromLeft(params) {
	var leftContentDiv = params.leftContentDiv;
	var animClassName = params.animClassName;
	var animEndCallback = params.animEndCallback;
	var animEndListener = function(e) {
		leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
		leftContentDiv.removeEventListener('animationend', animEndListener, false);
		cls.remove(leftContentDiv, animClassName);
		if (animEndCallback) {
			animEndCallback();
		}
	};
	leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.removeEventListener('animationend', animEndListener, false);
	leftContentDiv.addEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.addEventListener('animationend', animEndListener, false);
	cls.add(leftContentDiv, animClassName);
};
