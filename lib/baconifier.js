var Bacon = require('baconjs');
var csv = require('csv');

// From a stream of data points @ 50hz, buffer the points and release
// @ 50hz.
var Baconifier = {
  pipe: function(stream) {
    const parser = csv.parse({delimeter: ",", columns: true});
    const startingTime = new Date().getTime();
    return Bacon
    .fromEvent(stream.pipe(parser), 'data')
    .scan({ index: 0 }, (past, current) => Object.assign({}, current, { index: past.index + 1 }))
    .map((v) => {
      const projectedTime = (v.index * 1000 / 50) + startingTime;
      return Object.assign(v, { time: projectedTime })
    })
  },

  realtimeSimulationPipe: function(stream) {
    const parser = csv.parse({delimeter: ",", columns: true});
    return Bacon
    .fromEvent(stream.pipe(parser), 'data')
    .bufferingThrottle(1000 / 50)
    .map(v => Object.assign({}, v, { time: new Date().getTime() }))
  }
}

module.exports = Baconifier;
