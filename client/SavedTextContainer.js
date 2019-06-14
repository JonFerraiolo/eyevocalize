
import { SavedTextControl } from './SavedTextControl.js'
const { wire } = hyperHTML;

export function SavedTextContainer(text) {
  let obj = { text };
  //return wire()`
  //<div class=SavedTextContainer>${obj.text}</div>`;
  return wire()`
  <div class=SavedTextContainer>${SavedTextControl(obj.text)}</div>`;
}
