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
      console.log("Step!");
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
    })
    //.zip(stepStream, function(combined, hasStepped) {
    //  console.log(hasStepped);
    //  return _.extend(combined, {
    //    stepDetected: (hasStepped ? 1000 : -1000)
    //  })
    //});

    combinedStream.onValue(function(val) {
      console.log("data: " + JSON.stringify(val));
      var data = val;
      graph.series.addData(data);
      graph.render();
    });
  });
});
