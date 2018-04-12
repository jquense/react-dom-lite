// @flow
import type { OpaqueHandle } from 'react-reconciler';
import warning from 'warning';
import * as Events from './events';
import { isEventRegex } from './DOMConfig';
import { cacheHandleByInstance } from './DOMComponentTree';
import { TEXT_NODE, ELEMENT_NODE } from './HTMLNodeType';

// HTML parsing normalizes CR and CRLF to LF.
// It also can turn \u0000 into \uFFFD inside attributes.
// https://www.w3.org/TR/html5/single-page.html#preprocessing-the-input-stream
// If we have a mismatch, it might be caused by that.
// We will still patch up in this case but not fire the warning.
const NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
const NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;

let didWarnInvalidHydration;

function normalizeMarkupForTextOrAttribute(markup: mixed): string {
  const markupString = typeof markup === 'string' ? markup : '' + (markup: any);
  return markupString
    .replace(NORMALIZE_NEWLINES_REGEX, '\n')
    .replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, '');
}

function warnForTextDifference(
  serverText: string,
  clientText: string | number,
) {
  if (didWarnInvalidHydration) {
    return;
  }
  const normalizedClientText = normalizeMarkupForTextOrAttribute(clientText);
  const normalizedServerText = normalizeMarkupForTextOrAttribute(serverText);
  if (normalizedServerText === normalizedClientText) {
    return;
  }
  didWarnInvalidHydration = true;
  warning(
    false,
    'Text content did not match. Server: "%s" Client: "%s"',
    normalizedServerText,
    normalizedClientText,
  );
}

function warnForExtraAttributes(attributeNames: Set<string>) {
  if (didWarnInvalidHydration) {
    return;
  }
  didWarnInvalidHydration = true;
  const names = [];
  attributeNames.forEach(function(name) {
    names.push(name);
  });
  warning(false, 'Extra attributes from the server: %s', names);
}

function warnForInvalidEventListener(propKey, listener) {
  if (listener === false) {
    warning(
      false,
      'Expected `%s` listener to be a function, instead got `false`.\n\n' +
        'If you used to conditionally omit it with %s={condition && value}, ' +
        'pass %s={condition ? value : undefined} instead.',
      propKey,
      propKey,
      propKey,
    );
  } else {
    warning(
      false,
      'Expected `%s` listener to be a function, instead got a value of `%s` type.',
      propKey,
      typeof listener,
    );
  }
}

function warnForInsertedHydratedText(
  parentNode: Element | Document,
  text: string,
) {
  if (text === '') {
    // Refer comment at https://github.com/facebook/react/blob/73fa26a88b68bca77fb234fc405649d0f33a3815/packages/react-dom/src/client/ReactDOMFiberComponent.js#L1141
    return;
  }
  if (didWarnInvalidHydration) {
    return;
  }
  didWarnInvalidHydration = true;
  warning(
    false,
    'Expected server HTML to contain a matching text node for "%s" in <%s>.',
    text,
    parentNode.nodeName.toLowerCase(),
  );
}

function warnForInsertedHydratedElement(
  parentNode: Element | Document,
  tag: string,
) {
  if (didWarnInvalidHydration) {
    return;
  }
  didWarnInvalidHydration = true;
  warning(
    false,
    'Expected server HTML to contain a matching <%s> in <%s>.',
    tag,
    parentNode.nodeName.toLowerCase(),
  );
}

function warnForUnmatchedText(textNode: Text, text: string) {
  warnForTextDifference(textNode.nodeValue, text);
}

function warnForDeletedHydratableElement(
  parentNode: Element | Document,
  child: Element,
) {
  if (didWarnInvalidHydration) {
    return;
  }
  didWarnInvalidHydration = true;
  warning(
    false,
    'Did not expect server HTML to contain a <%s> in <%s>.',
    child.nodeName.toLowerCase(),
    parentNode.nodeName.toLowerCase(),
  );
}

function warnForDeletedHydratableText(
  parentNode: Element | Document,
  child: Text,
) {
  if (didWarnInvalidHydration) {
    return;
  }
  didWarnInvalidHydration = true;
  warning(
    false,
    'Did not expect server HTML to contain the text node "%s" in <%s>.',
    child.nodeValue,
    parentNode.nodeName.toLowerCase(),
  );
}

