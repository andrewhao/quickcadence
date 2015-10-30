(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var StepDetector = require('./stepDetector'),
    PowerConverter = require('./powerConverter'),
    CadenceCounter = require('./cadenceCounter');

QuickCadence = {
  pipe: function(stream) {
    return CadenceCounter.pipe(
      StepDetector.pipe(
        PowerConverter.pipe(stream)
      )
    );
  }
};

module.exports = QuickCadence;

},{"./cadenceCounter":1,"./powerConverter":3,"./stepDetector":4}],3:[function(require,module,exports){
var PowerConverter = {
  pipe: function(stream) {
    return stream
      .map(function(d) {
        var val = parseInt(d.y, 10);
        return val
      });
  }
};

module.exports = PowerConverter;

},{}],4:[function(require,module,exports){
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

},{}]},{},[2])