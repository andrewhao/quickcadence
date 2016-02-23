import QuickCadence from '../lib/QuickCadence';
import fs from 'fs';
import TestDataStream from '../lib/utils/TestDataStream';
import assert from 'assert';

const testDataStream = TestDataStream('bacon')

describe('QuickCadence', function() {
  [
    ['samples-1.csv', 70.75],
    ['samples-2.csv', 96.77],
    ['samples-3.csv', 56.82],
    ['samples-4.csv', 57.03],
    ['samples-5.csv', 52.08]
  ].forEach((testCase) => {
    const [fileName, expectedValue] = testCase;

    describe(`.pipe() from ${fileName}`, function() {
      const points = fs.readFileSync(`${__dirname}/../data/${fileName}`, 'utf-8');
      const stream = testDataStream.pointsAsStream(points);
      it('takes a sample set of data and returns a set of cadence details', function(done) {
        this.timeout(10000);

        QuickCadence.pipe(stream)
        .firstToPromise(Promise)
        .then((v) => {
          console.log(`Expected: ${expectedValue}`);
          console.log(`Actual: ${v}`);
          assert(Math.abs(v - expectedValue) < 2);
          done();
        })
        .catch(e => console.log(e))
      });
    });
  });
});
