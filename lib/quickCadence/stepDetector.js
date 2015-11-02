ACCEL_CHANGE_THRESHOLD = 50;
DEBOUNCE_THRESHOLD = 200;

var StepDetector = {
  pipe: function(stream) {
    // Fire an event every time acceleration changes from positive to negative
    var diffDirectionStream = stream
      .diff(0, function(a, b) {
        return b - a
      })
      .filter(function(diff) {
        return Math.abs(diff) > ACCEL_CHANGE_THRESHOLD;
      })
      .map(function(diff) {
        var changeSignal = diff > 0;

        return {
          "timestamp": new Date(),
          "diff": diff,
          "changeSignal": changeSignal
        };
      })
      .slidingWindow(2,2)
      .filter(function(arr) {
        return arr[0].changeSignal !== arr[1].changeSignal;
      })
      .debounce(DEBOUNCE_THRESHOLD)
      .map('.1')

    return diffDirectionStream;
  }
};

module.exports = StepDetector;
