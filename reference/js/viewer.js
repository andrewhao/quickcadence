var CadenceCounter = require('../../lib/cadenceCounter');
var Baconifier = require('../../lib/baconifier');
var fs = require('fs');
var stream = require('stream');
var bacon = require('baconjs');

var points = fs.readFileSync(__dirname + '/samples-1.csv', 'utf-8');

var pointStream = new stream.PassThrough();
pointStream.end(new Buffer(points));
var rawStream = Baconifier.pipe(pointStream);

var GraphWidget = {
  render: function() {
    // set up our data series with 150 random data points
    var seriesData = [ [], [], [], [], [], [], [], [], [] ];
    var random = new Rickshaw.Fixtures.RandomData(150);

    for (var i = 0; i < 150; i++) {
      random.addData(seriesData);
    }

    var palette = new Rickshaw.Color.Palette( { scheme: 'classic9' } );

    // instantiate our graph!

    var graph = new Rickshaw.Graph( {
      element: document.getElementById("chart"),
      width: 900,
      height: 500,
      renderer: 'area',
      stroke: true,
      preserve: true,
      series: [
        {
        color: palette.color(),
        data: seriesData[0],
        name: 'Moscow'
      }, {
        color: palette.color(),
        data: seriesData[1],
        name: 'Shanghai'
      }, {
        color: palette.color(),
        data: seriesData[2],
        name: 'Amsterdam'
      }, {
        color: palette.color(),
        data: seriesData[3],
        name: 'Paris'
      }, {
        color: palette.color(),
        data: seriesData[4],
        name: 'Tokyo'
      }, {
        color: palette.color(),
        data: seriesData[5],
        name: 'London'
      }, {
        color: palette.color(),
        data: seriesData[6],
        name: 'New York'
      }
      ]
    } );

    graph.render();

    var preview = new Rickshaw.Graph.RangeSlider( {
      graph: graph,
      element: document.getElementById('preview'),
    } );

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
      graph: graph,
      xFormatter: function(x) {
        return new Date(x * 1000).toString();
      }
    } );

    var annotator = new Rickshaw.Graph.Annotate( {
      graph: graph,
      element: document.getElementById('timeline')
    } );

    var legend = new Rickshaw.Graph.Legend( {
      graph: graph,
      element: document.getElementById('legend')

    } );

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
      graph: graph,
      legend: legend
    } );

    var order = new Rickshaw.Graph.Behavior.Series.Order( {
      graph: graph,
      legend: legend
    } );

    var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
      graph: graph,
      legend: legend
    } );

    var smoother = new Rickshaw.Graph.Smoother( {
      graph: graph,
      element: document.querySelector('#smoother')
    } );

    var ticksTreatment = 'glow';

    var xAxis = new Rickshaw.Graph.Axis.Time( {
      graph: graph,
      ticksTreatment: ticksTreatment,
      timeFixture: new Rickshaw.Fixtures.Time.Local()
    } );

    xAxis.render();

    var yAxis = new Rickshaw.Graph.Axis.Y( {
      graph: graph,
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      ticksTreatment: ticksTreatment
    } );

    yAxis.render();


    var controls = new RenderControls( {
      element: document.querySelector('form'),
      graph: graph
    } );

    // add some data every so often

    var messages = [
      "Changed home page welcome message",
      "Minified JS and CSS",
      "Changed button color from blue to green",
      "Refactored SQL query to use indexed columns",
      "Added additional logging for debugging",
      "Fixed typo",
      "Rewrite conditional logic for clarity",
      "Added documentation for new methods"
    ];

    setInterval( function() {
      random.removeData(seriesData);
      random.addData(seriesData);
      graph.update();
    }, 3000 );

    function addAnnotation(force) {
      if (messages.length > 0 && (force || Math.random() >= 0.95)) {
        annotator.add(seriesData[2][seriesData[2].length-1].x, messages.shift());
        annotator.update();
      }
    }

    addAnnotation(true);
    setTimeout( function() { setInterval( addAnnotation, 6000 ) }, 6000 );

    var previewXAxis = new Rickshaw.Graph.Axis.Time({
      graph: preview.previews[0],
      timeFixture: new Rickshaw.Fixtures.Time.Local(),
      ticksTreatment: ticksTreatment
    });

    previewXAxis.render();
  }
};

$(function() {
  GraphWidget.render()
});

$(function() {
  $('body').on('keyup', function(e) {
    var $body = $(this);
    if($(this).data('started') || e.keyCode !== 32) { return true; }
    $(this).data('started', true);

    $(this).append($('<p>Starting...</p>'))

    rawStream.onValue(function(val) {
      console.log("raw: " + val);
      //$body.append($('<p>Raw: ' + val + '</p>'));
    });

    var cadenceStream = CadenceCounter.pipe(rawStream);
    cadenceStream.onValue(function(val) {
      console.log("tempo: " + val);
    });
  });
});
