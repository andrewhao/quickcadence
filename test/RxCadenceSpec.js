import RxCadence from '../lib/RxCadence';
import fs from 'fs';
import TestDataStream from '../lib/utils/TestDataStream';
import assert from 'assert';

const testData = TestDataStream('rxjs');

describe('RxCadence', function() {
  [
    ['samples-1.csv', 70.75],
    //['samples-2.csv', 96.77],
    ['samples-3.csv', 56.82],
    ['samples-4.csv', 57.03],
    //['samples-5.csv', 76.14],
  ].forEach(([fileName, expectedValue]) => {
    describe(`.pipe() from ${fileName}`, function() {
      it('calculates cadence', function(done) {
        const points = fs.readFileSync(`${__dirname}/../data/${fileName}`, 'utf-8');
        const stream = testData.pointsAsStream(points);
        this.timeout(10000);

        RxCadence.pipe(stream)
        .catch((err) => console.log(err))
        .subscribe((v) => {
          assert.equal(v.toFixed(2), expectedValue);
          done();
        });
      })
    });
  });
});
