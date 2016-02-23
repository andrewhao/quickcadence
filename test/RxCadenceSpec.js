import RxCadence from '../lib/RxCadence';
import fs from 'fs';
import TestDataStream from '../lib/testDataStream';
import assert from 'assert';

const testData = TestDataStream('rxjs');

describe('RxCadence', function() {
  [
    ['samples-1.csv', 70.75],
    ['samples-2.csv', 96.77],
    ['samples-3.csv', 56.82],
    ['samples-4.csv', 57.03],
    ['samples-5.csv', 52.08]
  ].forEach(([fileName, expectedValue]) => {
    describe(`.pipe() from ${fileName}`, function() {
      const points = fs.readFileSync(`${__dirname}/../data/${fileName}`, 'utf-8');
      const stream = testData.pointsAsStream(points);

      it.only('takes a sample set of data and returns a set of cadence details', function(done) {
        this.timeout(10000);

        RxCadence.pipe(stream)
        .skip(10)
        .subscribe((v) => {
          assert.equal(v, expectedValue);
          done();
        });
      })
    });
  });
});
