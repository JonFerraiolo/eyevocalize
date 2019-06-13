
/**
  History data structure:
    [{text, date}]
  UI:
    Search
    Moments ago
    Today
    Yesterday
    This week
*/

const { wire } = hyperHTML;

export function HistoryControl(text) {
  let obj = { text };
  return wire()`
  <div class=HistoryControl>${obj.text}</div>`;
}
