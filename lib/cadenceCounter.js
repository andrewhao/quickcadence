var CadenceCounter = {
  pipe: function(stream) {
    var cadenceStream = stream
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
        // cycles per ms
        var cyclesPerMs = 1 / duration
        return cyclesPerMs * 1000 * 60
      })
    return cadenceStream;
  }
}
module.exports = CadenceCounter;
