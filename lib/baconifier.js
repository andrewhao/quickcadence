var Bacon = require('baconjs');
var csv = require('csv');

const parser = csv.parse({delimeter: ",", columns: true});
const startingTime = new Date().getTime();

// From a stream of data points @ 50hz, return a stream of points with
// times interpolated at 50hz.
export function pipe(stream) {
  return Bacon
  .fromEvent(stream.pipe(parser), 'data')
  .scan({ index: 0 }, (past, current) => Object.assign({}, current, { index: past.index + 1 }))
  .map((v) => {
    const projectedTime = (v.index * 1000 / 50) + startingTime;
    return Object.assign(v, { time: projectedTime })
  })
}

// From a stream of data points @ 50hz, buffer the points and release
// @ 50hz.
export function realtimeSimulationPipe(stream) {
  return Bacon
  .fromEvent(stream.pipe(parser), 'data')
  .bufferingThrottle(1000 / 50)
  .map(v => Object.assign({}, v, { time: new Date().getTime() }))
}
