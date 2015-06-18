var csv = require('csv'),
    Counter = require('./coolcadence'),
    Bacon = require('baconjs'),
    fs = require('fs');

var parser = csv.parse({delimeter: ",", columns: true});
var points = fs.createReadStream(__dirname + '/../data/samples-1.csv');

var rawStream = Bacon.fromEvent(points.pipe(parser), 'data')
  .bufferingThrottle(1/50 * 1000)

var xStream = rawStream
  .map(function(d) {
    return d.x
  })

var isVelocityChangingStream = xStream
  .slidingWindow(2,2)
  .map(function(arr) {
    var diff = arr[1] - arr[0]
    return (diff > 0) ? 1 : -1
  })
  .slidingWindow(2,2)
  .filter(function(arr) {
    return arr[0] !== arr[1]
  })
  .debounce(150)
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

var counter = new Counter();
