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
