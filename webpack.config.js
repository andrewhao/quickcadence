var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    "BaconReferenceRunner": ["./reference/js/BaconRunner"],
    "RxJSReferenceRunner": ["./reference/js/RxJSRunner"],
	},
  output: {
    path: path.join(__dirname, 'reference', 'build'),
    filename: '[name].js',
		publicPath: "/assets/"
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: [ 'babel' ],
      exclude: /node_modules/,
      include: __dirname
    }]
  }
}

