
import { html } from 'https://unpkg.com/lit-html?module';

let css = `
.Tags {
}
`;

export function Tags(props) {
  let { speak, Tags } = props;
  return html`
  <style>${css}</style>
  <div class=Tags>
    Tags
  </div>`;
}
