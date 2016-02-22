import csv from 'csv';
import { Observable } from 'rx';
import RxNode from 'rx-node';

// From a stream of data points @ 50hz, buffer the points and release
// @ 50hz.
var RxJSifier = {
  pipe: function(stream) {
    const parser = csv.parse({delimeter: ",", columns: true});
    const wait = 1/50 * 1000;
    return RxNode
    .fromStream(stream.pipe(parser))
    .throttle(wait);
  }
}

module.exports = RxJSifier;
