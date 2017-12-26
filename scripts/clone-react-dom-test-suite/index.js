const { clone } = require('./utils');

const repoURL = 'git@github.com:facebook/react.git';
const clonePath = './test/react-test-suite';
console.log('Cloning...');
clone(repoURL, clonePath)
  .then(() => {
    console.log('cloned');
  })
  .catch(e => {
    console.log('Cloning failed');
  });
