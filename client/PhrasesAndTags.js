
import { Phrases} from './Phrases.js';
import { Tags } from './Tags.js';
import { html } from 'https://unpkg.com/lit-html?module';

let css = `
.PhrasesAndTags {
  display: flex;
  flex: 1;
}
.PhrasesContainer, .TagsContainer {
  display: inline-block;
  flex: 1;
}
`;

export function PhrasesAndTags(props) {
  let { speak, phrases } = props;
  let PhrasesProps = { phrases, speak };
  let TagsProps = { phrases };
  return html`
  <style>${css}</style>
  <div class=PhrasesAndTags>
    <div class=PhrasesContainer>${Phrases(PhrasesProps)}</div
    ><div class=TagsContainer>${Tags(TagsProps)}</div>
  </div>`;
}
