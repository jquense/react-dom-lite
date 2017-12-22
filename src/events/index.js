// @flow

const ElementHandlers: WeakMap<Element, Map<string, Function>> = new WeakMap();

const handlerKey = (name, capturing) => `${name}-${String(capturing)}`;

const shouldUseCapture = name =>
  name === 'focus' ||
  name === 'blur' ||
  name === 'scroll' ||
  name === 'cancel' ||
  name === 'close';

const AlternateNames = {
  change: 'input'
};

export function listenTo(
  domElement: Element,
  eventName: string,
  value: ?Function,
  lastValue: ?Function
) {
  let handlers = ElementHandlers.get(domElement);
  if (!handlers) ElementHandlers.set(domElement, (handlers = new Map()));

  eventName = eventName.toLowerCase();
  let useCapture = shouldUseCapture(eventName);

  if (eventName.endsWith('capture')) {
    eventName = eventName.slice(0, -7);
    useCapture = true;
  }

  const key = handlerKey(eventName, useCapture);
  let altName = AlternateNames[eventName];

  if (!value) {
    domElement.removeEventListener(
      altName || eventName,
      handlerProxy,
      useCapture
    );
    handlers.delete(key);
  } else {
    if (!lastValue)
      domElement.addEventListener(
        altName || eventName,
        handlerProxy,
        useCapture
      );

    if (altName) value._reactAlternateType = altName;

    handlers.set(key, value);
  }
}

const returnsFalse = () => false;
const returnsTrue = () => true;
const persist = function() {
  this.isPersistent = returnsTrue;
};
const isPropagationStopped = function() {
  return this.cancelBubble;
};
const isDefaultPrevented = function() {
  return this.defaultPrevented;
};

function handlerProxy(event: Event) {
  const handlers = ElementHandlers.get(this);
  if (!handlers) return;

  const handler = handlers.get(
    handlerKey(event.type, event.eventPhase === event.CAPTURING_PHASE)
  );

  const syntheticEvent = (event: any);
  syntheticEvent.persist = persist;
  syntheticEvent.isPersistent = returnsFalse;
  syntheticEvent.isDefaultPrevented = isDefaultPrevented;
  syntheticEvent.isPropagationStopped = isPropagationStopped;
  syntheticEvent.nativeEvent = event;

  // TODO maybe normalize `event.key`
  return handler && handler.call(this, syntheticEvent);
}
