import { Observable } from 'rx';
import Cycle from '@cycle/core';
import { hJSX, makeDOMDriver, p } from '@cycle/dom';
import jQuery from 'jquery';
window.jQuery = jQuery

window.jQuery(() => {
  function main({ DOM }) {
    const sinks = {
      DOM: DOM.select('#starter')
      .events('click')
      .tap(v => console.log(v))
      .map(v => 'boo')
      .map(v => p(v))
    }
    return sinks
  }
  const drivers = {
    DOM: makeDOMDriver('#app')
  };
  Cycle.run(main, drivers)
});
