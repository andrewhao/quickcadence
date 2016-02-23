import { pipe } from './rxjsifier';
import { Observable } from 'rx';
import { inspect } from 'util';

const calculatePower = (d) => parseInt(d.y, 10)
const DEBOUNCE_THRESHOLD = 200;
const CYCLE_SAMPLE_BUFFER_SIZE = 10

function rxCadencePipe(stream) {
  const powerConvertedStream = stream
  .take(10)
  .tap(v => console.log(`in: ${inspect(v)}`))
  .map((v) => Object.assign(v, { power: calculatePower(v) }))
  .tap(v => console.log(`out: ${inspect(v)}`))

  const diffDirectionStream = powerConvertedStream
  .pairwise()
  .map(([e1, e2]) => (e2.power - e1.power))

  return diffDirectionStream

  const stepDetectionStream = powerConvertedStream
  .zip(diffDirectionStream, (sensor, diff) => {
    var changeSignal = diff > 0;

    return {
      "timestamp": sensor.time,
      "diff": diff,
      "changeSignal": changeSignal
    };
  })
  .pairwise()
  .filter(([e1, e2]) => e1.changeSignal !== e2.changeSignal)
  .map(([e1, e2]) => e2)
  .pairwise()
  .filter(([e1, e2]) => e2.timestamp - e1.timestamp > DEBOUNCE_THRESHOLD)
  .map(([e1, e2]) => e2)

  return stepDetectionStream
  .map(v => v.timestamp)
  .bufferWithCount(CYCLE_SAMPLE_BUFFER_SIZE, 1)
  .map((times) => {
    let t1 = times[0]
    let tlast = times[times.length - 1]
    // ms per event
    let msPerEvent = (tlast - t1) / times.length
    // 2 "event"s, a min and a max, per period.
    let msPerPeriod = msPerEvent * 2
    return msPerPeriod;
  })
  .map((duration) => {
    // periods per ms
    var periodsPerMs = 1 / duration
    // periods per minute
    return periodsPerMs * 1000 * 60
  })
  .map(v => v.toFixed(2))
}

const RxCadence = {
  pipe: rxCadencePipe,
}

export default RxCadence;
