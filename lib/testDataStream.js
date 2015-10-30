var Baconifier = require('./baconifier');
var stream = require('stream');

var TestDataStream = {
  pointsAsStream: function(points) {
    var pointStream = new stream.PassThrough();
    pointStream.end(new Buffer(points));
    return Baconifier.pipe(pointStream);
  }
};

module.exports = TestDataStream;
