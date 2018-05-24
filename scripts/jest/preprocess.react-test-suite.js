const babel = require('babel-core');
const path = require('path');

const babelOptions = {
  plugins: [
    // For Node environment only. For builds, Rollup takes care of ESM.
    require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
    require.resolve('babel-plugin-transform-react-jsx-source'),
    require.resolve('babel-plugin-transform-async-to-generator'),
  ],
  retainLines: true,
};

module.exports = {
  process: function(src, filePath) {
    const isTestFile = !!filePath.match(/\/__tests__\//);
    return babel.transform(
      src,
      Object.assign(
        { filename: path.relative(process.cwd(), filePath) },
        babelOptions,
      ),
    ).code;
  },
};
