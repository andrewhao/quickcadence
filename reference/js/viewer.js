var cadenceCounter = require('../../lib/cadenceCounter');
var baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

var pointStream = new stream.PassThrough();
pointStream.end(new Buffer(points));
cadenceCounter.pipe(baconifier.pipe(pointStream));

