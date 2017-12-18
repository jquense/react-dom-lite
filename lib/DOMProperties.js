'use strict';

exports.__esModule = true;
exports.isEventRegex = exports.RESERVED_PROPS = undefined;
exports.setValueOnElement = setValueOnElement;

var _hyphenate = require('dom-helpers/util/hyphenate');

var _hyphenate2 = _interopRequireDefault(_hyphenate);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var RESERVED_PROPS = (exports.RESERVED_PROPS = {
  children: true,
  dangerouslySetInnerHTML: true,
  innerHTML: true
});

var isEventRegex = (exports.isEventRegex = /^on([A-Z][a-zA-Z]+)$/);

var HAS_STRING_BOOLEAN_VALUE = 0x40;

var properties = {
  contentEditable: HAS_STRING_BOOLEAN_VALUE,
  draggable: HAS_STRING_BOOLEAN_VALUE,
  spellCheck: HAS_STRING_BOOLEAN_VALUE,
  value: HAS_STRING_BOOLEAN_VALUE
};

function setValueOnElement(domElement, propName, value) {
  if (RESERVED_PROPS.hasOwnProperty(propName)) return;

  if (propName in domElement) {
    domElement[propName] = value == null ? '' : value;
    return;
  }

  var attributeName = (0, _hyphenate2.default)(propName);
  if (value == null) {
    domElement.removeAttribute(attributeName);
  } else {
    if (properties[propName] === HAS_STRING_BOOLEAN_VALUE) {
      value = String(value);
    } else if (value === true) {
      value = '';
    }

    domElement.setAttribute(attributeName, value);
  }
}
