
const { wire } = hyperHTML;

export function SavedTextControl(text) {
  let obj = { text };
  return wire()`
  <div class=SavedTextControl>${obj.text}</div>`;
}
