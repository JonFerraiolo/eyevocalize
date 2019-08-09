/**
 * Attaches event listeners to a TEXTAREA object so that it resizes to exactly
 * fit the size of the content inside the TEXTAREA.
 *
 * @param {Element} ta The TEXTAREA element which needs to resize
 */
export function resizeableTextarea(ta) {
  if (ta.resizeableTextarea) return;
  ta.resizeableTextarea = true;
  function resize () {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight ? ta.scrollHeight+'px' : '1.4em';
  }
  function delayedResize () {
      window.setTimeout(resize, 0);
  }
  ta.addEventListener('change',  resize, false);
  ta.addEventListener('cut',  delayedResize, false);
  ta.addEventListener('paste',  delayedResize, false);
  ta.addEventListener('drop',  delayedResize, false);
  ta.addEventListener('keydown',  delayedResize, false);
  ta.addEventListener('change',  delayedResize, false);
  window.addEventListener('resize',  delayedResize, false);
  resize();
};
