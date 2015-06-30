var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');
var bacon = require('baconjs');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

var pointStream = new stream.PassThrough();
pointStream.end(new Buffer(points));
var rawStream = Baconifier.pipe(pointStream);
var cadenceStream = CadenceCounter.pipe(rawStream);

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
