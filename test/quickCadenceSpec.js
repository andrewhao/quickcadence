var QuickCadence = require('../lib/quickCadence'),
    TestDataStream = require('../lib/testDataStream'),
    fs = require('fs'),
    assert = require('assert');

describe('QuickCadence', function() {
  describe('.pipe()', function() {
    it('takes a sample set of data and returns a set of cadence details', function(done) {
      this.timeout(10000);

      var points = fs.readFileSync(__dirname + '/sample.csv', 'utf-8');
      var stream = TestDataStream.pointsAsStream(points);
      var cadenceStream = QuickCadence.pipe(stream)
      cadenceStream.onValue(function(v) { console.log(v); done(); })
    });
  });
});
