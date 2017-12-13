import Reconciler from 'react-reconciler';
import getOwnerDocument from 'dom-helpers/ownerDocument';

import Root from './Root';
import * as DOMComponent from './DOMComponent';

function createElement(type, props, rootContainerElement) {
  const ownerDocument = getOwnerDocument(rootContainerElement);
  let domElement = ownerDocument.createElement(type);
  return domElement;
}

const DOMLiteRenderer = Reconciler({
  appendInitialChild(parentInstance, child) {
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
    } else {
      parentInstance.document = child;
    }
  },

  createInstance(type, props) {
    return createElement(type, props);
  },

  createTextInstance(text, rootContainerInstance) {
    return getOwnerDocument(rootContainerInstance).createTextNode(text);
  },

  finalizeInitialChildren(domElement, type, props, rootContainerInstance) {
    DOMComponent.setInitialProps(domElement, props, rootContainerInstance);
  },

  getPublicInstance(inst) {
    return inst;
  },

  prepareForCommit() {
    // noop
  },

  prepareUpdate(domElement, type, oldProps, newProps) {
    return DOMComponent.diffProps(domElement, oldProps, newProps);
  },

  resetAfterCommit() {
    // noop
  },

  resetTextContent(domElement) {
    domElement.textContent = '';
  },

  getRootHostContext(instance) {
    return {};
  },

  getChildHostContext(instance) {
    return {};
  },

  shouldSetTextContent(type, props) {
    return (
      type === 'textarea' ||
      typeof props.children === 'string' ||
      typeof props.children === 'number' ||
      (typeof props.dangerouslySetInnerHTML === 'object' &&
        props.dangerouslySetInnerHTML !== null &&
        typeof props.dangerouslySetInnerHTML.__html === 'string')
    );
  },

  now: () => {},

  useSyncScheduling: true,

  mutation: {
    appendChild(parentInstance, child) {
      parentInstance.appendChild(child);
    },

    appendChildToContainer(parentInstance, child) {
      parentInstance.appendChild(child);
    },

    removeChild(parentInstance, child) {
      parentInstance.removeChild(child);
    },

    removeChildFromContainer(parentInstance, child) {
      parentInstance.removeChild(child);
    },

    insertBefore(parentInstance, child, beforeChild) {
      parentInstance.insertBefore(child, beforeChild);
    },

    commitUpdate(instance, preparedUpdateQueue) {
      DOMComponent.updateProps(instance, preparedUpdateQueue);
    },

    commitMount(instance, updatePayload, type, oldProps, newProps) {
      // noop
    },

    resetTextContent(domElement) {
      domElement.textContent = '';
    },

    commitTextUpdate(textInstance, oldText, newText) {
      textInstance.nodeValue = newText;
    }
  }
});

DOMLiteRenderer.injectIntoDevTools({
  bundleType: 1, // 0 for PROD, 1 for DEV
  version: '0.1.0', // version for your renderer
  rendererPackageName: 'custom-renderer', // package name
  findHostInstanceByFiber: DOMLiteRenderer.findHostInstance // host instance (root)
});

let ContainerMap = new WeakMap();
function render(reactElements, domContainer) {
  const container = DOMLiteRenderer.createContainer(domContainer);
  const root = new Root(container, DOMLiteRenderer);

  ContainerMap.set(domContainer, root);

  root.render(reactElements);
}

export { render, DOMLiteRenderer };
