const { rules, plugins } = require('webpack-atoms')

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
      'react-dom-lite$': `${__dirname}/src`,
    },
  },
  plugins: [
    plugins.html({
      template: `${__dirname}/examples/index.html`,
    }),
    plugins.extractText(),
  ],
}
