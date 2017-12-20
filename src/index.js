// @flow

import Reconciler, {
  type HostConfig,
  type OpaqueHandle
} from 'react-reconciler';
import getOwnerDocument from 'dom-helpers/ownerDocument';

import Root from './Root';
import * as DOMComponent from './DOMComponent';
import {
  cacheHandleByInstance,
  getInternalHandleFromInstance
} from './DOMComponentTree';

function createElement(type, props, rootContainerElement): Element {
  const ownerDocument = getOwnerDocument(rootContainerElement);
  let domElement = ownerDocument.createElement(type);
  return domElement;
}

const hostConfig: HostConfig<
  string, // T: component type
  Props, // P: props
  Element, // I: component instance
  Text, // TI: component text instance
  Element, // HI: Hydration Instance
  Element | Text, // PI: Public instance
  Element, // C: Container instance
  any, // Child container instance
  HostContext, // CX: Host context
  Array<[string, any]> // PL: prepare update result
> = {
  getRootHostContext(): HostContext {
    return '';
  },

  getChildHostContext(): HostContext {
    return '';
  },

  appendInitialChild(parentInstance: Element, child: Element | Text): void {
    parentInstance.appendChild(child);
  },

  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: DOMContainer,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle
  ): Element {
    const instance = createElement(type, props);
    cacheHandleByInstance(instance, internalInstanceHandle);
    return instance;
  },

  createTextInstance(
    text: string,
    rootContainerInstance: DOMContainer,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle
  ): Text {
    const inst = getOwnerDocument(rootContainerInstance).createTextNode(text);
    cacheHandleByInstance(inst, internalInstanceHandle);
    return inst;
  },

  finalizeInitialChildren(
    domElement: Element,
    type: string,
    props: Props
  ): boolean {
    DOMComponent.setInitialProps(domElement, props);
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
  ): null | Array<[string, any]> {
    return DOMComponent.diffProps(domElement, oldProps, newProps) || null;
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

  now() {
    return typeof performance === 'object' &&
      typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  },

  useSyncScheduling: true,
  scheduleDeferredCallback: window.requestIdleCallback,
  cancelDeferredCallback: window.cancelIdleCallback,
  shouldDeprioritizeSubtree: (type: string, props: Props) => !!props.hidden,

  mutation: {
    commitUpdate(
      instance: Element,
      preparedUpdateQueue: Array<[string, any]>
    ): void {
      DOMComponent.updateProps(instance, preparedUpdateQueue);
    },

    commitMount() {
      // noop
    },

    commitTextUpdate(textInstance: Text, oldText: string, newText: string) {
      textInstance.nodeValue = newText;
    },

    resetTextContent(domElement: Element): void {
      domElement.textContent = '';
    },

    appendChild(parentInstance: Element, child: Element | Text): void {
      parentInstance.appendChild(child);
    },

    appendChildToContainer(
      parentInstance: DOMContainer,
      child: Element | Text
    ): void {
      parentInstance.appendChild(child);
    },
    insertBefore(
      parentInstance: Element,
      child: Element | Text,
      beforeChild: Element | Text
    ): void {
      parentInstance.insertBefore(child, beforeChild);
    },

    insertInContainerBefore(
      container: Element,
      child: Element | Text,
      beforeChild: Element | Text
    ): void {
      container.insertBefore(child, beforeChild);
    },

    removeChild(parentInstance: Element, child: Element | Text): void {
      parentInstance.removeChild(child);
    },
    removeChildFromContainer(
      parentInstance: DOMContainer,
      child: Element | Text
    ): void {
      parentInstance.removeChild(child);
    }
  }
};

const DOMLiteRenderer = Reconciler(hostConfig);

DOMLiteRenderer.injectIntoDevTools({
  bundleType: 1,
  version: '0.1.0',
  rendererPackageName: 'react-dom-lite',
  findFiberByHostInstance: getInternalHandleFromInstance
});

let ContainerMap = new WeakMap();
function render(elements: React$Element<any>, domContainer: Element) {
  const container = DOMLiteRenderer.createContainer(domContainer, false, false);
  const root = new Root(container, DOMLiteRenderer);

  ContainerMap.set(domContainer, root);

  root.render(elements);
}

export { render, DOMLiteRenderer };
