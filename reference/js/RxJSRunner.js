import RxCadence from '../../lib/RxCadence';
import TestDataStream from '../../lib/utils/TestDataStream';
import { Observable } from 'rx';
import Cycle from '@cycle/core';
import { hJSX, makeDOMDriver, p } from '@cycle/dom';
import jQuery from 'jquery';
window.jQuery = jQuery

const START = 'START';
const STOP = 'STOP';
const MOVE = 'MOVE';
const STARTED = 'STARTED';
const STOPPED = 'STOPPED';

function main({ DOM, Motion }) {
  const cadence$ = Motion.events.tap(v => console.log(v)).count()

  const actions$ = Observable.merge(
    DOM.select('#starter').events('click').map(v => ({ name: START })),
    DOM.select('#stopper').events('click').map(v => ({ name: STOP })),
    cadence$.map(cadenceValue => ({ name: MOVE, value: cadenceValue }))
  )

  const initialState = {
    cadence: undefined,
    startState: STOPPED,
  }

  const state$ = actions$
  .scan((history, action) => {
    switch(action.name) {
      case START:
        return Object.assign({}, history, { startState: STARTED });
      case STOP:
        return Object.assign({}, history, { startState: STOPPED });
      case MOVE:
        return Object.assign({}, history, { cadence: action.value });
      default:
        return history;
    }
  }, initialState)
  .startWith(initialState)
  .map(v => Object.assign(v, {
    stopDisabled: v === STOPPED,
    startDisabled: v === STARTED,
  }))

  const vtree$ = state$
  .map(state  => {
    return <div>
      <div>{ state.startState }</div>
      <div id="chart_container">
        <div id="chart"></div>
        <div id="timeline"></div>
        <div id="preview"></div>
        <div id="legend"></div>
      </div>
      <div class="dashboard-widget">
        <h1>Cadence: <span class="number">{state.cadence}</span> BPM</h1>
      </div>
      <button id="starter" disabled={state.startDisabled}>Start</button>
      <button id="stopper" disabled={state.stopDisabled}>Pause</button>
    </div>
  })

  const startState$ = state$
  .map(state => state.startState);

  const sinks = {
    DOM: vtree$,
    Motion: startState$,
  }
  return sinks
}

window.jQuery(() => {
  const drivers = {
    DOM: makeDOMDriver('#app'),
    Motion: makeStubMotionDriver(),
  };
  Cycle.run(main, drivers)
});

function makeMotionDriver() {
  /*
   * @param startState$ Whether the app is active or not.
   */
  return function motionDriver(startState$) {
    const source$ = Observable
    .interval(1000)
    .map(v => ({ x: 1, y: 2, z: 3, time: new Date().getTime() }))
    .share()
    return { events: source$ };
  }
}

function makeStubMotionDriver() {
  return function fakeMotionDriver(startState$) {
    const events$ = Observable
    .fromPromise(jQuery.ajax('/data/samples-1.csv'))
    .flatMap(points => {
      return TestDataStream('rxjs')
      .pointsAsRealtimeStream(points)
    })
    .share()

    return { events: events$ }
  }
}
