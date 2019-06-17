
import { html } from 'https://unpkg.com/lit-html?module';

export function SavedTextControl(text) {
  let obj = { text };
  return html`
  <div class=SavedTextControl>${obj.text}</div>`;
}
