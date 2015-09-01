ACCEL_THRESHOLD_MIN = 100;

var StepDetector = {
  pipe: function(stream) {
    // Fire an event every time acceleration changes from positive to negative
    var diffDirectionStream = stream
      .slidingWindow(4,4)
      .map(function(arr) {
        var diff = arr[1] - arr[0];
        var changeSignal = (diff > 0) ? 1 : -1;
        return {"diff": diff, "changeSignal": changeSignal};
      })
      .slidingWindow(2,2)
      .filter(function(arr) {
        return arr[0].changeSignal !== arr[1].changeSignal;
      })

    // Does any point in this window fall between the zero-acceleration graph?
    var zeroAccelStream = stream
      .slidingWindow(4, 4)
      .filter(function(arr) {
        return arr.reduce(function(acc, point) {
          return acc || (point < ACCEL_THRESHOLD_MIN)
        }, false);
      })
      .debounce(200);
    return zeroAccelStream;
  }
};

module.exports = StepDetector;
