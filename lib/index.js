'use strict';

exports.__esModule = true;
exports.DOMLiteRenderer = exports.render = undefined;

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

var _reactReconciler = require('react-reconciler');

var _reactReconciler2 = _interopRequireDefault(_reactReconciler);

var _ownerDocument = require('dom-helpers/ownerDocument');

var _ownerDocument2 = _interopRequireDefault(_ownerDocument);

var _Root = require('./Root');

var _Root2 = _interopRequireDefault(_Root);

var _DOMComponent = require('./DOMComponent');

var DOMComponent = _interopRequireWildcard(_DOMComponent);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key];
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function createElement(type, props, rootContainerElement) {
  var ownerDocument = (0, _ownerDocument2.default)(rootContainerElement);
  var domElement = ownerDocument.createElement(type);
  return domElement;
}

var hostConfig = {
  getRootHostContext: function getRootHostContext(instance) {
    return '';
  },
  getChildHostContext: function getChildHostContext(
    parentHostContext,
    type,
    instance
  ) {
    return '';
  },
  appendInitialChild: function appendInitialChild(parentInstance, child) {
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
    } else {
      // $FlowFixMe
      parentInstance.document = child;
    }
  },
  createInstance: function createInstance(type, props) {
    return createElement(type, props);
  },
  createTextInstance: function createTextInstance(text, rootContainerInstance) {
    return (0, _ownerDocument2.default)(rootContainerInstance).createTextNode(
      text
    );
  },
  finalizeInitialChildren: function finalizeInitialChildren(
    domElement,
    type,
    props,
    rootContainerInstance
  ) {
    DOMComponent.setInitialProps(
      domElement,
      props
      /*rootContainerInstance // is unused */
    );
    return false;
  },
  getPublicInstance: function getPublicInstance(inst) {
    return inst;
  },
  prepareForCommit: function prepareForCommit() {
    // noop
  },
  prepareUpdate: function prepareUpdate(domElement, type, oldProps, newProps) {
    return DOMComponent.diffProps(domElement, oldProps, newProps) || null;
  },
  resetAfterCommit: function resetAfterCommit() {
    // noop
  },
  resetTextContent: function resetTextContent(domElement) {
    domElement.textContent = '';
  },
  shouldSetTextContent: function shouldSetTextContent(type, props) {
    return (
      type === 'textarea' ||
      typeof props.children === 'string' ||
      typeof props.children === 'number' ||
      (_typeof(props.dangerouslySetInnerHTML) === 'object' &&
        props.dangerouslySetInnerHTML !== null &&
        typeof props.dangerouslySetInnerHTML.__html === 'string')
    );
  },
  now: function now() {
    return (typeof performance === 'undefined'
      ? 'undefined'
      : _typeof(performance)) === 'object' &&
      typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  },

  useSyncScheduling: true,
  scheduleDeferredCallback: window.requestIdleCallback,
  cancelDeferredCallback: window.cancelIdleCallback,
  shouldDeprioritizeSubtree: function shouldDeprioritizeSubtree(type, props) {
    return !!props.hidden;
  },

  mutation: {
    commitUpdate: function commitUpdate(instance, preparedUpdateQueue) {
      DOMComponent.updateProps(instance, preparedUpdateQueue);
    },
    commitMount: function commitMount(
      instance,
      type,
      newProps,
      internalInstanceHandle
    ) {
      // noop
    },
    commitTextUpdate: function commitTextUpdate(
      textInstance,
      oldText,
      newText
    ) {
      textInstance.nodeValue = newText;
    },
    resetTextContent: function resetTextContent(domElement) {
      domElement.textContent = '';
    },
    appendChild: function appendChild(parentInstance, child) {
      parentInstance.appendChild(child);
    },
    appendChildToContainer: function appendChildToContainer(
      parentInstance,
      child
    ) {
      parentInstance.appendChild(child);
    },
    insertBefore: function insertBefore(parentInstance, child, beforeChild) {
      parentInstance.insertBefore(child, beforeChild);
    },
    insertInContainerBefore: function insertInContainerBefore(
      container,
      child,
      beforeChild
    ) {
      container.insertBefore(child, beforeChild);
    },
    removeChild: function removeChild(parentInstance, child) {
      parentInstance.removeChild(child);
    },
    removeChildFromContainer: function removeChildFromContainer(
      parentInstance,
      child
    ) {
      parentInstance.removeChild(child);
    }
  }
};

var DOMLiteRenderer = (0, _reactReconciler2.default)(hostConfig);

DOMLiteRenderer.injectIntoDevTools({
  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  version: '0.1.0',
  rendererPackageName: 'react-dom-lite',
  findFiberByHostInstance: DOMLiteRenderer.findHostInstance
});

var ContainerMap = new WeakMap();
function render(elements, domContainer) {
  var container = DOMLiteRenderer.createContainer(domContainer, false, false);
  var root = new _Root2.default(container, DOMLiteRenderer);

  ContainerMap.set(domContainer, root);

  root.render(elements);
}

exports.render = render;
exports.DOMLiteRenderer = DOMLiteRenderer;
