'use strict';

const config = require('./webpack.config.js');
const webpack = require('webpack');

config.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
);

config.plugins.push(
  new webpack.optimization.minimize({
    compress: {
      warnings: false
    }
  })
);

module.exports = config;