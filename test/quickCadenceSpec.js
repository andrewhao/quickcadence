var QuickCadence = require('../lib/quickCadence'),
    TestDataStream = require('../lib/testDataStream'),
    fs = require('fs'),
    assert = require('assert');

describe('QuickCadence', function() {
  [
    ['samples-1.csv', 74],
    ['samples-2.csv', 72],
    ['samples-3.csv', 79],
    ['samples-4.csv', 76],
    ['samples-5.csv', 68]
  ].forEach((testCase) => {
    describe('.pipe()', function() {
      const [fileName, expectedValue] = testCase;
      it('takes a sample set of data and returns a set of cadence details', function(done) {
        this.timeout(7000);

        var points = fs.readFileSync(`${__dirname}/../data/${fileName}`, 'utf-8');
        var stream = TestDataStream.pointsAsStream(points);
        var cadenceStream = QuickCadence.pipe(stream)
        cadenceStream
        .firstToPromise(Promise)
        .then((v) => {
          console.log(`Expected: ${expectedValue}`);
          console.log(`Actual: ${v}`);
          assert(Math.abs(v - expectedValue) < 2);
          done();
        })
      });
    });
  });
});
