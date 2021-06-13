import {HTML} from 'ube';

export default class Div extends HTML.Div {
  upgradedCallback() {
    this.style.border = '1px solid blue';
  }
}
