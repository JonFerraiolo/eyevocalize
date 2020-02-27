
import { html, render } from './lib/lit-html/lit-html.js';
import { styleMap } from './lib/lit-html/directives/style-map.js';

let css = `
.combobox {
  position: relative;
  display: flex;
  align-items: center;
}
.combobox > * {
  height: 1.5em;
  line-height: 1.5em;
}
.combobox select {
  position: absolute;
  top: 0px;
  z-index: 1;
  height: max-content; /* does not yet support fit-content */
  height: fit-content;
  line-height: 1.2em;
  overflow: auto;
}
.combobox option {
  padding: 0.1em 0.4em;
}
.combobox option.optionsRightAlign {
  text-align: right;
}
.comboboxDownArrow, .comboboxPlusIcon, .comboboxMinusIcon {
  display: inline-block;
  width: 1.4em;
  text-align: center;
  border: 1px solid #666;
}
.comboboxPlusIcon, .comboboxMinusIcon {
  margin-left: 1em;
}
.comboboxPlusIcon .icon, .comboboxMinusIcon .icon {
  font-size: 150%;
  font-weight: bold;
}
input[type='number'] {
    -moz-appearance:textfield;
}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

`;
let styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(css));
document.head.appendChild(styleElement);

export class combobox {
  constructor() {
  }
  update(parentElement, props) {
    props = props || {};
    let { min, max, step, digits, onChange } = props;
    let value = props.value || '';
    let inputId = props.inputId || '';
    let options = props.options || [];
    let inputType = props.inputType || 'text';
    let inputWidthEms = typeof props.inputWidthEms == 'number' ?  props.inputWidthEms : 10;
    let showPlusMinus = typeof props.showPlusMinus == 'boolean' ? props.showPlusMinus : false;
    let showMenu = false;
    let numericWithStep = (options.length === 0 &&
      typeof min == 'number' && typeof max == 'number' &&
      typeof step == 'number' && typeof digits == 'number' &&
      max > min && step > 0 && digits >= 0 && digits < 10);
    if (numericWithStep) {
      for (let i = min; i <= max; i += step) {
        let v = i.toFixed(digits);
        options.push({ label: v, value: v });
      }
    }
    // the 1.4 must match arrow width in css
    let selectWidthEms = inputWidthEms + 1.4;
    let onInput = e => {
      e.preventDefault();
      onChange(e.target.value);
    };
    let onChangeSelect = e => {
      e.preventDefault();
      value = options[e.target.selectedIndex].value;
      showMenu = false;
      localUpdate(); // necessary on Firefox
      onChange(value);
    };
    let onBlurSelect = e => {
      e.preventDefault();
      showMenu = false;
      localUpdate();
    };
    let onClickDownArrow = e => {
      e.preventDefault();
      showMenu = !showMenu;
      localUpdate();
      parentElement.querySelector('select').focus();
    };
    let onClickPlus = e => {
      e.preventDefault();
      if (numericWithStep) {
        let inputElement = parentElement.querySelector('input');
        let v = parseFloat(inputElement.value);
        if (v != NaN) {
          v += step;
          if (v > max) v = max;
          value = v.toFixed(digits);
          localUpdate(); // necessary on Firefox
          onChange(value);
        }
      }
    };
    let onClickMinus = e => {
      e.preventDefault();
      if (numericWithStep) {
        let inputElement = parentElement.querySelector('input');
        let v = parseFloat(inputElement.value);
        if (v != NaN) {
          v -= step;
          if (v < min) v = min;
          value = v.toFixed(digits);
          localUpdate(); // necessary on Firefox
          onChange(value);
        }
      }
    };
    const comboboxDownArrow = html`<span class=comboboxDownArrow @click=${onClickDownArrow}><span class=icon>&#x25BC;</span></span>`;
    const comboboxPlusIcon = html`<span class=comboboxPlusIcon @click=${onClickPlus}><span class=icon>&#x002B;</span></span>`;
    const comboboxMinusIcon = html`<span class=comboboxMinusIcon @click=${onClickMinus}i><span class=icon>&#x2212;</span></span>`;
    let optionStyle = styleMap({ width:selectWidthEms+'em', display: showMenu ? 'block': 'none' });
    let optionClass = numericWithStep ? 'optionsRightAlign' : '';
    let optionElements = options.map(option => {
      return html`<option value=${option.value} class ="${optionClass}">${option.label}</option>`;
    });
    let localUpdate = () => {
      let selectStyle = styleMap({ width:selectWidthEms+'em', display: showMenu ? 'block': 'none' });
      render(html`
        <span class=combobox
          ><select @change=${onChangeSelect} .size=${options.length} style=${selectStyle} @blur=${onBlurSelect}>${optionElements}</select
          ><input id=${inputId} type=${inputType} .value=${value} @input=${onInput} style=${styleMap({width:inputWidthEms+'em'})}></input
          >${comboboxDownArrow}${showPlusMinus ? html`${comboboxPlusIcon}${comboboxMinusIcon}` : '' }</span>
      `, parentElement);
      parentElement.querySelector('select').value = value;
    };
    localUpdate();
  }
}
