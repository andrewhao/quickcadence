var StepDetector   = require('./quickCadence/stepDetector'),
    PowerConverter = require('./quickCadence/powerConverter'),
    CadenceCounter = require('./quickCadence/cadenceCounter');

var QuickCadence = {
  pipe: function(stream) {
    var power = PowerConverter.pipe(stream);
    var steps = StepDetector.pipe(power);
    var cadence = CadenceCounter.pipe(steps);
    return cadence;
  }
};

module.exports = QuickCadence;
