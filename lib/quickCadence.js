var StepDetector = require('./stepDetector'),
    PowerConverter = require('./powerConverter'),
    CadenceCounter = require('./cadenceCounter');

QuickCadence = {
  pipe: function(stream) {
    var power = PowerConverter.pipe(stream);
    var steps = StepDetector.pipe(power);
    var cadence = CadenceCounter.pipe(steps);
    return cadence
  }
};

module.exports = QuickCadence;
