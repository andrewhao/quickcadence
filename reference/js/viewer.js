var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');
var bacon = require('baconjs');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

var pointStream = new stream.PassThrough();
pointStream.end(new Buffer(points));
var rawStream = Baconifier.pipe(pointStream);

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
  $('body').on('keyup', function(e) {
    var $body = $(this);
    if($(this).data('started') || e.keyCode !== 32) { return true; }
    $(this).data('started', true);

    $(this).append($('<p>Starting...</p>'))
    var cadenceStream = CadenceCounter.pipe(rawStream);
    cadenceStream.onValue(function(val) {
      $body.append($('<span>' + val + '</span>&nbsp;'));
    });
  });
});
