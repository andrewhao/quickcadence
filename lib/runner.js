var csv = require('csv'),
    Counter = require('./coolcadence'),
    Bacon = require('baconjs'),
    fs = require('fs');

var parser = csv.parse({delimeter: ",", columns: true})

var points = fs.createReadStream(__dirname + '/../data/samples-1.csv');

points.pipe(parser)
  .pipe(csv.transform(function(record) {
    console.log(record);
  }))

var counter = new Counter();
