import { convertPower, detectSteps, calculateCadence } from '../../lib/QuickCadence';
var TestDataStream = require('../../lib/utils/TestDataStream');
var CadenceGraph = require('./cadenceGraph');
var _ = require('underscore');
var d3 = require('d3');
var $ = require('jquery');
window.jQuery = $;
require('jquery-ui');

var Bacon = require('baconjs');
jQuery.fn.asEventStream = Bacon.$.asEventStream;

$(function() {
  $.ajax('/data/samples-1.csv')
  .then(function(points) {

  var $stopper = $('button#stopper')
                   .asEventStream('click')
                   .map(true)
  var $starter = $('button#starter')
                 .asEventStream('click')
                 .map(false)

  var commandStream = $starter.merge($stopper)
  var valve = commandStream.toProperty().startWith(false)
  valve.assign($('body'), 'data', 'started')

  var pointStream = TestDataStream('bacon').pointsAsRealtimeStream(points);
  var rawStream = pointStream
                  .skipUntil($starter)
                  .holdWhen(commandStream)

  var graph = CadenceGraph.render(document);
  var annotator = CadenceGraph.annotator(graph, document.getElementById('timeline'));
  var dashboardWidget = $('.dashboard-widget .number');

  var powerStream = convertPower(rawStream);
  var stepStream = detectSteps(powerStream);
  var cadenceStream = calculateCadence(stepStream);

  var hasSteppedStream = stepStream.onValue(function(val) {
    var timeVal = val.timestamp / 1000
    annotator.add(timeVal, "step @ " + timeVal);
    annotator.update();
  });

  var combinedStream = powerStream.combine(
    cadenceStream,
    function(power, cadence) {
      return {
        power: parseFloat(power.power),
        tempo: parseFloat(cadence),
      };
    }
  ).combine(rawStream, function(combined, raw) {
    return _.extend(combined, {
      xAccel: parseFloat(raw.x),
      yAccel: parseFloat(raw.y),
      zAccel: parseFloat(raw.z)
    });
  });

  combinedStream.onValue(function(val) {
    var data = val;
    console.log(data);
    graph.series.addData(data);
    graph.render();

    dashboardWidget.text(val.tempo);
  });
  });
});
