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
    var palette = new Rickshaw.Color.Palette( { scheme: 'classic9' } );

    // instantiate our graph!

    var graph = new Rickshaw.Graph( {
      element: document.getElementById("chart"),
      width: 900,
      height: 500,
      renderer: 'area',
      stroke: true,
      preserve: true,
      series: new Rickshaw.Series.FixedDuration(
        [ {x: 0, y: 0, name: "Tempo"} ],
        palette.color(),
        { timeBase: 0, timeInterval: 1, maxDataPoints: 200 }
      )
    });

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


    return graph;
  }
};

$(function() {
  var graph = GraphWidget.render();

  $('body').on('keyup', function(e) {
    var $body = $(this);
    if($(this).data('started') || e.keyCode !== 32) { return true; }
    $(this).data('started', true);

    //$(document).append($('<p>Starting...</p>'))

    rawStream.onValue(function(val) {
      console.log("raw: " + val);
      //$body.append($('<p>Raw: ' + val + '</p>'));
    });

    var cadenceStream = CadenceCounter.pipe(rawStream);
    cadenceStream.onValue(function(val) {
      console.log("tempo: " + val);
      var data = {
        y: val,
        name: "Tempo",
        x: new Date().getTime()
      }
      try {
        graph.series.addData(data);
        graph.render();
      } catch(e) { }
    });
  });
});
