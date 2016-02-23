import Baconifier from './baconifier';
import Rxjsifier from './rxjsifier';
import stream from 'stream';

const methods = function(lib) {
  return {
    pointsAsStream: function(points) {
      var pointStream = new stream.PassThrough();
      pointStream.end(new Buffer(points));
      return lib.pipe(pointStream);
    },

    pointsAsRealtimeStream(points) {
      var pointStream = new stream.PassThrough();
      pointStream.end(new Buffer(points));
      return lib.realtimeSimulationPipe(pointStream);
    }
  }
};

var TestDataStream = function(type) {
  if (type === 'bacon') {
    return methods(Baconifier);
  } else if (type === 'rxjs') {
    return methods(Rxjsifier);
  }
}

module.exports = TestDataStream;
