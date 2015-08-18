var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');
var bacon = require('baconjs');
var CadenceGraph = require('./cadenceGraph');

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

    var cadenceStream = CadenceCounter.pipe(rawStream);

    var combinedStream = rawStream.zip(cadenceStream, function(raw, cadence) {
        return { x: raw.x, y: raw.y, z: raw.z, tempo: cadence };
    });

    combinedStream.onValue(function(val) {
      console.log("data: " + JSON.stringify(val));
      var data = val;
      graph.series.addData(data);
      graph.render();
    });
  });
});
