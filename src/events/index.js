// @flow
import { collectAncestors } from '../DOMComponentTree';
import SyntheticEvent from './SyntheticEvent';

const Phases = {
  CAPTURING: 1,
  BUBBLING: 3
};

const AlternateNames = {
  change: 'input'
};

const ElementHandlers: WeakMap<
  Element | Text,
  Map<string, Function>
> = new WeakMap();

export function traverseTwoPhase(
  inst: Element,
  callback: Function,
  event: SyntheticEvent
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
  lastValue: ?Function
) {
  let handlers = ElementHandlers.get(domElement);
  if (!handlers) ElementHandlers.set(domElement, (handlers = new Map()));

  eventName = eventName.toLowerCase();
  let phase = Phases.BUBBLING;

  if (eventName.endsWith('capture')) {
    eventName = eventName.slice(0, -7);
    phase = Phases.CAPTURING;
  }

  let originalName = eventName;
  eventName = AlternateNames[eventName] || originalName;
  const key = `${eventName}-${phase}`;

  if (!value) {
    domElement.removeEventListener(eventName, handlerProxy, true);
    handlers.delete(key);
  } else {
    if (!lastValue) domElement.addEventListener(eventName, handlerProxy, true);

    value.__originalType = originalName;
    handlers.set(key, value);
  }
}

const HandledEvents = new WeakSet();
function handlerProxy(event: Event) {
  if (HandledEvents.has(event)) return;
  HandledEvents.add(event);

  // TODO maybe normalize `event.key`
  traverseTwoPhase((event.target: any), dispatch, new SyntheticEvent(event));
}

function dispatch(element: Element, phase, event): ?boolean {
  const handlers = ElementHandlers.get(element);
  if (!handlers) return;

  const handler = handlers.get(`${event.type}-${phase}`);
  if (!handler) return;

  event.currentTarget = element;
  event.eventPhase = phase;
  event.type = handler.__originalType || event.type;
  handler.call(element, event);

  const stop = event.isPropagationStopped();
  return stop === true;
}
