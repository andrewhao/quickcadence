// Fixture data runner
var testDataStream = require('./testDataStream'),
    cadenceCounter = require('./cadenceCounter');

var stream = testDataStream('samples-3.csv')
// Returns a Bacon observable
cadenceCounter.pipe(stream)
