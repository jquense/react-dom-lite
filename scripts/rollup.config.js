const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const closure = require('rollup-plugin-closure-compiler-js');

const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const logBundleSize = require('rollup-plugin-bundle-size');

const { hackyGCC } = require('./rdl-hacky-babel-inliner');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  input: 'src/index.js',
  output: {
    sourcemap: true, // Needed to inline the host config functions later
    file: dev ? 'lib/react-dom-lite.js' : 'lib/react-dom-lite.temp.js',
    format: 'cjs',
  },
  plugins: [
    replace({
      __DEV__: dev,
      __SVG__: true, // Needs attention! A way/config to selectively turn this on or off
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    babel(),
    resolve({ browser: true }), // browser: true for warning module
    commonjs(),
    !dev && hackyGCC(), // Yet to figure out obtaining sourcemaps created by rollup from transformBundle. Using generateBundle for now as a stopgap
    // !dev &&
    //   closure({
    //     compilationLevel: 'SIMPLE',
    //     languageIn: 'ECMASCRIPT5_STRICT',
    //     languageOut: 'ECMASCRIPT5_STRICT',
    //     env: 'CUSTOM',
    //     rewritePolyfills: false,
    //     applyInputSourceMaps: false,
    //     processCommonJsModules: false,
    //   })
  ].filter(Boolean),
  external: [
    'dom-helpers/ownerDocument',
    'dom-helpers/style',
    'dom-helpers/util/hyphenate',
    'react',
    'fbjs/lib/warning',
    'fbjs/lib/invariant',
    'object-assign',
    'prop-types',
  ],
};
