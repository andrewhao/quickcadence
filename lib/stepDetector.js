ACCEL_CHANGE_THRESHOLD = 100;

var StepDetector = {
  pipe: function(stream) {
    // Fire an event every time acceleration changes from positive to negative
    var diffDirectionStream = stream
      .map(function(v) {
        console.log("original: " + v);
        return v;
      })
      .slidingWindow(2,2)
      .map(function(arr) {
        var diff = arr[1] - arr[0];
        return diff
      })
      .filter(function(diff) {
        return Math.abs(diff) > ACCEL_CHANGE_THRESHOLD;
      })
      .map(function(diff) {
        var changeSignal = diff > 0;
        return {"diff": diff, "changeSignal": changeSignal};
      })
      .slidingWindow(2,2)
      .filter(function(arr) {
        return arr[0].changeSignal !== arr[1].changeSignal;
      })
      .map(function(v) {
        console.log(v);
        return v;
      });

    return diffDirectionStream;
  }
};

module.exports = StepDetector;
