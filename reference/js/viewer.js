var StepDetector = require('../../lib/stepDetector');
var PowerConverter = require('../../lib/powerConverter');
var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');
var Bacon = require('baconjs');
var fs = require('fs');
var stream = require('stream');
var CadenceGraph = require('./cadenceGraph');
var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;
var windowing = require('fft-windowing');
var _ = require('underscore');
var d3 = require('d3');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

SvgCreator = {
  render: function(frequencyData) {
    var svgHeight = '300';
    var svgWidth = '1200';
    var barPadding = '1';
    function createSvg(parent, height, width) {
      return d3.select(parent).append('svg').attr('height', height).attr('width', width);
    }
    var svg = createSvg('body', svgHeight, svgWidth);

    // Create our initial D3 chart.
    svg.selectAll('rect')
    .data(frequencyData)
    .enter()
    .append('rect')
    .attr('x', function (d, i) {
      return i * (svgWidth / frequencyData.length);
    })
    .attr('width', svgWidth / frequencyData.length - barPadding);
  }
}

$(function() {
  var $stopper = $('button#stopper')
                   .asEventStream('click')
                   .map(true)
  var $starter = $('button#starter')
                 .asEventStream('click')
                 .map(false)

  var commandStream = $starter.merge($stopper)
  var valve = commandStream.toProperty().startWith(false)
  valve.assign($('body'), 'data', 'started')

  var pointStream = new stream.PassThrough();
  pointStream.end(new Buffer(points));

  var rawStream = Baconifier.pipe(pointStream)
                  .skipUntil($starter)
                  .holdWhen(commandStream)

  var graph = CadenceGraph.render(document);
  var annotator = CadenceGraph.annotator(graph, document.getElementById('timeline'));
  var dashboardWidget = $('.dashboard-widget .number');

  var powerStream = PowerConverter.pipe(rawStream);
  var stepStream = StepDetector.pipe(powerStream);
  var cadenceStream = CadenceCounter.pipe(stepStream);

  var fftStream = powerStream
    .bufferWithCount(128)
    .log()
    .map(function(points) {
      return windowing.hann(points)
    })
    .log()
    .map(function(points) {
      SvgCreator.render(points);
      return points;
    })
    .map(function(windowedPoints) {
      var phasors = fft(windowedPoints);
      var sampling_frequency = 50
      var frequencies = fftUtil.fftFreq(phasors, sampling_frequency);
      var magnitudes = fftUtil.fftMag(phasors);
      var both = frequencies.map(function(f, ix) {
        return {frequency: f, magnitude: magnitudes[ix]};
      }).filter(function(fm) { return fm.frequency > 0 && fm.frequency < 3.0 })
      var sorted = _.sortBy(both, 'magnitude');
      return sorted[sorted.length - 1]
    })
    .log()
    .map(function(v) { return v.frequency * 60 })
    .log()

  var hasSteppedStream = stepStream.onValue(function(val) {
    var timeVal = val.timestamp.getTime() / 1000
    annotator.add(timeVal, "step @ " + timeVal);
    annotator.update();
  });

  var combinedStream = powerStream.combine(
    cadenceStream,
    function(power, cadence) {
      return {
        power: power,
        tempo: cadence,
      };
    }
  ).combine(rawStream, function(combined, raw) {
    return _.extend(combined, {
      xAccel: parseInt(raw.x),
      yAccel: parseInt(raw.y),
      zAccel: parseInt(raw.z)
    });
  });
  combinedStream.onValue(function(val) {
    var data = val;
    graph.series.addData(data);
    graph.render();

    dashboardWidget.text(val.tempo);
  });
});
