
import { render, html } from 'https://unpkg.com/lit-html?module';

let css = `
.Favorites {
  padding-left: 0.5em;
  min-height: 0px;
  overflow: auto;
}
.FavoritesCategoryLabel {
  font-size: 90%;
  color: #ccc;
}
.FavoritesCategoryLabel a, .FavoritesCategoryLabel a:link, .FavoritesCategoryLabel a:visited {
  text-decoration: none;
  cursor: pointer;
  color: #ccc;
}
.FavoriteContainer {
  display: inline-block;
}
.Favorites button {
  display: inline-block;
  flex: 1;
  margin: 1px 0;
  align-items: center;
  border-radius: 3px;
  border: 1px solid black;
  background: none;
  font-size: 1rem;
  padding: 0.3rem 0.8em;
  color: black;
  text-align: left;
}
.Favorites button:hover, .Favorites button:focus {
  cursor: pointer;
}
.Favorites button:active {
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.1) inset;
}
`;

export function updateFavorites(parentElement, props) {
  let { Favorites, searchTokens, onPhraseClick, speak, rightSideIcons, buildTitleWithCollapseExpandArrows } = props;
  let onClickEdit = e => {
    e.preventDefault();
    debugger;
  };
  let onClickHelp = e => {
    e.preventDefault();
    debugger;
  };
  let filteredFavorites = JSON.parse(JSON.stringify(Favorites));  // deep clone
  filteredFavorites.categories.forEach((category, index) => {
    category.categoryIndex = index;
    category.items = category.items.filter(phrase => {
      if (searchTokens.length === 0) {
        return true;
      } else {
        return searchTokens.some(token => {
          return (typeof phrase.text === 'string' && phrase.text.toLowerCase().includes(token)) ||
                  (typeof phrase.label === 'string' && phrase.label.toLowerCase().includes(token));
        });
      }
    });
  });
  filteredFavorites.categories = filteredFavorites.categories.filter(category => {
    return category.items.length > 0;
  });
  filteredFavorites.categories.forEach(category => {
    let originalDataCategory = Favorites.categories[category.categoryIndex];
    category.titleContent = buildTitleWithCollapseExpandArrows(originalDataCategory, category.label);
  });
  render(html`
  <style>${css}</style>
  <div class=Favorites>
    <div class=PhrasesSectionLabel>Favorites${rightSideIcons(onClickEdit, onClickHelp)}</div>
    ${filteredFavorites.categories.map(category => html`
      <div class=FavoritesCategoryLabel>${category.titleContent}</div>
      ${category.expanded ?
        html`${category.items.map(phrase =>
          html`
            <div class=FavoriteContainer>
              <button @click=${onPhraseClick} .phraseObject=${phrase}>${phrase.label || phrase.text}</button>
            </div>
          `
        )}` : ''}
    `)}
  </div>`, parentElement);
}
