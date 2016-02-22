const DEBOUNCE_THRESHOLD = 200;

var StepDetector = {
  pipe: function(stream) {
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
};

module.exports = StepDetector;
