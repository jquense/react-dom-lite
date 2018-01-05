const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const closure = require('rollup-plugin-closure-compiler-js');
const replace = require('rollup-plugin-replace');

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'lib/react-dom-lite.js',
    format: 'cjs',
  },
  plugins: [
    replace({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
    babel(),
    commonjs(),
    closure({
      compilationLevel: 'SIMPLE',
      languageIn: 'ECMASCRIPT5_STRICT',
      languageOut: 'ECMASCRIPT5_STRICT',
      env: 'CUSTOM',
      applyInputSourceMaps: false,
      processCommonJsModules: false,
    }),
  ],
  external: [
    'react-reconciler',
    'invariant',
    'dom-helpers/ownerDocument',
    'dom-helpers/util/hyphenate',
    'dom-helpers/style',
  ],
};
