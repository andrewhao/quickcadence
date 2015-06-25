var Bacon = require('baconjs');
var csv = require('csv');

// From a stream of data points @ 50hz, buffer the points and release
// @ 50hz.
var Baconifier = {
  pipe: function(stream) {
    var parser = csv.parse({delimeter: ",", columns: true});
    var rawStream = Bacon
                    .fromEvent(stream.pipe(parser), 'data')
                    .bufferingThrottle(1/50 * 1000);
    return rawStream;
  }
}

module.exports = Baconifier;
