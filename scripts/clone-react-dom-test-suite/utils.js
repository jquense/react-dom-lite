const { exec } = require('child_process');
const { transform } = require('babel-core');

module.exports.clone = function(url, dirname) {
  return new Promise((resolve, reject) => {
    exec(`git clone --depth 1 ${url} ${dirname}`, error => {
      if (error) {
        reject(error);
      } else {
        resolve(error);
      }
    });
  });
};

module.exports.silenceTests = filter => {
  babel;
};
