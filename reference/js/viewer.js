var CadenceCounter = require('../../lib/cadenceCounter');
var StepDetector = require('../../lib/stepDetector');
var PowerConverter = require('../../lib/powerConverter');
var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');
var bacon = require('baconjs');
var CadenceGraph = require('./cadenceGraph');
var _ = require('underscore');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

var pointStream = new stream.PassThrough();
pointStream.end(new Buffer(points));
var rawStream = Baconifier.pipe(pointStream);

$(function() {
  var graph = CadenceGraph.render(document);
  var annotator = CadenceGraph.annotator(graph, document.getElementById('timeline'));
  annotator.add(new Date().getTime(), "starting");
  annotator.update();

  var dashboardWidget = $('.dashboard-widget .number');

  $('body').on('keyup', function(e) {
    var $body = $(this);
    if($(this).data('started') || e.keyCode !== 32) { return true; }
    $(this).data('started', true);

    //$(document).append($('<p>Starting...</p>'))

    rawStream.onValue(function(val) {
      //console.log("raw: " + val);
      //$body.append($('<p>Raw: ' + val + '</p>'));
    });

    var powerStream = PowerConverter.pipe(rawStream);
    var stepStream = StepDetector.pipe(powerStream);
    var cadenceStream = CadenceCounter.pipe(stepStream);

    var hasSteppedStream = stepStream.onValue(function(val) {
      var timeVal = new Date().getTime() / 1000
      annotator.add(timeVal, "step!");
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
    )
    combinedStream.onValue(function(val) {
      var data = val;
      console.log(JSON.stringify(data))
      graph.series.addData(data);
      graph.render();

      dashboardWidget.text(val.tempo);
    });
  });
});
