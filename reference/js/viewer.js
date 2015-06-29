var cadenceCounter = require('../../lib/cadenceCounter');
var baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

var pointStream = new stream.PassThrough();
pointStream.end(new Buffer(points));

d3.select('body'),
  WIDTH = 1000,
  HEIGHT = 500,
  MARGINS = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  }

$(function() {
  $('body').on('keyup', function() {
    console.log('hey');
    $(this).append($('<p>Starting...</p>'))
    cadenceCounter.pipe(baconifier.pipe(pointStream));
  });
});
