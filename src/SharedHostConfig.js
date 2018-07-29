// @flow

import * as DOMComponent from './DOMComponent';
import { cacheHandleByInstance } from './DOMComponentTree';
import getOwnerDocument from 'dom-helpers/ownerDocument';

let isSvg = null;
type HostContext = { isSvg: boolean };

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

export function getRootHostContext(rootContainer: DOMContainer): HostContext {
  return { isSvg: getRootSvgContext(rootContainer) };
}

export function getChildHostContext(
  { isSvg }: HostContext,
  type: string,
): HostContext {
  return { isSvg: getSvgContext(isSvg, type) };
}

export function appendInitialChild(
  parentInstance: Element,
  child: Element | Text,
): void {
  parentInstance.appendChild(child);
}

export function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: DOMContainer,
  { isSvg: parentIsSvg }: HostContext,
  internalInstanceHandle: Object,
): Element {
  const instance = createElement(
    type,
    props,
    rootContainerInstance,
    parentIsSvg || type === 'svg', // in or entering an svg
  );
  cacheHandleByInstance(instance, internalInstanceHandle);
  return instance;
}

export function createTextInstance(
  text: string,
  rootContainerInstance: DOMContainer,
  hostContext: HostContext,
  internalInstanceHandle: Object, // TODO: annotation
): Text {
  const inst = getOwnerDocument(rootContainerInstance).createTextNode(text);
  cacheHandleByInstance(inst, internalInstanceHandle);
  return inst;
}

export function finalizeInitialChildren(
  domElement: Element,
  type: string,
  props: Props,
  rootContainerInstance: DOMContainer,
): boolean {
  if (isSvg == null) isSvg = getRootSvgContext(rootContainerInstance);

  DOMComponent.setInitialProps(
    domElement,
    props,
    (isSvg = getSvgContext(isSvg, type)),
  );
  return false;
}

export function getPublicInstance(inst: Element | Text): Element | Text {
  return inst;
}

export function prepareForCommit() {
  // noop
}

export function prepareUpdate(
  domElement: Element,
  type: string,
  oldProps: Props,
  newProps: Props,
): null | Array<[string, any]> {
  return DOMComponent.diffProps(domElement, oldProps, newProps) || null;
}

export function resetAfterCommit() {
  // noop
}

export function resetTextContent(domElement: Element): void {
  domElement.textContent = '';
}

export function shouldSetTextContent(type: string, props: Props): boolean {
  return (
    type === 'textarea' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      typeof props.dangerouslySetInnerHTML.__html === 'string')
  );
}

export function now() {
  return typeof performance === 'object' &&
    typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

export const isPrimaryRenderer = true;
export const supportsMutation = true;
export const useSyncScheduling = true;
export const supportsHydration = true;
export const scheduleDeferredCallback = window.requestIdleCallback;
export const cancelDeferredCallback = window.cancelIdleCallback;

export function shouldDeprioritizeSubtree(type: string, props: Props) {
  return !!props.hidden;
}

export function commitUpdate(
  instance: Element,
  preparedUpdateQueue: Array<[string, any]>,
  type: any,
  oldProps: any,
  _: any,
  { isSvg }: HostContext,
): void {
  DOMComponent.updateProps(instance, preparedUpdateQueue, oldProps, isSvg);
}

export function commitMount() {
  // noop
}

export function commitTextUpdate(
  textInstance: Text,
  oldText: string,
  newText: string,
) {
  textInstance.nodeValue = newText;
}

export function appendChild(
  parentInstance: Element,
  child: Element | Text,
): void {
  parentInstance.appendChild(child);
}

export function appendChildToContainer(
  parentInstance: DOMContainer,
  child: Element | Text,
): void {
  parentInstance.appendChild(child);
}

export function insertBefore(
  parentInstance: Element,
  child: Element | Text,
  beforeChild: Element | Text,
): void {
  parentInstance.insertBefore(child, beforeChild);
}

export function insertInContainerBefore(
  container: DOMContainer,
  child: Element | Text,
  beforeChild: Element | Text,
): void {
  container.insertBefore(child, beforeChild);
}

export function removeChild(
  parentInstance: Element,
  child: Element | Text,
): void {
  parentInstance.removeChild(child);
}
export function removeChildFromContainer(
  parentInstance: DOMContainer,
  child: Element | Text,
): void {
  parentInstance.removeChild(child);
}
