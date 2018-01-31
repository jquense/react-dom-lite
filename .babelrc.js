const dev = process.env.NODE_ENV !== 'production';
const BUILD = !!process.env.ROLLUP;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: BUILD ? false : 'commonjs',
        shippedProposals: true,
        loose: true,
        targets: {
          browsers: ['last 2 versions', 'safari >= 7'],
        },
      },
    ],
    '@babel/flow',
    ['@babel/react', { development: dev }],
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ].filter(Boolean),
};
