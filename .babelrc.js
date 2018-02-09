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
          browsers: [
            'last 2 versions',
            'last 4 android versions',
            'last 4 iOS versions',
            'safari >= 7',
            'not ie <= 11',
            'not android <= 4.4.3',
          ],
        },
      },
    ],
    '@babel/flow',
    ['@babel/react', { development: dev }],
  ],
  plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
};
