import webpack from 'webpack';
import webpackTargetElectronRenderer from 'webpack-target-electron-renderer';

import base from './webpack.base';

const port = process.env.PORT || 3000;

const config = {
  ...base,

  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
    './src/ui',
  ],

  output: {
    ...base.output,
    publicPath: `http://localhost:${port}/dist/`,
  },

  debug: true,
  devtool: 'cheap-module-eval-source-map',

  module: {
    ...base.module,

    loaders: [
      ...base.module.loaders,
      {
        test: /\.global\.css$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap',
        ],
      }, {
        test: /^((?!\.global).)*\.css$/,
        loaders: [
          'style-loader',
          'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
        ],
      },
    ],
  },

  plugins: [
    ...base.plugins,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};

config.target = webpackTargetElectronRenderer(config);

export default config;
