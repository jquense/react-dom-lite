// @flow

import Reconciler, { type HostConfig } from 'react-reconciler';
import getOwnerDocument from 'dom-helpers/ownerDocument';
// Caution! One one of the following modules is supposed to be imported. Avoid side effects in them.
import { SSRHydrationDev } from './SSRHydrationDev.js';
import { SSRHydrationProd } from './SSRHydrationProd.js';
import * as DOMComponent from './DOMComponent';
import {
  cacheHandleByInstance,
  getInternalHandleFromInstance,
} from './DOMComponentTree';

let isSvg = null;

function getSvgContext(isSvg, type) {
  return type === 'svg' || (isSvg && type === 'foreignObject' ? false : isSvg);
}

function getRootSvgContext(rootContainer: Element | Document) {
  const type = rootContainer.tagName ? (rootContainer: any).tagName : '#other';
  return getSvgContext(!!(rootContainer: any).ownerSVGElement, type);
}

function createElement(type, props, rootContainerElement, isSvg): Element {
  const ownerDocument = getOwnerDocument(rootContainerElement);
  let domElement = isSvg
    ? ownerDocument.createElementNS('http://www.w3.org/2000/svg', type)
    : ownerDocument.createElement(type);
  return domElement;
}

function getHydrationConfig() {
  if (__DEV__) {
    return SSRHydrationDev;
  } else {
    return SSRHydrationProd;
  }
}

const hostConfig: HostConfig<
  string, // T: component type
  Props, // P: props
  Element, // I: component instance
  Text, // TI: component text instance
  Element, // HI: Hydration Instance
  Element | Text, // PI: Public instance
  DOMContainer, // C: Container instance
  any, // Child container instance
  HostContext, // CX: Host context
  Array<[string, any]>, // PL: prepare update result
> = {
  getRootHostContext(rootContainer): HostContext {
    return { isSvg: getRootSvgContext(rootContainer) };
  },

  getChildHostContext({ isSvg }: HostContext, type: string): HostContext {
    return { isSvg: getSvgContext(isSvg, type) };
  },

  getPublicInstance(instance): * {
    return instance;
  },

  appendInitialChild(parentInstance: Element, child: Element | Text): void {
    parentInstance.appendChild(child);
  },

  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: DOMContainer,
    { isSvg: parentIsSvg },
    internalInstanceHandle,
  ): Element {
    const instance = createElement(
      type,
      props,
      rootContainerInstance,
      parentIsSvg || type === 'svg', // in or entering an svg
    );
    cacheHandleByInstance(instance, internalInstanceHandle);
    return instance;
  },

  createTextInstance(
    text: string,
    rootContainerInstance: DOMContainer,
    hostContext,
    internalInstanceHandle,
  ): Text {
    const inst = getOwnerDocument(rootContainerInstance).createTextNode(text);
    cacheHandleByInstance(inst, internalInstanceHandle);
    return inst;
  },

  finalizeInitialChildren(
    domElement: Element,
    type: string,
    props: Props,
    rootContainerInstance,
  ): boolean {
    if (isSvg == null) isSvg = getRootSvgContext(rootContainerInstance);

    DOMComponent.setInitialProps(
      domElement,
      props,
      (isSvg = getSvgContext(isSvg, type)),
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
    newProps: Props,
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

  // MUTATION
  supportsMutation: true,

  commitUpdate(
    instance: Element,
    preparedUpdateQueue: Array<[string, any]>,
    type,
    oldProps,
    _,
    { isSvg },
  ): void {
    DOMComponent.updateProps(instance, preparedUpdateQueue, oldProps, isSvg);
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
    child: Element | Text,
  ): void {
    parentInstance.appendChild(child);
  },
  insertBefore(
    parentInstance: Element,
    child: Element | Text,
    beforeChild: Element | Text,
  ): void {
    parentInstance.insertBefore(child, beforeChild);
  },

  insertInContainerBefore(
    container: DOMContainer,
    child: Element | Text,
    beforeChild: Element | Text,
  ): void {
    container.insertBefore(child, beforeChild);
  },

  removeChild(parentInstance: Element, child: Element | Text): void {
    parentInstance.removeChild(child);
  },
  removeChildFromContainer(
    parentInstance: DOMContainer,
    child: Element | Text,
  ): void {
    parentInstance.removeChild(child);
  },

  // Hydration
  ...getHydrationConfig(),
};

// $FlowFixMe
const DOMLiteReconciler = Reconciler(hostConfig);

DOMLiteReconciler.injectIntoDevTools({
  bundleType: __DEV__ ? 1 : 0,
  version: '0.1.0',
  rendererPackageName: 'react-dom-lite',
  findFiberByHostInstance: getInternalHandleFromInstance,
});

export { DOMLiteReconciler };
