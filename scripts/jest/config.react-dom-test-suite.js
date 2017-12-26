// const packageJSON = require('../../package.json');
// module.exports = Object.assign(
//   {},
//   // packageJSON.jest,
//   {
//     transform:{
//       '.*': require.resolve('./preprocess.react-test-suite.js')
//     },
//     setupFiles: ['./test/setup.js'],
//     moduleNameMapper: {
//       'react-dom': '<rootDir>/lib/index.js',
//     },
//     testRegex:
//       'test/react-test-suite/packages/react-dom/src/__tests__/.*\\.js$',
//     rootDir: process.cwd(),
//     roots: ['<rootDir>/test/react-test-suite/packages'],
//   },
// );

const reactJestSourceConfig = require('../../test/react-test-suite/scripts/jest/config.source.js');

module.exports = Object.assign({}, reactJestSourceConfig, {
  modulePathIgnorePatterns: [
    '<rootDir>/test/react-test-suite/scripts/rollup/shims/',
    '<rootDir>/test/react-test-suite/scripts/bench/',
  ],
  moduleNameMapper: {
    'react-dom': '<rootDir>/lib/index.js',
  },
  testRegex: '/react-dom/src/__tests__/[^/]*(\\.js)$',
  roots: ['<rootDir>/test/react-test-suite/packages'],
});
