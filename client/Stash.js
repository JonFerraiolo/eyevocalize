
import { render, html } from 'https://unpkg.com/lit-html?module';

let css = `
.Stash {
}
`;

export function updateStash(parentElement, props) {
  let { Stash, searchTokens, onPhraseClick, speak, rightSideIcons, buildTitleWithCollapseExpandArrows } = props;
  let onEditStash = e => {
    e.preventDefault();
    debugger;
  };
  let onHelpStash = e => {
    e.preventDefault();
    debugger;
  };
  let filteredStash = Stash;
  if (searchTokens.length > 0) {
    filteredStash = JSON.parse(JSON.stringify(Stash));  // deep clone
    filteredStash.items = filteredStash.items.filter(phrase => {
      return searchTokens.some(token => {
        return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
      });
    });
  }
  let StashTitle = buildTitleWithCollapseExpandArrows(Stash, "Stash");
  render(html`
  <style>${css}</style>
  <div class=Stash>
    <div class=PhrasesSectionLabel>
      ${StashTitle}${rightSideIcons(onEditStash, onHelpStash)}
    </div>
    ${filteredStash.expanded ?
      html`${filteredStash.items.map(phrase =>
        html`
          <div class=PhraseRow>
            <button @click=${onPhraseClick} .phraseContent=${phrase.text}>${phrase.label || phrase.text}</button>
          </div>
        `
      )}` : ''}
  </div>`, parentElement);
}
