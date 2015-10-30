var StepDetector = require('./stepDetector'),
    PowerConverter = require('./lib/powerConverter'),
    CadenceCounter = require('./lib/cadenceCounter'),
    Baconifier = require('./lib/baconifier'),
    Bacon = require('baconjs');

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
