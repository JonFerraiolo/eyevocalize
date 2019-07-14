
import { html, render } from './lib/lit-html/lit-html.js';
import { onPhraseClick, rightSideIcons, buildTitleWithCollapseExpandArrows } from './Phrases.js';

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

let Favorites;

export function initializeFavorites(props) {
  let { currentVersion } = props;
  Favorites = {
    version: currentVersion,
    categories: [
    	{ label: 'Basic', expanded: true, items: [
    		{ type: 'text', label: 'nevermind', text: 'Sorry. False alarm. Nevermind what I just said.'},
    		{ type: 'text', label: 'thanks', text: 'Thank you.'},
    		{ type: 'text', label: 'thanka', text: 'Thank you. You are an angel.'},
    		{ type: 'text', label: 'help', text: 'Please come and help me'},
    		{ type: 'text', label: 'testing', text: 'Please ignore what comes out of the computer for the next couple of minutes. I am just testing the software. '},
    	]},
    	{ label: 'Care Requests', expanded: true, items: [
    		{ type: 'text', label: 'air', text: 'Can I have air?'},
    		{ type: 'text', label: 'mask', text: 'Can you please fix my breathing mask?'},
    		{ type: 'text', label: 'nebulizer', text: 'Time for nebulizer and feeding'},
    		{ type: 'text', label: 'toilet', text: 'Take me to the toilet, please'},
    		{ type: 'text', label: 'urinal', text: 'can I please use the urinal'},
    		{ type: 'text', label: 'bed', text: 'Can I please go to my bed?'},
    		{ type: 'text', label: 'hurry', text: 'Please hurry!'},
    		{ type: 'text', label: 'no rush', text: 'Take your time. Not urgent'},
    		{ type: 'text', label: 'cold', text: 'I am a little cold. Could I please have something more over me?'},
    		{ type: 'text', label: 'warm', text: 'I am a little warm. Could you please take something off of me?'},
    		{ type: 'text', label: 'tubing', text: 'Please pull the blue tubing, you know, the tubing that goes from the breathing machine to my face mask, please pull it outside of the bed as much as possible. '},
    		{ type: 'text', label: 'face up', text: 'Please roll me a little so that my body is flat on the bed and my head is facing straight up. '},
    		{ type: 'text', label: 'head', text: 'Please straighten my head '},
    	]},
    	{ label: 'Adjustments', expanded: true, items: [
    		{ type: 'text', label: 'down', text: 'Please move it down. '},
    		{ type: 'text', label: 'up', text: 'Please move it up. '},
    		{ type: 'text', label: 'left', text: 'Please move it to my left. '},
    		{ type: 'text', label: 'right', text: 'Please move it to my right. '},
    		{ type: 'text', label: 'chair pos', text: 'Can you please fix the position of the wheelchair?'},
    		{ type: 'text', label: 'tilt fwd', text: 'Can you please tilt the wheelchair forward?'},
    		{ type: 'text', label: 'tilt back', text: 'Can you please tilt the wheelchair backward?'},
    	]},
    	{ label: 'Other', expanded: true, items: [
    		{ type: 'text', label: 'sliding', text: 'Can you please close the sliding glass doors?'},
    		{ type: 'text', label: 'Pepe', text: 'Can someone please help Peppay? '},
    		{ type: 'audio', label: 'Disappointed!', url: 'http://www.montypython.net/sounds/wanda/disappointed.wav'},
    		{ type: 'audio', label: 'Inconceivable!', url: 'http://www.moviesoundclips.net/download.php?id=2900&ft=mp3'},
        { type: 'audio', label: 'Excellent!', url: 'http://www.billandted.org/sounds/ea/eaexcellent.mp3'},
        { type: 'youtube', label: 'kenny', videoId: 'kXxr9A_UBG4', startAt: 10, endAt: 16 },
        { type: 'youtube', label: 'missed it', videoId: 'oPwrodxghrw', startAt: 2.5, endAt: 7.5 },
    	]}
    ]
  };
};

export function updateFavorites(parentElement, props) {
  let { searchTokens } = props;
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

export function editFavorites(parentElement, props) {

};
