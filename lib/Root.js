'use strict';

exports.__esModule = true;

var _index = require('./index');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var Root = (function() {
  // TODO: Needs attention!

  function Root(domRoot, renderer) {
    _classCallCheck(this, Root);

    this.renderer = renderer;
    this.internalRoot = domRoot;
  }

  Root.prototype.render = function render(children) {
    this.renderer.updateContainer(children, this.internalRoot, null);
  };

  Root.prototype.unmount = function unmount() {
    this.renderer.updateContainer(null, this.internalRoot, null);
  };

  return Root;
})();

exports.default = Root;
module.exports = exports['default'];
