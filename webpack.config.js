const CompressionPlugin = require('compression-webpack-plugin');
const { rules, plugins } = require('webpack-atoms');

module.exports = {
  devtool: 'module-source-map',
  entry: './examples/App.js',
  output: {
    path: `${__dirname}/build`,
    filename: 'bundle.js',
  },
  module: {
    rules: [rules.js(), rules.css()],
  },
  resolve: {
    alias: {
      'react-dom-lite$': `${__dirname}/src/index.js`,
    },
  },
  plugins: [
    plugins.html({
      template: `${__dirname}/examples/index.html`,
    }),
    plugins.define({
      __DEV__: true,
      __SVG__: false,
    }),
    plugins.extractCss(),
    new CompressionPlugin(),
  ],
};
