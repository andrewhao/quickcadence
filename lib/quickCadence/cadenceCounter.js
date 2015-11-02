CYCLE_SAMPLE_BUFFER_SIZE = 10
var CadenceCounter = {
  pipe: function(stream) {
    var cadenceStream = stream
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
    return cadenceStream;
  }
}
module.exports = CadenceCounter;
