// @flow
import type { OpaqueHandle } from 'react-reconciler';
import * as Events from './events';
import { isEventRegex } from './DOMConfig';
import { cacheHandleByInstance } from './DOMComponentTree';
import { TEXT_NODE, ELEMENT_NODE } from './HTMLNodeType';

function diffHydratedProperties(
  domElement: Element,
  tag: string,
  rawProps: Object,
  // parentNamespace: string,
  // rootContainerElement: Element | Document,
): null | Array<[string, any]> {
  let updatePayload = null;

  for (const propKey in rawProps) {
    if (!rawProps.hasOwnProperty(propKey)) {
      continue;
    }
    const nextProp = rawProps[propKey];
    let match;
    if (propKey === 'children') {
      // Explanation as seen upstream
      // For text content children we compare against textContent. This
      // might match additional HTML that is hidden when we read it using
      // textContent. E.g. "foo" will match "f<span>oo</span>" but that still
      // satisfies our requirement. Our requirement is not to produce perfect
      // HTML and attributes. Ideally we should preserve structure but it's
      // ok not to if the visible content is still enough to indicate what
      // even listeners these nodes might be wired up to.
      if (typeof nextProp === 'string') {
        if (domElement.textContent !== nextProp) {
          updatePayload = [['children', nextProp]];
        }
      } else if (typeof nextProp === 'number') {
        if (domElement.textContent !== '' + nextProp) {
          updatePayload = [['children', '' + nextProp]];
        }
      }
    } else if ((match = propKey.match(isEventRegex))) {
      if (nextProp != null) {
        Events.listenTo(((domElement: any): Element), match[1], nextProp); // Attention!
      }
    }
  }
  return updatePayload;
}

function diffHydratedText(textNode: Text, text: string): boolean {
  const isDifferent = textNode.nodeValue !== text;
  return isDifferent;
}

export const SSRHydrationProd = {
  canHydrateInstance(instance: Element, type: string): null | Element {
    if (
      instance.nodeType !== ELEMENT_NODE ||
      type.toLowerCase() !== instance.nodeName.toLowerCase()
    ) {
      return null;
    }
    return instance;
  },

  canHydrateTextInstance(instance: Element, text: string): null | Text {
    if (text === '' || instance.nodeType !== TEXT_NODE) {
      // Empty strings are not parsed by HTML so there won't be a correct match here.
      return null;
    }
    return ((instance: any): Text);
  },

  getNextHydratableSibling(instance: Element | Text): null | Element {
    let node = instance.nextSibling;
    // Skip non-hydratable nodes.
    while (
      node &&
      node.nodeType !== ELEMENT_NODE &&
      node.nodeType !== TEXT_NODE
    ) {
      node = node.nextSibling;
    }
    return (node: any);
  },

  getFirstHydratableChild(
    parentInstance: DOMContainer | Element,
  ): null | Element {
    let next = parentInstance.firstChild;
    // Skip non-hydratable nodes.
    while (
      next &&
      next.nodeType !== ELEMENT_NODE &&
      next.nodeType !== TEXT_NODE
    ) {
      next = next.nextSibling;
    }
    return ((next: any): Element);
  },

  hydrateInstance(
    instance: Element,
    type: string,
    props: Props,
    rootContainerInstance: DOMContainer,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
  ): null | Array<[string, any]> {
    cacheHandleByInstance(instance, internalInstanceHandle);
    return diffHydratedProperties(
      instance,
      type,
      props,
      /* hostContext, */
      /* rootContainerInstance,*/
    );
  },

  hydrateTextInstance(
    textInstance: Text,
    text: string,
    internalInstanceHandle: OpaqueHandle,
  ): boolean {
    cacheHandleByInstance(
      ((textInstance: any): Element),
      internalInstanceHandle,
    );
    return diffHydratedText(textInstance, text);
  },

  didNotMatchHydratedContainerTextInstance() {},
  // parentContainer: DOMContainer,
  // textInstance: Text,
  // text: string,

  didNotMatchHydratedTextInstance() {},
  // parentType: string,
  // parentProps: Props,
  // parentInstance: Element,
  // textInstance: Text,
  // text: string,

  didNotHydrateContainerInstance() {},
  // parentContainer: DOMContainer,
  // instance: Element | Text,

  didNotHydrateInstance() {},
  // parentType: string,
  // parentProps: Props,
  // parentInstance: Element,
  // instance: Element | Text,

  didNotFindHydratableContainerInstance() {},
  // parentContainer: DOMContainer,
  // type: string,

  didNotFindHydratableContainerTextInstance() {},
  // parentContainer: DOMContainer,
  // text: string,

  didNotFindHydratableInstance() {},
  // parentType: string,
  // parentProps: Props,
  // parentInstance: Element,
  // type: string,

  didNotFindHydratableTextInstance() {},
  // parentType: string,
  // parentProps: Props,
  // parentInstance: Element,
  // text: string,
};
