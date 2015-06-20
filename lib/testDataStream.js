var csv = require('csv'),
    Bacon = require('baconjs'),
    fs = require('fs');

function TestDataStream(filename) {
  var parser = csv.parse({delimeter: ",", columns: true});
  var points = fs.createReadStream(__dirname + '/../data/' + filename);
  var rawStream = Bacon
                  .fromEvent(points.pipe(parser), 'data')
                  .bufferingThrottle(1/50 * 1000);
  return rawStream;
}

module.exports = TestDataStream;
