var StepDetector = {
  pipe: function(stream) {
    return stream
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
      .debounce(150);
  }
};

module.exports = StepDetector;
