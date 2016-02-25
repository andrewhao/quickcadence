import csv from 'csv';
import { Observable } from 'rx';
import RxNode from 'rx-node';
import { inspect } from 'util';
const SLOW_WAIT = 1000;
const FIFTY_HZ = 1000 / 50;

// From a stream of data points @ 50hz, return a stream of points with
// times interpolated at 50hz.
function pipe(stream) {
  const startingTime = new Date().getTime();
  const parser = csv.parse({delimeter: ",", columns: true});

  return RxNode
  .fromStream(stream.pipe(parser))
  .scan((past, current) => {
    return Object.assign({}, current, { index: past.index + 1 })
  }, { index: 0 })
  .map((v) => {
    const projectedTime = (v.index * FIFTY_HZ) + startingTime;
    return Object.assign({}, v, { time: projectedTime })
  })
};

// From a stream of data points @ 50hz, buffer the points and release
// @ 50hz.
function realtimeSimulationPipe(stream) {
  const parser = csv.parse({delimeter: ",", columns: true});
  const nodeStream = RxNode
  .fromStream(stream.pipe(parser))

  return Observable.zip(nodeStream,
                        Observable.interval(FIFTY_HZ),
                        (data, interval) => data)
  .catch(e => console.log(e))
  .map((v) => Object.assign({},
                            v,
                            {
                              time: new Date().getTime(),
                              x: parseInt(v.x),
                              y: parseInt(v.y),
                              z: parseInt(v.z),
                            }))
};

const Rxjsifier = {
  pipe,
  realtimeSimulationPipe,
}

export default Rxjsifier;
