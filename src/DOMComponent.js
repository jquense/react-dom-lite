import css from 'dom-helpers/style';

import { setValueOnElement, isEventRegex } from './DOMProperties';

const isRenderableChild = child =>
  typeof child === 'string' || typeof child === 'number';

function listenTo(domElement, eventName, value, lastValue) {
  let useCapture = false;

  if (eventName.endsWith('Capture')) {
    eventName = eventName.slice(0, -7);
    useCapture = true;
  }

  eventName = eventName.toLowerCase();

  if (lastValue)
    domElement.removeEventListener(eventName, lastValue, useCapture);

  domElement.addEventListener(eventName, value, useCapture);
}

export function setInitialProps(domElement, nextProps) {
  Object.entries(nextProps).forEach(([propKey, propValue]) => {
    let match;

    // inline styles!
    if (propKey === 'style') {
      css(domElement, propValue);

      // Quick support for dangerousSetInnerHTML={{__html}}
    } else if (
      propKey === 'dangerouslySetInnerHTML' &&
      propValue &&
      propValue.__html != null
    ) {
      domElement.innerHtml = propValue.__html;

      // Handle when `children` is a renderable (text, number, etc)
    } else if (propKey === 'children') {
      // doesn't cover an IE8 issue with textareas
      if (typeof propValue === 'number') propValue = `${propValue}`;
      if (typeof propValue === 'string') domElement.textContent = propValue;

      // Add DOM event listeners
    } else if ((match = propKey.match(isEventRegex))) {
      let [, eventName] = match;
      listenTo(domElement, eventName, propValue, null);
    } else if (propValue != null) {
      setValueOnElement(domElement, propKey, propValue);
    }
  });
}

function diffStyle(lastStyle, nextStyle) {
  let updates = null;
  if (lastStyle) {
    for (const lastKey in lastStyle) {
      if (!updates) updates = {};
      updates[lastKey] = '';
    }
  }

  if (!updates || !nextStyle) return nextStyle;

  return Object.assign(updates, nextStyle);
}

export function diffProps(domElement, lastProps, nextProps) {
  let updatePayload = null;

  let add = (k, v) => {
    if (!updatePayload) updatePayload = [];
    updatePayload.push([k, v]);
  };

  for (let propKey in Object.keys(lastProps)) {
    if (lastProps[propKey] == null || nextProps.hasOwnProperty(propKey)) {
      continue;
    } else if (propKey.match(isEventRegex)) {
      updatePayload = updatePayload || [];
    }
  }

  for (let [propKey, nextProp] of Object.entries(nextProps)) {
    const lastProp = lastProps[propKey];

    if (
      nextProp === lastProp ||
      propKey === 'style' ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    } else if (propKey === 'dangerouslySetInnerHTML') {
      const nextHtml = nextProp ? nextProp.__html : undefined;
      const lastHtml = lastProp ? lastProp.__html : undefined;

      if (nextHtml != null && lastHtml !== nextHtml) {
        add(propKey, nextHtml);
      }
    } else if (
      propKey === 'children' &&
      lastProp !== nextProp &&
      isRenderableChild(nextProp)
    ) {
      add(propKey, nextProp);
    } else if (propKey.match(isEventRegex) && lastProp !== nextProp) {
      // we need the last event handler so we can remove it in the commit phase
      add(propKey, [lastProp, nextProp]);
    } else {
      // For any other property we always add it to the queue and then we
      // filter it out using the whitelist during the commit.
      add(propKey, nextProp);
    }
  }

  let styleUpdates = diffStyle(lastProps.style, nextProps.style);
  if (styleUpdates) {
    add('style', styleUpdates);
  }

  return updatePayload;
}

export function updateProps(domElement, updateQueue) {
  let match;

  for (let [propKey, propValue] of updateQueue) {
    // inline styles!
    if (propKey === 'style') {
      css(domElement, propValue);
    } else if (propKey === 'dangerouslySetInnerHTML') {
      domElement.innerHtml = propValue.__html;

      // Handle when `children` is a renderable (text, number, etc)
    } else if (propKey === 'children') {
      // doesn't cover an IE8 issue with textareas
      if (typeof propValue === 'number') propValue = `${propValue}`;
      if (typeof propValue === 'string') domElement.textContent = propValue;

      // Add DOM event listeners
    } else if ((match = propKey.match(isEventRegex))) {
      let [lastHandler, nextHandler] = propValue;

      listenTo(domElement, match[1], nextHandler, lastHandler);
    } else if (propValue != null) {
      setValueOnElement(domElement, propKey, propValue);
    }
  }
}
