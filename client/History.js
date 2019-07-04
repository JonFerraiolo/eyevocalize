
import { render, html } from 'https://unpkg.com/lit-html?module';

let css = `
.History {
}
`;

export function updateHistory(parentElement, props) {
  let { History, searchTokens, onPhraseClick, speak, rightSideIcons, buildTitleWithCollapseExpandArrows } = props;
  let onClickEdit = e => {
    e.preventDefault();
    debugger;
  };
  let onClickHelp = e => {
    e.preventDefault();
    debugger;
  };
  let filteredHistory = History;
  if (searchTokens.length > 0) {
    filteredHistory = JSON.parse(JSON.stringify(History));  // deep clone
    filteredHistory.items = filteredHistory.items.filter(phrase => {
      return searchTokens.some(token => {
        return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
      });
    });
  }
  let HistoryTitle = buildTitleWithCollapseExpandArrows(History, "History");
  render(html`
  <style>${css}</style>
  <div class=History>
    <div class=PhrasesSectionLabel>
      ${HistoryTitle}${rightSideIcons(onClickEdit, onClickHelp)}
    </div>
    ${filteredHistory.expanded ?
      html`${filteredHistory.items.map(phrase =>
        html`
          <div class=PhraseRow>
            <button @click=${onPhraseClick} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
          </div>
        `
      )}` : ''}
  </div>`, parentElement);
}
