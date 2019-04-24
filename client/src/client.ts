declare const m: typeof import("mithril");
declare const _: typeof import("lodash");
import * as P from './protocol';

console.log("HELLO 1");
document.addEventListener('DOMContentLoaded', () => {
  console.log("HELLO 2");
  const Main = {
    view() {
      return m('h1', 'Hello System');
    }
  }
  m.mount(document.getElementById('Main')!, Main);
});