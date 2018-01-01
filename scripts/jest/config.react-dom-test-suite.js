const moduleNameMapper = {
  '^react-dom$': '<rootDir>/lib/index.js',
  '^react$': '<rootDir>/node_modules/react/',
  '^react-reconciler$': '<rootDir>/node_modules/react-reconciler',
  '^react-dom/test-utils$': '<rootDir>/node_modules/react-dom/test-utils',
};

module.exports = Object.assign(
  {},
  {
    rootDir: process.cwd(),
    roots: ['<rootDir>'],
    moduleNameMapper,
    testRegex:
      'test/react-test-suite/packages/react-dom/src/__tests__/.*\\.js$',
    testPathIgnorePatterns: [
      '/node_modules/',
      '-test.internal.js$',
      '[Ss]erver',
    ],
    transformIgnorePatterns: ['/node_modules/', '<rootDir>/lib/'],
  },
);
