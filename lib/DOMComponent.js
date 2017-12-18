'use strict';

exports.__esModule = true;

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

var _typeof =
  typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
    ? function(obj) {
        return typeof obj;
      }
    : function(obj) {
        return obj &&
          typeof Symbol === 'function' &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? 'symbol'
          : typeof obj;
      };

exports.setInitialProps = setInitialProps;
exports.diffProps = diffProps;
exports.updateProps = updateProps;

var _style = require('dom-helpers/style');

var _style2 = _interopRequireDefault(_style);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _DOMProperties = require('./DOMProperties');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var isRenderableChild = function isRenderableChild(child) {
  return typeof child === 'string' || typeof child === 'number';
};

function listenTo(domElement, eventName, value, lastValue) {
  var useCapture = false;

  if (eventName.endsWith('Capture')) {
    eventName = eventName.slice(0, -7);
    useCapture = true;
  }

  eventName = eventName.toLowerCase();

  if (lastValue)
    domElement.removeEventListener(eventName, lastValue, useCapture);

  domElement.addEventListener(eventName, value, useCapture);
}

function setInitialProps(domElement, nextProps) {
  Object.entries(nextProps).forEach(function(_ref) {
    var propKey = _ref[0],
      propValue = _ref[1];

    var match = void 0;

    // inline styles!
    if (propKey === 'style') {
      (0, _style2.default)(domElement, propValue);

      // Quick support for dangerousSetInnerHTML={{__html}}
    } else if (
      propKey === 'dangerouslySetInnerHTML' &&
      propValue &&
      propValue.__html != null
    ) {
      !(
        (typeof propValue === 'undefined'
          ? 'undefined'
          : _typeof(propValue)) === 'object' &&
        typeof propValue.__html === 'string'
      )
        ? process.env.NODE_ENV !== 'production'
          ? (0, _invariant2.default)(
              false,
              'The dangerouslySetInnerHTML prop value must be an object with an single __html field'
            )
          : (0, _invariant2.default)(false)
        : void 0;
      domElement.innerHTML = propValue.__html;
      // Handle when `children` is a renderable (text, number, etc)
    } else if (propKey === 'children') {
      // doesn't cover an IE8 issue with textareas
      if (typeof propValue === 'number') propValue = '' + propValue;
      if (typeof propValue === 'string') domElement.textContent = propValue;

      // Add DOM event listeners
    } else if ((match = propKey.match(_DOMProperties.isEventRegex))) {
      var _match = match,
        eventName = _match[1];

      listenTo(domElement, eventName, propValue, null);
    } else if (propValue != null) {
      (0, _DOMProperties.setValueOnElement)(domElement, propKey, propValue);
    }
  });
}

function diffStyle(lastStyle, nextStyle) {
  var updates = null;
  if (lastStyle) {
    for (var lastKey in lastStyle) {
      if (!updates) updates = {};
      updates[lastKey] = '';
    }
  }

  if (!updates || !nextStyle) return nextStyle;

  return _extends(updates, nextStyle);
}

function diffProps(domElement, lastProps, nextProps) {
  var updatePayload = null;

  var add = function add(k, v) {
    if (!updatePayload) updatePayload = [];
    updatePayload.push([k, v]);
  };

  for (
    var _iterator = Object.keys(lastProps),
      _isArray = Array.isArray(_iterator),
      _i = 0,
      _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();
    ;

  ) {
    var _ref2;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref2 = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref2 = _i.value;
    }

    var propKey = _ref2;

    if (lastProps[propKey] == null || nextProps.hasOwnProperty(propKey)) {
      continue;
    } else if (propKey.match(_DOMProperties.isEventRegex)) {
      updatePayload = updatePayload || [];
    }
  }

  for (
    var _iterator2 = Object.entries(nextProps),
      _isArray2 = Array.isArray(_iterator2),
      _i2 = 0,
      _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();
    ;

  ) {
    var _ref3;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref3 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref3 = _i2.value;
    }

    var entry = _ref3;
    var _propKey = entry[0],
      nextProp = entry[1];

    var lastProp = lastProps[_propKey];

    if (
      nextProp === lastProp ||
      _propKey === 'style' ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    } else if (_propKey === 'dangerouslySetInnerHTML') {
      !(
        (typeof nextProp === 'undefined' ? 'undefined' : _typeof(nextProp)) ===
        'object'
      )
        ? process.env.NODE_ENV !== 'production'
          ? (0, _invariant2.default)(
              false,
              'The dangerouslySetInnerHTML prop value must be an object with an single __html field'
            )
          : (0, _invariant2.default)(false)
        : void 0;
      var nextHtml = nextProp ? nextProp.__html : undefined;
      var lastHtml = lastProp ? lastProp.__html : undefined;
      if (nextHtml != null && lastHtml !== nextHtml) {
        add(_propKey, nextHtml);
      }
    } else if (
      _propKey === 'children' &&
      lastProp !== nextProp &&
      isRenderableChild(nextProp)
    ) {
      add(_propKey, nextProp);
    } else if (
      _propKey.match(_DOMProperties.isEventRegex) &&
      lastProp !== nextProp
    ) {
      // we need the last event handler so we can remove it in the commit phase
      add(_propKey, [lastProp, nextProp]);
    } else {
      // For any other property we always add it to the queue and then we
      // filter it out using the whitelist during the commit.
      add(_propKey, nextProp);
    }
  }

  var styleUpdates = diffStyle(lastProps.style, nextProps.style);
  if (styleUpdates) {
    add('style', styleUpdates);
  }

  return updatePayload;
}

function updateProps(domElement, updateQueue) {
  var match = void 0;

  for (
    var _iterator3 = updateQueue,
      _isArray3 = Array.isArray(_iterator3),
      _i3 = 0,
      _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();
    ;

  ) {
    var _ref5;

    if (_isArray3) {
      if (_i3 >= _iterator3.length) break;
      _ref5 = _iterator3[_i3++];
    } else {
      _i3 = _iterator3.next();
      if (_i3.done) break;
      _ref5 = _i3.value;
    }

    var _ref4 = _ref5;
    var propKey = _ref4[0];
    var propValue = _ref4[1];

    // inline styles!
    if (propKey === 'style') {
      (0, _style2.default)(domElement, propValue);
    } else if (propKey === 'dangerouslySetInnerHTML') {
      domElement.innerHTML = propValue.__html;

      // Handle when `children` is a renderable (text, number, etc)
    } else if (propKey === 'children') {
      // doesn't cover an IE8 issue with textareas
      if (typeof propValue === 'number') propValue = '' + propValue;
      if (typeof propValue === 'string') domElement.textContent = propValue;

      // Add DOM event listeners
    } else if ((match = propKey.match(_DOMProperties.isEventRegex))) {
      var _propValue = propValue,
        lastHandler = _propValue[0],
        nextHandler = _propValue[1];

      listenTo(domElement, match[1], nextHandler, lastHandler);
    } else if (propValue != null) {
      (0, _DOMProperties.setValueOnElement)(domElement, propKey, propValue);
    }
  }
}
