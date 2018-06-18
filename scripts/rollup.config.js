const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const tmp = require('tmp');
const ClosureCompiler = require('google-closure-compiler').compiler;
const { writeFileSync } = require('fs');
// const closure = require('rollup-plugin-closure-compiler-js');
function compile(flags) {
  return new Promise((resolve, reject) => {
    const closureCompiler = new ClosureCompiler(flags);
    closureCompiler.run(function(exitCode, stdOut, stdErr) {
      // if (!stdErr) {
      //   resolve(stdOut);
      // } else {
      //   reject(new Error(stdErr));
      // }
      resolve(stdOut);
    });
  });
}
function closure(flags = {}) {
  return {
    name: 'closure-plugin',
    async transformBundle(code) {
      const inputFile = tmp.fileSync();
      const tempPath = inputFile.name;
      flags = Object.assign({}, flags, { js: tempPath });
      writeFileSync(tempPath, code, 'utf8');
      return compile(flags).then(compiledCode => {
        inputFile.removeCallback();
        return { code: compiledCode };
      });
    },
  };
}

const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const logBundleSize = require('rollup-plugin-bundle-size');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  input: 'src/index.js',
  output: {
    file: dev ? 'lib/react-dom-lite.js' : 'lib/react-dom-lite.min.js',
    format: 'cjs',
  },
  plugins: [
    replace({
      __DEV__: dev,
      __SVG__: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }), // Needs attention! A way/config to selectively turn this on or off
    babel(),
    resolve({ browser: true }), // browser: true for warning module
    commonjs(),
    !dev &&
      closure({
        // compilationLevel: 'SIMPLE',
        compilationLevel: 'ADVANCED',
        languageIn: 'ECMASCRIPT5_STRICT',
        languageOut: 'ECMASCRIPT5_STRICT',
        // env: 'CUSTOM',
        rewritePolyfills: false,
        applyInputSourceMaps: false,
        processCommonJsModules: false,
        jscompOff: 'checkVars',
      }),
    logBundleSize(),
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