function diffHydratedProperties(
  domElement: Element,
  tag: string,
  rawProps: Object,
  // parentNamespace: string,
  // rootContainerElement: Element | Document,
): null | Array<[string, any]> {
  // Track extra attributes so that we can warn later
  let extraAttributeNames: Set<string> = new Set();
  const attributes = domElement.attributes;
  for (let i = 0; i < attributes.length; i++) {
    const name = attributes[i].name.toLowerCase();
    switch (name) {
      // Built-in SSR attribute is whitelisted
      case 'data-reactroot':
        break;
      // Controlled attributes are not validated
      // TODO: Only ignore them on controlled tags.
      case 'value':
        break;
      case 'checked':
        break;
      case 'selected':
        break;
      default:
        // Intentionally use the original name.
        // See discussion in https://github.com/facebook/react/pull/10676.
        extraAttributeNames.add(attributes[i].name);
    }
  }

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
      // TODO: Warn if there is more than a single textNode as a child.
      // TODO: Should we use domElement.firstChild.nodeValue to compare?
      if (typeof nextProp === 'string') {
        if (domElement.textContent !== nextProp) {
          warnForTextDifference(domElement.textContent, nextProp);
          updatePayload = [['children', nextProp]];
        }
      } else if (typeof nextProp === 'number') {
        if (domElement.textContent !== '' + nextProp) {
          warnForTextDifference(domElement.textContent, nextProp);
          updatePayload = [['children', '' + nextProp]];
        }
      }
    } else if ((match = propKey.match(isEventRegex))) {
      if (nextProp != null) {
        if (typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        Events.listenTo(((domElement: any): Element), match[1], nextProp); // Attention!
      }
    }
    // TODO shouldIgnoreAttribute && shouldRemoveAttribute
  }

  // $FlowFixMe - Should be inferred as not undefined.
  if (extraAttributeNames.size > 0) {
    // $FlowFixMe - Should be inferred as not undefined.
    warnForExtraAttributes(extraAttributeNames);
  }

  return updatePayload;
}

function diffHydratedText(textNode: Text, text: string): boolean {
  const isDifferent = textNode.nodeValue !== text;
  return isDifferent;
}

export const SSRHydrationDev = {
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

  didNotMatchHydratedContainerTextInstance(
    parentContainer: DOMContainer,
    textInstance: Text,
    text: string,
  ) {
    warnForUnmatchedText(textInstance, text);
  },

  didNotMatchHydratedTextInstance(
    parentType: string,
    parentProps: Props,
    parentInstance: Element,
    textInstance: Text,
    text: string,
  ) {
    warnForUnmatchedText(textInstance, text);
  },

  didNotHydrateContainerInstance(
    parentContainer: DOMContainer,
    instance: Element | Text,
  ) {
    if (instance.nodeType === 1) {
      warnForDeletedHydratableElement(parentContainer, (instance: any));
    } else {
      warnForDeletedHydratableText(parentContainer, (instance: any));
    }
  },

  didNotHydrateInstance(
    parentType: string,
    parentProps: Props,
    parentInstance: Element,
    instance: Element | Text,
  ) {
    if (instance.nodeType === 1) {
      warnForDeletedHydratableElement(parentInstance, (instance: any));
    } else {
      warnForDeletedHydratableText(parentInstance, (instance: any));
    }
  },

  didNotFindHydratableContainerInstance(
    parentContainer: DOMContainer,
    type: string,
  ) {
    warnForInsertedHydratedElement(parentContainer, type);
  },

  didNotFindHydratableContainerTextInstance(
    parentContainer: DOMContainer,
    text: string,
  ) {
    warnForInsertedHydratedText(parentContainer, text);
  },

  didNotFindHydratableInstance(
    parentType: string,
    parentProps: Props,
    parentInstance: Element,
    type: string,
  ) {
    warnForInsertedHydratedElement(parentInstance, type);
  },

  didNotFindHydratableTextInstance(
    parentType: string,
    parentProps: Props,
    parentInstance: Element,
    text: string,
  ) {
    warnForInsertedHydratedText(parentInstance, text);
  },
};
