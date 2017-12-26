const packageJSON = require('../../package.json');
module.exports = Object.assign(
  {},
  // packageJSON.jest,
  {
    setupFiles: ['./test/setup.js'],
    moduleNameMapper: {
      'react-dom': '<rootDir>/src/index.js',
    },
    testRegex:
      'test/react-test-suite/packages/react-dom/src/__tests__/.*\\.js$',
    rootDir: process.cwd(),
    roots: ['<rootDir>/test/react-test-suite/packages'],
  },
);
