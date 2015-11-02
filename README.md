# quickcadence


[![Accelerometer sample graphs](https://i.gyazo.com/fa11d9be4f8d3a14ea2ae7f5684d874f.gif)](https://gyazo.com/fa11d9be4f8d3a14ea2ae7f5684d874f)

[![Circle CI](https://circleci.com/gh/andrewhao/quickcadence.svg?style=svg)](https://circleci.com/gh/andrewhao/quickcadence)
[![Code Climate](https://codeclimate.com/github/andrewhao/quickcadence/badges/gpa.svg)](https://codeclimate.com/github/andrewhao/quickcadence)

Cadence detection for event-driven accelerometer data

## Usage

```js
var QuickCadence = require('quickcadence')

// On a Node `streams2` stream, or BaconJS `Observable` stream.
// Returns a BaconJS Observable.
//
// The stream must be object that matches the schema:
// {x: <xAccelValue>, y: <yAccelValue>, z: <zAccelValue>}
var cadenceStream = QuickCadence.pipe(stream);
cadenceStream.onValue(function(val) { console.log(val) });

// Values emitted are integers of the current cadence calculation.
// `93.22`
// `88.11`
// `79.25` ...
```

## Limitations

Power is matched off of the `y` acceleration axis, which works well for
wrist-mounted accelerometers (watches). Further work can be done to
generalize this algorithm to all-axes calculations.

## Data harness for your accelerometer data

Put CSV dump of files with other `csv` files.

    $ gulp watch
    $ open reference/index.html

## Build

    $ gulp build

Assets are dumped into the `builds/` directory.
