import { pipe, realtimeSimulationPipe } from './baconifier';
var stream = require('stream');

var TestDataStream = {
  pointsAsStream: function(points) {
    var pointStream = new stream.PassThrough();
    pointStream.end(new Buffer(points));
    return pipe(pointStream);
  },

  pointsAsRealtimeStream(points) {
    var pointStream = new stream.PassThrough();
    pointStream.end(new Buffer(points));
    return realtimeSimulationPipe(pointStream);
  }
};

module.exports = TestDataStream;
