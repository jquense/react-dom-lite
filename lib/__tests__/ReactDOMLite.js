'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ = require('../');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

describe('ReactDOMLite', function() {
  var container = void 0;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    document.body.innerHTML = '';
  });

  it('should render', function() {
    (0, _.render)(_react2.default.createElement('div', null), container);

    expect(container).toMatchSnapshot();
  });
});
