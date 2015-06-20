var testDataStream = require('./testDataStream'),
    cadenceCounter = require('./cadenceCounter');

var stream = testDataStream('samples-1.csv')
// Returns a Bacon observable
cadenceCounter.pipe(stream)
