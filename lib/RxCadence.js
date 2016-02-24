import { Observable } from 'rx';

const calculatePower = (d) => parseInt(d.y, 10)
const DEBOUNCE_THRESHOLD = 200;
const CYCLE_SAMPLE_BUFFER_SIZE = 10

function pipe(stream) {
  return calculateCadence(
    detectSteps(
      convertPower(stream)
    )
  )
}

export function convertPower(stream) {
  return stream
  .map((v) => Object.assign(v, { power: calculatePower(v) }))
};

export function detectSteps(stream) {
  return stream
  .pairwise()
  .map(([e1, e2]) => {
    let powerDiff = e2.power - e1.power;
    let changeSignal = powerDiff > 0;
    return {
      "timestamp": e1.time,
      "diff": powerDiff,
      "changeSignal": changeSignal
    }
  })
  .pairwise()
  .filter(([e1, e2]) => e1.changeSignal !== e2.changeSignal)
  .map(([e1, e2]) => e2)
  .pairwise()
  .filter(([e1, e2]) => e2.timestamp - e1.timestamp > DEBOUNCE_THRESHOLD)
  .map(([e1, e2]) => e2)
};

export function calculateCadence(stream) {
  return stream
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
};

const RxCadence = {
  pipe,
  convertPower,
  detectSteps,
  calculateCadence,
}

export default RxCadence;
