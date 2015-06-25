Bacon = require('baconjs');

var CadenceCounter = {
  pipe: function(stream) {
    var combinedStream = stream
      .map(function(d) {
        return Math.sqrt(
          Math.pow(d.x, 2),
          Math.pow(d.y, 2),
          Math.pow(d.z, 2)
        )
      });

    var isVelocityChangingStream = combinedStream
      .slidingWindow(4,4)
      .map(function(arr) {
        var diff = arr[1] - arr[0]
        var changeSignal = (diff > 0) ? 1 : -1;
        return {"diff": diff, "changeSignal": changeSignal}
      })
      .slidingWindow(2,2)
      .filter(function(arr) {
        return arr[0].changeSignal !== arr[1].changeSignal
      })
      .debounce(100)
      .log('boing')
      .map(function() {
        return new Date()
      })
      .slidingWindow(10, 2)
      .map(function(times) {
        var t1 = times[0]
        var tlast = times[times.length - 1]
        // ms per event
        return (tlast - t1) / times.length
      })
      .map(function(duration) {
        // ms per cycle
        return duration * 2
      })
      .map(function(duration) {
        // cycles per ms
        var cyclesPerMs = 1 / duration
        return cyclesPerMs * 1000 * 60
      })
      .log()
  }
}
module.exports = CadenceCounter;
