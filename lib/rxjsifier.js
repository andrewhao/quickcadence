import csv from 'csv';
import { Observable } from 'rx';
import RxNode from 'rx-node';
import { inspect } from 'util';
const WAIT = 1/50 * 1000;

// From a stream of data points @ 50hz, return a stream of points with
// times interpolated at 50hz.
function pipe(stream) {
  const startingTime = new Date().getTime();
  const parser = csv.parse({delimeter: ",", columns: true});

  return RxNode
  .fromStream(stream.pipe(parser))
  //.tap(v => console.log(`in: ${inspect(v)}`))
  .scan((past, current) => {
    return Object.assign({}, current, { index: past.index + 1 })
  }, { index: 0 })
  //.tap(v => console.log(`out: ${inspect(v)}`))
  .map((v) => {
    const projectedTime = (v.index * 1000 / 50) + startingTime;
    return Object.assign({}, v, { time: projectedTime })
  })
};

// From a stream of data points @ 50hz, buffer the points and release
// @ 50hz.
function realtimeSimulationPipe(stream) {
  const parser = csv.parse({delimeter: ",", columns: true});
  return RxNode
  .fromStream(stream.pipe(parser))
  .throttle(WAIT);
};

const Rxjsifier = {
  pipe,
  realtimeSimulationPipe,
}

export default Rxjsifier;
