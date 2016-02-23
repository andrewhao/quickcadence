const DEBOUNCE_THRESHOLD = 200;

const calculatePower = (d) => parseInt(d.y, 10)

export function convertPower(stream) {
  return stream
  .map((v) => Object.assign(v, { power: calculatePower(v) }))
}

export function detectSteps(stream) {
  var diffDirectionStream = stream
  .diff({ power: 0 }, function(a, b) {
    return b.power - a.power
  })

  return stream
  .zip(diffDirectionStream, (sensor, diff) => {
    var changeSignal = diff > 0;

    return {
      "timestamp": sensor.time,
      "diff": diff,
      "changeSignal": changeSignal
    };
  })
  .slidingWindow(2,2)
  .filter(function(events) {
    let [e1, e2] = events;
    return e1.changeSignal !== e2.changeSignal
  })
  .map('.1')
  .slidingWindow(2,2)
  .filter((events) => {
    let [e1, e2] = events;
    return e2.timestamp - e1.timestamp > DEBOUNCE_THRESHOLD
  })
  .map('.1')
}

const CYCLE_SAMPLE_BUFFER_SIZE = 10
export function calculateCadence(stream) {
  return stream
  .map('.timestamp')
  .slidingWindow(CYCLE_SAMPLE_BUFFER_SIZE, CYCLE_SAMPLE_BUFFER_SIZE)
  .map(function(times) {
    var t1 = times[0]
    var tlast = times[times.length - 1]
    // ms per event
    var msPerEvent = (tlast - t1) / times.length
    // 2 "event"s, a min and a max, per period.
    var msPerPeriod = msPerEvent * 2
    return msPerPeriod;
  })
  .map(function(duration) {
    // periods per ms
    var periodsPerMs = 1 / duration
    // periods per minute
    return periodsPerMs * 1000 * 60
  })
  .map(v => v.toFixed(2))
}

export function pipe(stream) {
  return calculateCadence(detectSteps(convertPower(stream)))
}

const QuickCadence = {
  pipe,
  convertPower,
  detectSteps,
  calculateCadence,
};

export default QuickCadence
