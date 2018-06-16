var config = require('./webpack.config.js');
var webpack = require('webpack');

config.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
);

// config.plugins.push(
//   new webpack.optimization.minimize({
//     optimization: {
//       minimize: true
//     }
//   })
// );

module.exports = config;