var CadenceCounter = require('../../lib/cadenceCounter');
var StepDetector = require('../../lib/stepDetector');
var PowerConverter = require('../../lib/powerConverter');
var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');
var Bacon = require('baconjs');
var CadenceGraph = require('./cadenceGraph');
var _ = require('underscore');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

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
