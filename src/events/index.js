// @flow
import { collectAncestors } from '../DOMComponentTree';
import SyntheticEvent from './SyntheticEvent';

export const Phases = {
  CAPTURING: 1,
  BUBBLING: 3,
};

const ElementHandlers: WeakMap<
  Element | Text,
  Map<string, Function>,
> = new WeakMap();

function traverseTwoPhase(
  inst: Element,
  callback: Function,
  event: SyntheticEvent,
) {
  const path = collectAncestors(inst);

  let i;
  for (i = path.length; i-- > 0; )
    if (callback(path[i], Phases.CAPTURING, event)) return;
  for (i = 0; i < path.length; i++)
    if (callback(path[i], Phases.BUBBLING, event)) return;
}

export function listenTo(
  domElement: Element,
  eventName: string,
  value: ?Function,
  lastValue: ?Function,
) {
  let handlers = ElementHandlers.get(domElement);
  if (!handlers) ElementHandlers.set(domElement, (handlers = new Map()));

  eventName = eventName.toLowerCase();
  let phase = Phases.BUBBLING;

  if (eventName.endsWith('capture')) {
    eventName = eventName.slice(0, -7);
    phase = Phases.CAPTURING;
  }

  const originalName = eventName;
  const key = `${originalName}-${phase}`;
  eventName = originalName === 'change' ? 'input' : originalName;

  if (!value) {
    domElement.removeEventListener(eventName, handlerProxy, true);
    handlers.delete(key);
  } else {
    if (!lastValue) domElement.addEventListener(eventName, handlerProxy, true);
    handlers.set(key, value);
  }
}

const HandledEvents = new WeakSet();
export function handlerProxy(nativeEvent: Event) {
  if (HandledEvents.has(nativeEvent)) return;
  HandledEvents.add(nativeEvent);

  const target = (nativeEvent: any).target;
  dispatchSyntheticEvent(target, new SyntheticEvent(nativeEvent));

  // if the event is an input event we need to also check for onChange events
  if (nativeEvent.type === 'input') {
    dispatchSyntheticEvent(target, new SyntheticEvent(nativeEvent, 'change'));
  }
}

export function dispatchSyntheticEvent(target: Element, event: SyntheticEvent) {
  // TODO: probably more traversal options for different events,
  // e.g. mouseenter/leave for portal compat
  traverseTwoPhase(target, executeHandlers, event);
}

function executeHandlers(element: Element, phase, event): ?boolean {
  const handlers = ElementHandlers.get(element);
  const handler = handlers && handlers.get(`${event.type}-${phase}`);
  if (!handler) return;

  event.currentTarget = element;
  event.eventPhase = phase;
  handler.call(element, event);
  return event.isPropagationStopped();
}
