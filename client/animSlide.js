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
 *        animation-name: slideFromRight;
 *        animation-duration: <duration: eg, 1s>;
 *        animation-timing-function: <function: eg, linear>;
 *        animation-fill-mode: forwards;
 *      }
 *      .endFromRightAnim {
 *         margin-left: -100%;
 *      }
 *      @keyframes slideFromRight { from { transform: translate(0,0); } to { transform: translate(-100%,0); } }
 *   Then to cause the slide-from-right to happen, issue this call:
 *      slide.fromRight(params);
 *
 * @param {object} params Various parameters
 * @param {Element} params.leftContentDiv Contains the left-side content before the animation
 * @param {Element} params.rightContentDiv Contains the right-side content before the animation
 * @param {string} params.animClassName Class name to add to leftContentDiv, rightContentDiv to trigger animation
 * @param {string} params.endAnimClassName Class name to add to leftContentDiv to end of animation
 * @param {function} [params.animEndCallback] Called when the animation is finished
 */
export function fromRight(params) {
  let { leftContentDiv, rightContentDiv, animClassName, endAnimClassName, animEndCallback } = params;
	let animEndListener = function(e) {
		leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
		leftContentDiv.removeEventListener('animationend', animEndListener, false);
    leftContentDiv.classList.add(endAnimClassName);
    leftContentDiv.classList.remove(animClassName);
    rightContentDiv.classList.remove(animClassName);
		if (animEndCallback) {
			animEndCallback();
		}
	};
	leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.removeEventListener('animationend', animEndListener, false);
	leftContentDiv.addEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.addEventListener('animationend', animEndListener, false);
  leftContentDiv.classList.add(animClassName);
  rightContentDiv.classList.add(animClassName);
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
 *        animation-name: undoSlideFromRight;
 *        animation-duration: <duration: eg, 1s>;
 *        animation-timing-function: <function: eg, linear>;
 *        animation-fill-mode: forwards;
 *      }
 *      @keyframes undoSlideFromRight { from { transform: translate(-100%,0); } to { transform: translate(0,0); } }
 *   Then to cause the slide-from-right to happen, issue this call:
 *      slide.fromLeft(params);
 *
 * @param {object} params Various parameters
 * @param {Element} params.leftContentDiv Contains the left-side content before the animation
 * @param {Element} params.rightContentDiv Contains the right-side content before the animation
 * @param {string} params.origAnimClassName Class name that was added to leftContentDiv after original animation
 * @param {string} params.undoAnimClassName Class name to add to leftContentDiv to do a reverse animation
 * @param {function} [params.animEndCallback] Called when the animation is finished
 */
export function fromLeft(params) {
  let { leftContentDiv, rightContentDiv, origAnimClassName, undoAnimClassName, animEndCallback } = params;
	let animEndListener = function(e) {
		leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
		leftContentDiv.removeEventListener('animationend', animEndListener, false);
    leftContentDiv.classList.remove(undoAnimClassName);
    rightContentDiv.classList.remove(undoAnimClassName);
		if (animEndCallback) {
			animEndCallback();
		}
	};
	leftContentDiv.removeEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.removeEventListener('animationend', animEndListener, false);
	leftContentDiv.addEventListener('webkitAnimationEnd', animEndListener, false);
	leftContentDiv.addEventListener('animationend', animEndListener, false);
  leftContentDiv.classList.add(undoAnimClassName);
  leftContentDiv.classList.remove(origAnimClassName);
  rightContentDiv.classList.add(undoAnimClassName);
};
