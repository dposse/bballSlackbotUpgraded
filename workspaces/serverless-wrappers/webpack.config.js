const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal ? 'cheap-module-eval-source-map' : 'source-map',
  resolve: {
    extensions: ['.mjs', '.json', '.ts', '.js'],
    symlinks: false,
    cacheWithContext: false,
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
  },
  target: 'node',
  externals: [nodeExternals({
    modulesDir: path.resolve(__dirname, '../node_modules')
  })],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
          /node_modules/
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
        use: [{
          loader: 'cache-loader',
        }, {
          loader: 'thread-loader',
          options: {
            // There should be 1 cpu for the
            // fork-ts-checker-webpack-plugin
            workers: os.cpus().length - 1,
          },
        }, {
          loader: 'ts-loader',
          options: {
            // IMPORTANT! use happyPackMode mode to speed-up
            // compilation and reduce errors reported to webpack
            happyPackMode: true,
          },
        }],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
			checkSyntacticErrors: true
		}),
  ],
};
