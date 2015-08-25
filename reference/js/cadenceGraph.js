var Rickshaw = require('rickshaw');

var CadenceGraph = {
  annotator: function(graph, element) {
    var annotator = new Rickshaw.Graph.Annotate( {
      graph: graph,
      element: element
    } );
    return annotator;
  },

  render: function(document) {
    var palette = new Rickshaw.Color.Palette( { scheme: 'classic9' } );

    // instantiate our graph!
    var graphConfig = {
      timeBase: (new Date().getTime() / 1000),
      timeInterval: (1/50 * 1000),
      maxDataPoints: 400
    };

    var graph = new Rickshaw.Graph( {
      element: document.getElementById("chart"),
      renderer: 'line',
      stroke: true,
      preserve: true,
      min: 'auto',
      series: new Rickshaw.Series.FixedDuration(
        [ { name: "tempo" },
          { name: 'power' },
          { name: 'xAccel' },
          { name: 'yAccel' },
          { name: 'zAccel' },
          { name: 'stepDetected' }
        ],
        undefined,
        graphConfig
      )
    } );

    graph.render();

    //var preview = new Rickshaw.Graph.RangeSlider( {
    //  graph: graph,
    //  element: document.getElementById('preview'),
    //} );

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
      graph: graph,
      xFormatter: function(x) {
        return new Date(x * 1000).toString();
      }
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

    //var smoother = new Rickshaw.Graph.Smoother( {
    //  graph: graph,
    //  element: document.querySelector('#smoother')
    //} );

    var ticksTreatment = 'glow';

    var xAxis = new Rickshaw.Graph.Axis.Time( {
      graph: graph,
      tickFormat: Rickshaw.Fixtures.Number.formatTime,
      ticksTreatment: ticksTreatment
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

module.exports = CadenceGraph;
