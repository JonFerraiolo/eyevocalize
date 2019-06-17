
import { SavedTextControl } from './SavedTextControl.js'
import { html } from 'https://unpkg.com/lit-html?module';

export function SavedTextContainer(text) {
  let obj = { text };
  return html`
  <div class=SavedTextContainer>${SavedTextControl(obj.text)}</div>`;
}
