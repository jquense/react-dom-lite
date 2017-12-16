// @flow

import Reconciler, { type HostConfig } from 'react-reconciler';
import getOwnerDocument from 'dom-helpers/ownerDocument';

import Root from './Root';
import * as DOMComponent from './DOMComponent';

function createElement(type, props, rootContainerElement): Element {
  const ownerDocument = getOwnerDocument(rootContainerElement);
  let domElement = ownerDocument.createElement(type);
  return domElement;
}

const hostConfig: HostConfig<
  string,
  Props,
  Element,
  Text,
  Element,
  Element | Text,
  Element,
  any,
  HostContext,
  Array<[string, any]>
> = {
  getRootHostContext(instance: DOMContainer): HostContext {
    return '';
  },

  getChildHostContext(
    parentHostContext: HostContext,
    type: string,
    instance: Element
  ): HostContext {
    return '';
  },
  appendInitialChild(parentInstance: Element, child: Element | Text): void {
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
    } else {
      // $FlowFixMe
      parentInstance.document = child;
    }
  },

  createInstance(type: string, props: Props): Element {
    return createElement(type, props);
  },

  createTextInstance(text: string, rootContainerInstance: DOMContainer): Text {
    return getOwnerDocument(rootContainerInstance).createTextNode(text);
  },

  finalizeInitialChildren(
    domElement: Element,
    type: string,
    props: Props,
    rootContainerInstance: DOMContainer
  ): boolean {
    DOMComponent.setInitialProps(
      domElement,
      props
      /*rootContainerInstance // is unused */
    );
    return false;
  },

  getPublicInstance(inst: Element | Text): Element | Text {
    return inst;
  },

  prepareForCommit() {
    // noop
  },

  prepareUpdate(
    domElement: Element,
    type: string,
    oldProps: Props,
    newProps: Props
  ): ?Array<[string, any]> {
    return DOMComponent.diffProps(domElement, oldProps, newProps);
  },

  resetAfterCommit() {
    // noop
  },

  resetTextContent(domElement: Element): void {
    domElement.textContent = '';
  },

  shouldSetTextContent(type: string, props: Props): boolean {
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
    appendChild(parentInstance: Element, child: Element | Text): void {
      parentInstance.appendChild(child);
    },

    appendChildToContainer(
      parentInstance: DOMContainer,
      child: Element | Text
    ): void {
      parentInstance.appendChild(child);
    },

    removeChild(parentInstance: Element, child: Element | Text): void {
      parentInstance.removeChild(child);
    },

    removeChildFromContainer(
      parentInstance: DOMContainer,
      child: Element | Text
    ): void {
      parentInstance.removeChild(child);
    },

    insertBefore(
      parentInstance: Element,
      child: Element | Text,
      beforeChild: Element | Text
    ): void {
      parentInstance.insertBefore(child, beforeChild);
    },

    commitUpdate(
      instance: Element,
      preparedUpdateQueue: Array<[string, any]>
    ): void {
      DOMComponent.updateProps(instance, preparedUpdateQueue);
    },

    commitMount() {
      // noop
    },

    resetTextContent(domElement: Element): void {
      domElement.textContent = '';
    },

    commitTextUpdate(textInstance: Text, oldText: string, newText: string) {
      textInstance.nodeValue = newText;
    }
  }
};

const DOMLiteRenderer = Reconciler(hostConfig);

DOMLiteRenderer.injectIntoDevTools({
  bundleType: 1, // 0 for PROD, 1 for DEV
  version: '0.1.0', // version for your renderer
  rendererPackageName: 'custom-renderer', // package name
  findFiberByHostInstance: DOMLiteRenderer.findHostInstance // host instance (root)
});

let ContainerMap = new WeakMap();
function render(elements: React$Element<any>, domContainer: DOMContainer) {
  const container = DOMLiteRenderer.createContainer(domContainer, false, false);
  const root = new Root(container, DOMLiteRenderer);

  ContainerMap.set(domContainer, root);

  root.render(elements);
}

export { render, DOMLiteRenderer };
