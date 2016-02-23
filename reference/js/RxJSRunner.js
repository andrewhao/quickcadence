import { Observable } from 'rx';
import Cycle from '@cycle/core';
import { hJSX, makeDOMDriver } from '@cycle/dom';
import jQuery from 'jquery';
window.jQuery = jQuery

function main() {
  return {
    DOM: Observable
    .interval(1000)
    .map(i => <p>{`${i} seconds elapsed`}</p>)
  }
}

window.jQuery(() => {
  const drivers = {
    DOM: makeDOMDriver('#app')
  };
  Cycle.run(main, drivers)
});
